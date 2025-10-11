import React from "react";
import CompaniesTable from "./components/CompaniesTable";
import { useGetAllCompany } from "@/hooks/useGetAllCompany";

const AdminCompanies: React.FC = () => {
  useGetAllCompany();

  return (
    <>
      <CompaniesTable />
    </>
  );
};

export default AdminCompanies;
