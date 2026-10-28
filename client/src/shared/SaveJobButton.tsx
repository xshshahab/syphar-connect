import React from "react";
import { Bookmark } from "lucide-react";
import { useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { RootState } from "@/redux/store";
import type { Job } from "@/redux/types/jobTypes";
import { useSavedJobs } from "@/hooks/useSavedJobs";

interface SaveJobButtonProps {
  job: Job;
  // "icon" is a bookmark in a corner, "full" is a labelled button
  variant?: "icon" | "full";
  className?: string;
}

const SaveJobButton: React.FC<SaveJobButtonProps> = ({
  job,
  variant = "icon",
  className,
}) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const { isSaved, toggleSave } = useSavedJobs();

  // bookmarks are for job seekers
  if (user?.role !== "student") return null;

  const saved = isSaved(job._id);
  const label = saved ? "Remove from saved jobs" : "Save for later";

  const onClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // cards can be clickable
    toggleSave(job);
  };

  if (variant === "full") {
    return (
      <Button
        type="button"
        variant="outline"
        onClick={onClick}
        className={cn("cursor-pointer", className)}
      >
        <Bookmark className={cn("size-4", saved && "fill-current")} />
        {saved ? "Saved" : "Save for later"}
      </Button>
    );
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      title={label}
      aria-label={label}
      aria-pressed={saved}
      onClick={onClick}
      className={cn("cursor-pointer", className)}
    >
      <Bookmark
        className={cn(
          "size-5",
          saved ? "fill-red-500 text-red-500" : "text-muted-foreground"
        )}
      />
    </Button>
  );
};

export default SaveJobButton;
