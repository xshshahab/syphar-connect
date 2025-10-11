import React, { useEffect } from "react";
import JobsListCard from "../jobs/components/JobsListCard";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import { key } from "@/utils/key";
import { setSearchQuery } from "@/redux/slice/jobSlice";
import { useGetAllJobs } from "@/hooks/useGetAllJobs";

const BrowsePage: React.FC = () => {
  useGetAllJobs();

  const dispatch = useDispatch();

  const { allJobs } = useSelector((state: RootState) => state.job);
  useEffect(() => {
    return () => {
      dispatch(setSearchQuery(""));
    };
  }, []);

  return (
    <div>
      <h1 className="text-lg font-semibold my-5">
        Search Result ({allJobs.length})
      </h1>
      <div className="grid grid-cols-3 gap-4 items-center">
        {allJobs.map((job) => {
          return (
            <div key={job._id}>
              <JobsListCard job={job} key={key} />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BrowsePage;
