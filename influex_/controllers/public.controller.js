// src/controllers/public.controller.js
import {
  getFeaturedCreators,
  getPublicStats,
  getTopCities
} from "../services/public.service.js";

export const featured = async (req, res) => {
  const role = req.query.role;
  const limit = Math.min(Number(req.query.limit) || 6, 12);

  const data = await getFeaturedCreators({ role, limit });
  res.json({ success: true, data });
};

export const stats = async (req, res) => {
  const data = await getPublicStats();
  res.json({ success: true, data });
};

export const topCities = async (req, res) => {
  const data = await getTopCities();
  res.json({ success: true, data });
};
