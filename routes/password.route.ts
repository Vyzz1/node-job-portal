import e, { Router } from "express";
import passwordController from "../controllers/password.controller";
const passwordRoute = Router();

passwordRoute.post("/forgot", passwordController.handleForgotPassword);

passwordRoute.post("/validate", passwordController.handleValidateOTP);

passwordRoute.post("/reset", passwordController.handleResetPassword);

export default passwordRoute;
