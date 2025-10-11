import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { RootState } from "@/redux/store";
import { JOB_API_ENDPOINT } from "@/utils/constant";
import axios from "axios";
import { Loader } from "lucide-react";
import React, { useReducer, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { toast } from "sonner";

type InputType = {
  title: string;
  description: string;
  requirements: string;
  salary: number;
  location: string;
  jobType: string;
  experience: string;
  position: number;
  companyId: string;
};

const initialState: InputType = {
  title: "",
  description: "",
  requirements: "",
  salary: 0,
  location: "",
  jobType: "",
  experience: "",
  position: 0,
  companyId: "",
};

type Action =
  | {
      type: "SET_FIELD";
      field: keyof InputType;
      value: string | number;
    }
  | {
      type: "SET_COMPANY";
      companyId: string;
    };

const reducer = (state: InputType, action: Action): InputType => {
  switch (action.type) {
    case "SET_FIELD":
      return { ...state, [action.field]: action.value };
    case "SET_COMPANY":
      return { ...state, companyId: action.companyId };
    default:
      return state;
  }
};

const PostNewJob: React.FC = () => {
  const [input, setInput] = useReducer(reducer, initialState);
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const { allCompany } = useSelector((state: RootState) => state.company);

  const handleChange = (field: keyof InputType, value: string | number) => {
    setInput({ type: "SET_FIELD", field, value });
  };

  const handleSelectChange = (value: string) => {
    const selectedCompany = allCompany?.find(
      (company) => company.name.toLowerCase() === value
    );
    handleChange("companyId", selectedCompany?._id ?? "");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await axios.post(`${JOB_API_ENDPOINT}/create-job`, input, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });

      if (res.data.success) {
        toast.success(res?.data?.message);
        navigate("/admin/ad-jobs");
      }
    } catch (error: any) {
      console.error("ERROR! while submitting the new job: ", error);
      toast.error(error.response.data.message || "An unknown error occurred!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl border rounded-2xl shadow my-4 mx-auto p-5">
      <div className="mb-6">
        <h2 className="text-2xl font-bold  mb-1">Post a New Job</h2>
        <p className=" text-xs">
          Fill in the details below to create a new job posting
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-2">
        {/* Job Details Section */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Job Title */}
          <div className="space-y-1">
            <Label
              htmlFor="title"
              className="text-sm font-semibold  flex items-center gap-1"
            >
              Job Title
              <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              value={input.title}
              onChange={(e) => handleChange("title", e.target.value)}
              placeholder="e.g., Frontend Developer"
              className="focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Registered Company */}
          <div className="space-y-1">
            <Label
              htmlFor="company"
              className="text-sm font-semibold  flex items-center gap-1"
            >
              Registered Company
              <span className="text-red-500">*</span>
            </Label>
            {Array.isArray(allCompany) && allCompany.length > 0 ? (
              <Select onValueChange={handleSelectChange}>
                <SelectTrigger
                  id="company"
                  className="w-full focus:ring-2 focus:ring-blue-500"
                >
                  <SelectValue placeholder="Select a company" />
                </SelectTrigger>
                <SelectContent>
                  {allCompany.map((company) => (
                    <SelectItem
                      key={company._id}
                      value={company?.name?.toLowerCase()}
                    >
                      {company?.name || ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="text-sm  bg-gray-50 p-3 rounded-md border">
                No companies available
              </div>
            )}
          </div>

          {/* Job Description */}
          <div className="space-y-1 md:col-span-2">
            <Label
              htmlFor="description"
              className="text-sm font-semibold  flex items-center gap-1"
            >
              Job Description
              <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="description"
              value={input.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Describe the job responsibilities, expectations, and what makes your company great..."
              className="h-16 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Requirements */}
          <div className="space-y-1 md:col-span-2">
            <Label
              htmlFor="requirements"
              className="text-sm font-semibold  flex items-center gap-1"
            >
              Requirements
              <span className="text-red-500">*</span>
            </Label>
            <Input
              id="requirements"
              value={input.requirements}
              onChange={(e) => handleChange("requirements", e.target.value)}
              placeholder="List job requirements separated by commas (e.g., React, TypeScript, 3+ years experience)"
              className="focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Salary */}
          <div className="space-y-1">
            <Label
              htmlFor="salary"
              className="text-sm font-semibold  flex items-center gap-1"
            >
              Salary ($)
              <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 ">
                $
              </span>
              <Input
                id="salary"
                type="number"
                value={input.salary}
                onChange={(e) => handleChange("salary", Number(e.target.value))}
                placeholder="50000"
                className="pl-8 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="0"
                required
              />
            </div>
          </div>

          {/* Location */}
          <div className="space-y-1">
            <Label
              htmlFor="location"
              className="text-sm font-semibold  flex items-center gap-1"
            >
              Location
              <span className="text-red-500">*</span>
            </Label>
            <Input
              id="location"
              value={input.location}
              onChange={(e) => handleChange("location", e.target.value)}
              placeholder="e.g., New York, NY or Remote"
              className="focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Job Type */}
          <div className="space-y-1">
            <Label
              htmlFor="jobType"
              className="text-sm font-semibold  flex items-center gap-1"
            >
              Job Type
              <span className="text-red-500">*</span>
            </Label>
            <Input
              id="jobType"
              value={input.jobType}
              onChange={(e) => handleChange("jobType", e.target.value)}
              placeholder="e.g., Full-time, Part-time, Contract"
              className="focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Experience Level */}
          <div className="space-y-1">
            <Label
              htmlFor="experience"
              className="text-sm font-semibold  flex items-center gap-1"
            >
              Experience Level
              <span className="text-red-500">*</span>
            </Label>
            <Input
              id="experience"
              value={input.experience}
              onChange={(e) => handleChange("experience", e.target.value)}
              placeholder="e.g., 3+ years, Entry-level, Senior"
              className="focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Position */}
          <div className="space-y-1">
            <Label
              htmlFor="position"
              className="text-sm font-semibold  flex items-center gap-1"
            >
              Number of Positions
              <span className="text-red-500">*</span>
            </Label>
            <Input
              id="position"
              type="number"
              value={input.position}
              onChange={(e) => handleChange("position", Number(e.target.value))}
              placeholder="1"
              className="focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min="1"
              required
            />
          </div>
        </section>

        {/* Action Buttons */}
        <div className="flex flex-col space-y-4 pt-2">
          <Button
            type="submit"
            disabled={loading || !allCompany || allCompany.length === 0}
          >
            {loading ? (
              <>
                <Loader className="h-5 w-5 animate-spin" />
                Creating Job Post...
              </>
            ) : (
              "Create Job Post"
            )}
          </Button>

          {(!allCompany || allCompany.length === 0) && (
            <div className="text-center">
              <p className="text-red-600 text-sm font-semibold bg-red-50 py-3 px-4 rounded-lg border border-red-200">
                ⚠️ Please register a company first before posting a job
              </p>
            </div>
          )}
        </div>
      </form>
    </div>
  );
};

export default PostNewJob;
