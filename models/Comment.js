const mongoose = require('mongoose');

// Schema for a comment on a roadmap item
const commentSchema = new mongoose.Schema({
  roadmapId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Roadmap',
    required: true // must be linked to a roadmap
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // must have an author
  },
  text: {
    type: String,
    required: true,
    maxlength: 300 // limit to keep things readable
  },
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
    default: null // null means it's a top-level comment
  },
  createdAt: {
    type: Date,
    default: Date.now // set timestamp when comment is created
  }
});

// Export the comment model for use in routes/controllers
module.exports = mongoose.model('Comment', commentSchema);