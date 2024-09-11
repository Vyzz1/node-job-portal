import { model, Schema } from "mongoose";
import TextSchema from "./text.schema";

const ExperienceSchema = new Schema({
  company: String,
  position: String,
  fromDate: String,
  toDate: String,
  description: { type: String, maxlength: [5000, "Description is too long"] },
});

const EducationSchema = new Schema({
  school: String,
  degree: String,
  fromDate: String,
  toDate: String,
});

const ColorsSchema = new Schema({
  primary: String,
  secondary: String,
  heading: String,
  description: String,
  title: String,
});

const StylingSchema = new Schema({
  font: String,
  color: ColorsSchema,
});

const ResumeSchema = new Schema({
  name: String,
  email: String,
  phone: String,
  address: String,
  jobTitle: String,
  education: String,
  description: { type: String, maxlength: [10000, "Description is too long"] },
  experiences: [ExperienceSchema],
  educations: [EducationSchema],
  skills: [TextSchema],
  awards: [TextSchema],
  createdAt: { type: Date, default: Date.now },
  image: String,
  styling: StylingSchema,
  seeker: { type: Schema.Types.ObjectId, ref: "Seeker" },
});

const Resume = model("Resume", ResumeSchema);
export default Resume;
