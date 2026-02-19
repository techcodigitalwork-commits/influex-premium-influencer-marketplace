// src/controllers/meta.controller.js
import { fetchCities } from "../services/meta.service.js";

export const getCities = async (req, res) => {
  const cities = await fetchCities();
  res.json({
    success: true,
    data: cities
  });
};
export const getCategories = async (req, res) => {
  const categories = await fetchCategories();
  res.json({ success: true, data: categories });
};