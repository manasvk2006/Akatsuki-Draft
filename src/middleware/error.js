const AppError = require('../utils/AppError');

exports.notFound = (req, _res, next) => {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));
};

// eslint-disable-next-line no-unused-vars
exports.errorHandler = (err, _req, res, _next) => {
  let status = err.statusCode || 500;
  let message = err.message || 'Internal server error';

  if (err.name === 'ValidationError') {
    status = 400;
    message = Object.values(err.errors).map((e) => e.message).join(', ');
  } else if (err.code === 11000) {
    status = 409;
    message = 'Email is already registered';
  } else if (err.name === 'CastError') {
    status = 400;
    message = `Invalid ${err.path}`;
  } else if (err.name === 'MulterError') {
    status = 400;
    message = err.message;
  }

  if (status === 500) console.error(err);

  res.status(status).json({ success: false, message });
};
