import controller from "./controller";
import {RequestHandler} from "express";

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

export default routes;