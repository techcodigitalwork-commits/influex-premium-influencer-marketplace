import { getRazorpayInstance } from "../config/razorpay.js";

const razorpay = getRazorpayInstance();
import User from "../models/user.js";
import crypto from "crypto";

const PLAN_DETAILS = {
  "plan_SVPLspo3dTExLj": {
    plan: "pro_monthly",
    role : "Brand",
    tokens: 1000,
    duration: 30
  },
  "plan_SVnuPYiXBIl8x5": {
    plan: "pro_plus_monthly",
    role : "Brand",
    tokens: 2500,
    duration: 30
  },
  "plan_SVnyugqOr3jRyH": {
    plan: "pro_yearly",
    role: "Brand",
    tokens: 12000,
    duration: 365
  },
  "plan_SVo6c8aoVBSgMf": {
    plan: "pro_plus_yearly",
    role: "Brand",
    tokens: 25000,
    duration: 365
  }
};


export const createRazorpaySubscription = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    const { plan_id } = req.body;
    console.log("BODY:", req.body);
    console.log("PLAN ID RECEIVED:", plan_id);

    const subscription = await razorpay.subscriptions.create({
       plan_id,
       total_count: 12,
       customer_notify: 1,
       notes: {
          userId: user._id.toString()
  }
});

    user.razorpaySubscriptionId = subscription.id;
    await user.save();

    return res.json({
      success: true,
      subscription,
    });
  } catch (err) {
    console.error("Create Subscription Error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to create subscription",
    });
  }
};
// MANUAL SUBSCRIPTION ACTIVATE
// ===============================
export const purchaseSubscription = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    user.isSubscribed = true;
    user.subscriptionExpiry = new Date(
      Date.now() + 30 * 24 * 60 * 60 * 1000
    );

    await user.save();

    res.json({ success: true, message: "Subscription activated manually" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Subscription failed" });
  }
};

// ===============================
// RAZORPAY WEBHOOK
// ===============================
export const razorpayWebhook = async (req, res) => {
  try {

    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    const signature = req.headers["x-razorpay-signature"];

    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(req.body.toString())
      .digest("hex");

    if (expectedSignature !== signature) {
      return res.status(400).send("Invalid signature");
    }

    const event = JSON.parse(req.body.toString());

    // ===============================
    // ACTIVATED
    // ===============================
    if (event.event === "subscription.activated") {
      const subscription = event.payload.subscription.entity;
      const subId = subscription.id;
      const planId = subscription.plan_id;

      const user = await User.findOne({
        razorpaySubscriptionId: subId
      });

      if (user && PLAN_DETAILS[planId]) {
        const planData = PLAN_DETAILS[planId];

        user.plan = planData.plan;
        user.bits = planData.tokens;

        user.subscriptionExpiry = new Date(
          Date.now() + planData.duration * 24 * 60 * 60 * 1000
        );

        await user.save();
      }
    }

    // ===============================
    // CHARGED
    // ===============================
    if (event.event === "subscription.charged") {
      const subscription = event.payload.subscription.entity;
      const subId = subscription.id;
      const planId = subscription.plan_id;

      const user = await User.findOne({
        razorpaySubscriptionId: subId
      });

      if (user && PLAN_DETAILS[planId]) {
        const planData = PLAN_DETAILS[planId];

        user.bits += planData.tokens;

        user.subscriptionExpiry = new Date(
          Date.now() + planData.duration * 24 * 60 * 60 * 1000
        );

        await user.save();
      }
    }

    // ===============================
    // CANCELLED
    // ===============================
    if (event.event === "subscription.cancelled") {
      const subId = event.payload.subscription.entity.id;

      const user = await User.findOne({
        razorpaySubscriptionId: subId
      });

      if (user) {
        user.plan = "free";
        user.bits = 100;
        user.subscriptionExpiry = null;

        await user.save();
      }
    }

    res.status(200).send("OK");

  } catch (error) {
    console.error("Webhook Error:", error);
    res.status(500).send("Webhook error");
  }
};
  