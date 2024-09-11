import { Request, Response } from "express";
import Resume from "../models/resume.model";

const handleCreateResume = async (req: Request, res: Response) => {
  try {
    const { id } = (req as any).user;
    const newResume = await Resume.create({ ...req.body, seeker: id });
    if (!newResume) {
      return res.status(500).json({ message: "Error creating resume" });
    }
    return res.status(201).json(newResume);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Error creating resume" });
  }
};

const handleUpdateResume = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updatedResume = await Resume.findByIdAndUpdate(id, req.body);
    if (!updatedResume) {
      return res.status(404).json({ message: "Resume not found" });
    }
    return res.status(200).json({ message: "Resume updated successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Error updating resume" });
  }
};

const handleGetDetails = async (req: Request, res: Response) => {
  try {
    const resume = await Resume.findById(req.params.id).exec();
    if (!resume) {
      return res.status(404).json({ message: "Resume not found" });
    }
    return res.status(200).json(resume);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Error fetching resume" });
  }
};

const handleGetAuth = async (req: Request, res: Response) => {
  try {
    const { id } = (req as any).user;
    const resume = await Resume.find({ seeker: id }).exec();
    if (!resume) {
      return res.status(404).json({ message: "Resume not found" });
    }
    return res.status(200).json(resume);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Error fetching resume" });
  }
};

const handleDeleteResume = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deletedResume = await Resume.findByIdAndDelete(id).exec();
    if (!deletedResume) {
      return res.status(404).json({ message: "Resume not found" });
    }
    return res.status(200).json({ message: "Resume deleted successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Error deleting resume" });
  }
};

export default {
  handleCreateResume,
  handleUpdateResume,
  handleGetDetails,
  handleGetAuth,
  handleDeleteResume,
};
