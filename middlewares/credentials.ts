import { NextFunction, Request, Response } from "express";
import { allowedSite } from "../config/allowedSite";

const credentials = (req: Request, res: Response, next: NextFunction) => {
  const origin = req.headers.origin;
  if (allowedSite.includes(origin!)) {
    res.header("Access-Control-Allow-Credentials", "true");
  }
  next();
};
export default credentials;
