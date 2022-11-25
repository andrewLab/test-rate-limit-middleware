import { Request, Response } from "express";
import Redis from "ioredis";
import config from "./config";

const indexAction = async (req: Request, res: Response) =>
  res.status(200).json("OK Public");
const privateAction = async (req: Request, res: Response) =>
  res.status(200).json("OK Private");

const resetRateLimitAction = async (req: Request, res: Response) => {
  const redis = new Redis(config.redis.port, config.redis.host);
  await redis.flushall("SYNC");
  res.status(200).json("DONE");
};

const controller = {
  indexAction,
  privateAction,
  resetRateLimitAction,
};

export default controller;
