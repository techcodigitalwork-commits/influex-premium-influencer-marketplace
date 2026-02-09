// src/services/public.service.js
import User from "../models/user.js";
import { getCache, setCache } from "../utils/redis.js";

/* ================= FEATURED TALENT ================= */

export const getFeaturedCreators = async ({ role, limit }) => {
  const cacheKey = `home:featured:${role || "all"}:${limit}`;
  const cached = await getCache(cacheKey);
  if (cached) return cached;

  const filter = {
    kycStatus: "Verified",
    isActive: true,
    profileComplete: true,
    role: role ? role : { $in: ["Influencer", "Model", "Photographer"] }
  };

  const creators = await User.find(filter)
    .sort({ isFeatured: -1, rating: -1, updatedAt: -1 })
    .limit(limit)
    .select("name role city category rating budgetMin budgetMax avatar");

  const formatted = creators.map(u => ({
    id: u._id,
    name: u.name,
    role: u.role,
    city: u.city,
    category: u.category,
    rating: u.rating,
    priceRange: `₹${u.budgetMin} - ₹${u.budgetMax}`,
    avatar: u.avatar,
    profileUrl: `/profile/${u._id}`
  }));

  await setCache(cacheKey, formatted, 1800); // 30 min
  return formatted;
};

/* ================= STATS ================= */

export const getPublicStats = async () => {
  const cacheKey = "home:stats";
  const cached = await getCache(cacheKey);
  if (cached) return cached;

  const creators = await User.countDocuments({
    role: { $in: ["Influencer", "Model", "Photographer"] },
    kycStatus: "Verified"
  });

  const brands = await User.countDocuments({ role: "Brand" });

  const stats = {
    creators,
    brands,
    campaignsCompleted: 0 // future: campaigns collection
  };

  await setCache(cacheKey, stats, 21600); // 6 hours
  return stats;
};

/* ================= TOP CITIES ================= */

export const getTopCities = async () => {
  const cacheKey = "home:topCities";
  const cached = await getCache(cacheKey);
  if (cached) return cached;

  const cities = await User.aggregate([
    {
      $match: {
        role: { $in: ["Influencer", "Model", "Photographer"] },
        kycStatus: "Verified",
        isActive: true
      }
    },
    {
      $group: {
        _id: "$city",
        count: { $sum: 1 }
      }
    },
    { $sort: { count: -1 } },
    { $limit: 10 }
  ]);

  const formatted = cities.map(c => ({
    city: c._id,
    count: c.count
  }));

  await setCache(cacheKey, formatted, 43200); // 12 hours
  return formatted;
};
