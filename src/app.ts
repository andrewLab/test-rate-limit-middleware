import express, { Express, RequestHandler } from "express";
import config from "./config";
import controller from "./controller";
import authMiddleware from "./middlewares/auth";
import rateLimiterMiddleware from "./middlewares/rateLimiter";
import redisClient from "./redisClient";

const app: Express = express();

type RouteDefinition = {
  path: string;
  handler: RequestHandler;
  private?: boolean;
  weight?: number;
};

const routes: RouteDefinition[] = [
  {
    path: "/",
    handler: controller.indexAction,
  },
  {
    path: "/weight2",
    handler: controller.indexAction,
    weight: 2,
  },
  {
    path: "/weight5",
    handler: controller.indexAction,
    weight: 5,
  },
  {
    path: "/reset",
    handler: controller.resetRateLimitAction,
  },
  {
    path: "/private",
    handler: controller.privateAction,
    private: true,
  },
];

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
    routes: routes.map(({ handler, ...routeData}) => routeData)
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
