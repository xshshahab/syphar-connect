import { Button } from "@/components/ui/button";
import { useGetSingleJob } from "@/hooks/useGetSingleJob";
import { setSingleJob } from "@/redux/slice/jobSlice";
import type { RootState } from "@/redux/store";
import type { Job } from "@/redux/types/jobTypes";
import CustomBadge from "@/shared/CustomBadge";
import { APPLICATION_API_ENDPOINT } from "@/utils/constant";
import axios from "axios";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router";
import { toast } from "sonner";

const JobDescription: React.FC = () => {
  const params = useParams();
  const jobId: string = params.id || "";

  const { singleJob } = useSelector((state: RootState) => state.job);
  const { user } = useSelector((state: RootState) => state.auth);

  const isInitiallyApplied =
    singleJob?.applications?.some(
      (application) => application.applicant === user?._id
    ) || false;

  const [isApplied, setIsApplied] = useState(isInitiallyApplied);
  const dispatch = useDispatch();

  const applyJobHandler = async () => {
    try {
      const res = await axios.get(
        `${APPLICATION_API_ENDPOINT}/apply/${jobId}`,
        {
          withCredentials: true,
        }
      );

      if (res.data.success && singleJob) {
        setIsApplied(true);

        const updateSingleJob: Job = {
          ...singleJob,
          _id: singleJob._id!,
          applications: [
            ...(singleJob.applications || []),
            { applicant: user?._id },
          ],
        };

        dispatch(setSingleJob(updateSingleJob));
        toast.success(res.data.message);
      } else {
        if (res.data.message === "You've already applied for this job") {
          setIsApplied(true);
        }
        toast.error(res.data.message || "Something went wrong!");
      }
    } catch (error: any) {
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to apply for job";
      toast.error(msg);
      console.error("ERROR! apply job: ", error);
    }
  };
  useGetSingleJob(jobId, setIsApplied);

  return (
    <section className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-8">
      {/* Header: Job Title + Badges + Apply Button */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center bg-white shadow-md rounded-lg p-6">
        <div className="space-y-3">
          <h1 className="text-3xl font-bold text-gray-800">
            {singleJob?.title || ""}
          </h1>

          <CustomBadge
            position={singleJob?.position || ""}
            jobType={singleJob?.jobType || ""}
            salary={singleJob?.salary || ""}
          />
        </div>
        <div className="mt-4 md:mt-0">
          <Button
            onClick={isApplied ? undefined : () => applyJobHandler()}
            disabled={isApplied}
            className="px-6 py-2 font-semibold rounded-lg"
          >
            {isApplied ? "Already Applied" : "Apply Now"}
          </Button>
        </div>
      </div>

      {/* Job Details Card */}
      <div className="bg-white shadow-md rounded-lg p-6 space-y-4">
        <h2 className="text-2xl font-semibold text-gray-700 border-b pb-2">
          Job Details
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
          <div>
            <p>
              <span className="font-semibold">Role:</span>{" "}
              {singleJob?.jobType || "-"}
            </p>
            <p>
              <span className="font-semibold">Location:</span>{" "}
              {singleJob?.location || "-"}
            </p>
            <p>
              <span className="font-semibold">Experience:</span>{" "}
              {singleJob?.experienceLevel || "-"} yrs
            </p>
          </div>
          <div>
            <p>
              <span className="font-semibold">Salary:</span>{" "}
              {singleJob?.salary || "-"} LPA
            </p>
            <p>
              <span className="font-semibold">Total Applicants:</span>{" "}
              {singleJob?.applications?.length || 0}
            </p>
            <p>
              <span className="font-semibold">Posted Date:</span>{" "}
              {singleJob?.createdAt?.split("T")[0] || "-"}
            </p>
          </div>
        </div>
        <div className="mt-4">
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            Job Description
          </h3>
          <p className="text-gray-600 leading-relaxed">
            {singleJob?.description || "No description available."}
          </p>
        </div>
      </div>
    </section>
  );
};

export default JobDescription;
