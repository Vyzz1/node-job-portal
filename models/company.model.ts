import { Schema, model, models } from "mongoose";
import TextSchema from "./text.schema";

const AddressSchema = new Schema({
  city: String,
  location: String,
});

const CompanySchema = new Schema({
  name: {
    require: false,
    type: String,
    unique: true,
  },
  companyField: {
    require: false,
    type: String,
  },
  companyModel: {
    require: false,
    type: String,
  },
  companySize: {
    require: false,
    type: String,
  },

  national: {
    require: false,
    type: String,
  },
  workingTime: {
    require: false,
    type: String,
  },
  ot_working: {
    require: false,
    type: String,
  },
  description: {
    require: false,
    type: String,
  },

  photoUrl: {
    require: false,
    type: String,
  },
  website: {
    require: false,
    type: String,
  },
  whyUs: {
    require: false,
    type: String,
  },
  addresses: {
    require: false,
    type: [AddressSchema],
  },
  keySkills: {
    require: false,
    type: [TextSchema],
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  email: {
    type: String,
    require: false,
  },
});

const Company = models?.Company || model("Company", CompanySchema);
export default Company;
