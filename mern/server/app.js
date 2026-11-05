const path = require('path');
const fs = require('fs');
const express = require('express');
const logoRoutes = require('./routes/logos');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const { requireAuth } = require('./middleware/auth');

const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '10kb' }));

// Preview images are only served to signed-in people. The full-size files (png / jpg / tiff)
// are not exposed directly at all: they only come through the download route below.
app.use(
  '/assets/logos/preview',
  requireAuth,
  express.static(path.join(__dirname, 'public', 'logos', 'preview'), {
    setHeaders: (res) => res.setHeader('Cache-Control', 'private, max-age=86400'),
  })
);

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/logos', requireAuth, logoRoutes);
app.get('/api/health', (_req, res) => res.json({ ok: true }));

// In production, serve the built React app (it contains no secrets; all data sits behind the API)
const dist = path.join(__dirname, '..', 'client', 'dist');
if (fs.existsSync(dist)) {
  app.use(express.static(dist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/assets')) return next();
    res.sendFile(path.join(dist, 'index.html'));
  });
}

app.use((err, _req, res, _next) => {
  if (err && err.type === 'entity.parse.failed') return res.status(400).json({ message: 'Invalid request' });
  console.error(err);
  res.status(500).json({ message: 'Server error' });
});

module.exports = app;
