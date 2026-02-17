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
