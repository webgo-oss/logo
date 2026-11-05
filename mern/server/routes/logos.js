const path = require('path');
const express = require('express');
const Logo = require('../models/Logo');

const router = express.Router();
const ORIGINALS = path.join(__dirname, '..', 'public', 'logos', 'original');
const PREVIEW_DIR = path.join(__dirname, '..', 'public', 'logos', 'preview');

const toDto = (l) => ({
  code: l.code,
  name: l.name,
  variant: l.variant,
  tone: l.tone,
  tagline: l.tagline,
  group: l.group,
  subtype: l.subtype,
  // Served straight from disk by express.static (no DB lookup, so it can't go stale)
  previewUrl: `/assets/logos/preview/logo-${l.code}.png`,
  downloadUrl: `/api/logos/${l.code}/download`,
  width: l.width,
  height: l.height,
  downloads: l.downloads,
});

// GET /api/logos  (optional filters: ?group=primary&subtype=secondary)
router.get('/', async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.group) filter.group = req.query.group;
    if (req.query.subtype) filter.subtype = req.query.subtype;
    const logos = await Logo.find(filter).sort({ order: 1 }).lean();
    res.json(logos.map(toDto));
  } catch (err) {
    next(err);
  }
});

// GET /api/logos/sections  -> data shaped for the page
router.get('/sections', async (_req, res, next) => {
  try {
    const all = (await Logo.find().sort({ order: 1 }).lean()).map(toDto);
    const by = (fn) => all.filter(fn);
    res.json({
      primary: by((l) => l.group === 'primary'),
      secondary: by((l) => l.group === 'secondary'),
      complementary: {
        primary: by((l) => l.group === 'complementary' && l.subtype === 'primary'),
        secondary: by((l) => l.group === 'complementary' && l.subtype === 'secondary'),
      },
      brand: by((l) => l.group === 'brand'),
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/logos/:code/preview  -> the image shown on the page
router.get('/:code/preview', async (req, res, next) => {
  try {
    const logo = await Logo.findOne({ code: req.params.code }).lean();
    if (!logo) return res.status(404).json({ message: 'Logo not found' });
    res.set('Cache-Control', 'public, max-age=86400');
    // Build the filename from the code (not from stored DB data) and use `root`
    // so Express never rejects the path.
    const file = `logo-${path.basename(logo.code)}.png`;
    res.sendFile(file, { root: PREVIEW_DIR }, (err) => {
      if (err && !res.headersSent) res.status(404).json({ message: 'Preview file missing', file });
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/logos/:code/download  -> sends the original PNG and counts the download
router.get('/:code/download', async (req, res, next) => {
  try {
    const logo = await Logo.findOneAndUpdate(
      { code: req.params.code },
      { $inc: { downloads: 1 } },
      { new: true }
    );
    if (!logo) return res.status(404).json({ message: 'Logo not found' });
    const file = `unstoppable-logo-${path.basename(logo.code)}.png`;
    res.download(path.join(ORIGINALS, file), file);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
