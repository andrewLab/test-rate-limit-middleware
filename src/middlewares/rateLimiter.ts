import { Request, Response, NextFunction } from "express";
import config from "../config";
import Redis from "ioredis";

type RateLimiterOptions = {
  maxByToken: number;
  maxByIp: number;
};

const RATE_LIMIT_WINDOW = 60 * 60; // 1 hour

const redis = new Redis(config.redis.port, config.redis.host);

const rateLimiterMiddleware =
  (options: RateLimiterOptions) =>
  async (req: Request, res: Response, next: NextFunction) => {
    const { isPrivateAction } = req.context;

    const recordKey = isPrivateAction ? req.context.token : req.ip;
    const limit = isPrivateAction ? options.maxByToken : options.maxByIp;

    const record = await redis.get(recordKey);
    if (!record) {
      await redis.set(recordKey, limit, "EX", RATE_LIMIT_WINDOW);
      return next();
    }

    const currentLimit = parseInt(record);
    if (currentLimit <= 1) {
      const ttl = await redis.ttl(recordKey);
      return res
        .status(429)
        .json(`Too Many Requests. Rate limit will reset in ${ttl} seconds`);
    }

    await redis.decr(recordKey);
    return next();
  };

export default rateLimiterMiddleware;
