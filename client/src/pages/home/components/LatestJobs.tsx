import React, { useEffect, useState } from "react";
import JobsCard from "./JobsCard";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import type { Job } from "@/redux/types/jobTypes";
import { Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router";

const LatestJobs: React.FC = () => {
  const { allJobs, searchQuery } = useSelector((state: RootState) => state.job);
  const [filterJobs, setFilterJobs] = useState(allJobs);

  useEffect(() => {
    const query =
      typeof searchQuery === "string" ? searchQuery.trim().toLowerCase() : "";

    if (query) {
      const filteredJobs = allJobs.filter((job) =>
        [job.title, job.description, job.location]
          .map((f) => f.toLowerCase())
          .some((f) => f.includes(query))
      );
      setFilterJobs(filteredJobs);
    } else {
      setFilterJobs(allJobs);
    }
  }, [allJobs, searchQuery]);

  return (
    <div className="py-14">
      <h1
        className="text-2xl mb-5 font-semibold 
    bg-gradient-to-r from-black via-gray-400 to-gray-600 
    dark:from-white dark:via-gray-400 dark:to-gray-600 
    bg-clip-text text-transparent"
      >
        <span>Latest & Top </span> Job Openings
      </h1>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filterJobs.length <= 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-20 space-y-4 ">
            <Loader className="animate-spin text-gray-500 size-5" />
            <p className="text-gray-500 text-lg font-medium">
              No Jobs Available
            </p>
          </div>
        ) : (
          <>
            {filterJobs.slice(0, 6).map((job: Job) => (
              <JobsCard key={job._id} jobs={job} />
            ))}
          </>
        )}
      </section>

      {filterJobs.length > 6 && (
        <div className="flex justify-center mt-8">
          <Button className="rounded-full">
            <Link to={"/browse"}>Explore Jobs</Link>
          </Button>
        </div>
      )}
    </div>
  );
};

export default LatestJobs;
