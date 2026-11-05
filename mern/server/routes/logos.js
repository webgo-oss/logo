const path = require('path');
const fs = require('fs');
const express = require('express');
const Logo = require('../models/Logo');

const router = express.Router();
const ORIGINALS = path.join(__dirname, '..', 'public', 'logos', 'original');
const PREVIEW_DIR = path.join(__dirname, '..', 'public', 'logos', 'preview');

// One entry per downloadable format. `file` builds the filename from the logo code.
const FORMATS = {
  png: { dir: ORIGINALS, file: (c) => `unstoppable-logo-${c}.png`, label: 'PNG' },
  jpg: { dir: path.join(__dirname, '..', 'public', 'jpg'), file: (c) => `Unstoppable Logos-${c}.jpg`, label: 'JPG' },
  tiff: { dir: path.join(__dirname, '..', 'public', 'tiff'), file: (c) => `Unstoppable Logos-${c}.tiff`, label: 'TIFF' },
};

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
  downloadUrl: `/api/logos/${l.code}/download?format=png`, // kept for backwards compatibility
  // Separate download link for each file format
  downloadUrls: {
    png: `/api/logos/${l.code}/download?format=png`,
    jpg: `/api/logos/${l.code}/download?format=jpg`,
    tiff: `/api/logos/${l.code}/download?format=tiff`,
  },
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
    res.set('Cache-Control', 'private, max-age=86400');
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

// GET /api/logos/:code/download?format=png|jpg|tiff  -> sends that file and counts the download
router.get('/:code/download', async (req, res, next) => {
  try {
    let format = String(req.query.format || 'png').toLowerCase();
    if (format === 'jpeg') format = 'jpg';
    if (format === 'tif') format = 'tiff';
    const fmt = FORMATS[format];
    if (!fmt) return res.status(400).json({ message: 'Unknown format. Use png, jpg or tiff.' });

    const code = path.basename(req.params.code);
    const filePath = path.join(fmt.dir, fmt.file(code));
    if (!fs.existsSync(filePath)) return res.status(404).json({ message: 'File not found', file: fmt.file(code) });

    const logo = await Logo.findOneAndUpdate({ code }, { $inc: { downloads: 1 } }, { new: true });
    if (!logo) return res.status(404).json({ message: 'Logo not found' });

    // Friendly filename, e.g. unstoppable-logo-04.jpg
    res.download(filePath, `unstoppable-logo-${code}.${format}`);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
