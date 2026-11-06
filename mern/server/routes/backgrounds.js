const path = require('path');
const fs = require('fs');
const express = require('express');
const Background = require('../models/Background');

const router = express.Router();
const ROOT = path.join(__dirname, '..', 'public', 'backgrounds');
const SETS = ['landscape', 'portrait'];

const toDto = (b) => ({
  code: b.code,
  set: b.set,
  group: b.group,
  name: b.name,
  previewUrl: `/assets/backgrounds/${b.set}/preview/${b.previewFile}`,
  downloadUrls: { jpg: `/api/backgrounds/${b.set}/${b.code}/download` },
  width: b.width,
  height: b.height,
  downloads: b.downloads,
});

// GET /api/backgrounds/sections -> { landscape: {primary, secondary}, portrait: {primary, secondary} }
router.get('/sections', async (_req, res, next) => {
  try {
    const all = (await Background.find().sort({ order: 1 }).lean()).map(toDto);
    const pick = (set, group) => all.filter((b) => b.set === set && b.group === group);
    res.json({
      landscape: { primary: pick('landscape', 'primary'), secondary: pick('landscape', 'secondary') },
      portrait: { primary: pick('portrait', 'primary'), secondary: pick('portrait', 'secondary') },
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/backgrounds/:set/:code/download -> sends the full-size JPG and counts the download
router.get('/:set/:code/download', async (req, res, next) => {
  try {
    const set = req.params.set;
    if (!SETS.includes(set)) return res.status(404).json({ message: 'Unknown set' });
    const code = path.basename(req.params.code);
    const bg = await Background.findOneAndUpdate({ set, code }, { $inc: { downloads: 1 } }, { new: true });
    if (!bg) return res.status(404).json({ message: 'Background not found' });
    const filePath = path.join(ROOT, set, 'original', path.basename(bg.originalFile));
    if (!fs.existsSync(filePath)) return res.status(404).json({ message: 'File not found', file: bg.originalFile });
    res.download(filePath, bg.originalFile);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
