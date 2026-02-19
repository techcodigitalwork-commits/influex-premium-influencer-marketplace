// src/controllers/discover.controller.js
import { searchCreators } from "../services/discover.service.js";

export const search = async (req, res) => {
  const userRole = req.user.role;

  // 🔥 Override role based on logged-in user
  if (userRole === "brand") {
    req.query.role = "influencer";
  }

  if (userRole === "influencer") {
    req.query.role = "brand";
  }

  const data = await searchCreators(req.query);
  res.json({ success: true, ...data });
};

