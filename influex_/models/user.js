import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
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

  // 🔥 TOKENS (role-based, no default)
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

  kycStatus: {
    type: String,
    enum: ["Pending", "Verified", "Rejected"],
    default: "Pending"
  },

  isActive: {
    type: Boolean,
    default: true
  },

  // 🔥 PLAN SYSTEM
  plan: {
    type: String,
    enum: ["free", "pro_monthly", "pro_plus_monthly", "pro_yearly", "pro_plus_yearly"],
    default: "free"
  },
   // =======================
  // 🔥 EMAIL VERIFICATION
  // =======================
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: {
    type: String,
    default: null
  },
  emailVerificationTokenExpires: {
    type: Date
  },

  // =======================
  // 🔥 FORGOT PASSWORD
  // =======================
  resetPasswordToken: {
    type: String,
    default: null
  },
  resetPasswordExpires: {
    type: Date
  },
otp: String,
otpExpiry: Date,

}, { timestamps: true });


// ==============================
// 🔥 ROLE BASED TOKEN ASSIGNMENT
// ==============================
userSchema.pre("save", function (next) {
  if (this.isNew) {
    if (this.role === "brand") {
      this.bits = 200;
    } else if (this.role === "influencer") {
      this.bits = 100;
    } else {
      this.bits = 0; // admin ya fallback
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