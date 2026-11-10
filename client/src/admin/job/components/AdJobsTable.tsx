import React from "react";
import { Button } from "@/components/ui/button";
import {
  ChevronsUpDown,
  Edit2,
  Eye,
  MoreHorizontal,
  Plus,
  Users,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link, useNavigate } from "react-router";
import { DynamicTable } from "@/components/dynamic-table/DynamicTable";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";

export type AdminJobsTable = {
  id: string;
  companyId: string;
  logo: string;
  title: string;
  companyName: string;
  role: string;
  applicants: number;
  date: string;
};

const ActionsCell: React.FC<{ job: AdminJobsTable }> = ({ job }) => {
  const navigate = useNavigate();

  return (
    <div className="flex justify-end">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={() => navigate(`/admin/ad-jobs/${job.id}/applicants`)}
            className="cursor-pointer"
          >
            <Eye className="mr-2 h-4 w-4" /> View applicants
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => navigate(`/admin/companies/${job.companyId}`)}
            className="cursor-pointer"
          >
            <Edit2 className="mr-2 h-4 w-4" /> Edit company
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
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
    accessorKey: "title",
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="px-0 font-semibold "
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Job
        <span className="ml-1 opacity-50">
          <ChevronsUpDown />
        </span>
      </Button>
    ),
    cell: ({ row }) => {
      const { logo, companyName, title } = row.original;
      return (
        <div className="flex items-center gap-3">
          <Avatar className="size-9 rounded-lg">
            <AvatarImage src={logo || ""} alt={companyName} />
            <AvatarFallback className="rounded-lg">
              {companyName.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate font-medium">{title}</p>
            <p className="truncate text-xs text-muted-foreground">
              {companyName}
            </p>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "role",
    header: () => <div className="text-left font-semibold ">Type</div>,
    cell: ({ row }) => <div className="text-sm ">{row.getValue("role")}</div>,
  },
  {
    accessorKey: "applicants",
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="px-0 font-semibold "
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Applicants
        <span className="ml-1 opacity-50">
          <ChevronsUpDown />
        </span>
      </Button>
    ),
    cell: ({ row }) => {
      const count = row.original.applicants;
      return (
        <Link to={`/admin/ad-jobs/${row.original.id}/applicants`}>
          <Badge variant={count > 0 ? "default" : "secondary"}>
            <Users className="size-3" />
            {count}
          </Badge>
        </Link>
      );
    },
  },
  {
    accessorKey: "date",
    header: () => <div className="text-left font-semibold ">Posted On</div>,
    cell: ({ row }) => <div className="text-sm ">{row.getValue("date")}</div>,
  },
  {
    id: "actions",
    enableHiding: false,
    header: () => <div className="text-right font-semibold ">Actions</div>,
    cell: ({ row }) => <ActionsCell job={row.original} />,
  },
];

const AdJobsTable: React.FC = () => {
  const { adminAllJobs } = useSelector((state: RootState) => state.job);
  const navigate = useNavigate();

  const data: AdminJobsTable[] = adminAllJobs
    ? adminAllJobs.map((job) => ({
        id: job._id || "",
        companyId: job.company?._id || "",
        logo: job.company?.logo || "",
        title: job.title || "",
        companyName: job.company?.name || "",
        role: job.jobType || "",
        applicants: job.applications?.length ?? 0,
        date: job.createdAt.split("T")[0] || "",
      }))
    : [];

  return (
    <div className="mt-4 rounded-xl border p-4 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Your Posted Jobs</h2>
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
        filterColumn="title"
        tableCaption="Your posted jobs and how many people applied"
        key={Math.floor(Math.random() * 687945349)}
      />
    </div>
  );
};

export default AdJobsTable;
