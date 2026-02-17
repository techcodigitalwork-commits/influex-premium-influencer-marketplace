import Profile from "../models/profile.js";
import User from "../models/user.js";
import { getCache, setCache } from "../utils/redis.js";

export const getFeaturedCreators = async ({ role, limit }) => {
  const cacheKey = `home:featured:${role || "all"}:${limit}`;
  const cached = await getCache(cacheKey);
  if (cached) return cached;

  const filter = {};
  if (role) filter.role = role;

  const profiles = await Profile.find(filter)
    .sort({ updatedAt: -1 })
    .limit(limit)
    .populate("user", "avatar rating isFeatured");

  const formatted = profiles.map(p => ({
    id: p._id,
    name: p.name,
    role: p.role,
    city: p.location,
    category: p.categories,
    rating: p.user?.rating || 0,
    avatar: p.profileImage || p.user?.avatar,
    profileUrl: `/profile/${p.user?._id}`
  }));

  await setCache(cacheKey, formatted, 1800);
  return formatted;
};


export const getTopCities = async () => {
  const cacheKey = "home:topCities";
  const cached = await getCache(cacheKey);
  if (cached) return cached;

  const cities = await Profile.aggregate([
    {
      $match: {
        location: { $ne: null }
      }
    },
    {
      $group: {
        _id: "$location",
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

  await setCache(cacheKey, formatted, 43200);
  return formatted;
};
export const getPublicStats = async () => {
  const cacheKey = "home:stats";

  const cached = await getCache(cacheKey);
  if (cached) return cached;

  const creators = await User.countDocuments({
    role: "influencer",
    kycStatus: "Verified"
  });

  const brands = await User.countDocuments({
    role: "brand"
  });

  const stats = {
    creators,
    brands,
    campaignsCompleted: 0
  };

  await setCache(cacheKey, stats, 21600);
  return stats;
};

