// src/services/redis.service.ts
import { redisClient } from "../config/redis";

export const RedisService = {
  async set(key: string, value: string, ttlSeconds?: number) {
    if (ttlSeconds) {
      await redisClient.set(key, value, { EX: ttlSeconds });
    } else {
      await redisClient.set(key, value);
    }
  },

  async get(key: string) {
    return await redisClient.get(key);
  },

  async del(key: string) {
    return await redisClient.del(key);
  },
};
