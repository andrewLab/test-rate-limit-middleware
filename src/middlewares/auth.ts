import config from "../config";
import { Request, Response, NextFunction } from "express";

type AuthMiddlewareOptions = {
  publicRoutes: string[];
};

const buildUnauthorizedResponse = (res: Response) =>
  res.status(401).json("Unauthorized");

const authMiddleware =
  (options: AuthMiddlewareOptions) =>
  (req: Request, res: Response, next: NextFunction) => {
    const { publicRoutes } = options;

    if (publicRoutes.includes(req.path)) {
      return next();
    }

    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return buildUnauthorizedResponse(res);
    }

    const [scheme, token] = authHeader.split(" ");
    if (!/^Bearer$/i.test(scheme)) {
      return buildUnauthorizedResponse(res);
    }

    if (config.app.authToken !== token) {
      return buildUnauthorizedResponse(res);
    }

    req.context.isPrivateAction = true;
    req.context.token = token;

    return next();
  };

export default authMiddleware;
