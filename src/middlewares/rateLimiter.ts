import { Request, Response, NextFunction } from "express";
import redisClient from "../redisClient";

type RateLimiterOptions = {
  maxByToken: number;
  maxByIp: number;
};

const RATE_LIMIT_WINDOW = 60 * 60; // 1 hour

const rateLimiterMiddleware =
  (options: RateLimiterOptions) =>
  async (req: Request, res: Response, next: NextFunction) => {
    const { isPrivateAction } = req.context;

    const recordKey = isPrivateAction ? req.context.token : req.ip;
    const limit = isPrivateAction ? options.maxByToken : options.maxByIp;

    const record = await redisClient.getNumberWithTTL(recordKey);
    if (!record.length) {
      await redisClient.set(recordKey, limit - 1, "EX", RATE_LIMIT_WINDOW);
      return next();
    }

    const [value, ttl] = record;
    if (value <= 1) {
      return res
        .status(429)
        .json(`Too Many Requests. Rate limit will reset in ${ttl} seconds`);
    }

    await redisClient.decr(recordKey);
    return next();
  };

export default rateLimiterMiddleware;
