const User = require('../models/User');
const { COOKIE_NAME, parseCookies, verifyToken } = require('../utils/auth');

// Returns the signed-in user, or null. Checked against the database on every request,
// so disabling a user or regenerating their code takes effect immediately.
async function loadSession(req) {
  const payload = verifyToken(parseCookies(req.headers.cookie)[COOKIE_NAME]);
  if (!payload) return null;
  try {
    const user = await User.findById(payload.sub);
    if (!user || !user.active) return null;
    if (user.role !== payload.role || (user.sessionVersion || 0) !== payload.ver) return null;
    return user;
  } catch {
    return null;
  }
}

async function requireAuth(req, res, next) {
  try {
    const user = await loadSession(req);
    if (!user) return res.status(401).json({ message: 'Please sign in' });
    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') return res.status(403).json({ message: 'Admins only' });
  next();
}

module.exports = { requireAuth, requireAdmin };
