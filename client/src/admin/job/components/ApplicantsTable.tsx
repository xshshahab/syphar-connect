import { DynamicTable } from "@/components/dynamic-table/DynamicTable";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Job } from "@/redux/slice/applicationSlice";
import { APPLICATION_API_ENDPOINT } from "@/utils/constant";
import type { ColumnDef } from "@tanstack/react-table";
import axios from "axios";
import { Check, ChevronsUpDown, MoreHorizontal, X } from "lucide-react";
import type React from "react";
import { toast } from "sonner";

export type ApplicantsTable = {
  id: string;
  fullName: string;
  email: string;
  contact: string;
  resume: string;
  resumeName: string;
  date: string;
};

export interface ApplicantsTableProps {
  applicants: Job | null;
}

const statusHandler = async (status: string, id: string) => {
  try {
    const res = await axios.post(
      `${APPLICATION_API_ENDPOINT}/update-status/${id}`,
      { status },
      {
        withCredentials: true,
      }
    );

    if (res.data.success) {
      toast.success(res.data.message);
    }
  } catch (error: any) {
    console.error("ERROR! status handling: ", error);
    toast.error(error.response.data.message);
  }
};

export const columns: ColumnDef<ApplicantsTable>[] = [
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
    accessorKey: "fullName",
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="px-0 font-semibold "
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Full Name
        <span className="ml-1 opacity-50">
          <ChevronsUpDown />
        </span>
      </Button>
    ),
    cell: ({ row }) => (
      <div className="text-sm ">{row.getValue("fullName")}</div>
    ),
  },
  {
    accessorKey: "email",
    header: () => <div className="text-left font-semibold ">Email</div>,
    cell: ({ row }) => <div className="text-sm ">{row.getValue("email")}</div>,
  },
  {
    accessorKey: "contact",
    header: () => <div className="text-left font-semibold ">Contact</div>,
    cell: ({ row }) => (
      <div className="text-sm ">{row.getValue("contact")}</div>
    ),
  },
  {
    accessorKey: "resume",
    header: () => <div className="text-left font-semibold ">Resume</div>,
    cell: ({ row }) => {
      const url = row.original.resume;
      const name = row.original.resumeName;

      return (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-blue-600 hover:underline"
        >
          {name}
        </a>
      );
    },
  },
  {
    accessorKey: "date",
    header: () => <div className="text-left font-semibold ">Applied Date</div>,
    cell: ({ row }) => <div className="text-sm ">{row.getValue("date")}</div>,
  },
  {
    id: "actions",
    enableHiding: false,
    header: () => <div className="text-right font-semibold ">Actions</div>,
    cell: ({ row }) => {
      const id = row.original.id;
      const handleAccept = async () => {
        await statusHandler("ACCEPTED", id);
      };

      const handleReject = async () => {
        await statusHandler("REJECTED", id);
      };

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
                onClick={handleAccept}
                className="cursor-pointer"
              >
                <Check className="text-emerald-600 mr-2 h-4 w-4" /> Accepted
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleReject}
                className="cursor-pointer"
              >
                <X className="text-red-600 mr-2 h-4 w-4" /> Rejected
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];

const ApplicantsTable: React.FC<ApplicantsTableProps> = ({ applicants }) => {
  const data: ApplicantsTable[] | null = applicants
    ? applicants.applications.map((app) => ({
        id: app._id,
        fullName: app.applicant.fullName,
        email: app.applicant.email,
        contact: app.applicant.phoneNumber,
        resume: app.applicant.profile.resume,
        resumeName: app.applicant.profile.resumeOriginalName,
        date: app.applicant.createdAt.split("T")[0],
      }))
    : null;

  return (
    <>
      <DynamicTable
        data={data ?? []}
        columns={columns}
        filterColumn="fullName"
        tableCaption="A list of your recent applied users"
        key={Math.floor(
          Math.random() * (728734982 - (3287419238 / 897987979) * 22341323)
        )}
      />
    </>
  );
};

export default ApplicantsTable;
