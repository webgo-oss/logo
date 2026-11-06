const mongoose = require('mongoose');

// Solid-colour background artwork. Two sets (landscape = "USP Logo", portrait = "Vertical"),
// each split into primary (green) and secondary (red).
const backgroundSchema = new mongoose.Schema(
  {
    code: { type: String, required: true }, // "01" ... "18"
    set: { type: String, enum: ['landscape', 'portrait'], required: true },
    group: { type: String, enum: ['primary', 'secondary'], required: true },
    name: { type: String, required: true },
    previewFile: { type: String, required: true },
    originalFile: { type: String, required: true },
    width: { type: Number, required: true },
    height: { type: Number, required: true },
    downloads: { type: Number, default: 0 },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);
backgroundSchema.index({ set: 1, code: 1 }, { unique: true });

module.exports = mongoose.model('Background', backgroundSchema);
