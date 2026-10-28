import { Application } from "../models/application.model.js";
import { Job } from "../models/job.model.js";
import { User } from "../models/user.model.js";

export const applyJob = async (req, res) => {
  try {
    const userId = req.id;
    const jobId = req.params.id;

    if (!jobId) {
      return res.status(400).json({
        message: "JobId is required!",
        success: false,
      });
    }

    const existingApplication = await Application.findOne({
      job: jobId,
      applicant: userId,
    });

    if (existingApplication) {
      return res.status(400).json({
        message: "You've already applied for this job",
        success: false,
      });
    }

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        message: "Job not found!",
        success: false,
      });
    }

    // recruiters cannot apply, and a student must have a resume on file
    const applicant = await User.findById(userId).select("role profile.resume");
    if (!applicant || applicant.role !== "student") {
      return res.status(403).json({
        message: "Only job seekers can apply for jobs",
        success: false,
      });
    }
    if (!applicant.profile?.resume) {
      return res.status(400).json({
        message: "Please upload your resume before applying",
        needsResume: true,
        success: false,
      });
    }

    const newApplication = await Application.create({
      job: jobId,
      applicant: userId,
    });

    job.applications.push(newApplication._id);
    await job.save();

    return res.status(201).json({
      message: "Job applied successfully!",
      success: true,
    });
  } catch (error) {
    console.error("ERROR! apply job controller: ", error);
    return res.status(500).json({
      message: "Server error while applying job",
      success: false,
    });
  }
};

export const getAppliedJobs = async (req, res) => {
  try {
    const userId = req.id;
    const application = await Application.find({ applicant: userId })
      .sort({ createdAt: -1 })
      .populate({
        path: "job",
        options: { sort: { createdAt: -1 } },
        populate: {
          path: "company",
          options: { sort: { createdAt: -1 } },
        },
      });

    if (!application) {
      return res.status(404).json({
        message: "No Applications",
        success: false,
      });
    }

    return res.status(200).json({
      message: "Application retreived successfully",
      application,
      success: true,
    });
  } catch (error) {
    console.error("ERROR! get applied job controller: ", error);
    return res.status(500).json({
      message: "Server error while fetching applied job",
      success: false,
    });
  }
};

export const getApplicants = async (req, res) => {
  try {
    const jobId = req.params.id;
    const job = await Job.findById(jobId).populate({
      path: "applications",
      options: { sort: { createdAt: -1 } },
      populate: {
        path: "applicant",
        select: "-password",
      },
    });

    if (!job) {
      return res.status(404).json({
        message: "Job not found",
        success: false,
      });
    }

    // only the recruiter who posted the job may see its applicants
    if (String(job.created_by) !== req.id) {
      return res.status(403).json({
        message: "Not allowed to view applicants of this job",
        success: false,
      });
    }

    return res.status(200).json({
      message: "Applicants fetched successfully.",
      job,
      success: true,
    });
  } catch (error) {
    console.error("ERROR! get applicants controller: ", error);
    return res.status(500).json({
      message: "Server error while fetching applicants",
      success: false,
    });
  }
};

export const updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const applicationId = req.params.id;

    if (!status) {
      return res.status(400).json({
        message: "Status is required",
        success: false,
      });
    }

    const newStatus = String(status).toUpperCase();
    if (!["PENDING", "ACCEPTED", "REJECTED"].includes(newStatus)) {
      return res.status(400).json({
        message: "Invalid status",
        success: false,
      });
    }

    const application = await Application.findOne({
      _id: applicationId,
    }).populate({ path: "job", select: "created_by" });
    if (!application) {
      return res.status(400).json({
        message: "Application not found",
        success: false,
      });
    }

    // only the recruiter who posted the job may change its applications
    if (String(application.job?.created_by) !== req.id) {
      return res.status(403).json({
        message: "Not allowed to update this application",
        success: false,
      });
    }

    application.status = newStatus;
    await application.save();

    return res.status(200).json({
      message: "Status updated successsfully!",
      success: true,
    });
  } catch (error) {
    console.error("ERROR! update status controller: ", error);
    return res.status(500).json({
      message: "Server error while updating the status",
      success: false,
    });
  }
};
