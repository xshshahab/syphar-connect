import React from "react";
import { Link, Navigate } from "react-router";
import { useSelector } from "react-redux";
import { CheckCircle2, Clock, FileText, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useGetAppliedJobs } from "@/hooks/useGetAppliedJobs";
import type { RootState } from "@/redux/store";
import { AppliedJobTable } from "./components/AppliedJobTable";

const AppliedJobs: React.FC = () => {
  useGetAppliedJobs();
  const { user } = useSelector((state: RootState) => state.auth);
  const applied = useSelector((state: RootState) => state.job.allAppliedJobs);

  // recruiters do not apply for jobs; their equivalent is the applicants page
  if (user?.role === "recruiter") {
    return <Navigate to="/admin/applicants" replace />;
  }

  const applications = (applied ?? []).filter((item) => item.job);
  const count = (status: string) =>
    applications.filter((item) => item.status === status).length;

  const stats = [
    { icon: FileText, label: "Total applied", value: applications.length },
    { icon: Clock, label: "Pending", value: count("PENDING") },
    { icon: CheckCircle2, label: "Accepted", value: count("ACCEPTED") },
    { icon: XCircle, label: "Rejected", value: count("REJECTED") },
  ];

  return (
    <div className="mx-auto my-6 w-full max-w-5xl px-4">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">Applied Jobs</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Track the status of every job you have applied for.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link to="/jobs">Browse more jobs</Link>
        </Button>
      </header>

      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        {stats.map(({ icon: Icon, label, value }) => (
          <Card key={label} className="gap-2 p-4">
            <Icon className="size-5 text-muted-foreground" />
            <p className="text-2xl font-semibold">{value}</p>
            <p className="text-sm text-muted-foreground">{label}</p>
          </Card>
        ))}
      </div>

      <Card className="p-2 sm:p-4">
        <AppliedJobTable />
      </Card>
    </div>
  );
};

export default AppliedJobs;
