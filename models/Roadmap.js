const mongoose = require('mongoose');

// Schema for a single roadmap item
const roadmapSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true // remove accidental spaces
  },
  description: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed'],
    default: 'pending'
  },
  upvotes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User' // reference to users who upvoted
    }
  ]
}, {
  timestamps: true // adds createdAt and updatedAt automatically
});

// Export the model so we can use it in routes/controllers
module.exports = mongoose.model('Roadmap', roadmapSchema);
