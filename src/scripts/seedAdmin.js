require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');

(async () => {
  try {
    await connectDB();
    const email = (process.env.SEED_ADMIN_EMAIL || 'admin@akatsuki.com').toLowerCase();
    const existing = await User.findOne({ email });
    if (existing) {
      console.log(`Admin already exists: ${email}`);
    } else {
      await User.create({
        name: process.env.SEED_ADMIN_NAME || 'Admin',
        email,
        password: process.env.SEED_ADMIN_PASSWORD || 'Admin@12345',
        role: 'admin',
      });
      console.log(`Admin created: ${email}`);
    }
  } catch (err) {
    console.error(err.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
})();
