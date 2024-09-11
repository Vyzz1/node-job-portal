import { Schema, model, models } from "mongoose";

const UserSchema = new Schema({
  email: {
    require: true,
    type: String,
    unique: true,
  },
  password: {
    require: true,
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },

  role: {
    type: Object,
    require: true,
    default: "ROLE_SEEKER",
  },
  refreshToken: {
    type: String,
    require: false,
  },
});

const User = models?.User || model("User", UserSchema);
export default User;
