const Post = require('../models/Post');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

const USER_SETTABLE_STATUS = ['draft', 'pending'];
const EDITABLE_FIELDS = ['title', 'description', 'content', 'image', 'category'];

// POST /posts  -> create a post (status "pending") or a draft (status "draft", default)
exports.createPost = asyncHandler(async (req, res) => {
  const { title, description, content, image, category, status } = req.body;

  if (!title || !content) throw new AppError('title and content are required', 400);

  let finalStatus = 'draft';
  if (status !== undefined) {
    if (!USER_SETTABLE_STATUS.includes(status)) {
      throw new AppError('status must be "draft" or "pending"', 400);
    }
    finalStatus = status;
  }

  const post = await Post.create({
    title,
    description,
    content,
    image,
    category,
    status: finalStatus,
    createdBy: req.user._id,
  });

  res.status(201).json({ success: true, message: 'Post created', post });
});

// GET /posts -> all approved posts (supports ?category=&search=&page=&limit=)
exports.getApprovedPosts = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 100);

  const filter = { status: 'approved' };
  if (req.query.category) filter.category = req.query.category;
  if (req.query.search) {
    const rx = new RegExp(String(req.query.search).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    filter.$or = [{ title: rx }, { description: rx }];
  }

  const [posts, total] = await Promise.all([
    Post.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('createdBy', 'name email'),
    Post.countDocuments(filter),
  ]);

  res.json({
    success: true,
    count: posts.length,
    total,
    page,
    pages: Math.ceil(total / limit),
    posts,
  });
});

// GET /posts/:id -> one approved post
exports.getApprovedPostById = asyncHandler(async (req, res) => {
  const post = await Post.findOne({ _id: req.params.id, status: 'approved' }).populate(
    'createdBy',
    'name email'
  );
  if (!post) throw new AppError('Approved post not found', 404);
  res.json({ success: true, post });
});

// GET /posts/my-posts -> own posts and drafts (optional ?status=)
exports.getMyPosts = asyncHandler(async (req, res) => {
  const filter = { createdBy: req.user._id };
  if (req.query.status) filter.status = req.query.status;

  const posts = await Post.find(filter).sort({ createdAt: -1 });
  res.json({ success: true, count: posts.length, posts });
});

// PATCH /posts/:id -> update own post
exports.updatePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) throw new AppError('Post not found', 404);
  if (String(post.createdBy) !== String(req.user._id)) {
    throw new AppError('You can only update your own posts', 403);
  }

  let contentChanged = false;
  EDITABLE_FIELDS.forEach((f) => {
    if (req.body[f] !== undefined) {
      post[f] = req.body[f];
      contentChanged = true;
    }
  });

  if (req.body.status !== undefined) {
    if (!USER_SETTABLE_STATUS.includes(req.body.status)) {
      throw new AppError('status can only be set to "draft" or "pending"', 400);
    }
    post.status = req.body.status;
  } else if (contentChanged && post.status === 'approved') {
    // Editing a published post sends it back for re-approval.
    post.status = 'pending';
  }

  await post.save();
  res.json({ success: true, message: 'Post updated', post });
});

// DELETE /posts/:id -> delete own post
exports.deletePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) throw new AppError('Post not found', 404);
  if (String(post.createdBy) !== String(req.user._id)) {
    throw new AppError('You can only delete your own posts', 403);
  }
  await post.deleteOne();
  res.json({ success: true, message: 'Post deleted' });
});
