import Notification from "../models/notification.js";

export const createNotificationService = async ({
  userId,
  senderId,
  message,
  type = "application_accepted",
  link = "",
  applicationId = null
}) => {
  try {
    const notification = await Notification.create({
      user: userId,
      sender: senderId,
      message,
      type,
      link,
      applicationId 
    });

    return notification;
  } catch (error) {
    console.error("Notification creation error:", error);
    throw error;
  }
};