import React from "react";
import { Link, useNavigate } from "react-router";
import { Bookmark, MapPin } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import SaveJobButton from "@/shared/SaveJobButton";
import { useSavedJobs } from "@/hooks/useSavedJobs";
import { formatExperience } from "@/utils/formatExperience";

const SavedJobs: React.FC = () => {
  const { savedJobs } = useSavedJobs();
  const navigate = useNavigate();

  return (
    <section className="mx-auto w-full max-w-5xl">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h1 className="flex items-center gap-2 text-lg font-semibold">
          Saved Jobs
          {savedJobs.length > 0 && (
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
              {savedJobs.length}
            </span>
          )}
        </h1>
      </div>

      {savedJobs.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed py-10 text-center">
          <Bookmark className="size-8 text-muted-foreground" />
          <div>
            <p className="font-medium">No saved jobs yet</p>
            <p className="text-sm text-muted-foreground">
              Tap the bookmark on any job to keep it here for later.
            </p>
          </div>
          <Button asChild size="sm">
            <Link to="/jobs">Browse jobs</Link>
          </Button>
        </div>
      ) : (
        <ul className="divide-y rounded-lg border">
          {savedJobs.map((job) => (
            <li
              key={job._id}
              className="flex flex-wrap items-center gap-3 p-4 sm:flex-nowrap"
            >
              <Avatar className="size-11 rounded-lg">
                <AvatarImage src={job.company?.logo || ""} />
                <AvatarFallback className="rounded-lg">
                  {job.company?.name?.charAt(0).toUpperCase() || "C"}
                </AvatarFallback>
              </Avatar>

              <div className="min-w-0 flex-1">
                <h2 className="truncate font-medium">{job.title}</h2>
                <p className="flex flex-wrap items-center gap-x-3 text-sm text-muted-foreground">
                  <span>{job.company?.name}</span>
                  {job.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="size-3" />
                      {job.location}
                    </span>
                  )}
                  <span>{job.salary} LPA</span>
                  <span>{job.jobType}</span>
                  <span>{formatExperience(job.experienceLevel)}</span>
                </p>
              </div>

              <div className="flex items-center gap-1">
                <Button
                  size="sm"
                  className="cursor-pointer"
                  onClick={() => navigate(`/description/${job._id}`)}
                >
                  View
                </Button>
                <SaveJobButton job={job} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default SavedJobs;
