import { Badge } from "@/components/ui/badge";
import React from "react";

interface CustomBadgeProps {
  position: number | string;
  jobType: string;
  salary: number | string;
}

const CustomBadge: React.FC<CustomBadgeProps> = ({
  position,
  jobType,
  salary,
}) => {
  return (
    <div className="flex flex-wrap gap-2">
      <Badge variant="outline" className="bg-teal-100 text-teal-800">
        {position || ""} Positions
      </Badge>
      <Badge variant="outline" className="bg-indigo-100 text-indigo-800">
        {jobType || ""}
      </Badge>
      <Badge variant="outline" className="bg-purple-100 text-purple-800">
        {salary || ""} LPA
      </Badge>
    </div>
  );
};

export default CustomBadge;
