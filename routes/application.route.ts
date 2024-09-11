import { Router } from "express";
import verifyJWT from "../middlewares/verifyJWT";
import verifyRoles from "../middlewares/verifyRoles";
import applicationController from "../controllers/application.controller";
const applicationRoute = Router();

applicationRoute.use(verifyJWT);

applicationRoute.use(verifyRoles("ROLE_SEEKER", "ROLE_COMPANY"));

applicationRoute.post("/:jobId", applicationController.handleCreateApplication);

applicationRoute.put("/:id", applicationController.handleUpdateApplication);

applicationRoute.delete("/:id", applicationController.handleDeleleApplication);

export default applicationRoute;
