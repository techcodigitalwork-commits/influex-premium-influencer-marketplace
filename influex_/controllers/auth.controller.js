// import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.js";

// Token generator
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

// ---------------------- Dynamic Bits ----------------------
// Roles / categories that get free bits
const ROLE_BITS = {
  influencer: 100,
  model: 100,
  photographer: 100,
  food: 150,
  travel: 120
};

// ---------------------- SIGNUP ----------------------
export const signup = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    const roleLower = role.toLowerCase();

    // Check if email exists
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({
        success: false,
        message: "Email already registered"
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Assign bits dynamically based on role/category
    // Brands get 0 bits, others get ROLE_BITS
    const bits = ROLE_BITS[roleLower] || 0;

    // Create user with subscription fields
    const user = await User.create({
      email,
      passwordHash: hashedPassword,
      role: roleLower,
      bits: bits,                 // ← Dynamic bits here
      applicationsUsed: 0,
      campaignsCreated: 0,        // for brand campaigns
      isSubscribed: false,
      subscriptionExpiry: null,
      profileStatus: "pending"    // optional: track profile completion
    });

    const token = generateToken(user);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        role: user.role,
        bits: user.bits,
        isSubscribed: user.isSubscribed,
        campaignsCreated: user.campaignsCreated
      }
    });

  } catch (err) {
    console.error("Signup Error:", err);
    res.status(500).json({
      success: false,
      message: "Signup failed"
    });
  }
};

// ---------------------- LOGIN ----------------------
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    const token = generateToken(user);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        role: user.role,
        bits: user.bits,
        isSubscribed: user.isSubscribed,
        campaignsCreated: user.campaignsCreated
      },
      hasProfile: user.profileStatus === "completed"
    });

  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({
      success: false,
      message: "Login failed"
    });
  }
};