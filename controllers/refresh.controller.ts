import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import User from "../models/user.model";

const handleRefreshToken = async (req: Request, res: Response) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) {
    return res.status(401).json({ message: "No token found" });
  }
  const refreshToken = cookies.jwt;
  const foundUser = await User.findOne({ refreshToken: refreshToken }).exec();
  if (!foundUser) {
    return res.status(403).json({ message: "Invalid token" });
  }
  jwt.verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET!,
    (err: any, decoded: any) => {
      if (err || decoded.username !== foundUser.username) {
        return res.status(403).json({ message: "Invalid token" });
      }
      const accessToken = jwt.sign(
        {
          UserInfo: {
            email: foundUser.email,
            role: foundUser.role,
            id: foundUser._id,
          },
        },
        process.env.ACCESS_TOKEN_SECRET!,
        { expiresIn: "3m" }
      );

      res.status(200).json({ token: accessToken });
    }
  );
};
export default { handleRefreshToken };
