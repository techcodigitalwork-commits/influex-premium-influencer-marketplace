import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.js";

// Helper function to generate JWT
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// SIGNUP
export const signup = async (req, res) => {
  try {
    let { email, password, role } = req.body;

    // Trim email & convert to lowercase
    email = email.trim().toLowerCase();

    // Check if user already exists
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "User already exists"
      });
    }

    // Hash the password
    const hashed = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      email,
      passwordHash: hashed,
      role
    });

    // Generate JWT token
    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        email: user.email,
        role: user.role
      }
    });

  } catch (err) {
    console.error("Signup Error:", err);
    res.status(500).json({ success: false, message: "Server error during signup" });
  }
};

// LOGIN
export const login = async (req, res) => {
  try {
    let { email, password } = req.body;

    // Trim email & lowercase
    email = email.trim().toLowerCase();

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    // Generate JWT token
    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        email: user.email,
        role: user.role
      }
    });

  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ success: false, message: "Server error during login" });
  }
};
