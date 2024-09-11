import jwt from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";

const verifyJWT = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.sendStatus(403);
  }
  const token = authHeader.split(" ")[1];

  jwt.verify(
    token,
    process.env.ACCESS_TOKEN_SECRET!,
    (err: any, decoded: any) => {
      if (err) {
        return res.status(403).json({ message: "Token is not valid" });
      }
      (req as any).user = {
        email: decoded.UserInfo.email,
        role: decoded.UserInfo.role,
        id: decoded.UserInfo.id,
      };
      next();
    }
  );
};
export default verifyJWT;
