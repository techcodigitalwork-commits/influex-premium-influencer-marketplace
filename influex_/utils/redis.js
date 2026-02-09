// src/utils/redis.js
import Redis from "ioredis";

export const redis = new Redis(process.env.REDIS_URL);

export const getCache = async (key) => {
  const data = await redis.get(key);
  return data ? JSON.parse(data) : null;
};

export const setCache = async (key, value, ttl = 900) => {
  await redis.set(key, JSON.stringify(value), "EX", ttl);
};
