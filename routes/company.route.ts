import { Router } from "express";
import companyController from "../controllers/company.controller";
import verifyJWT from "../middlewares/verifyJWT";
import verifyRoles from "../middlewares/verifyRoles";

const companyRoute = Router();

// Public routes

companyRoute.get(
  "/applications",
  verifyJWT,
  verifyRoles("ROLE_COMPANY"),
  companyController.handleGetApplications
);
companyRoute.get(
  "/getDashboard",
  verifyJWT,
  verifyRoles("ROLE_COMPANY"),
  companyController.handleGetDashboard
);

companyRoute.get("/random", companyController.handleGetRandom);

companyRoute.get("/:id", companyController.handleGetDetails);

// Protected routes for company role
companyRoute.use(verifyJWT);
companyRoute.use(verifyRoles("ROLE_COMPANY"));

companyRoute.get("/:id/jobs", companyController.handleGetJobs);
companyRoute.put("/details", companyController.handleUpdateDetails);

export default companyRoute;
