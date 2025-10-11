import { Job } from "../models/job.model.js";

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

    // Validate required fields
    if (
      !title ||
      !description ||
      !requirements ||
      !salary ||
      !location ||
      !jobType ||
      !experience ||
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
      formattedRequirements = requirements.split(",").map((req) => req.trim());
    } else if (Array.isArray(requirements)) {
      formattedRequirements = requirements;
    } else {
      return res.status(400).json({
        message:
          "Invalid format for requirements. Use array or comma-separated string.",
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

    const job = await Job.create({
      title,
      description,
      requirements: formattedRequirements,
      salary: numericSalary,
      location,
      jobType,
      experienceLevel: Number(experience),
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

export const getAllJob = async (req, res) => {
  try {
    const keyword = req.query.keyword || "";
    const query = {
      $or: [
        { title: { $regex: keyword, $options: "i" } },
        { description: { $regex: keyword, $options: "i" } },
      ],
    };

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

    return res.status(200).json({
      message: `Jobs retrieved by logged in user`,
      jobs,
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
