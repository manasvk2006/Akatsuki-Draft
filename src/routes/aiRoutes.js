const router = require('express').Router();
const { improvePost } = require('../controllers/aiController');
const { protect } = require('../middleware/auth');
const validateId = require('../middleware/validateId');
const upload = require('../middleware/upload');

// Optional multipart field "file" (PDF/TXT/MD/HTML/CSV) used as reference by Gemini.
router.post('/improve/:postId', protect, validateId('postId'), upload.single('file'), improvePost);

module.exports = router;
