import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    required: true
  },

  name: {
    type: String,
    required: true
  },

  passwordHash: {
    type: String,
    required: true
  },

  role: {
    type: String,
    enum: ["brand", "influencer", "admin"],
    required: true
  },

  profileStatus: {
    type: String,
    enum: ["pending", "completed"],
    default: "pending"
  },

  // 🔥 TOKENS / USAGE
  bits: {
    type: Number,
    min: 0
  },

  applicationsUsed: {
    type: Number,
    default: 0
  },

  campaignsCreated: {
    type: Number,
    default: 0
  },

  // 💳 SUBSCRIPTION
  razorpaySubscriptionId: {
    type: String,
    default: null
  },

  isSubscribed: {
    type: Boolean,
    default: false
  },

  subscriptionExpiry: {
    type: Date
  },

  // 🪪 KYC
  kycStatus: {
    type: String,
    enum: ["Pending", "Verified", "Rejected"],
    default: "Pending"
  },

  isActive: {
    type: Boolean,
    default: true
  },

  // 📦 PLAN
  plan: {
    type: String,
    enum: [
      "free",
      "pro_monthly",
      "pro_plus_monthly",
      "pro_yearly",
      "pro_plus_yearly"
    ],
    default: "free"
  },

  // =======================
  // 📧 EMAIL VERIFICATION (OTP BASED)
  // =======================
  isEmailVerified: {
    type: Boolean,
    default: false
  },

  otp: {
    type: String // hashed OTP
  },

  otpExpiry: {
    type: Date
  },

  // =======================
  // 🔑 FORGOT PASSWORD
  // =======================
  resetPasswordToken: {
    type: String, // hashed token
    default: null
  },

  resetPasswordExpires: {
    type: Date
  }

}, { timestamps: true });


// ==============================
// 🔥 ROLE BASED BITS ASSIGNMENT
// ==============================
userSchema.pre("save", function (next) {
  if (this.isNew) {
    if (this.role === "brand") {
      this.bits = 200;
    } else if (this.role === "influencer") {
      this.bits = 100;
    } else {
      this.bits = 0;
    }
  }
  next();
});


// ==============================
// 🔗 VIRTUAL PROFILE LINK
// ==============================
userSchema.virtual("profile", {
  ref: "Profile",
  localField: "_id",
  foreignField: "user",
  justOne: true
});

userSchema.set("toObject", { virtuals: true });
userSchema.set("toJSON", { virtuals: true });


// ==============================
// 🚀 EXPORT
// ==============================
export default mongoose.model("User", userSchema);