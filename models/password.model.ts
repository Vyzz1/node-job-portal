import { model, Schema } from "mongoose";

const passwordSchema = new Schema({
  token: String,
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  otp: String,
});

const PasswordResetToken = model("Password", passwordSchema);

export default PasswordResetToken;
