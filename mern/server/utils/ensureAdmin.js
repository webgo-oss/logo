const User = require('../models/User');
const { hashSecret, verifySecret } = require('./auth');

// Makes sure the admin account from server/.env exists. The .env values are the source of truth:
// change ADMIN_PASSWORD there, restart the server, and the admin password is updated.
module.exports = async function ensureAdmin() {
  const email = String(process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.warn('[auth] ADMIN_EMAIL / ADMIN_PASSWORD are not set in server/.env, so no admin account exists.');
    return;
  }
  if (password.length < 8) {
    console.warn('[auth] ADMIN_PASSWORD must be at least 8 characters. Admin account was not created.');
    return;
  }

  let admin = await User.findOne({ email });
  if (!admin) {
    await User.create({ email, name: 'Administrator', role: 'admin', secretHash: await hashSecret(password) });
    console.log(`[auth] Admin account created: ${email}`);
  } else {
    let changed = false;
    if (admin.role !== 'admin') {
      admin.role = 'admin';
      changed = true;
    }
    if (!admin.active) {
      admin.active = true;
      changed = true;
    }
    if (!(await verifySecret(password, admin.secretHash))) {
      admin.secretHash = await hashSecret(password);
      admin.sessionVersion = (admin.sessionVersion || 0) + 1;
      changed = true;
      console.log('[auth] Admin password updated from server/.env');
    }
    if (changed) await admin.save();
  }

  if (password === 'Admin@12345') {
    console.warn('[auth] You are using the sample admin password. Change ADMIN_PASSWORD in server/.env.');
  }
};
