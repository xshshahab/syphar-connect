import { htmlToText } from "@/utils/richText";
import React from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNavigate } from "react-router";
import type { Job } from "@/redux/types/jobTypes";
import { daysAgoFn } from "@/utils/calculateDays";
import SaveJobButton from "@/shared/SaveJobButton";
import JobMeta from "@/shared/JobMeta";

interface JobsListCardProps {
  job: Job;
}

const JobsListCard: React.FC<JobsListCardProps> = ({ job }) => {
  const navigate = useNavigate();
  const openDetails = () => navigate(`/description/${job._id}`);
  const days = daysAgoFn(job?.createdAt || "");
  const posted =
    days === 0 ? "Posted today" : `Posted ${days} day${days > 1 ? "s" : ""} ago`;

  return (
    // the whole card opens the job; the bookmark stops its click from bubbling up
    <Card
      role="link"
      tabIndex={0}
      aria-label={`View details for ${job?.title || "this job"}`}
      onClick={openDetails}
      onKeyDown={(e) => {
        if (e.target === e.currentTarget && e.key === "Enter") openDetails();
      }}
      className="group h-full cursor-pointer gap-4 py-5 transition-all hover:-translate-y-0.5 hover:border-foreground/20 hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring"
    >
      <CardContent className="flex flex-1 flex-col gap-4 px-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <Avatar className="size-11 rounded-lg">
              <AvatarImage src={job?.company?.logo || ""} />
              <AvatarFallback className="rounded-lg">
                {job?.company?.name?.charAt(0).toUpperCase() || "C"}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <h2 className="truncate text-sm font-medium">
                {job?.company?.name || ""}
              </h2>
              {job?.company?.location && (
                <p className="flex items-center gap-1 truncate text-xs text-muted-foreground">
                  <MapPin className="size-3 shrink-0" />
                  {job.company.location}
                </p>
              )}
            </div>
          </div>
          <SaveJobButton job={job} className="-mr-2 -mt-1 shrink-0" />
        </div>

        <div className="space-y-1.5">
          <h1 className="line-clamp-1 text-lg font-semibold">
            {job?.title || ""}
          </h1>
          <p className="text-xs text-muted-foreground">
            {posted}
            {job?.location ? ` · ${job.location}` : ""}
          </p>
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {htmlToText(job?.description || "")}
          </p>
        </div>

        <div className="mt-auto">
          <JobMeta job={job} />
        </div>
      </CardContent>

      <CardFooter className="px-5">
        {/* the click bubbles up to the card, which opens the job */}
        <Button className="w-full cursor-pointer">View Details</Button>
      </CardFooter>
    </Card>
  );
};

export default JobsListCard;
