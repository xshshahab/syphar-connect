import React, { useEffect } from "react";
import ApplicantsTable from "./ApplicantsTable";
import axios from "axios";
import { APPLICATION_API_ENDPOINT } from "@/utils/constant";
import { Link, useParams } from "react-router";
import { ArrowLeft } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { setAllApplicants } from "@/redux/slice/applicationSlice";
import type { RootState } from "@/redux/store";

const JobApplicants: React.FC = () => {
  const params = useParams();

  const dispatch = useDispatch();
  const { applicants } = useSelector((state: RootState) => state.application);

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get(
          `${APPLICATION_API_ENDPOINT}/applicants/${params.id}`,
          {
            withCredentials: true,
          }
        );

        if (res.data.success) {
          dispatch(setAllApplicants(res.data.job));
        }
      } catch (error) {
        console.error("ERROR! fetching all applicants: ", error);
      }
    })();
  }, []);

  return (
    <div className="my-3 w-full px-4 py-4">
      <Link
        to="/admin/applicants"
        className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> All applicants
      </Link>
      <h1 className="text-2xl font-semibold">
        {applicants?.title ? `${applicants.title} — ` : ""}Applicants (
        {applicants?.applications?.length ?? 0})
      </h1>
      <div className="mt-4">
        <ApplicantsTable applicants={applicants} />
      </div>
    </div>
  );
};

export default JobApplicants;
