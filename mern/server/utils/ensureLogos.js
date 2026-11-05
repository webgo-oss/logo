const Logo = require('../models/Logo');
const logos = require('../data/logos');

// On a fresh database (for example the first deploy on Render) load the logos automatically,
// so there is no separate "seed" step. Existing logos and their download counters are left alone.
module.exports = async function ensureLogos() {
  const existing = new Set((await Logo.find({}, 'code').lean()).map((l) => l.code));
  const missing = logos.filter((l) => !existing.has(l.code));
  if (missing.length) {
    await Logo.insertMany(missing.map((l) => ({ ...l, downloads: 0 })));
    console.log(`[logos] Added ${missing.length} logo(s) to the database`);
  }
};
