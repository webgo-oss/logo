const mongoose = require('mongoose');

const logoSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true }, // "01" ... "13"
    name: { type: String, required: true },
    variant: { type: String, enum: ['stacked', 'horizontal', 'wordmark', 'mark'], required: true },
    tone: { type: String, enum: ['green', 'white', 'gold'], required: true },
    tagline: { type: String, enum: ['Beyond the Blueprint', 'Real Estate Growth Partner', 'None'], required: true },
    // Which section of the website it lives in
    group: { type: String, enum: ['primary', 'secondary', 'complementary', 'brand'], required: true },
    // Only used inside "complementary": primary (green) or secondary (white)
    subtype: { type: String, enum: ['primary', 'secondary', null], default: null },
    previewFile: { type: String, required: true },
    originalFile: { type: String, required: true },
    width: { type: Number, default: 4500 },
    height: { type: Number, default: 4500 },
    downloads: { type: Number, default: 0 },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Logo', logoSchema);
