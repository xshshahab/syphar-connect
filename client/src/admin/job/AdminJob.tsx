import React from "react";
import AdJobsTable from "./components/AdJobsTable";
import { useGetAdminJobs } from "@/hooks/useGetAdminJobs";

const AdminJob: React.FC = () => {
  useGetAdminJobs();

  return <AdJobsTable />;
};

export default AdminJob;
