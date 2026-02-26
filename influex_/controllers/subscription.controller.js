import { razorpay } from "../config/razorpay.js";
import User from "../models/user.js";

export const createRazorpaySubscription = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    // Make sure plan_id exists (you got from Razorpay dashboard)
    const { plan_id } = req.body;

    const subscription = await razorpay.subscriptions.create({
      plan_id: plan_SKmSEwh4wl4Tv6,
      total_count: 12,                // total months
      customer_notify: 1,
    });

    // Save subscription id for webhooks later
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