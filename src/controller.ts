import { Request, Response } from "express";
import redisClient from "./redisClient";

const indexAction = async (req: Request, res: Response) =>
  res.status(200).json("OK Public");
const privateAction = async (req: Request, res: Response) =>
  res.status(200).json("OK Private");

const resetRateLimitAction = async (req: Request, res: Response) => {
  await redisClient.flushall("SYNC");
  return res.status(200).json("DONE");
};

const controller = {
  indexAction,
  privateAction,
  resetRateLimitAction,
};

export default controller;
