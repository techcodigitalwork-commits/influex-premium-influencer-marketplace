import Profile from "../models/profile.js";

export const searchCreators = async (q) => {
  const {
    role,
    location,
    categories,
    search,
    page = 1,
    limit = 12
  } = q;

  const filter = {};

  // Role filter
  if (role) filter.role = role;

  // Location filter
  if (location) {
    filter.location = { $regex: location, $options: "i" };
  }

  // Category filter
  if (categories) {
    filter.categories = { $regex: categories, $options: "i" };
  }

  // Name search
  if (search) {
    filter.name = { $regex: search, $options: "i" };
  }

  const skip = (page - 1) * limit;

  const [profiles, total] = await Promise.all([
    Profile.find(filter)
      .populate("user", "email role") // optional fields
      .skip(skip)
      .limit(Number(limit))
      .lean(),

    Profile.countDocuments(filter)
  ]);

  return {
    total,
    page: Number(page),
    limit: Number(limit),
    results: profiles
  };
};
