import React from "react";
import { Button } from "@/components/ui/button";
import {
  ArrowUpRight,
  ChevronsUpDown,
  Edit2,
  Eye,
  MoreHorizontal,
  Plus,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link, useNavigate } from "react-router";
import { DynamicTable } from "@/components/dynamic-table/DynamicTable";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";

export type AdminJobsTable = {
  id: string;
  logo: string;
  companyName: string;
  website: string;
  role: string;
  date: string;
};

export const columns: ColumnDef<AdminJobsTable>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
    size: 30,
  },
  {
    accessorKey: "companyName",
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="px-0 font-semibold "
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Company Details
        <span className="ml-1 opacity-50">
          <ChevronsUpDown />
        </span>
      </Button>
    ),
    cell: ({ row }) => {
      const { logo, companyName } = row.original;
      return (
        <div className="flex items-center gap-3">
          <Avatar className="size-9">
            <AvatarImage src={logo || ""} alt={companyName} />
            <AvatarFallback>{companyName.charAt(0)}</AvatarFallback>
          </Avatar>
          <span className="font-medium ">{companyName}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "website",
    header: () => <div className="text-left font-semibold ">Website URL</div>,
    cell: ({ row }) => (
      <div className="text-sm ">
        <Link
          className="flex items-center gap-2 hover:underline"
          to={row.getValue("website") as string}
          target="_blank"
          rel="noopener noreferrer"
        >
          <ArrowUpRight size={16} />
          {row.getValue("website")}
        </Link>
      </div>
    ),
  },
  {
    accessorKey: "role",
    header: () => <div className="text-left font-semibold ">Role</div>,
    cell: ({ row }) => <div className="text-sm ">{row.getValue("role")}</div>,
  },
  {
    accessorKey: "date",
    header: () => <div className="text-left font-semibold ">Added On</div>,
    cell: ({ row }) => <div className="text-sm ">{row.getValue("date")}</div>,
  },
  {
    id: "actions",
    enableHiding: false,
    header: () => <div className="text-right font-semibold ">Actions</div>,
    cell: ({ row }) => {
      const id = row.original.id;
      const navigate = useNavigate();

      const handleEdit = () => navigate(`/admin/companies/${id}`);
      const handleViewApplicants = () =>
        navigate(`/admin/ad-jobs/${id}/applicants`);

      return (
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleEdit} className="cursor-pointer">
                <Edit2 className="mr-2 h-4 w-4" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleViewApplicants}
                className="cursor-pointer"
              >
                <Eye className="mr-2 h-4 w-4" /> Applicants
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];

const AdJobsTable: React.FC = () => {
  const { adminAllJobs } = useSelector((state: RootState) => state.job);
  const navigate = useNavigate();

  const data: AdminJobsTable[] = adminAllJobs
    ? adminAllJobs.map((job) => ({
        id: job._id || "",
        logo: job.company.logo || "",
        companyName: job.company.name || "",
        website: job.company.website || "",
        role: job.jobType || "",
        date: job.createdAt.split("T")[0] || "",
      }))
    : [];

  return (
    <div className="mt-4 rounded-xl border p-4 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Posted Job Directory</h2>
        <Button
          variant={"outline"}
          onClick={() => navigate("/admin/ad-jobs/post-job")}
          className="cursor-pointer"
        >
          <Plus /> Add New
        </Button>
      </div>
      <DynamicTable
        data={data}
        columns={columns}
        filterColumn="companyName"
        tableCaption="A list of your recent posted jobs"
        key={Math.floor(Math.random() * 687945349)}
      />
    </div>
  );
};

export default AdJobsTable;
