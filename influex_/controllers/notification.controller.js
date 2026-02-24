import { createNotificationService } from "../services/notification.service.js";
import Notification from "../models/notification.js";

// Create notification via API (optional)
export const createNotification = async (req, res) => {
  try {
    const { userId, message, type, link } = req.body;

    const notification = await createNotificationService({
      userId,
      message,
      type,
      link
    });

    res.status(201).json({
      success: true,
      data: notification
    });
  } catch (error) {
    console.error("Create notification error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create notification"
    });
  }
};

export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user._id })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: notifications
    });
  } catch (error) {
    console.error("Get notifications error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch notifications" });
  }
};

export const markNotificationRead = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findById(id);
    if (!notification) {
      return res.status(404).json({ success: false, message: "Notification not found" });
    }

    if (String(notification.user) !== String(req.user._id)) {
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