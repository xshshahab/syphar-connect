import mongoose from "mongoose";
import { Job } from "../models/job.model.js";
import { User } from "../models/user.model.js";
import { Application } from "../models/application.model.js";
import { sanitizeRichText, stripTags } from "../utils/sanitize.js";

export const postJob = async (req, res) => {
  try {
    const {
      title,
      description,
      requirements,
      salary,
      location,
      jobType,
      experience,
      position,
      companyId,
    } = req.body;

    const userId = req.id;

    // Validate required fields (experience may legitimately be 0 for freshers)
    const hasExperience =
      experience !== undefined && experience !== null && experience !== "";
    const safeDescription = sanitizeRichText(description);
    if (
      !title ||
      !stripTags(safeDescription) ||
      !requirements ||
      !salary ||
      !location ||
      !jobType ||
      !hasExperience ||
      !position ||
      !companyId
    ) {
      return res.status(400).json({
        message: "Missing required fields.",
        success: false,
      });
    }

    // Handle requirements (string or array)
    let formattedRequirements = [];
    if (typeof requirements === "string") {
      formattedRequirements = requirements
        .split(",")
        .map((req) => req.trim())
        .filter(Boolean);
    } else if (Array.isArray(requirements)) {
      formattedRequirements = requirements
        .map((req) => String(req).trim())
        .filter(Boolean);
    } else {
      return res.status(400).json({
        message:
          "Invalid format for requirements. Use array or comma-separated string.",
        success: false,
      });
    }

    if (formattedRequirements.length === 0) {
      return res.status(400).json({
        message: "Add at least one requirement.",
        success: false,
      });
    }

    // Convert salary to number
    const numericSalary = Number(salary);
    if (isNaN(numericSalary)) {
      return res.status(400).json({
        message: "Salary must be a number.",
        success: false,
      });
    }

    const numericExperience = Number(experience);
    if (isNaN(numericExperience) || numericExperience < 0) {
      return res.status(400).json({
        message: "Experience must be a number of years (0 or more).",
        success: false,
      });
    }

    const job = await Job.create({
      title,
      description: safeDescription,
      requirements: formattedRequirements,
      salary: numericSalary,
      location,
      jobType,
      experienceLevel: numericExperience,
      position: Number(position),
      company: companyId,
      created_by: userId,
    });

    return res.status(201).json({
      message: "New job created successfully!",
      job,
      success: true,
    });
  } catch (error) {
    console.error("ERROR! post job controller: ", error);
    return res.status(500).json({
      message: "Server error while posting job.",
      success: false,
    });
  }
};

const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Filter values are matched with these patterns (instead of exact text) so
// "Delhi NCR" finds Gurgaon/Noida jobs and "Banglore" finds "Bengaluru".
const LOCATION_ALIASES = {
  "delhi ncr": "delhi|noida|gurgaon|gurugram|ghaziabad|faridabad",
  bengaluru: "bengaluru|bangalore|banglore",
  banglore: "bengaluru|bangalore|banglore",
  gurugram: "gurugram|gurgaon",
  gurgaon: "gurugram|gurgaon",
  chennai: "chennai|madras",
  kolkata: "kolkata|calcutta",
};
const INDUSTRY_ALIASES = {
  "frontend developer": "front[- ]?end",
  "backend developer": "back[- ]?end",
  "fullstack developer": "full[- ]?stack",
  "data science": "data (scien|analy)|machine learning",
  "devops engineer": "dev[- ]?ops",
  "graphic designer": "graphic|ui[ /-]?ux|designer",
};

// A known role uses its pattern. Anything else the user typed matches titles
// that contain every word, so "react developer" finds "React Front-End Developer".
const roleCondition = (role) => {
  const alias = INDUSTRY_ALIASES[String(role).toLowerCase()];
  if (alias) return { title: { $regex: alias, $options: "i" } };

  const words = String(role)
    .split(/\s+/)
    .filter((word) => word.length > 1)
    .slice(0, 6);
  if (words.length === 0) {
    return { title: { $regex: escapeRegex(role), $options: "i" } };
  }
  return {
    $and: words.map((word) => ({
      title: { $regex: escapeRegex(word), $options: "i" },
    })),
  };
};

const toArray = (value) =>
  value === undefined ? [] : Array.isArray(value) ? value : [value];

const anyRegex = (field, values, aliases = {}) => ({
  $or: values.map((value) => ({
    [field]: {
      $regex: aliases[String(value).toLowerCase()] ?? escapeRegex(value),
      $options: "i",
    },
  })),
});

// "6-10" -> 6 <= salary < 10, "20+" -> salary >= 20 (salary is in LPA)
const salaryRange = (value) => {
  const open = /^(\d+(?:\.\d+)?)\+$/.exec(value);
  if (open) return { salary: { $gte: Number(open[1]) } };
  const closed = /^(\d+(?:\.\d+)?)-(\d+(?:\.\d+)?)$/.exec(value);
  if (closed) {
    return { salary: { $gte: Number(closed[1]), $lt: Number(closed[2]) } };
  }
  return null;
};

