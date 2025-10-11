import React from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { useNavigate } from "react-router";
import type { Job } from "@/redux/types/jobTypes";
import { daysAgoFn } from "@/utils/calculateDays";
import CustomBadge from "@/shared/CustomBadge";

interface JobsListCardProps {
  key: string;
  job: Job;
}

const JobsListCard: React.FC<JobsListCardProps> = ({ key, job }) => {
  const navigate = useNavigate();
  const handleViewDetails = () => {
    navigate(`/description/${job._id}`);
  };

  return (
    <Card key={key}>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-500 dark:text-gray-300">
            {(() => {
              const days = daysAgoFn(job?.createdAt || "");
              return days === 0 ? "Today" : `${days} days ago`;
            })()}
          </span>

          <Button className="cursor-pointer" variant="ghost" size="icon">
            <Bookmark className="h-5 w-5 text-gray-500 dark:text-gray-300" />
          </Button>
        </div>

        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={job?.company?.logo || ""} />
          </Avatar>
          <div>
            <h2 className="font-semibold text-base">
              {job?.company?.name || ""}
            </h2>
            <p className="text-xs">{job?.company?.location || ""}</p>
          </div>
        </div>

        <div className="space-y-1 mt-2.5">
          <h1 className="text-lg font-semibold">{job?.title || ""}</h1>
          <p className="text-sm text-zinc-500">{job?.description || ""}</p>
        </div>
      </CardContent>

      <CardFooter className="flex flex-col gap-3 items-start">
        <CustomBadge
          position={job?.position}
          jobType={job?.jobType}
          salary={job?.salary}
        />

        <div className="flex mt-2 gap-3">
          <Button
            className="cursor-pointer"
            onClick={handleViewDetails}
            size="sm"
          >
            View Details
          </Button>
          <Button className="cursor-pointer" size="sm" variant="outline">
            Save For Later
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default JobsListCard;
