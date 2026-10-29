import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { getFileURL, removeUploadedFile } from "../utils/uploads.js";

export const register = async (req, res) => {
  try {
    const { fullName, email, phoneNumber, password, role } = req.body;
    const file = req.file;

    if (
      !fullName?.trim() ||
      !email?.trim() ||
      !phoneNumber?.trim() ||
      !password?.trim() ||
      !role?.trim()
    ) {
      removeUploadedFile(file);
      return res.status(400).json({
        message: "Missing: Required fields",
        success: false,
      });
    }

    const user = await User.findOne({ email });
    if (user) {
      removeUploadedFile(file);
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
        profilePhoto: file ? getFileURL(req, file) : undefined,
      },
    });

    return res.status(201).json({
      message: "Account created successfully!",
      success: true,
    });
  } catch (error) {
    console.error("ERROR! register controller: ", error);
    removeUploadedFile(req.file);
    return res.status(500).json({
      message: "Server error while creating the account",
      success: false,
    });
  }
};

export const login = async (req, res) => {
  try {
    // the role is stored on the account at signup, so login does not ask for it
    const { email, password } = req.body;
    if (!email?.trim() || !password?.trim()) {
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
        httpOnly: true,
        sameSite: "strict",
        // only sent over HTTPS in production
        secure: process.env.NODE_ENV === "production",
      })
      .json({
        message: `Welcome back ${user.fullName}`,
        user,
        success: true,
      });
  } catch (error) {
    console.error("ERROR! login controller: ", error);
    return res.status(500).json({
      message: "Server error while logging in",
      success: false,
    });
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
    return res.status(500).json({
      message: "Server error while logging out",
      success: false,
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { fullName, email, phoneNumber, bio, skills } = req.body;

    const resumeFile = req.files?.file?.[0];
    const photoFile = req.files?.profilePhoto?.[0];
    const discardUploads = () => {
      removeUploadedFile(resumeFile);
      removeUploadedFile(photoFile);
    };

    const { id } = req.params;

    let skillsArray;
    if (skills) {
      skillsArray = Array.isArray(skills)
        ? skills
        : skills.split(",").map((s) => s.trim());
    }

    // users may only edit their own profile
    if (id !== req.id) {
      discardUploads();
      return res
        .status(403)
        .json({ message: "Not allowed to edit this profile", success: false });
    }

    let user = await User.findById(id);
    if (!user) {
      discardUploads();
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
    if (resumeFile) {
      user.profile.resume = getFileURL(req, resumeFile);
      user.profile.resumeOriginalName = resumeFile.originalname;
    }
    if (photoFile) {
      user.profile.profilePhoto = getFileURL(req, photoFile);
    }

    await user.save();

    return res.status(200).json({
      message: "Profile updated successfully",
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        profile: user.profile,
      },
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
