const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

// users Route
router.post("/users", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(200)
        .json({ message: "User already registered with this email." });
    }

    // Hash the password before saving
    const hashedPassword =
      password === "google" ? "google" : await bcrypt.hash(password, 10);

    // Create and save the new user
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
    });
    res
      .status(201)
      .json({ message: "User created successfully", user: newUser });
  } catch (err) {
    console.error("Signup error:", err.message);
    res.status(500).json({ message: "Something went wrong during signup." });
  }
});

// generate jwt token

router.post('/jwt', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required to generate JWT.' });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Create JWT payload including user's MongoDB ObjectId as 'id'
    const payload = {
      id: user._id.toString(),
      email: user.email,
    };

    // Sign the token with secret and 7 days expiration
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(200).json({ token });
  } catch (err) {
    console.error('JWT generation error:', err.message);
    res.status(500).json({ message: 'Could not generate token.' });
  }
});

module.exports = router;
