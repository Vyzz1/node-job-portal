import { Router } from "express";
import resumeController from "../controllers/resume.controller";
import verifyJWT from "../middlewares/verifyJWT";
import verifyRoles from "../middlewares/verifyRoles";

const resumeRoute = Router();

resumeRoute.use(verifyJWT);
resumeRoute.use(verifyRoles("ROLE_SEEKER"));

resumeRoute.post("/", resumeController.handleCreateResume);
resumeRoute.get("/auth", resumeController.handleGetAuth);

resumeRoute.put("/:id", resumeController.handleUpdateResume);

resumeRoute.delete("/:id", resumeController.handleDeleteResume);

resumeRoute.get("/:id", resumeController.handleGetDetails);

export default resumeRoute;
