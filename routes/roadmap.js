const express = require('express');
const Roadmap = require('../models/Roadmap');
const Comment = require('../models/Comment');
const verifyToken = require('../middleware/verifyToken');

const router = express.Router();

/**
 * GET /api/roadmaps
 * Optional query params: ?status=pending&sort=popular
 * Fetch all roadmap items
 */
router.get('/', async (req, res) => {
  try {
    const { status, sort } = req.query;
    const filter = status ? { status } : {};
    const sortOption = sort === 'popular' ? { votes: -1 } : { createdAt: -1 };

    const roadmaps = await Roadmap.find(filter).sort(sortOption).lean();
    res.json(roadmaps);
  } catch (err) {
    console.error('Error fetching roadmaps:', err.message);
    res.status(500).json({ message: 'Failed to load roadmap items.' });
  }
});

/**
 * GET /api/roadmaps/:id
 * Get a single roadmap item by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const roadmap = await Roadmap.findById(req.params.id);
    if (!roadmap) {
      return res.status(404).json({ message: 'Roadmap item not found.' });
    }
    res.json(roadmap);
  } catch (err) {
    console.error('Error fetching single roadmap:', err.message);
    res.status(500).json({ message: 'Something went wrong.' });
  }
});

/**
 * PUT /api/roadmaps/:id/upvote
 * Upvote a roadmap item (auth required)
 */
router.put('/:id/upvote', verifyToken, async (req, res) => {
  try {
    const roadmap = await Roadmap.findById(req.params.id);
    if (!roadmap) return res.status(404).json({ message: 'Roadmap item not found.' });

    if (roadmap.upvotes.includes(req.user.id)) {
      return res.status(400).json({ message: 'You already upvoted this item.' });
    }

    roadmap.upvotes.push(req.user.id);
    roadmap.votes = roadmap.upvotes.length;
    await roadmap.save();

    res.json({ message: 'Upvoted successfully.', votes: roadmap.votes });
  } catch (err) {
    console.error('Upvote error:', err.message);
    res.status(500).json({ message: 'Failed to upvote item.' });
  }
});

/**
 * POST /api/roadmaps/:id/comments
 * Add a new comment or reply (auth required)
 */
router.post('/:id/comments', verifyToken, async (req, res) => {
  console.log('req.user:', req.user);
  const { text, parentId } = req.body;

  try {
    // Check nesting depth if it's a reply
    if (parentId) {
      let depth = 1;
      let current = await Comment.findById(parentId);
      if (!current) return res.status(404).json({ message: 'Parent comment not found.' });

      while (current.parentId) {
        current = await Comment.findById(current.parentId);
        depth++;
        if (depth >= 3) break;
      }

      if (depth >= 3) {
        return res.status(400).json({ message: 'Max reply depth (3 levels) reached.' });
      }
    }

    const newComment = await Comment.create({
      roadmapId: req.params.id,
      author: req.user.id,
      text,
      parentId: parentId || null
    });

    res.status(201).json(newComment);
  } catch (err) {
    console.error('Comment creation failed:', err.message);
    res.status(500).json({ message: 'Failed to post comment.' });
  }
});

/**
 * GET /api/roadmaps/:id/comments
 * Get all comments for a roadmap item
 */
router.get('/:id/comments', async (req, res) => {
  try {
    const comments = await Comment.find({ roadmapId: req.params.id })
      .populate('author', 'name')
      .sort({ createdAt: 1 });

    res.json(comments);
  } catch (err) {
    console.error('Error fetching comments:', err.message);
    res.status(500).json({ message: 'Failed to load comments.' });
  }
});

/**
 * PUT /api/roadmaps/comments/:commentId
 * Edit a comment (auth required)
 */
router.put('/comments/:commentId', verifyToken, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) return res.status(404).json({ message: 'Comment not found.' });

    if (comment.author.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not allowed to edit this comment.' });
    }

    comment.text = req.body.text;
    await comment.save();

    res.json(comment);
  } catch (err) {
    console.error('Error updating comment:', err.message);
    res.status(500).json({ message: 'Failed to update comment.' });
  }
});

/**
 * DELETE /api/roadmaps/comments/:commentId
 * Delete a comment (auth required)
 */
router.delete('/comments/:commentId', verifyToken, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) return res.status(404).json({ message: 'Comment not found.' });

    if (comment.author.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not allowed to delete this comment.' });
    }

    await Comment.findByIdAndDelete(req.params.commentId);
    res.json({ message: 'Comment deleted successfully.' });
  } catch (err) {
    console.error('Error deleting comment:', err.message);
    res.status(500).json({ message: 'Failed to delete comment.' });
  }
});

module.exports = router;
