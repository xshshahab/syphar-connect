import { Company } from "../models/company.model.js";
import { getFileURL, removeUploadedFile } from "../utils/uploads.js";

export const registerCompany = async (req, res) => {
  try {
    const { companyName, description, website, location, logo } = req.body;

    if (!companyName) {
      return res.status(400).json({
        message: "Company name is required",
        success: false,
      });
    }

    // Check if a company with the same name already exists
    const existingCompany = await Company.findOne({ name: companyName });
    if (existingCompany) {
      return res.status(400).json({
        message: "You can't register the same company again",
        success: false,
      });
    }

    //  Check website only if it's provided and not empty
    if (website && website.trim() !== "") {
      const existingWebsite = await Company.findOne({ website });
      if (existingWebsite) {
        return res.status(400).json({
          message: "This website is already registered for another company",
          success: false,
        });
      }
    }

    //  Create new company (skip undefined/null website automatically)
    const company = await Company.create({
      name: companyName.trim(),
      description: description?.trim() || "",
      website: website?.trim() || undefined,
      location: location?.trim() || "",
      logo: logo || "",
      userId: req.id, // make sure this comes from your auth middleware
    });

    return res.status(201).json({
      message: "Company registered successfully.",
      company,
      success: true,
    });
  } catch (error) {
    console.error("ERROR! Register Company Controller:", error);

    //  Handle duplicate key errors gracefully
    if (error.code === 11000) {
      const duplicateField = Object.keys(error.keyValue)[0];
      return res.status(400).json({
        message: `Duplicate value for '${duplicateField}': ${error.keyValue[duplicateField]}`,
        success: false,
      });
    }

    return res.status(500).json({
      message: "Something went wrong while registering company.",
      success: false,
    });
  }
};

export const getAllCompany = async (req, res) => {
  try {
    const userId = req.id;
    const companies = await Company.find({ userId });

    if (!companies || companies.length === 0) {
      return res.status(404).json({
        message: "No companies found for this user.",
        success: false,
      });
    }

    return res.status(200).json({
      message: "All companies retrieved successfully.",
      companies,
      success: true,
    });
  } catch (error) {
    console.error("ERROR! Get company controller: ", error);
    return res.status(500).json({
      message: "Something went wrong while fetching companies.",
      success: false,
    });
  }
};

export const getCompanyById = async (req, res) => {
  try {
    const companyId = req.params.id;

    // Await the result
    const company = await Company.findById(companyId);

    if (!company) {
      return res.status(404).json({
        message: "Company not found!",
        success: false,
      });
    }

    // only the recruiter who registered the company may open it
    if (String(company.userId) !== req.id) {
      return res.status(403).json({
        message: "Not allowed to access this company",
        success: false,
      });
    }

    return res.status(200).json({
      message: `Company found by id: ${companyId}`,
      company,
      success: true,
    });
  } catch (error) {
    console.error("ERROR! Get company by id controller: ", error);
    return res.status(500).json({
      message: "Something went wrong while fetching the company.",
      success: false,
    });
  }
};

export const updateCompany = async (req, res) => {
  try {
    const { name, description, website, location } = req.body;

    const file = req.file;

    const updateData = { name, description, website, location };
    if (file) updateData.logo = getFileURL(req, file);

    // matching on userId means only the owner can change a company
    const company = await Company.findOneAndUpdate(
      { _id: req.params.id, userId: req.id },
      updateData,
      { new: true }
    );

    if (!company) {
      removeUploadedFile(file);
      return res.status(404).json({
        message: "Company not found!",
        success: false,
      });
    }

    return res.status(200).json({
      message: "Company Information updated",
      success: true,
    });
  } catch (error) {
    console.error("ERROR! Update company: ", error);
  }
};

export const deleteCompany = async (req, res) => {
  try {
    const companyId = req.params.id;

    // Check if company exists
    const company = await Company.findOne({ _id: companyId, userId: req.id });
    if (!company) {
      return res.status(404).json({
        message: "Company not found!",
        success: false,
      });
    }

    await Company.findByIdAndDelete(companyId);

    return res.status(200).json({
      message: "Company deleted successfully",
      success: true,
    });
  } catch (error) {
    console.error("ERROR! Delete company controller: ", error);
    return res.status(500).json({
      message: "Server error while deleting company",
      success: false,
    });
  }
};
