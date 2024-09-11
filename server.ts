import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import connectToDB from "./utils/connect";
import mongoose from "mongoose";
import authRouter from "./routes/auth.route";
import corsHandler from "./config/corsHandler";
import credentials from "./middlewares/credentials";
import passwordRoute from "./routes/password.route";
import companyRoute from "./routes/company.route";
import jobRoute from "./routes/job.route";
import applicationRoute from "./routes/application.route";
import seekerRoute from "./routes/seeker.route";
import fileRouter from "./routes/file.route";
import resumeRoute from "./routes/resume.route";
import adminRouter from "./routes/admin.route";

dotenv.config();
const app = express();

const PORT = 8080;

connectToDB();

app.use(credentials);

app.use(corsHandler);

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.use("/auth", authRouter);
app.use("/password", passwordRoute);
app.use("/company", companyRoute);

app.use("/job", jobRoute);

app.use("/application", applicationRoute);

app.use("/seeker", seekerRoute);

app.use("/file", fileRouter);

app.use("/resume", resumeRoute);
app.use("/admin", adminRouter);

mongoose.connection.on("connected", () => {
  console.log("Connected to MongoDB");
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});
