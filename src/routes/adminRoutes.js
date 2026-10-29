const router = require('express').Router();
const c = require('../controllers/adminController');
const { protect, restrictTo } = require('../middleware/auth');
const validateId = require('../middleware/validateId');

router.use(protect, restrictTo('admin'));

router.get('/posts/pending', c.getPendingPosts);
router.patch('/posts/approve/:id', validateId(), c.approvePost);
router.patch('/posts/reject/:id', validateId(), c.rejectPost);

module.exports = router;
