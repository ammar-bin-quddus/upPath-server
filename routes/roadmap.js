const express = require('express');
const Roadmap = require('../models/Roadmap');
const Comment = require('../models/Comment');
const verifyToken = require('../middleware/verifyToken');

const router = express.Router();

// Get all roadmap items (read-only)
router.get('/', async (req, res) => {
  try {
    const items = await Roadmap.find().lean();
    res.json(items);
  } catch (err) {
    console.error('Failed to fetch roadmap items:', err.message);
    res.status(500).json({ message: 'Something went wrong.' });
  }
});

// Upvote a roadmap item
router.put('/:id/upvote', verifyToken, async (req, res) => {
  try {
    const roadmap = await Roadmap.findById(req.params.id);
    if (!roadmap) {
      return res.status(404).json({ message: 'Roadmap not found' });
    }

    if (roadmap.upvotes.includes(req.user.id)) {
      return res.status(400).json({ message: 'You already upvoted this item.' });
    }

    roadmap.upvotes.push(req.user.id);
    await roadmap.save();

    res.json({
      message: 'Upvoted successfully.',
      upvotes: roadmap.upvotes.length
    });
  } catch (err) {
    console.error('Upvote error:', err.message);
    res.status(500).json({ message: 'Could not upvote item.' });
  }
});

// Add a comment to a roadmap item
router.post('/:id/comments', verifyToken, async (req, res) => {
  const { text, parentId } = req.body;

  try {
    // Prevent deep nesting (max 3 levels)
    if (parentId) {
      let depth = 1;
      let current = await Comment.findById(parentId);
      if (!current) return res.status(404).json({ message: 'Parent comment not found' });

      while (current.parentId) {
        current = await Comment.findById(current.parentId);
        depth++;
        if (depth >= 3) break;
      }

      if (depth >= 3) {
        return res.status(400).json({ message: 'Maximum reply depth (3 levels) reached' });
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
    res.status(500).json({ message: 'Could not add comment.' });
  }
});

// Get all comments for a roadmap item
router.get('/:id/comments', async (req, res) => {
  try {
    const comments = await Comment.find({ roadmapId: req.params.id })
      .populate('author', 'name')
      .sort({ createdAt: 1 }); // sort oldest to newest

    res.json(comments);
  } catch (err) {
    console.error('Failed to fetch comments:', err.message);
    res.status(500).json({ message: 'Unable to load comments.' });
  }
});

// Edit a comment
router.put('/comments/:commentId', verifyToken, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    if (comment.author.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You are not allowed to edit this comment.' });
    }

    comment.text = req.body.text;
    await comment.save();

    res.json(comment);
  } catch (err) {
    console.error('Failed to update comment:', err.message);
    res.status(500).json({ message: 'Could not update comment.' });
  }
});

// Delete a comment
router.delete('/comments/:commentId', verifyToken, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    if (comment.author.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You are not allowed to delete this comment.' });
    }

    await Comment.findByIdAndDelete(req.params.commentId);
    res.json({ message: 'Comment deleted successfully.' });
  } catch (err) {
    console.error('Comment deletion failed:', err.message);
    res.status(500).json({ message: 'Could not delete comment.' });
  }
});

module.exports = router;
