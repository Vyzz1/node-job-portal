import { Router } from "express";
import verifyJWT from "../middlewares/verifyJWT";
import verifyRoles from "../middlewares/verifyRoles";
import jobController from "../controllers/job.controller";

const jobRoute = Router();

jobRoute.get("/find-related", jobController.handleGetJobsRelated);

jobRoute.get("/search", jobController.handleSearchAndPaginateJobs);

jobRoute.get("/random", jobController.handleGetJobsRandom);

jobRoute.get("/:id", jobController.handleGetJobsDetails);

// protected routes
jobRoute.use(verifyJWT);
jobRoute.use(verifyRoles("ROLE_COMPANY"));

jobRoute.post("/", jobController.handleCreateJobs);

jobRoute.put("/:id", jobController.handleUpdateJob);

export default jobRoute;
