import express from "express";
import { getNotifications, markNotificationRead } from "../controllers/notification.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Fetch all notifications for logged-in user
router.get("/", verifyToken, getNotifications);

// Mark single notification as read
router.patch("/read/:id", verifyToken, markNotificationRead);

export default router;
