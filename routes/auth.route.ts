import { Router } from "express";
import authController from "../controllers/auth.controller";
import verifyJWT from "../middlewares/verifyJWT";
import refreshController from "../controllers/refresh.controller";
const authRouter = Router();

authRouter.post("/register", authController.handleRegister);

authRouter.post("/login", authController.handleLogin);

authRouter.get("/logout", authController.handleLogout);
authRouter.get("/refresh", refreshController.handleRefreshToken);

authRouter.post(
  "/change-password",
  verifyJWT,
  authController.handleChangePassword
);

authRouter.put("/update-logo", verifyJWT, authController.handleUpdateLogo);

export default authRouter;
