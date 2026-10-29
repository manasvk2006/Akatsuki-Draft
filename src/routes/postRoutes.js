const router = require('express').Router();
const c = require('../controllers/postController');
const { protect } = require('../middleware/auth');
const validateId = require('../middleware/validateId');

router.get('/', c.getApprovedPosts);
router.post('/', protect, c.createPost);

// NOTE: must be declared before "/:id" so "my-posts" is not treated as an id.
router.get('/my-posts', protect, c.getMyPosts);

router.get('/:id', validateId(), c.getApprovedPostById);
router.patch('/:id', protect, validateId(), c.updatePost);
router.delete('/:id', protect, validateId(), c.deletePost);

module.exports = router;
