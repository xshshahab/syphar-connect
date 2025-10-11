import React from "react";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Job } from "@/redux/types/jobTypes";
import { useNavigate } from "react-router";
import { key } from "@/utils/key";

interface JobsCardProps {
  jobs: Job;
}

const JobsCard: React.FC<JobsCardProps> = ({ jobs }) => {
  const navigate = useNavigate();
  return (
    <Card
      onClick={() => navigate(`/description/${jobs._id}`)}
      className="flex flex-col cursor-pointer h-full"
      key={key}
    >
      <div className="flex flex-col flex-1">
        <CardHeader>
          <CardTitle>
            <h1 className="text-xl font-semibold">
              {jobs.company?.name || ""}
            </h1>
            <span className="text-xs text-gray-500 dark:text-gray-300">
              {jobs?.company?.location || ""}
            </span>
          </CardTitle>
          <CardDescription className="mt-1">
            <h1 className="text-lg text-foreground font-medium">
              {jobs.title || ""}
            </h1>
            <p className="text-base text-gray-700 dark:text-gray-400 mt-1">
              {jobs.description || ""}
            </p>
          </CardDescription>
        </CardHeader>
      </div>

      <CardFooter className="mt-auto">
        <div className="flex flex-wrap gap-2">
          <Badge className="bg-teal-500 font-medium" variant="outline">
            {jobs.position} Position
          </Badge>
          <Badge className="font-medium" variant="destructive">
            {jobs.jobType}
          </Badge>
          <Badge
            className="bg-indigo-600 font-medium text-white"
            variant="outline"
          >
            {jobs.salary} LPA
          </Badge>
        </div>
      </CardFooter>
    </Card>
  );
};

export default JobsCard;
