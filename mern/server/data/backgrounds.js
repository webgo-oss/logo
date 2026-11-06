// 18 landscape ("Solid Backgrounds USP Logo") + 18 portrait ("Solid Backgrounds Vertical") images.
// In both sets 01-09 have green backgrounds (primary) and 10-18 have red backgrounds (secondary).
const SETS = {
  landscape: { label: 'USP Logo', prefix: 'usp-landscape', width: 8000, height: 4500 },
  portrait: { label: 'Vertical', prefix: 'vertical-portrait', width: 2480, height: 3508 },
};

const backgrounds = [];
for (const [set, cfg] of Object.entries(SETS)) {
  for (let n = 1; n <= 18; n++) {
    const code = String(n).padStart(2, '0');
    backgrounds.push({
      code,
      set,
      group: n <= 9 ? 'primary' : 'secondary',
      name: `${cfg.label} · ${n <= 9 ? 'Green' : 'Red'} ${code}`,
      previewFile: `${set}-${code}.jpg`,
      originalFile: `${cfg.prefix}-${code}.jpg`,
      width: cfg.width,
      height: cfg.height,
      order: n,
    });
  }
}

module.exports = backgrounds;
