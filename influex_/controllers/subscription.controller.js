import  razorpay  from "../config/razorpay.js";
import User from "../models/user.js";
import crypto from "crypto";


export const createRazorpaySubscription = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    const { plan_id } = req.body;

    const subscription = await razorpay.subscriptions.create({
      plan_id: plan_id,
      total_count: 12,
      customer_notify: 1,
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
      .update(req.body)
      .digest("hex");

    if (expectedSignature !== signature) {
      return res.status(400).send("Invalid signature");
    }

    const event = JSON.parse(req.body.toString());

    // When subscription activated
    if (event.event === "subscription.activated") {
      const subId = event.payload.subscription.entity.id;

      const user = await User.findOne({
        razorpaySubscriptionId: subId,
      });

      if (user) {
        user.isSubscribed = true;
        user.subscriptionExpiry = new Date(
          Date.now() + 30 * 24 * 60 * 60 * 1000
        );
        await user.save();
      }
    }

    // When payment failed
    if (event.event === "subscription.cancelled") {
      const subId = event.payload.subscription.entity.id;

      const user = await User.findOne({
        razorpaySubscriptionId: subId,
      });

      if (user) {
        user.isSubscribed = false;
        await user.save();
      }
    }

    res.status(200).send("OK");
  } catch (error) {
    console.error("Webhook Error:", error);
    res.status(500).send("Webhook error");
  }
};