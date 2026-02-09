// src/controllers/discover.controller.js
import { searchCreators } from "../services/discover.service.js";

export const search = async (req, res) => {
  const data = await searchCreators(req.query);
  res.json({ success: true, ...data });
};
