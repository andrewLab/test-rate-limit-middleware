import config from "../config";
import { Request, Response, NextFunction } from "express";

type AuthMiddlewareOptions = {
  publicRoutes: string[];
};

export const getRequestToken = (req: Request): string | null => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return null
    }

    const [scheme, token] = authHeader.split(" ");
    if (!/^Bearer$/i.test(scheme)) {
        return null
    }

    return token
}

const authMiddleware =
  (options: AuthMiddlewareOptions) =>
  (req: Request, res: Response, next: NextFunction) => {
    const { publicRoutes } = options;

    if (publicRoutes.includes(req.path)) {
      return next();
    }

    const token = getRequestToken(req);
    if (!token || config.app.authToken !== token) {
        return res.status(401).json("Unauthorized");
    }

    return next();
  };

export default authMiddleware;
