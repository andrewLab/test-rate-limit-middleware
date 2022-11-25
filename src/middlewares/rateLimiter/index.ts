import {Request, Response, NextFunction} from "express";
import {getRequestToken} from "../auth";
import {SequentialQueue} from "./sequentialQueue";
import redisClient from "../../redisClient";

type RouteDefinition = {
    path: string;
    private?: boolean;
    weight?: number;
};
type RateLimiterOptions = {
    maxByToken: number;
    maxByIp: number;
    routes: RouteDefinition[]
};

type HandlerHttpData = {
    req: Request,
    res: Response,
    next: NextFunction
}

const RATE_LIMIT_WINDOW = 60 * 60; // 1 hour

const getRequestConstrains = (req: Request, options: RateLimiterOptions): [string, number, number] => {
    const routeDefinition = options.routes.find((r) => r.path === req.path);
    if (!routeDefinition) {
        throw new Error(`RateLimiter: faced undefined route ${req.path}`)
    }

    const weight = routeDefinition.weight ?? 1
    if (!routeDefinition.private) {
        return [req.ip, options.maxByIp, weight]
    }

    const authIdentifier = getRequestToken(req)
    if (!authIdentifier) {
        throw new Error('RateLimiter: failed to obtain authorization id')
    }

    return [authIdentifier, options.maxByToken, weight]
}

const requestHandler = async ({req, res, next}: HandlerHttpData, options: RateLimiterOptions) => {
    const [key, limit, weight] = getRequestConstrains(req, options);

    const record = await redisClient.getNumberWithTTL(key);
    if (!record.length) {
        await redisClient.set(key,limit - 1, "EX", RATE_LIMIT_WINDOW);
        return next();
    }

    const [value, ttl] = record;
    if (value <= 0) {
      return res
        .status(429)
        .json(`Too Many Requests. Rate limit will reset in ${ttl} seconds`);
    }

    await redisClient.decrby(key, weight)
    return next()
}

const rateLimiterMiddleware =
    (options: RateLimiterOptions) => {
        const requestQueue = new SequentialQueue()
        return (req: Request, res: Response, next: NextFunction) => {
            if (!options.routes.find((r) => req.path === r.path)) {
                return next();
            }
            requestQueue.push(() => requestHandler({req, res, next}, options));
        }
    }

export default rateLimiterMiddleware;
