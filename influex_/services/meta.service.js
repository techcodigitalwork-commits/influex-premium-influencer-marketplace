import Profile from "../models/profile.js";
import { getCache, setCache } from "../utils/redis.js";

export const fetchCities = async () => {
  const cacheKey = "meta:cities";

  const cached = await getCache(cacheKey);
  if (cached) return cached;

  const cities = await Profile.distinct("location", {
    location: { $ne: null }
  });

  const formatted = cities
    .map(c => c.trim())
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b));

  await setCache(cacheKey, formatted, 21600); // 6 hours

  return formatted;
};
export const fetchCategories = async () => {
  const cacheKey = "meta:categories";

  const cached = await getCache(cacheKey);
  if (cached) return cached;

  const categories = await Profile.distinct("categories", {
    categories: { $ne: null }
  });

  const formatted = categories
    .map(c => c.trim())
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b));

  await setCache(cacheKey, formatted, 21600); // 6 hours

  return formatted;
};