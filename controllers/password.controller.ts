import { randomBytes } from "crypto";
import PasswordResetToken from "../models/password.model";
import User from "../models/user.model";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { createTransport } from "nodemailer";
import bcrypt from "bcrypt";

function generateOTP() {
  const randomNumber = randomBytes(2).readUInt16BE(0) % 10000; // Lấy 2 byte, chuyển thành số nguyên và lấy modulo 10000
  return randomNumber.toString().padStart(6, "0"); // Đảm bảo kết quả luôn có 6 chữ số
}

const transporter = createTransport({
  service: "gmail",
  port: 587,
  secure: false,
  host: "smtp.gmail.com",
  auth: {
    user: "vykhanghuynh@gmail.com",
    pass: "cgcsisppijsezjti",
  },
});

const handleForgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email }).exec();
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    //delete all token

    await PasswordResetToken.deleteMany({ user: user._id }).exec();

    //create new token

    const otp = generateOTP();

    const token = jwt.sign({ otp }, process.env.ACCESS_TOKEN_SECRET!, {
      expiresIn: "5m",
    });

    const newPasswordToken = await PasswordResetToken.create({
      token,
      otp,
      user: user._id,
    });
    if (!newPasswordToken) {
      return res.status(500).json({ message: "Error creating token" });
    }

    const mailOPtions = {
      from: "vykhanghuynh@gmail.com",
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP code is ${otp}`,
    };
    await transporter.sendMail(mailOPtions);
    return res.status(200).json({ message: "OTP sent to your email", token });
  } catch (error) {
    return res.status(500).json({ message: "Error creating token" });
  }
};

const handleValidateOTP = async (req: Request, res: Response) => {
  const { otp, token } = req.body;
  try {
    const passwordToken = await PasswordResetToken.findOne({ token }).exec();

    if (!passwordToken) {
      return res.status(404).json({ message: "Token not found" });
    }

    if (passwordToken.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!, (err: any) => {
      if (err) {
        return res.status(400).json({ message: "Invalid token" });
      }
    });

    const newToken = jwt.sign({ otp }, process.env.REFRESH_TOKEN_SECRET!, {
      expiresIn: "5m",
    });

    passwordToken.token = newToken;

    await passwordToken.save();

    return res.status(200).json({ message: "OTP is valid", token: newToken });
  } catch (error) {
    console.log(error);

    return res.status(500).json({ message: "Error validating token" });
  }
};

const handleResetPassword = async (req: Request, res: Response) => {
  const { token, password } = req.body;

  try {
    const passwordToken = await PasswordResetToken.findOne({ token }).exec();
    if (!passwordToken) {
      return res.status(404).json({ message: "Token not found" });
    }

    if (!jwt.verify(token, process.env.REFRESH_TOKEN_SECRET!)) {
      return res.status(400).json({ message: "Invalid token" });
    }
    const newPassword = bcrypt.hashSync(password, 10);

    const user = await User.findById(passwordToken.user).exec();
    user.password = newPassword;
    await user.save();

    await PasswordResetToken.deleteMany({ user: user._id }).exec();

    return res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Error resetting password" });
  }
};

export default {
  handleForgotPassword,
  handleValidateOTP,
  handleResetPassword,
};
