import { Request, Response } from "express";
import User from "../models/user.model";
import Seeker from "../models/seeker.model";
import Company from "../models/company.model";
import Job from "../models/job.model";
import Application from "../models/application.model";
import bcrypt from "bcrypt";

const handleGetUsers = async (req: Request, res: Response) => {
  try {
    const { id } = (req as any).user;
    const users = await User.find({ _id: { $ne: id } }).exec();

    // Create an array to hold the userDTOs
    const userDTOs = await Promise.all(
      users.map(async (user) => {
        // Try to find the seeker or company based on the user's _id
        const seeker = await Seeker.findOne({ user: user._id }).exec();
        const company = await Company.findOne({ user: user._id }).exec();

        // Build the DTO object based on the existence of seeker or company details
        return {
          id: user._id,
          email: user.email,
          name: seeker
            ? `${seeker.firstName} ${seeker.lastName}`
            : company?.name,
          photoUrl: seeker ? seeker.photoUrl : company?.photoUrl,
          role: user.role,
        };
      })
    );
    return res.status(200).json(userDTOs);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Error fetching dashboard" });
  }
};
const handleDeleteUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const user = await User.findByIdAndDelete(id).exec();

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(202).json({ message: "User deleted" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Error deleting user" });
  }
};
const handleChangePassword = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { password } = req.body;
  try {
    const newPassword = bcrypt.hashSync(password, 10);
    const user = await User.findByIdAndUpdate(id, {
      password: newPassword,
    }).exec();

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json({ message: "Password changed" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Error changing password" });
  }
};
const handleGetDashboard = async (req: Request, res: Response) => {
  const { id } = (req as any).user;
  try {
    const totalJob = await Job.countDocuments().exec();
    const totalApplications = await Application.countDocuments().exec();
    const totalSeeker = await Seeker.countDocuments().exec();
    const totalEmployers = await Company.countDocuments().exec();
    const recent5Users = await User.find({ _id: { $ne: id } })
      .sort({ createdAt: -1 })
      .limit(5)
      .exec();

    const userDTOs = await Promise.all(
      recent5Users.map(async (user) => {
        // Try to find the seeker or company based on the user's _id
        const seeker = await Seeker.findOne({ user: user._id }).exec();
        const company = await Company.findOne({ user: user._id }).exec();

        // Build the DTO object based on the existence of seeker or company details
        return {
          id: user._id,
          email: user.email,
          name: seeker
            ? `${seeker.firstName} ${seeker.lastName}`
            : company?.name,
          photoUrl: seeker ? seeker.photoUrl : company?.photoUrl,
          role: user.role,
        };
      })
    );
    const body = {
      totalJob,
      totalApplications,
      totalSeeker,
      totalEmployers,
      recentUsers: userDTOs,
    };
    return res.status(200).json(body);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Error fetching dashboard" });
  }
};

export default {
  handleGetUsers,
  handleDeleteUser,
  handleChangePassword,
  handleGetDashboard,
};
