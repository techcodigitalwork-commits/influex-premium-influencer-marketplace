// src/services/discover.service.js
import User from "../models/user.js";
import esClient from "../utils/redis.js";

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

  const esQuery = {
    bool: {
      must: [
        { term: { kycStatus: "Verified" } },
        { term: { isActive: true } }
      ],
      filter: []
    }
  };

  if (role) esQuery.bool.filter.push({ term: { role } });
  if (city) esQuery.bool.filter.push({ term: { city } });
  if (category) esQuery.bool.filter.push({ term: { category } });

  if (budgetMin || budgetMax) {
    esQuery.bool.filter.push({
      range: {
        budgetMin: { gte: budgetMin || 0 },
        budgetMax: { lte: budgetMax || 999999 }
      }
    });
  }

  const esResult = await esClient.search({
    index: "creators",
    from: (page - 1) * limit,
    size: limit,
    query: esQuery
  });

  const ids = esResult.hits.hits.map(h => h._source.userId);

  const users = await User.find({ _id: { $in: ids } })
    .select("name role city category rating avatar budgetMin budgetMax");

  return {
    total: esResult.hits.total.value,
    page: Number(page),
    limit: Number(limit),
    results: users
  };
};
