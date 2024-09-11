import { Schema, model } from "mongoose";
import TextSchema from "./text.schema";

// Tạo schema cho công việc (Job)
const jobSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    fromSalary: {
      type: Number,
      required: true,
    },
    toSalary: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      enum: ["Full_time", "Part_time"], // Tương tự như JobType enum
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    place: {
      type: String,
      enum: ["On_site", "Remote"],
      required: true,
    },
    experienceLevel: {
      type: String,
      enum: [
        "Internship",
        "Entry_level",
        "Mid_level",
        "Senior_level",
        "Director",
      ],
      required: true,
    },
    skills: [TextSchema],
    keyRequirements: {
      type: String,
    },
    location: {
      type: String,
    },
    company: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const Job = model("Job", jobSchema);

export default Job;
