import express from "express";
import { getNotifications, markNotificationRead, createNotification } from "../controllers/notification.controller.js";
import auth from "../middlewares/auth.middleware.js";

const router = express.Router();

// Middleware to disable caching for notifications
const noCache = (req, res, next) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  res.setHeader("Surrogate-Control", "no-store");
  next();
};

// Fetch all notifications for logged-in user (no caching)
router.get("/", auth, noCache, getNotifications);

// Mark single notification as read
router.patch("/read/:id", auth, markNotificationRead);

// Create a notification
router.post("/create", auth, createNotification);

export default router;