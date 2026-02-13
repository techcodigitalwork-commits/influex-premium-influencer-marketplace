import Notification from "../models/notification.model.js";

// 1️⃣ Create Notification (used internally)
export const createNotification = async ({ userId, message, type = "application_accepted", link = "" }) => {
  try {
    const notification = await Notification.create({
      user: userId,
      message,
      type,
      link
    });
    return notification;
  } catch (error) {
    console.error("Notification creation error:", error);
  }
};

// 2️⃣ Get Notifications for logged-in user
export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user.profileId })
      .sort({ createdAt: -1 }); // latest first

    res.json({
      success: true,
      data: notifications
    });
  } catch (error) {
    console.error("Get notifications error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch notifications" });
  }
};

// 3️⃣ Mark notification as read
export const markNotificationRead = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findById(id);
    if (!notification) {
      return res.status(404).json({ success: false, message: "Notification not found" });
    }

    // Only owner can mark as read
    if (String(notification.user) !== String(req.user.profileId)) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    notification.read = true;
    await notification.save();

    res.json({ success: true, message: "Notification marked as read" });
  } catch (error) {
    console.error("Mark notification read error:", error);
    res.status(500).json({ success: false, message: "Failed to mark notification as read" });
  }
};
