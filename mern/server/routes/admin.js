const express = require('express');
const User = require('../models/User');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { hashSecret, generateCode, codeForHashing } = require('../utils/auth');
const { toDto } = require('./auth');

const router = express.Router();
router.use(requireAuth, requireAdmin); // everything here is admin-only

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Finds a normal user (never an admin) by id
async function findUser(id) {
  try {
    const user = await User.findById(id);
    return user && user.role === 'user' ? user : null;
  } catch {
    return null;
  }
}

// GET /api/admin/users
router.get('/users', async (_req, res, next) => {
  try {
    const users = await User.find({ role: 'user' }).sort({ createdAt: -1 });
    res.json(users.map(toDto));
  } catch (err) {
    next(err);
  }
});

// POST /api/admin/users  { email, name? }  -> creates the user and returns their access code (shown once)
router.post('/users', async (req, res, next) => {
  try {
    const email = String((req.body && req.body.email) || '').trim().toLowerCase();
    const name = String((req.body && req.body.name) || '').trim().slice(0, 80);
    if (!EMAIL_RE.test(email)) return res.status(400).json({ message: 'Please enter a valid email address' });
    if (await User.findOne({ email })) return res.status(409).json({ message: 'That email already has an account' });

    const code = generateCode();
    const user = await User.create({
      email,
      name,
      role: 'user',
      secretHash: await hashSecret(codeForHashing(code)),
    });
    res.status(201).json({ user: toDto(user), code });
  } catch (err) {
    if (err && err.code === 11000) return res.status(409).json({ message: 'That email already has an account' });
    next(err);
  }
});

// POST /api/admin/users/:id/code  -> new access code (old one stops working, active sessions end)
router.post('/users/:id/code', async (req, res, next) => {
  try {
    const user = await findUser(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const code = generateCode();
    user.secretHash = await hashSecret(codeForHashing(code));
    user.sessionVersion = (user.sessionVersion || 0) + 1;
    await user.save();
    res.json({ user: toDto(user), code });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/admin/users/:id  { active: true|false }  -> enable / disable
router.patch('/users/:id', async (req, res, next) => {
  try {
    const user = await findUser(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (typeof (req.body && req.body.active) !== 'boolean') {
      return res.status(400).json({ message: '"active" must be true or false' });
    }
    user.active = req.body.active;
    if (!user.active) user.sessionVersion = (user.sessionVersion || 0) + 1;
    await user.save();
    res.json({ user: toDto(user) });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/admin/users/:id
router.delete('/users/:id', async (req, res, next) => {
  try {
    const user = await findUser(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    await User.deleteOne({ _id: user._id });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
