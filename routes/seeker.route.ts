import { Router } from "express";
import seekerController from "../controllers/seeker.controller";
import verifyJWT from "../middlewares/verifyJWT";
import verifyRoles from "../middlewares/verifyRoles";

const seekerRoute = Router();

seekerRoute.use(verifyJWT);
seekerRoute.use(verifyRoles("ROLE_SEEKER"));

seekerRoute.get("/auth", seekerController.handleGetInfor);

seekerRoute.put("/", seekerController.handleUpdateInfor);

seekerRoute.get("/applications", seekerController.handleGetApplications);

export default seekerRoute;
