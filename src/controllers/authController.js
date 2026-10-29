const User = require('../models/User');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { signToken } = require('../utils/token');

exports.register = asyncHandler(async (req, res) => {
  const { name, email, password, role, adminSecret } = req.body;

  if (!name || !email || !password) {
    throw new AppError('name, email and password are required', 400);
  }

  // Everyone is a normal user unless the correct adminSecret is supplied.
  let finalRole = 'user';
  if (role === 'admin') {
    if (!process.env.ADMIN_SECRET || adminSecret !== process.env.ADMIN_SECRET) {
      throw new AppError('Invalid admin secret. Cannot register as admin.', 403);
    }
    finalRole = 'admin';
  }

  const exists = await User.findOne({ email: String(email).toLowerCase() });
  if (exists) throw new AppError('Email is already registered', 409);

  const user = await User.create({ name, email, password, role: finalRole });
  const token = signToken(user);

  res.status(201).json({ success: true, message: 'Registered successfully', token, user });
});

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) throw new AppError('email and password are required', 400);

  const user = await User.findOne({ email: String(email).toLowerCase() }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw new AppError('Invalid email or password', 401);
  }

  const token = signToken(user);
  res.json({ success: true, message: 'Logged in successfully', token, user });
});

exports.me = asyncHandler(async (req, res) => {
  res.json({ success: true, user: req.user });
});
