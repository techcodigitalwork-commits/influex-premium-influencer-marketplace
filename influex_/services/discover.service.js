// src/services/discover.service.js
import User from "../models/user.js";

export const searchCreators = async (q) => {
  const {
    role,
    city,
    category,
    budgetMin,
    budgetMax,
    page = 1,
    limit = 12
  } = q;

  const filter = {
    kycStatus: "Verified",
    isActive: true
  };

  if (role) filter.role = role;
  if (city) filter["profile.city"] = city;
  if (category) filter["profile.category"] = category;

  if (budgetMin || budgetMax) {
    filter["profile.budget"] = {};
    if (budgetMin) filter["profile.budget"].$gte = Number(budgetMin);
    if (budgetMax) filter["profile.budget"].$lte = Number(budgetMax);
  }

  const skip = (page - 1) * limit;

  const [results, total] = await Promise.all([
    User.find(filter)
      .select("name role profile.city profile.category profile.budget rating avatar")
      .skip(skip)
      .limit(Number(limit))
      .lean(),

    User.countDocuments(filter)
  ]);

  return {
    total,
    page: Number(page),
    limit: Number(limit),
    results
  };
};
