import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/user.js";
import sendEmail from "../utils/sendEmail.js";

// ---------------------- JWT TOKEN ----------------------
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

// ---------------------- ROLE BITS ----------------------
const ROLE_BITS = {
  influencer: 100,
  brand: 100,
  model: 100,
  photographer: 100,
  food: 150,
  travel: 120
};

// ---------------------- SIGNUP ----------------------
export const signup = async (req, res) => {
  try {
    const { email, password, role, name } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({ message: "All fields required" });
    }

    const roleLower = role.toLowerCase();

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({
        success: false,
        message: "Email already registered"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const bits = ROLE_BITS[roleLower] ?? 100;

    // OTP generate
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // 🔐 hash OTP (secure)
    const hashedOtp = crypto
      .createHash("sha256")
      .update(otp)
      .digest("hex");

    const user = await User.create({
      email,
      name,
      passwordHash: hashedPassword,
      role: roleLower,
      bits,
      applicationsUsed: 0,
      campaignsCreated: 0,
      isSubscribed: false,
      subscriptionExpiry: null,
      profileStatus: "pending",
      isEmailVerified: false,
      otp: hashedOtp,
      otpExpiry: new Date(Date.now() + 10 * 60 * 1000) // 10 min
    });

    // send OTP email
    try {
      await sendEmail(
        email,
        "Verify your email",
        `
        <h2>Your OTP is:</h2>
        <h1>${otp}</h1>
        <p>This OTP is valid for 10 minutes.</p>
        `
      );
    } catch (err) {
      console.log("Email failed:", err.message);
    }

    const token = generateToken(user);

    res.status(201).json({
      success: true,
      token,
      message: "Signup successful. Please verify OTP.",
      user: {
        id: user._id,
        role: user.role,
        bits: user.bits
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// ---------------------- VERIFY OTP ----------------------
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.isEmailVerified) {
      return res.json({ message: "Already verified" });
    }

    const hashedOtp = crypto
      .createHash("sha256")
      .update(otp)
      .digest("hex");

    if (user.otp !== hashedOtp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (user.otpExpiry < Date.now()) {
      return res.status(400).json({ message: "OTP expired" });
    }

    user.isEmailVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;

    await user.save();

    res.json({ success: true, message: "Email verified successfully" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ---------------------- RESEND OTP ----------------------
export const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });
       
    // 🔥 ADD THIS HERE (cooldown check)
    if (user.otpExpiry && user.otpExpiry > Date.now() - 60 * 1000) {
      return res.status(429).json({ message: "Wait before requesting OTP again" });
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const hashedOtp = crypto
      .createHash("sha256")
      .update(otp)
      .digest("hex");

    user.otp = hashedOtp;
   user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    await user.save();

    await sendEmail(
      email,
      "Your new OTP",
      `<h1>${otp}</h1>`
    );

    res.json({ success: true, message: "OTP resent" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ---------------------- LOGIN ----------------------
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) return res.status(400).json({ message: "Invalid credentials" });

    if (!user.isEmailVerified) {
      return res.status(403).json({ message: "Verify email first" });
    }

    const token = generateToken(user);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        role: user.role,
        bits: user.bits,
        plan: user.plan
      }
    });

  } catch (err) {
    res.status(500).json({ message: "Login failed" });
  }
};

// ---------------------- FORGOT PASSWORD ----------------------
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
   if (!user) {
  return res.json({ success: true, message: "If email exists, reset link sent" });
}

    const rawToken = crypto.randomBytes(32).toString("hex");
    

    // 🔐 hash token
    const hashedToken = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 60 * 60 * 1000;

    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${rawToken}&email=${email}`;

    await sendEmail(
      email,
      "Reset Password",
      `<a href="${resetUrl}">Reset Password</a>`
    );

    res.json({ success: true, message: "Reset link sent" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ---------------------- RESET PASSWORD ----------------------
export const resetPassword = async (req, res) => {
  try {
    const { email, token, newPassword } = req.body;
    console.log("EMAIL:", email);
console.log("RAW TOKEN:", token);

    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");
      console.log("HASHED TOKEN:", hashedToken);

    const user = await User.findOne({
      email,
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.json({ success: true, message: "Password reset successful" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};