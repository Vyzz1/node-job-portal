import { Request, Response } from "express";
import User from "../models/user.model";
import bcrypt from "bcrypt";
import Company from "../models/company.model";
import Seeker from "../models/seeker.model";
import jwt from "jsonwebtoken";

const handleRegister = async (req: Request, res: Response) => {
  const { email, password, role, name, firstName, lastName } = req.body;

  // Check for missing email or password
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    // Check if the user already exists
    const existingUser = await User.findOne({ email }).exec();
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Hash the password
    const hashedPassword = bcrypt.hashSync(password, 10);

    // Create the user
    const user = await User.create({
      email,
      password: hashedPassword,
      role,
    });

    // Create associated profile (Company or Seeker)
    const profile =
      role === "ROLE_COMPANY"
        ? await createCompanyProfile(user._id, name, email)
        : await createSeekerProfile(user._id, firstName, lastName, email);

    // Generate JWT token
    const token = generateToken(user);

    // Send success response with token and profile info
    return res.status(201).json({
      role: user.role,
      id: profile._id,
      name: role === "ROLE_COMPANY" ? name : `${firstName} ${lastName}`,
      token,
    });
  } catch (error) {
    return res.status(500).json({ message: "Error registering user", error });
  }
};

// Helper function to create a company profile
const createCompanyProfile = async (
  userId: string,
  name: string,
  email: string
) => {
  if (!name) {
    throw new Error("Company name is required");
  }
  return await Company.create({ name, user: userId, email });
};

// Helper function to create a seeker profile
const createSeekerProfile = async (
  userId: string,
  firstName: string,
  lastName: string,
  email: string
) => {
  if (!firstName || !lastName) {
    throw new Error("Seeker first and last names are required");
  }
  return await Seeker.create({
    firstName,
    lastName,
    user: userId,
    email,
    name: `${firstName} ${lastName}`,
  });
};

// Helper function to generate JWT token
const generateToken = (user: any) => {
  return jwt.sign(
    {
      UserInfo: {
        email: user.email,
        role: user.role,
        id: user._id,
      },
    },
    process.env.ACCESS_TOKEN_SECRET!,
    { expiresIn: "3m" }
  );
};

const handleLogin = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: "Invalid username or password" });
  const foundUser = await User.findOne({ email }).exec();

  if (!foundUser) return res.status(404).json({ message: "User not found" });
  const isPasswordValid = bcrypt.compareSync(password, foundUser.password);
  if (!isPasswordValid)
    return res.status(401).json({ message: "Invalid password" });
  else {
    const accessToken = generateToken(foundUser);

    const refreshToken = jwt.sign(
      { email: foundUser.email },
      process.env.REFRESH_TOKEN_SECRET!,
      { expiresIn: "1h" }
    );
    foundUser.refreshToken = refreshToken;
    await foundUser.save();

    res.cookie("jwt", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 24 * 60 * 60 * 1000,
    });

    const role = foundUser.role;

    const entity =
      role === "ROLE_COMPANY"
        ? await Company.findOne({ user: foundUser._id }).exec()
        : await Seeker.findOne({ user: foundUser._id }).exec();

    const photoUrl = entity?.photoUrl;

    const name =
      role === "ROLE_COMPANY"
        ? entity?.name
        : entity?.firstName + " " + entity?.lastName;

    const id = entity?._id;

    res.status(200).json({
      message: "Login successful",
      token: accessToken,
      role,
      name,
      id,
      photoUrl,
    });
  }
};

const handleChangePassword = async (req: Request, res: Response) => {
  const { id } = (req as any).user; // Get user id from the request (assuming user is authenticated)
  const existingUser = await User.findById(id).exec(); // Find the user by ID

  if (!existingUser) {
    return res.status(404).json({ message: "User not found" });
  }

  const { currentPassword, newPassword } = req.body; // Destructure currentPassword and newPassword from request body

  if (!currentPassword || !newPassword) {
    return res
      .status(400)
      .json({ message: "Current password and new password are required" });
  }

  // Compare currentPassword (plain text) with the hashed password in the database
  const isMatch = bcrypt.compareSync(currentPassword, existingUser.password);

  if (!isMatch) {
    return res.status(400).json({ message: "Current password is incorrect" });
  }

  // Check if the new password is the same as the current one
  if (bcrypt.compareSync(newPassword, existingUser.password)) {
    return res.status(400).json({
      message: "New password must be different from the old password",
    });
  }

  // Hash the new password
  const hashedPassword = bcrypt.hashSync(newPassword, 10);
  existingUser.password = hashedPassword;

  // Save the updated user with the new password
  await existingUser.save();

  return res.status(200).json({ message: "Password changed successfully" });
};

const handleUpdateLogo = async (req: Request, res: Response) => {
  const { id } = (req as any).user;
  try {
    const existingUser = await User.findById(id).exec();
    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }
    const role = existingUser.role;
    const entity =
      role === "ROLE_COMPANY"
        ? await Company.findOne({ user: existingUser._id }).exec()
        : await Seeker.findOne({ user: existingUser._id }).exec();

    if (!entity) {
      return res.status(404).json({ message: "Entity not found" });
    }

    const photoUrl = req.body.photoUrl;
    entity.photoUrl = photoUrl;
    await entity.save();

    return res.status(200).json({ message: "Logo updated successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Error registering user", error });
  }
};
const handleLogout = async (req: Request, res: Response) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) {
    console.log("No cookie found");
    return res.status(202).json({ message: "Logged out" });
  }
  const refreshToken = cookies.jwt;

  const foundUser = await User.findOne({ refreshToken: refreshToken }).exec();
  if (!foundUser) {
    console.log("No users found");

    return res.status(202).json({ message: "Logged out" });
  }

  foundUser.refreshToken = "";
  await foundUser.save();

  res.clearCookie("jwt", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  });
  return res.status(202).json({ message: "Logged out" });
};

export default {
  handleRegister,
  handleLogin,
  handleChangePassword,
  handleUpdateLogo,
  handleLogout,
};
