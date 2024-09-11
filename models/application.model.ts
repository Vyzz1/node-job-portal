import { model, models, Schema } from "mongoose";

const applicationSchema = new Schema({
  createdAt: {
    type: Date,
    default: Date.now,
    required: true,
  },
  cvFile: {
    type: String,
    required: false,
  },
  coverLetter: {
    type: String,
    required: false,
  },
  status: {
    type: String,
    enum: ["Pending", "Accepted", "Rejected", "Reviewed"],
    default: "Pending",
    required: true,
  },
  seeker: {
    type: Schema.Types.ObjectId,
    ref: "Seeker",
    required: true,
  },
  job: {
    type: Schema.Types.ObjectId,
    ref: "Job",
    required: true,
  },
});

const Application =
  models?.Application || model("Application", applicationSchema);
export default Application;
