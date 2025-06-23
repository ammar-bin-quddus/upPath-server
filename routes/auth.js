const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

// Signup Route
router.post("/users", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
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
    
  } catch (err) {
    console.error("Signup error:", err.message);
    res.status(500).json({ message: "Something went wrong during signup." });
  }
});

// generate jwt token

router.post("/jwt", async (req, res) => {
  const { email } = req.body;

  // Early exit if email is missing
  if (!email) {
    return res
      .status(400)
      .json({ message: "Email is required to generate a token." });
  }

  try {
    // Check if the user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ message: "No user found with that email." });
    }

    // Create a signed JWT
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" } // 7-day token validity
    );

    res.status(200).json({ token });
  } catch (err) {
    console.error("Error generating JWT:", err.message || err);
    res
      .status(500)
      .json({ message: "Something went wrong while creating token." });
  }
});

module.exports = router;
