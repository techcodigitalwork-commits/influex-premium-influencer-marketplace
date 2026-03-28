
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/user.js";
import sendEmail from "../utils/sendEmail.js";

// ---------------------- JWT TOKEN GENERATOR ----------------------
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

// ---------------------- Dynamic Bits ----------------------
const ROLE_BITS = {
  influencer: 100,
  brand: 100,
  model: 100,
  photographer: 100,
  food: 150,
  travel: 120
};

// ---------------------- SIGNUP ----------------------

// ---------------------- SIGNUP ----------------------
export const signup = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({ message: "All fields required" });
    }

    const roleLower = role.toLowerCase();

    // Check existing
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({
        success: false,
        message: "Email already registered"
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const bits = ROLE_BITS[roleLower] ?? 100;

    // Token
    const emailToken = crypto.randomBytes(32).toString("hex");

    // Create user
    const user = await User.create({
      email,
      passwordHash: hashedPassword,
      role: roleLower,
      bits,
      applicationsUsed: 0,
      campaignsCreated: 0,
      isSubscribed: false,
      subscriptionExpiry: null,
      profileStatus: "pending",
      isEmailVerified: false,
      emailVerificationToken: emailToken,
      emailVerificationTokenExpires: Date.now() + 24 * 60 * 60 * 1000
    });

    // 🔥 EMAIL SEND (SAFE VERSION)
    try {
      const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${emailToken}&email=${email}`;

     await sendEmail(
  email,
  "Verify your email",
  `
  <h2>Welcome to Collabzy 🚀</h2>
  <p>Please verify your email:</p>

  <a href="${verifyUrl}" 
     style="padding:12px 20px;background:black;color:white;text-decoration:none;border-radius:6px;">
     Verify Email
  </a>

  <p>This link expires in 24 hours</p>
  `
);

    } catch (mailErr) {
      console.log("❌ Email failed (but signup success):", mailErr.message);
    }

    const token = generateToken(user);

    res.status(201).json({
      success: true,
      token,
      message: "Signup successful. Please verify your email.",
      user: {
        id: user._id,
        role: user.role,
        bits: user.bits,
        isSubscribed: user.isSubscribed,
        campaignsCreated: user.campaignsCreated
      }
    });

  } catch (err) {
    console.error("🔥 FULL SIGNUP ERROR:", err);
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};


// ---------------------- VERIFY EMAIL ----------------------
export const verifyEmail = async (req, res) => {
  try {
    const { email, token } = req.query;

    const user = await User.findOne({
      email,
      emailVerificationToken: token,
      emailVerificationTokenExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationTokenExpires = undefined;

    await user.save();

    res.json({ success: true, message: "Email verified successfully" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// ---------------------- LOGIN ----------------------
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // ❌ block if not verified
    if (!user.isEmailVerified) {
      return res.status(403).json({
        message: "Please verify your email first"
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
        plan: user.plan,
        isSubscribed: user.isSubscribed,
        campaignsCreated: user.campaignsCreated
      },
      hasProfile: user.profileStatus === "completed"
    });

  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ message: "Login failed" });
  }
};


// ---------------------- FORGOT PASSWORD ----------------------
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const token = crypto.randomBytes(32).toString("hex");

    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 60 * 60 * 1000;

    await user.save();

    try {
      const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}&email=${email}`;

      await sendEmail(
        email,
        "Reset Password",
        `<h3>Reset Password</h3>
         <a href="${resetUrl}">Click here</a>`
      );

    } catch (mailErr) {
      console.log("❌ Reset email failed:", mailErr.message);
    }

    res.json({
      success: true,
      message: "Password reset email sent"
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ---------------------- RESET PASSWORD ----------------------
export const resetPassword = async (req, res) => {
  try {
    const { email, token, newPassword } = req.body;

    const user = await User.findOne({
      email,
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) return res.status(400).json({ success: false, message: "Invalid or expired token" });

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ success: true, message: "Password reset successful" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// import bcrypt from "bcryptjs";
// import jwt from "jsonwebtoken";
// import User from "../models/user.js";

// // Token generator
// const generateToken = (user) => {
//   return jwt.sign(
//     {
//       id: user._id,
//       role: user.role
//     },
//     process.env.JWT_SECRET,
//     { expiresIn: "7d" }
//   );
// };

// // ---------------------- Dynamic Bits ----------------------
// // Roles / categories that get free bits
// const ROLE_BITS = {
//   influencer: 100,
//   brand : 100,
//   model: 100,
//   photographer: 100,
//   food: 150,
//   travel: 120
// };

// // ---------------------- SIGNUP ----------------------
// export const signup = async (req, res) => {
//   try {
//     const { email, password, role } = req.body;
//     const roleLower = role.toLowerCase();

//     // Check if email exists
//     const exists = await User.findOne({ email });
//     if (exists) {
//       return res.status(400).json({
//         success: false,
//         message: "Email already registered"
//       });
//     }

//     // Hash password
//     const hashedPassword = await bcrypt.hash(password, 10);

//     // Assign bits dynamically based on role/category
//     // Brands get 0 bits, others get ROLE_BITS
//     //const bits = ROLE_BITS[roleLower] || 0;
//     const bits = ROLE_BITS[roleLower] ?? 100;
//     // Create user with subscription fields
//     const user = await User.create({
//       email,
//       passwordHash: hashedPassword,
//       role: roleLower,
//       bits: bits,                 // ← Dynamic bits here
//       applicationsUsed: 0,
//       campaignsCreated: 0,        // for brand campaigns
//       isSubscribed: false,
//       subscriptionExpiry: null,
//       profileStatus: "pending"    // optional: track profile completion
//     });

//     const token = generateToken(user);

//     res.status(201).json({
//       success: true,
//       token,
//       user: {
//         id: user._id,
//         role: user.role,
//         bits: user.bits,
//         isSubscribed: user.isSubscribed,
//         campaignsCreated: user.campaignsCreated
//       }
//     });

//   } catch (err) {
//     console.error("Signup Error:", err);
//     res.status(500).json({
//       success: false,
//       message: "Signup failed"
//     });
//   }
// };

// // ---------------------- LOGIN ----------------------
// export const login = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid credentials"
//       });
//     }

//     const match = await bcrypt.compare(password, user.passwordHash);
//     if (!match) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid credentials"
//       });
//     }

//     const token = generateToken(user);

//     res.json({
//       success: true,
//       token,
//       user: {
//         id: user._id,
//         role: user.role,
//         bits: user.bits,
//         plan: user.plan,
//         isSubscribed: user.isSubscribed,
//         campaignsCreated: user.campaignsCreated
//       },
//       hasProfile: user.profileStatus === "completed"
//     });

//   } catch (err) {
//     console.error("Login Error:", err);
//     res.status(500).json({
//       success: false,
//       message: "Login failed"
//     });
//   }
// };