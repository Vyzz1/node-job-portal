import { Request, Response } from "express";
import User from "../models/user.model";
import Seeker from "../models/seeker.model";
import Application from "../models/application.model";

const handleUpdateInfor = async (req: Request, res: Response) => {
  try {
    const { id } = (req as any).user;

    const updatedSeeker = await Seeker.findOneAndUpdate(
      { user: id },
      req.body
    ).exec();

    if (!updatedSeeker) {
      return res.status(404).json({ message: "Seeker not found" });
    }
    return res.status(200).json(updatedSeeker);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Error updating seeker details" });
  }
};

const handleGetInfor = async (req: Request, res: Response) => {
  try {
    const { id } = (req as any).user;

    const seeker = await Seeker.findOne({ user: id }).exec();
    if (!seeker) {
      return res.status(404).json({ message: "Seeker not found" });
    }
    return res.status(200).json(seeker);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Error fetching seeker details" });
  }
};

const handleGetApplications = async (req: Request, res: Response) => {
  try {
    const { id } = (req as any).user;

    const seeker = await Seeker.findOne({ user: id }).exec();
    if (!seeker) {
      return res.status(404).json({ message: "Seeker not found" });
    }
    const applications = await Application.find({ seeker: seeker._id })
      .populate({
        path: "job", // Populating the job field
        select: "_id title company", // Select specific fields from job
        populate: {
          // Populate company inside job
          path: "company", // Assuming job has a company reference
          select: "_id name", // Select specific fields from company
        },
      })
      .lean()
      .exec();
    return res.status(200).json(applications);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Error fetching applications" });
  }
};

export default { handleUpdateInfor, handleGetInfor, handleGetApplications };
