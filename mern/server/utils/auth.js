const crypto = require('crypto');
const { promisify } = require('util');

const scrypt = promisify(crypto.scrypt);

const COOKIE_NAME = 'us_session';

let SECRET = process.env.SESSION_SECRET;
if (!SECRET || SECRET.length < 16) {
  SECRET = crypto.randomBytes(32).toString('hex');
  console.warn(
    '[auth] SESSION_SECRET is missing or too short in server/.env. Using a temporary one: everyone will be signed out whenever the server restarts.'
  );
}

/* ---------- hashing (passwords and access codes) ---------- */
async function hashSecret(secret) {
  const salt = crypto.randomBytes(16);
  const key = await scrypt(String(secret), salt, 64);
  return `${salt.toString('hex')}:${key.toString('hex')}`;
}

async function verifySecret(secret, stored) {
  if (!stored || !stored.includes(':')) return false;
  const [saltHex, keyHex] = stored.split(':');
  const expected = Buffer.from(keyHex, 'hex');
  const actual = await scrypt(String(secret), Buffer.from(saltHex, 'hex'), expected.length);
  return crypto.timingSafeEqual(actual, expected);
}

/* ---------- access codes (chosen by the admin) ---------- */
const CODE_MIN = 6;
const CODE_MAX = 64;

// Returns an error message, or null if the code is acceptable
function validateCode(code) {
  const c = String(code == null ? '' : code).trim();
  if (c.length < CODE_MIN) return `The access code must be at least ${CODE_MIN} characters`;
  if (c.length > CODE_MAX) return `The access code must be at most ${CODE_MAX} characters`;
  return null;
}

/* ---------- signed session tokens (HMAC-SHA256) ---------- */
const sign = (body) => crypto.createHmac('sha256', SECRET).update(body).digest('base64url');

function signToken(payload, ttlSeconds) {
  const body = Buffer.from(
    JSON.stringify({ ...payload, exp: Math.floor(Date.now() / 1000) + ttlSeconds })
  ).toString('base64url');
  return `${body}.${sign(body)}`;
}

function verifyToken(token) {
  if (!token || typeof token !== 'string') return null;
  const [body, sig] = token.split('.');
  if (!body || !sig) return null;
  const a = Buffer.from(sig);
  const b = Buffer.from(sign(body));
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString());
    if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

/* ---------- cookies ---------- */
function parseCookies(header = '') {
  const out = {};
  header.split(';').forEach((part) => {
    const i = part.indexOf('=');
    if (i < 0) return;
    const k = part.slice(0, i).trim();
    if (k) {
      try {
        out[k] = decodeURIComponent(part.slice(i + 1).trim());
      } catch {
        /* ignore malformed cookie */
      }
    }
  });
  return out;
}

const cookieOptions = (maxAgeSeconds) => ({
  httpOnly: true, // not readable from JavaScript
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  path: '/',
  ...(maxAgeSeconds ? { maxAge: maxAgeSeconds * 1000 } : {}),
});

function startSession(res, user) {
  const ttl = user.role === 'admin' ? 8 * 60 * 60 : 7 * 24 * 60 * 60;
  const token = signToken({ sub: String(user._id), role: user.role, ver: user.sessionVersion || 0 }, ttl);
  res.cookie(COOKIE_NAME, token, cookieOptions(ttl));
}

function endSession(res) {
  res.clearCookie(COOKIE_NAME, cookieOptions());
}

module.exports = {
  COOKIE_NAME,
  hashSecret,
  verifySecret,
  validateCode,
  verifyToken,
  parseCookies,
  startSession,
  endSession,
};
