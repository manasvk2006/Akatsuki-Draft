const mongoose = require('mongoose');
const AppError = require('../utils/AppError');

module.exports = (paramName = 'id') => (req, _res, next) => {
  if (!mongoose.isValidObjectId(req.params[paramName])) {
    return next(new AppError(`Invalid ${paramName}`, 400));
  }
  next();
};
