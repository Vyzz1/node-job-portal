import e, { Request, Response } from "express";
import User from "../models/user.model";
import Company from "../models/company.model";
import Job from "../models/job.model";
import mongoose from "mongoose";

const handleCreateJobs = async (req: Request, res: Response) => {
  const { id } = (req as any).user;
  try {
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const company = await Company.findOne({ user: user._id });
    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    const job = await Job.create({ ...req.body, company: company._id });

    return res.status(201).json({ entityId: job._id, entityClass: job });
  } catch (error) {
    console.log(error);

    return res.status(500).json({ message: "Error creating job" });
  }
};

const handleGetJobsDetails = async (req: Request, res: Response) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate(
        "company",
        "_id photoUrl name website companyModel companySize national companyField workingTime ot_working"
      )
      .exec();
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }
    return res.status(200).json(job);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching job" });
  }
};

const handleUpdateJob = async (req: Request, res: Response) => {
  const id = req.params.id;
  try {
    const job = await Job.findByIdAndUpdate(id, req.body, {
      new: true,
    }).exec();
    console.log(job);

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }
    return res.status(200).json(job);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Error updating job" });
  }
};
const handleGetJobsRandom = async (_req: Request, res: Response) => {
  try {
    const jobs = await Job.aggregate([{ $sample: { size: 5 } }]).exec();

    const populatedJobs = await Job.populate(jobs, {
      path: "company",
      select: "name photoUrl _id",
    });

    return res.status(200).json(populatedJobs);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Error fetching jobs" });
  }
};
const handleGetJobsRelated = async (req: Request, res: Response) => {
  const { jobId, jobType, experienceLevel, place } = req.query;

  try {
    const jobs = await Job.aggregate([
      {
        $match: {
          _id: { $ne: new mongoose.Types.ObjectId(jobId as string) }, // Exclude the job with the given ID
          $or: [
            { type: jobType }, // Match type
            { experienceLevel: experienceLevel }, // Match experience level
            { place: place }, // Match place
          ],
        },
      },
      { $sample: { size: 4 } }, // Randomize and limit the result to 4 jobs
      {
        $lookup: {
          from: "companies",
          localField: "company",
          foreignField: "_id",
          as: "company",
        },
      },
      {
        $unwind: "$company",
      },
    ]);

    return res.status(200).json(jobs);
  } catch (err) {
    console.error(err);
    throw err;
  }
};
const handleSearchAndPaginateJobs = async (req: Request, res: Response) => {
  try {
    const query = req.query;
    const minSalary = query?.minSalary
      ? parseInt(query.minSalary as string)
      : 0;
    const maxSalary = query?.maxSalary
      ? parseInt(query.maxSalary as string)
      : Number.MAX_SAFE_INTEGER;
    const experienceLevel =
      query?.experienceLevel && query.experienceLevel !== ""
        ? query.experienceLevel
        : null;

    const place = query?.place && query.place !== "" ? query.place : null;
    const type = query?.type && query?.type !== "" ? query.type : null;
    const page = query?.page ? parseInt(query.page as string) : 0;
    const size = query?.size ? parseInt(query.size as string) : 4;
    const sortQuery = query?.sortBy || "createdAt";
    const key = query?.key ?? "";
    const location = query?.location ?? "";
    const skip = page - 1 < 0 ? 0 : page * size;

    let sortParams: any = {};
    switch (sortQuery) {
      case "minSalary":
        sortParams = { fromSalary: 1 };
        break;
      case "maxSalary":
        sortParams = { toSalary: -1 };
        break;
      case "createdAt":
        sortParams = { createdAt: -1 };
        break;
      default:
        sortParams = { createdAt: -1 };
    }

    const titleRegex = new RegExp(key as string, "i");
    const locationRegex = new RegExp(location as string, "i");

    const conditions: any = [
      { toSalary: { $lte: maxSalary } },
      { fromSalary: { $gte: minSalary } },
      { title: { $regex: titleRegex } },
      { location: { $regex: locationRegex } },

      experienceLevel ? { experienceLevel: experienceLevel } : {},
      place ? { place: place } : {},
      type ? { type: type } : {},
    ];

    const jobs = await Job.find({
      $and: conditions,
    })
      .sort(sortParams)
      .skip(skip)
      .limit(size)
      .populate("company", "name photoUrl _id")
      .exec();

    const totalJobs = await Job.countDocuments({
      $and: conditions,
    }).exec();

    const last = skip + size >= totalJobs;

    const body = {
      content: jobs,
      last,
      pageable: {
        pageNumber: page,
      },
    };

    return res.status(200).json(body);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error fetching jobs" });
  }
};

export default {
  handleCreateJobs,
  handleGetJobsDetails,
  handleUpdateJob,
  handleGetJobsRandom,
  handleGetJobsRelated,
  handleSearchAndPaginateJobs,
};