export const getAllJob = async (req, res) => {
  try {
    const keyword = req.query.keyword || "";
    const locations = toArray(req.query.location);
    const industries = toArray(req.query.industry);
    const jobTypes = toArray(req.query.jobType);
    const salaries = toArray(req.query.salary).map(salaryRange).filter(Boolean);
    // candidate's years of experience: jobs asking for that much or less
    const experience =
      req.query.experience === undefined || req.query.experience === ""
        ? NaN
        : Number(req.query.experience);

    // groups are combined with AND, the choices inside a group with OR
    const conditions = [];
    if (keyword) {
      conditions.push({
        $or: [
          { title: { $regex: escapeRegex(keyword), $options: "i" } },
          { description: { $regex: escapeRegex(keyword), $options: "i" } },
        ],
      });
    }
    if (locations.length) {
      conditions.push(anyRegex("location", locations, LOCATION_ALIASES));
    }
    if (industries.length) {
      conditions.push({ $or: industries.map(roleCondition) });
    }
    if (jobTypes.length) {
      conditions.push({
        $or: jobTypes.map((type) => ({
          jobType: { $regex: `^${escapeRegex(type)}$`, $options: "i" },
        })),
      });
    }
    if (salaries.length) conditions.push({ $or: salaries });
    if (!isNaN(experience) && experience >= 0) {
      conditions.push({ experienceLevel: { $lte: experience } });
    }

    const query = conditions.length ? { $and: conditions } : {};

    const jobs = await Job.find(query)
      .populate({
        path: "company",
      })
      .sort({ createdAt: -1 });
    if (!jobs) {
      return res.status(404).json({
        message: "Jobs not found",
        success: false,
      });
    }

    return res.status(200).json({
      message: "All Jobs retrieved successfully.",
      jobs,
      success: true,
    });
  } catch (error) {
    console.error("ERROR! get all job controller: ", error);
    return res.status(500).json({
      message: "Server error while fetching all jobs.",
      success: false,
    });
  }
};

export const getJobById = async (req, res) => {
  try {
    const jobId = req.params.id;
    const job = await Job.findById(jobId).populate({
      path: "applications",
    });

    if (!job) {
      return res.status(404).json({
        message: "Job not found!",
        success: false,
      });
    }

    return res.status(200).json({
      message: `Job retrieved successfully by id: ${jobId}`,
      job,
      success: true,
    });
  } catch (error) {
    console.error("ERROR! get job by id controller: ", error);
    return res.status(500).json({
      message: "Server error while fetching job by id",
      success: false,
    });
  }
};

export const getJobByLoggedInUser = async (req, res) => {
  try {
    const adminId = req.id;
    const jobs = await Job.find({ created_by: adminId }).populate({
      path: "company",
      createdAt: -1,
    });
    if (!jobs) {
      return res.status(404).json({
        message: "Jobs not found",
        success: false,
      });
    }

    // applications still waiting for a decision, per job
    const pending = await Application.aggregate([
      {
        $match: {
          job: { $in: jobs.map((job) => job._id) },
          status: "PENDING",
        },
      },
      { $group: { _id: "$job", count: { $sum: 1 } } },
    ]);
    const pendingByJob = new Map(
      pending.map((item) => [String(item._id), item.count])
    );

    return res.status(200).json({
      message: `Jobs retrieved by logged in user`,
      jobs: jobs.map((job) => ({
        ...job.toObject(),
        pendingApplications: pendingByJob.get(String(job._id)) ?? 0,
      })),
      success: true,
    });
  } catch (error) {
    console.error("ERROR! get job by logged in user controller: ", error);
    return res.status(500).json({
      message: "Server error while fetching job by logged in user",
      success: false,
    });
  }
};

export const saveJob = async (req, res) => {
  try {
    const jobId = req.params.id;
    if (!mongoose.isValidObjectId(jobId)) {
      return res
        .status(400)
        .json({ message: "Invalid job id.", success: false });
    }

    const job = await Job.exists({ _id: jobId });
    if (!job) {
      return res
        .status(404)
        .json({ message: "Job not found!", success: false });
    }

    await User.findByIdAndUpdate(req.id, { $addToSet: { savedJobs: jobId } });

    return res
      .status(200)
      .json({ message: "Job saved for later.", success: true });
  } catch (error) {
    console.error("ERROR! save job controller: ", error);
    return res
      .status(500)
      .json({ message: "Server error while saving job.", success: false });
  }
};

export const removeSavedJob = async (req, res) => {
  try {
    const jobId = req.params.id;
    if (!mongoose.isValidObjectId(jobId)) {
      return res
        .status(400)
        .json({ message: "Invalid job id.", success: false });
    }

    await User.findByIdAndUpdate(req.id, { $pull: { savedJobs: jobId } });

    return res
      .status(200)
      .json({ message: "Removed from saved jobs.", success: true });
  } catch (error) {
    console.error("ERROR! remove saved job controller: ", error);
    return res.status(500).json({
      message: "Server error while removing saved job.",
      success: false,
    });
  }
};

export const getSavedJobs = async (req, res) => {
  try {
    const user = await User.findById(req.id).populate({
      path: "savedJobs",
      populate: { path: "company" },
    });

    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found!", success: false });
    }

    // newest saved first; drop jobs that were deleted since being saved
    const jobs = [...user.savedJobs].reverse().filter(Boolean);

    return res.status(200).json({
      message: "Saved jobs retrieved successfully.",
      jobs,
      success: true,
    });
  } catch (error) {
    console.error("ERROR! get saved jobs controller: ", error);
    return res.status(500).json({
      message: "Server error while fetching saved jobs.",
      success: false,
    });
  }
};
