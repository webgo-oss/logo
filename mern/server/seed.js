require('dotenv').config();
const mongoose = require('mongoose');
const Logo = require('./models/Logo');
const logos = require('./data/logos');
const Background = require('./models/Background');
const backgrounds = require('./data/backgrounds');

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    // Keep existing download counters when re-seeding
    const existing = await Logo.find({}, 'code downloads').lean();
    const counts = Object.fromEntries(existing.map((l) => [l.code, l.downloads]));
    await Logo.deleteMany({});
    await Logo.insertMany(logos.map((l) => ({ ...l, downloads: counts[l.code] || 0 })));
    console.log(`Seeded ${logos.length} logos`);

    const oldBg = await Background.find({}, 'set code downloads').lean();
    const bgCounts = Object.fromEntries(oldBg.map((b) => [`${b.set}:${b.code}`, b.downloads]));
    await Background.deleteMany({});
    await Background.insertMany(backgrounds.map((b) => ({ ...b, downloads: bgCounts[`${b.set}:${b.code}`] || 0 })));
    console.log(`Seeded ${backgrounds.length} backgrounds`);
  } catch (err) {
    console.error('Seed failed:', err.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
})();
