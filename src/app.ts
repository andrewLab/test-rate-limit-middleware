import express, { Express } from "express";
import config from "./config";
import authMiddleware from "./middlewares/auth";
import rateLimiterMiddleware from "./middlewares/rateLimiter";
import redisClient from "./redisClient";
import routes from "./routes";

const app: Express = express();

app.use(
  authMiddleware({
    publicRoutes: routes
      .filter((route) => !route.private)
      .map((route) => route.path),
  })
);

app.use(
  rateLimiterMiddleware({
    maxByToken: config.rateLimiter.maxByToken,
    maxByIp: config.rateLimiter.maxByIp,
    routes: routes
        .filter((route) => !['/reset'].includes(route.path))
        .map((route) => ({
      path: route.path,
      private: route.private,
      weight: route.weight
    }))
  })
);

routes.forEach((route) => {
  app.get(route.path, route.handler);
});

const server = app.listen(config.app.port, () => {
  console.log(`App is running at http://localhost:${config.app.port}`);
});

process.on("SIGTERM", () => {
  console.info("SIGTERM signal received.");
  console.log("Closing http server.");
  redisClient.quit();
  server.close(() => {
    console.log("Http server closed.");
    process.exit(0);
  });
});
