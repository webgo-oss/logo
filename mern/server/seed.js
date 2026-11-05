require('dotenv').config();
const mongoose = require('mongoose');
const Logo = require('./models/Logo');

const BLUEPRINT = 'Beyond the Blueprint';
const GROWTH = 'Real Estate Growth Partner';

const make = (code, variant, tone, tagline, group, subtype = null) => {
  const v = variant[0].toUpperCase() + variant.slice(1);
  const t = tone[0].toUpperCase() + tone.slice(1);
  return {
    code,
    name: variant === 'mark' ? 'Brand Mark' : `${v} · ${t}`,
    variant,
    tone,
    tagline,
    group,
    subtype,
    previewFile: `logo-${code}.png`,
    originalFile: `unstoppable-logo-${code}.png`,
    order: Number(code),
  };
};

const logos = [
  // Primary: all green logos with the "Beyond the Blueprint" tagline
  make('04', 'stacked', 'green', BLUEPRINT, 'primary'),
  make('05', 'horizontal', 'green', BLUEPRINT, 'primary'),
  make('06', 'wordmark', 'green', BLUEPRINT, 'primary'),

  // Secondary: the white versions
  make('01', 'stacked', 'white', BLUEPRINT, 'secondary'),
  make('02', 'horizontal', 'white', BLUEPRINT, 'secondary'),
  make('03', 'wordmark', 'white', BLUEPRINT, 'secondary'),

  // Complementary: everything with "Real Estate", split by the same logic
  make('11', 'stacked', 'green', GROWTH, 'complementary', 'primary'),
  make('12', 'horizontal', 'green', GROWTH, 'complementary', 'primary'),
  make('13', 'wordmark', 'green', GROWTH, 'complementary', 'primary'),
  make('07', 'stacked', 'white', GROWTH, 'complementary', 'secondary'),
  make('08', 'horizontal', 'white', GROWTH, 'complementary', 'secondary'),
  make('09', 'wordmark', 'white', GROWTH, 'complementary', 'secondary'),

  // Brand logo: the one standalone monogram
  make('10', 'mark', 'gold', 'None', 'brand'),
];

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    // Keep existing download counters when re-seeding
    const existing = await Logo.find({}, 'code downloads').lean();
    const counts = Object.fromEntries(existing.map((l) => [l.code, l.downloads]));
    await Logo.deleteMany({});
    await Logo.insertMany(logos.map((l) => ({ ...l, downloads: counts[l.code] || 0 })));
    console.log(`Seeded ${logos.length} logos`);
  } catch (err) {
    console.error('Seed failed:', err.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
})();
