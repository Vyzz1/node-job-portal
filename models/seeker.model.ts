import { Schema, model, models } from "mongoose";

const SeekerSChema = new Schema({
  photoUrl: {
    require: false,
    type: String,
    unique: true,
  },
  email: {
    require: false,
    type: String,
    unique: true,
  },
  firstName: {
    require: false,
    type: String,
  },
  lastName: {
    require: false,
    type: String,
  },
  phoneNumber: {
    require: false,
    type: String,
  },
  dateOfBirth: {
    require: false,
    type: Date,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
});

const Seeker = models?.Seeker || model("Seeker", SeekerSChema);
export default Seeker;
