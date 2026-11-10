import React from "react";
import { Briefcase, GraduationCap, Users, Wallet } from "lucide-react";
import type { Job } from "@/redux/types/jobTypes";
import { formatExperience } from "@/utils/formatExperience";

// Compact icon + text facts about a job, used on cards and lists
const JobMeta: React.FC<{ job: Job }> = ({ job }) => {
  const items = [
    { icon: Briefcase, text: job.jobType },
    { icon: Wallet, text: job.salary != null ? `${job.salary} LPA` : "" },
    { icon: GraduationCap, text: formatExperience(job.experienceLevel) },
    {
      icon: Users,
      text: job.position
        ? `${job.position} opening${job.position > 1 ? "s" : ""}`
        : "",
    },
  ].filter((item) => item.text);

  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
      {items.map(({ icon: Icon, text }) => (
        <li key={text} className="flex items-center gap-1.5">
          <Icon className="size-4 shrink-0" aria-hidden />
          {text}
        </li>
      ))}
    </ul>
  );
};

export default JobMeta;
