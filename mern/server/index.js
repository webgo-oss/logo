require('dotenv').config();
const mongoose = require('mongoose');
const app = require('./app');
const ensureAdmin = require('./utils/ensureAdmin');
const ensureLogos = require('./utils/ensureLogos');

const PORT = process.env.PORT || 5000; // Render sets PORT for you

if (!process.env.MONGO_URI) {
  console.error('Startup failed: MONGO_URI is not set. Add it to server/.env (local) or the Render environment settings.');
  process.exit(1);
}

mongoose
  .connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 15000 })
  .then(async () => {
    console.log('MongoDB connected');
    await ensureLogos();
    await ensureAdmin();
    app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('Startup failed:', err.message);
    process.exit(1);
  });
