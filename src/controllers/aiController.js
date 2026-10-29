const Post = require('../models/Post');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { improveContent } = require('../utils/gemini');

// POST /ai/improve/:postId
// Improves the content with Gemini and saves it as a NEW draft (new _id, same user).
// The original post is left untouched.
exports.improvePost = asyncHandler(async (req, res) => {
  const original = await Post.findById(req.params.postId);
  if (!original) throw new AppError('Post not found', 404);
  if (String(original.createdBy) !== String(req.user._id)) {
    throw new AppError('You can only improve your own posts', 403);
  }

  const improved = await improveContent({
    title: original.title,
    description: original.description,
    content: original.content,
    instructions: req.body && req.body.instructions,
    file: req.file,
  });

  const newDraft = await Post.create({
    title: `${original.title} (AI Improved)`,
    description: original.description,
    content: improved,
    image: original.image,
    category: original.category,
    status: 'draft',
    createdBy: req.user._id,
  });

  res.status(201).json({
    success: true,
    message: 'Content improved and saved as a new draft',
    originalPostId: original._id,
    post: newDraft,
  });
});
