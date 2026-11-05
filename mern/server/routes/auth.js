const express = require('express');
const User = require('../models/User');
const { requireAuth } = require('../middleware/auth');
const { createLimiter } = require('../utils/rateLimit');
const { hashSecret, verifySecret, startSession, endSession } = require('../utils/auth');

const router = express.Router();
const limiter = createLimiter({ max: 5, windowMs: 15 * 60 * 1000 });

const normEmail = (v) => String(v || '').trim().toLowerCase();

const toDto = (u) => ({
  id: String(u._id),
  email: u.email,
  name: u.name || '',
  role: u.role,
  active: u.active,
  lastLoginAt: u.lastLoginAt || null,
  createdAt: u.createdAt || null,
});

// Used so a wrong email takes about as long to reject as a wrong code
let dummyHash;
async function burnTime(secret) {
  dummyHash = dummyHash || (await hashSecret('not-a-real-secret'));
  await verifySecret(secret, dummyHash);
}

async function login(req, res, next, { role, field, label }) {
  try {
    const email = normEmail(req.body && req.body.email);
    const raw = req.body && req.body[field];
    if (!email || !raw) return res.status(400).json({ message: `Email and ${label} are required` });

    const key = `${req.ip}|${role}|${email}`;
    const wait = limiter.retryAfter(key);
    if (wait) {
      res.set('Retry-After', String(wait));
      return res.status(429).json({ message: `Too many attempts. Try again in ${Math.ceil(wait / 60)} minute(s).` });
    }

    // The code is exactly what the admin typed (leading/trailing spaces ignored)
    const secret = role === 'user' ? String(raw).trim() : String(raw);
    const user = await User.findOne({ email, role });
    let ok = false;
    if (user) ok = await verifySecret(secret, user.secretHash);
    else await burnTime(secret);

    if (!ok) {
      limiter.fail(key);
      return res.status(401).json({ message: `Invalid email or ${label}` });
    }
    if (!user.active) {
      return res.status(403).json({ message: 'This account has been disabled. Please contact the administrator.' });
    }

    limiter.clear(key);
    user.lastLoginAt = new Date();
    await user.save();
    startSession(res, user);
    res.json({ user: toDto(user) });
  } catch (err) {
    next(err);
  }
}

// Users: email + the access code given by the admin
router.post('/login', (req, res, next) => login(req, res, next, { role: 'user', field: 'code', label: 'access code' }));

// Admin: email + password
router.post('/admin/login', (req, res, next) =>
  login(req, res, next, { role: 'admin', field: 'password', label: 'password' })
);

router.post('/logout', (_req, res) => {
  endSession(res);
  res.json({ ok: true });
});

router.get('/me', requireAuth, (req, res) => res.json({ user: toDto(req.user) }));

module.exports = router;
module.exports.toDto = toDto;
