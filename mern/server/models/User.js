const mongoose = require('mongoose');

// Two kinds of accounts live here:
//  - role "admin": signs in with email + password (created from ADMIN_EMAIL / ADMIN_PASSWORD in .env)
//  - role "user":  signs in with email + the access code the admin generated for them
// Only a hash of the password / code is stored, never the plain text.
const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, default: '', trim: true },
    role: { type: String, enum: ['admin', 'user'], default: 'user' },
    secretHash: { type: String, required: true },
    active: { type: Boolean, default: true },
    // Bumped when a code is regenerated or the account is disabled, which signs out existing sessions
    sessionVersion: { type: Number, default: 0 },
    lastLoginAt: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
