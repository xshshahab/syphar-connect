import React from "react";
import FilterPage from "./components/FilterPage";
import JobsListCard from "./components/JobsListCard";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import type { Job } from "@/redux/types/jobTypes";

const Jobs: React.FC = () => {
  const { allJobs } = useSelector((state: RootState) => state.job);

  return (
    <main className="flex w-full gap-5 p-2">
      <section className="w-[25%] h-screen sticky top-0">
        <FilterPage />
      </section>

      <section className="w-full">
        {allJobs.length <= 0 ? (
          <div>No Jobs Found</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {allJobs.map((job: Job) => (
              <JobsListCard key={job._id} job={job} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
};

export default Jobs;
