import express, { Express } from "express";
import expressContext from "express-request-context";
import config from "./config";
import controller from "./controller";
import authMiddleware from "./middlewares/auth";
import rateLimiterMiddleware from "./middlewares/rateLimiter";

const app: Express = express();

app.use(expressContext());
app.use(
  authMiddleware({
    publicRoutes: ["/"],
  })
);

app.get("/reset", controller.resetRateLimitAction);

app.use(
  rateLimiterMiddleware({
    maxByToken: config.rateLimiter.maxByToken,
    maxByIp: config.rateLimiter.maxByIp,
  })
);

app.get("/", controller.indexAction);
app.get("/private", controller.privateAction);

app.listen(config.app.port, () => {
  console.log(`App is running at http://localhost:${config.app.port}`);
});
