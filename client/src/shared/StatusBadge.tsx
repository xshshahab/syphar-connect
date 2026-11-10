import React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const STYLES: Record<string, string> = {
  ACCEPTED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
  PENDING: "bg-yellow-100 text-yellow-700",
};

// Application status pill: PENDING / ACCEPTED / REJECTED
const StatusBadge: React.FC<{ status: string; className?: string }> = ({
  status,
  className,
}) => (
  <Badge
    className={cn(
      "border-transparent font-medium uppercase",
      STYLES[status] ?? STYLES.PENDING,
      className
    )}
  >
    {status}
  </Badge>
);

export default StatusBadge;
