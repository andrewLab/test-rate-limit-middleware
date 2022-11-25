import {Request, Response, NextFunction } from "express";
import redisClient from "../redisClient";
import config from "../config";

type RouteDefinition = {
    path: string;
    private?: boolean;
    weight?: number;
};
type RateLimiterOptions = {
  maxByToken: number;
  maxByIp: number;
  routes?: RouteDefinition[]
};

const RATE_LIMIT_WINDOW = 60 * 60; // 1 hour

const rateLimiterMiddleware =
  (options: RateLimiterOptions) =>
  async (req: Request, res: Response, next: NextFunction) => {
    const isPrivateAction = options.routes?.find((r) => r.path === req.path)?.private ?? false

    const recordKey = isPrivateAction ? config.app.authToken : req.ip;
    const limit = isPrivateAction ? options.maxByToken : options.maxByIp;

    const record = await redisClient.getNumberWithTTL(recordKey);
    if (!record.length) {
      await redisClient.set(recordKey, limit - 1, "EX", RATE_LIMIT_WINDOW);
      return next();
    }

    const [value, ttl] = record;
    if (value <= 0) {
      return res
        .status(429)
        .json(`Too Many Requests. Rate limit will reset in ${ttl} seconds`);
    }

    const { routes } = options;
    if (!routes) {
        await redisClient.decr(recordKey);
        return next();
    }

    const requestWeight = routes.find((rw) => req.path === rw.path)?.weight ?? 1
    await redisClient.decrby(recordKey, requestWeight)
    return next()
  };

export default rateLimiterMiddleware;
