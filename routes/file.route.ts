import { Router } from "express";
import fileController from "../controllers/file.controller";
import verifyJWT from "../middlewares/verifyJWT";

const fileRouter = Router();
fileRouter.get("/content/:fileName", fileController.handleGetFile);

fileRouter.use(verifyJWT);
fileRouter.post(
  "/",
  fileController.uploadFile,
  fileController.handleUploadFile
);

export default fileRouter;
