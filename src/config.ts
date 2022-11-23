import "dotenv/config";

interface AppConfig {
  app: {
    port: number;
    authToken: string;
  };
  redis: {
    host: string;
    port: number;
  };
  rateLimiter: {
    maxByToken: number;
    maxByIp: number;
  };
}

const config: AppConfig = {
  app: {
    port: parseInt(process.env.APP_PORT || "3000"),
    authToken: process.env.APP_AUTH_TOKEN || "secret",
  },
  redis: {
    host: process.env.REDIS_HOST || "redis",
    port: parseInt(process.env.REDIS_PORT || "6379"),
  },
  rateLimiter: {
    maxByToken: parseInt(process.env.RATE_LIMIT_PER_HOUR_BY_TOKEN || "200"),
    maxByIp: parseInt(process.env.RATE_LIMIT_PER_HOUR_BY_IP || "100"),
  },
};

export default config;
