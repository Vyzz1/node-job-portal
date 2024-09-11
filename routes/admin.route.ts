import { Router } from "express";
import verifyJWT from "../middlewares/verifyJWT";
import verifyRoles from "../middlewares/verifyRoles";
import adminController from "../controllers/admin.controller";

const adminRouter = Router();

adminRouter.use(verifyJWT);

adminRouter.use(verifyRoles("ROLE_ADMIN"));

adminRouter.get("/users", adminController.handleGetUsers);
adminRouter.get("/dashboard", adminController.handleGetDashboard);
adminRouter.delete("/:id", adminController.handleDeleteUser);
adminRouter.put("/:id", adminController.handleChangePassword);

export default adminRouter;
