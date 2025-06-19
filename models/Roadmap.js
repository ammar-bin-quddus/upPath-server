const mongoose = require('mongoose');

// Schema for roadmap items (features, ideas, etc.)
const roadmapSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['Planned', 'In Progress', 'Completed'],
    default: 'Planned'
  },
  category: {
    type: String,
    trim: true,
    default: 'General'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  votes: {
    type: Number,
    default: 0
  },
  author: {
    type: String,
    default: 'Admin'
  },
  upvotes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  ]
});

// Export the model for use in routes/controllers
module.exports = mongoose.model('Roadmap', roadmapSchema);
