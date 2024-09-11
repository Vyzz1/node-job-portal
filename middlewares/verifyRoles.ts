import { NextFunction, Request, Response } from "express";

const verifyRoles = (...allowedRoles: Array<string>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!(req as any).user.role) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const rolesArray = [...allowedRoles];

    const result = rolesArray.includes((req as any).user.role);

    if (!result) return res.status(401).json({ message: "Unauthorized" });
    next();
  };
};
export default verifyRoles;
