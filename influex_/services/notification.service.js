import Notification from "../models/notification.js";
export const createNotificationService = async ({
  user,
  userId,
  sender,
  senderId,
  message,
  type = "application_accepted",
  link = "",
  applicationId = null,
  data = {}
}) => {
  try {

    const finalUser = user || userId;
    const finalSender = sender || senderId;

    if (!finalUser) {
      throw new Error("User is required for notification");
    }

    const notification = await Notification.create({
      user: finalUser,
      sender: finalSender,
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