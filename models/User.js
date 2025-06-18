const mongoose = require('mongoose');

// Define the schema for a User
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true, // name is required
    trim: true      // remove any extra spaces
  },
  email: {
    type: String,
    required: true,
    unique: true,   // each email must be unique
    lowercase: true // store in lowercase
  },
  password: {
    type: String,
    required: true,
    minlength: 6    // basic check for password strength
  }
}, {
  timestamps: true // automatically adds createdAt and updatedAt fields
});

// Export the model so we can use it elsewhere
module.exports = mongoose.model('User', userSchema);

