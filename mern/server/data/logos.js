// The 13 logos and which section of the page each belongs to.
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

module.exports = logos;
