import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { getDataURI } from "../utils/dataURI.js";
import cloudinary from "../utils/cloudinary.js";

export const register = async (req, res) => {
  try {
    const { fullName, email, phoneNumber, password, role } = req.body;
    const file = req.file;
    const fileURI = getDataURI(file);
    const cloudResponse = await cloudinary.uploader.upload(fileURI.content);

    if (
      !fullName?.trim() ||
      !email?.trim() ||
      !phoneNumber?.trim() ||
      !password?.trim() ||
      !role?.trim()
    ) {
      return res.status(400).json({
        message: "Missing: Required fields",
        success: false,
      });
    }

    const user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({
        message: "User already exist",
        success: false,
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({
      fullName,
      email,
      password: hashedPassword,
      phoneNumber,
      role,
      profile: {
        profilePhoto: cloudResponse.secure_url,
      },
    });

    return res.status(201).json({
      message: "Account created successfully!",
      success: true,
    });
  } catch (error) {
    console.error("ERROR! register controller: ", error);
  }
};

export const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    if (!email?.trim() || !password?.trim() || !role?.trim()) {
      return res.status(400).json({
        message: "Missing: Required fields",
        success: false,
      });
    }

    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        message: "Incorect email or password.",
        success: false,
      });
    }

    const isPasswordMatched = await bcrypt.compare(password, user.password);
    if (!isPasswordMatched) {
      return res.status(400).json({
        message: "Incorect email or password.",
        success: false,
      });
    }

    if (role !== user.role) {
      return res.status(400).json({
        message: "Account doesn't exist with current role.",
        success: false,
      });
    }

    const tokenData = {
      userId: user._id,
    };

    const token = await jwt.sign(tokenData, process.env.SECRET_KEY, {
      expiresIn: "1d",
    });

    user = {
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
      profile: user.profile,
    };

    return res
      .status(200)
      .cookie("token", token, {
        maxAge: 1 * 24 * 60 * 60 * 1000,
        httpsOnly: true,
        sameSite: "strict",
      })
      .json({
        message: `Welcome back ${user.fullName}`,
        user,
        success: true,
      });
  } catch (error) {
    console.error("ERROR! login controller: ", error);
  }
};

export const logout = async (req, res) => {
  try {
    return res.status(200).cookie("token", "", { maxAge: 0 }).json({
      message: "User logged out successfully",
      success: true,
    });
  } catch (error) {
    console.error(`ERROR! logout controller: ${error}`);
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { fullName, email, phoneNumber, bio, skills } = req.body;

    const file = req.file;
    const fileURI = getDataURI(file);
    const cloudResponse = await cloudinary.uploader.upload(fileURI.content);

    const { id } = req.params;

    let skillsArray;
    if (skills) {
      skillsArray = Array.isArray(skills)
        ? skills
        : skills.split(",").map((s) => s.trim());
    }

    let user = await User.findById(id);
    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found!", success: false });
    }

    if (fullName) user.fullName = fullName;
    if (email) user.email = email;
    if (phoneNumber) user.phoneNumber = phoneNumber;
    if (!user.profile) {
      user.profile = {};
    }

    if (bio) user.profile.bio = bio;
    if (skillsArray) user.profile.skills = skillsArray;
    if (cloudResponse) {
      user.profile.resume = cloudResponse.secure_url;
      user.profile.resumeOriginalName = file.originalname;
    }

    await user.save();

    return res.status(200).json({
      message: "Profile updated successfully",
      user,
      success: true,
    });
  } catch (error) {
    console.error("ERROR! Update profile controller: ", error);
    return res.status(500).json({
      message: "Server error while updating profile",
      success: false,
    });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const { role } = req.query;

    const query = {};
    if (role) {
      query.role = role;
    }

    const users = await User.find(query).select("-password");

    return res.status(200).json({
      message: "Users fetched successfully",
      users,
      success: true,
    });
  } catch (error) {
    console.error("ERROR! getAllUsers controller:", error);
    return res.status(500).json({
      message: "Server error while fetching users",
      success: false,
    });
  }
};
