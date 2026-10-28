import React, { useState } from "react";
import { Link } from "react-router";
import { useSelector } from "react-redux";
import { Briefcase, Building2, PlusCircle, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { RootState } from "@/redux/store";
import { useGetAllCompany } from "@/hooks/useGetAllCompany";
import { useGetAdminJobs } from "@/hooks/useGetAdminJobs";
import UpdateProfile from "./components/UpdateProfile";
import ProfileHero from "./components/ProfileHero";

const RecruiterProfile: React.FC = () => {
  useGetAllCompany();
  useGetAdminJobs();

  const [open, setOpen] = useState<boolean>(false);
  const companies = useSelector((state: RootState) => state.company.allCompany);
  const jobs = useSelector((state: RootState) => state.job.adminAllJobs) ?? [];
  const applicants = jobs.reduce(
    (sum, job) => sum + (job.applications?.length ?? 0),
    0
  );

  const stats = [
    {
      icon: Building2,
      label: "Companies",
      value: companies?.length ?? 0,
      to: "/admin/companies",
    },
    {
      icon: Briefcase,
      label: "Jobs posted",
      value: jobs.length,
      to: "/admin/ad-jobs",
    },
    {
      icon: Users,
      label: "Applicants",
      value: applicants,
      to: "/admin/applicants",
    },
  ];

  return (
    <div className="mx-auto my-6 flex w-full max-w-5xl flex-col gap-6 px-4">
      <ProfileHero onEdit={() => setOpen(true)} />

      <Card className="p-5 sm:p-6">
        <h2 className="mb-4 text-lg font-semibold">Your activity</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {stats.map(({ icon: Icon, label, value, to }) => (
            <Link
              key={label}
              to={to}
              className="rounded-xl border p-4 transition-colors hover:bg-accent"
            >
              <Icon className="size-5 text-muted-foreground" />
              <p className="mt-3 text-2xl font-semibold">{value}</p>
              <p className="text-sm text-muted-foreground">{label}</p>
            </Link>
          ))}
        </div>
      </Card>

      <Card>
        <CardContent className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">Ready to hire?</h2>
            <p className="text-sm text-muted-foreground">
              Publish a new opening and start receiving applications.
            </p>
          </div>
          <Button asChild>
            <Link to="/admin/ad-jobs/post-job">
              <PlusCircle className="mr-2 size-4" /> Post a Job
            </Link>
          </Button>
        </CardContent>
      </Card>

      {open && <UpdateProfile open={open} onClose={setOpen} />}
    </div>
  );
};

export default RecruiterProfile;
