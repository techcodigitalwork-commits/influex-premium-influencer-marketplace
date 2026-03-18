import Notification from "../models/notification.js";

export const createNotificationService = async ({
  user,
  sender,
  message,
  type = "application_accepted",
  link = "",
  applicationId = null,
  data = {}
}) => {
  try {

    if (!user) {
      throw new Error("User is required for notification");
    }

    const notification = await Notification.create({
      user,        // ✅ direct schema field
      sender,      // ✅ match schema
      message,
      type,
      link,
      applicationId,
      data
    });

    return notification;

  } catch (error) {
    console.error("Notification creation error:", error);
    throw error;
  }
};