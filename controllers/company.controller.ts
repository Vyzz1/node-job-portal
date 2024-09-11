import { Request, Response } from "express";
import Company from "../models/company.model";
import User from "../models/user.model";
import Job from "../models/job.model";
import Application from "../models/application.model";

const handleGetDetails = async (req: Request, res: Response) => {
  try {
    let company = await Company.findById(req.params.id).exec();
    const jobs = await Job.find({ company: company._id }).exec();
    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    company = { ...company.toJSON(), jobs };

    return res.status(200).json(company);
  } catch (error) {
    console.log(error);

    return res.status(500).json({ message: "Error fetching company" });
  }
};

const handleUpdateDetails = async (req: Request, res: Response) => {
  try {
    const existingCompany = await Company.findOneAndUpdate(
      { user: (req as any).user.id },
      req.body,
      { new: true }
    ).exec();
    if (!existingCompany) {
      return res.status(404).json({ message: "Company not found" });
    }
    return res.status(200).json(existingCompany);
  } catch (error) {
    console.log(error);

    return res.status(500).json({ message: "Error updating company details" });
  }
};

const handleGetJobs = async (req: Request, res: Response) => {
  try {
    const jobs = await Job.find({ company: req.params.id }).lean().exec();
    return res.status(200).json(jobs);
  } catch (error) {
    console.log(error);

    return res.status(500).json({ message: "Error fetching jobs" });
  }
};

const handleGetRandom = async (req: Request, res: Response) => {
  try {
    const randomCompany = await Company.aggregate([
      { $sample: { size: 6 } },
    ]).exec();
    return res.status(200).json(randomCompany);
  } catch (error) {
    console.log(error);

    return res.status(500).json({ message: "Error fetching random company" });
  }
};

const handleGetApplications = async (req: Request, res: Response) => {
  const { id } = (req as any).user;

  try {
    // Fetch the user and company in parallel
    const company = await Company.findOne({ user: id }).exec();

    if (!company) {
      return res.status(404).json({ message: "User or Company not found" });
    }

    // Find jobs by company
    const jobs = await Job.find({ company: company._id })
      .select("_id ")
      .lean()
      .exec();
    const jobIds = jobs.map((job) => job._id);

    // Fetch applications for those jobs and populate the seeker
    const applications = await Application.find({ job: { $in: jobIds } })
      .populate("seeker") // Exclude sensitive fields like password
      .populate("job", "_id title")
      .lean()
      .exec();

    return res.status(200).json(applications);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Error fetching applications" });
  }
};

const handleGetDashboard = async (req: Request, res: Response) => {
  try {
    const { id } = (req as any).user;

    const company = await Company.findOne({ user: id }).exec();
    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    const jobs = await Job.find({ company: company._id }).exec();

    const jobsIds = jobs.map((job) => job._id);

    const applications = await Application.find({
      job: { $in: jobsIds },
    })
      .populate("seeker", "_id photoUrl firstName lastName ")
      .populate("job", "_id title")
      .exec();

    const top5Recents = applications
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 5);

    const pendingApplications = applications.filter(
      (application) => application.status === "Pending"
    ).length;
    const acceptedApplications = applications.filter(
      (application) => application.status === "Accepted"
    ).length;
    const rejectedApplications = applications.filter(
      (application) => application.status === "Rejected"
    ).length;
    const reviewedApplications = applications.filter(
      (application) => application.status === "Reviewed"
    ).length;

    const acceptedRate =
      applications.length > 0
        ? (acceptedApplications / applications.length) * 100
        : 0;

    const body = {
      applicationList: top5Recents,
      totalJobs: jobs.length,
      totalApplications: applications.length,
      pendingApplications,
      acceptedApplications,
      rejectedApplications,
      reviewedApplications,
      acceptedRate,
    };
    return res.status(200).json(body);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Error fetching applications" });
  }
};

export default {
  handleGetDetails,
  handleUpdateDetails,
  handleGetJobs,
  handleGetApplications,
  handleGetRandom,
  handleGetDashboard,
};
