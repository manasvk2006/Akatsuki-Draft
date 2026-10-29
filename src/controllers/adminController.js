const Post = require('../models/Post');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

// GET /admin/posts/pending
exports.getPendingPosts = asyncHandler(async (_req, res) => {
  const posts = await Post.find({ status: 'pending' })
    .sort({ createdAt: 1 })
    .populate('createdBy', 'name email');
  res.json({ success: true, count: posts.length, posts });
});

const review = (newStatus) =>
  asyncHandler(async (req, res) => {
    const post = await Post.findById(req.params.id);
    if (!post) throw new AppError('Post not found', 404);
    if (post.status !== 'pending') {
      throw new AppError(`Only pending posts can be reviewed (current status: ${post.status})`, 400);
    }
    post.status = newStatus;
    await post.save();
    res.json({ success: true, message: `Post ${newStatus}`, post });
  });

// PATCH /admin/posts/approve/:id
exports.approvePost = review('approved');
// PATCH /admin/posts/reject/:id
exports.rejectPost = review('rejected');
