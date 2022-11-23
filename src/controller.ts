import { Request, Response } from "express";

const indexAction = async (req: Request, res: Response) =>
  res.status(200).json("OK Public");
const privateAction = async (req: Request, res: Response) =>
  res.status(200).json("OK Private");

const controller = {
  indexAction,
  privateAction,
};

export default controller;
