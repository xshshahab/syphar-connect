import React from "react";
import { Link, useNavigate } from "react-router";
import { useSelector } from "react-redux";
import { ArrowRight, Briefcase, Clock, Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useGetAdminJobs } from "@/hooks/useGetAdminJobs";
import type { RootState } from "@/redux/store";
import EmptyState from "@/shared/EmptyState";
import { daysAgoFn } from "@/utils/calculateDays";

// Overview of every posted job with how many people applied
const AdminApplicants: React.FC = () => {
  useGetAdminJobs();
  const navigate = useNavigate();
  const jobs = useSelector((state: RootState) => state.job.adminAllJobs) ?? [];

  const withCounts = jobs
    .map((job) => ({
      job,
      count: job.applications?.length ?? 0,
      pending: job.pendingApplications ?? 0,
    }))
    // jobs that need attention first, then by number of applicants
    .sort((a, b) => b.pending - a.pending || b.count - a.count);
  const total = withCounts.reduce((sum, { count }) => sum + count, 0);
  const pendingTotal = withCounts.reduce((sum, { pending }) => sum + pending, 0);

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 md:py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold md:text-3xl">Applicants</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          See who applied to each of your job postings.
        </p>
      </header>

      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-3">
        <Card className="py-4">
          <CardContent className="flex items-center gap-3 px-5">
            <span className="flex size-10 items-center justify-center rounded-lg border">
              <Users className="size-5" />
            </span>
            <div>
              <p className="text-2xl font-semibold">{total}</p>
              <p className="text-sm text-muted-foreground">Total applicants</p>
            </div>
          </CardContent>
        </Card>
        <Card className="py-4">
          <CardContent className="flex items-center gap-3 px-5">
            <span className="flex size-10 items-center justify-center rounded-lg border">
              <Clock className="size-5" />
            </span>
            <div>
              <p className="text-2xl font-semibold">{pendingTotal}</p>
              <p className="text-sm text-muted-foreground">Pending review</p>
            </div>
          </CardContent>
        </Card>
        <Card className="py-4">
          <CardContent className="flex items-center gap-3 px-5">
            <span className="flex size-10 items-center justify-center rounded-lg border">
              <Briefcase className="size-5" />
            </span>
            <div>
              <p className="text-2xl font-semibold">{jobs.length}</p>
              <p className="text-sm text-muted-foreground">Jobs posted</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {withCounts.length === 0 ? (
        <EmptyState
          title="No jobs posted yet"
          description="Post a job and applicants will show up here."
        >
          <Button asChild>
            <Link to="/admin/ad-jobs/post-job">Post a Job</Link>
          </Button>
        </EmptyState>
      ) : (
        <ul className="divide-y rounded-lg border">
          {withCounts.map(({ job, count, pending }) => {
            const days = daysAgoFn(job.createdAt || "");
            return (
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
                  <p className="text-sm text-muted-foreground">
                    {job.company?.name} · {job.jobType} · Posted{" "}
                    {days === 0 ? "today" : `${days} day${days > 1 ? "s" : ""} ago`}
                  </p>
                </div>

                {pending > 0 && (
                  <Badge className="shrink-0 border-transparent bg-red-500 text-white">
                    {pending} pending
                  </Badge>
                )}
                <Badge
                  variant={count > 0 ? "default" : "secondary"}
                  className="shrink-0"
                >
                  {count} {count === 1 ? "applicant" : "applicants"}
                </Badge>
                <Button
                  size="sm"
                  variant="outline"
                  className="cursor-pointer"
                  onClick={() => navigate(`/admin/ad-jobs/${job._id}/applicants`)}
                >
                  View <ArrowRight className="ml-1 size-4" />
                </Button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default AdminApplicants;
