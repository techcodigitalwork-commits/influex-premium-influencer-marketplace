import Notification from "../models/notification.js";

export const createNotificationService = async ({
  userId,
  message,
  type = "application_accepted",
  link = ""
}) => {
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
    throw error;
  }
};