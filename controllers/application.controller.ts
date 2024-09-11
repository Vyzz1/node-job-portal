import { Request, Response } from "express";
import User from "../models/user.model";
import Job from "../models/job.model";
import Application from "../models/application.model";
import Seeker from "../models/seeker.model";

const handleCreateApplication = async (req: Request, res: Response) => {
  try {
    const jobId = req.params.jobId;

    const { id } = (req as any).user;

    const existingUser = await User.findById(id).exec();
    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }
    const existingJob = await Job.findById(jobId).exec();
    if (!existingJob) {
      return res.status(404).json({ message: "Job not found" });
    }
    const existingSeeker = await Seeker.findOne({
      user: existingUser._id,
    }).exec();

    const newApplication = await Application.create({
      ...req.body,
      job: existingJob._id,
      seeker: existingSeeker._id,
    });
    return res.status(201).json(newApplication);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Error creating application" });
  }
};

const handleUpdateApplication = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const updatedApplication = await Application.findByIdAndUpdate(
      id,
      req.body
    );
    if (!updatedApplication) {
      return res.status(404).json({ message: "Application not found" });
    }
    return res.status(200).json(updatedApplication);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Error updating application" });
  }
};

const handleDeleleApplication = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const deletedApplication = await Application.findByIdAndDelete(id);
    if (!deletedApplication) {
      return res.status(404).json({ message: "Application not found" });
    }
    return res.status(202).json({ message: "Application deleted" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Error deleting application" });
  }
};

export default {
  handleCreateApplication,
  handleUpdateApplication,
  handleDeleleApplication,
};
