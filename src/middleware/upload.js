const multer = require('multer');
const AppError = require('../utils/AppError');

const ALLOWED = [
  'application/pdf',
  'text/plain',
  'text/markdown',
  'text/html',
  'text/csv',
];

// Memory storage: the file is sent to Gemini as inline data (limit 20MB per request).
module.exports = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED.includes(file.mimetype)) {
      return cb(new AppError('Unsupported file type. Use PDF, TXT, MD, HTML or CSV.', 400));
    }
    cb(null, true);
  },
});
