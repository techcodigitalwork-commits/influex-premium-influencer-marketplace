import express from "express";
import { getNotifications, markNotificationRead,createNotification} from "../controllers/notification.controller.js";
import auth  from "../middlewares/auth.middleware.js";

const router = express.Router();

// Fetch all notifications for logged-in user
router.get("/", auth, getNotifications);

// Mark single notification as read
router.patch("/read/:id", auth, markNotificationRead);
router.post("/create",auth,createNotification);

export default router;
