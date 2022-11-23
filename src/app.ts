import express, { Express, Request, Response } from "express";
import "dotenv/config";

const app: Express = express();
const port = process.env.APP_PORT || 3000;

app.get("/", (req: Request, res: Response) => {
  res.send("OK");
});

app.listen(port, () => {
  console.log(`App is running at http://localhost:${port}`);
});
