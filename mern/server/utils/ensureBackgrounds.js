const Background = require('../models/Background');
const backgrounds = require('../data/backgrounds');

// Adds any missing background images to the database on startup; existing rows
// (and their download counters) are left alone.
module.exports = async function ensureBackgrounds() {
  const existing = new Set((await Background.find({}, 'set code').lean()).map((b) => `${b.set}:${b.code}`));
  const missing = backgrounds.filter((b) => !existing.has(`${b.set}:${b.code}`));
  if (missing.length) {
    await Background.insertMany(missing.map((b) => ({ ...b, downloads: 0 })));
    console.log(`[backgrounds] Added ${missing.length} background(s) to the database`);
  }
};
