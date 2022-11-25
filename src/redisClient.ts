import config from "./config";
import Redis, { Callback, Result } from "ioredis";

const redisClient = new Redis({
  host: config.redis.host,
  port: config.redis.port,
});

declare module "ioredis" {
  interface RedisCommander<Context> {
    getNumberWithTTL(
      key: string,
      callback?: Callback<string>
    ): Result<[number, number], Context>;
  }
}

redisClient.defineCommand("getNumberWithTTL", {
  numberOfKeys: 1,
  lua: `
        local value = redis.call("GET", KEYS[1])
        if (value==nil) then 
            return nil
        end
        local ttl = redis.call("TTL", KEYS[1])
        return { tonumber(value), ttl }
    `,
});

export default redisClient;
