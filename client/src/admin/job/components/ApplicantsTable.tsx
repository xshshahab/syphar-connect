import React, { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import {
  Check,
  ChevronsUpDown,
  Eye,
  MoreHorizontal,
  X,
} from "lucide-react";
import { DynamicTable } from "@/components/dynamic-table/DynamicTable";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Job } from "@/redux/slice/applicationSlice";
import StatusBadge from "@/shared/StatusBadge";
import { useUpdateApplicationStatus } from "@/hooks/useUpdateApplicationStatus";
import ApplicantDetailSheet from "./ApplicantDetailSheet";

type ApplicantRow = {
  id: string;
  fullName: string;
  email: string;
  contact: string;
  photo: string;
  resume: string;
  resumeName: string;
  date: string;
  status: string;
};

export interface ApplicantsTableProps {
  applicants: Job | null;
}

// clicks on controls inside a row must not also open the row's detail panel
const stop = (e: React.MouseEvent) => e.stopPropagation();

const ApplicantsTable: React.FC<ApplicantsTableProps> = ({ applicants }) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const updateStatus = useUpdateApplicationStatus();

  const data: ApplicantRow[] = (applicants?.applications ?? []).map((app) => ({
    id: app._id,
    fullName: app.applicant.fullName,
    email: app.applicant.email,
    contact: app.applicant.phoneNumber,
    photo: app.applicant.profile?.profilePhoto ?? "",
    resume: app.applicant.profile?.resume ?? "",
    resumeName: app.applicant.profile?.resumeOriginalName ?? "",
    // when they applied, not when their account was created
    date: app.createdAt.split("T")[0],
    status: app.status,
  }));

  // looked up by id so the panel always shows the latest status
  const selected =
    applicants?.applications.find((app) => app._id === selectedId) ?? null;

  const columns = useMemo<ColumnDef<ApplicantRow>[]>(
    () => [
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
          <div onClick={stop}>
            <Checkbox
              checked={row.getIsSelected()}
              onCheckedChange={(value) => row.toggleSelected(!!value)}
              aria-label="Select row"
            />
          </div>
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
            className="px-0 font-semibold"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Applicant
            <span className="ml-1 opacity-50">
              <ChevronsUpDown />
            </span>
          </Button>
        ),
        cell: ({ row }) => {
          const { fullName, email, photo } = row.original;
          return (
            <div className="flex items-center gap-3">
              <Avatar className="size-9">
                <AvatarImage src={photo} />
                <AvatarFallback>
                  {fullName.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate font-medium">{fullName}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {email}
                </p>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "contact",
        header: () => <div className="text-left font-semibold">Contact</div>,
        cell: ({ row }) => (
          <div className="text-sm">{row.getValue("contact")}</div>
        ),
      },
      {
        accessorKey: "resume",
        header: () => <div className="text-left font-semibold">Resume</div>,
        cell: ({ row }) => {
          const { resume, resumeName } = row.original;
          return resume ? (
            <a
              href={resume}
              target="_blank"
              rel="noopener noreferrer"
              onClick={stop}
              className="text-sm text-blue-600 hover:underline dark:text-blue-400"
            >
              {resumeName || "View resume"}
            </a>
          ) : (
            <span className="text-sm text-muted-foreground">—</span>
          );
        },
      },
      {
        accessorKey: "date",
        header: () => <div className="text-left font-semibold">Applied on</div>,
        cell: ({ row }) => <div className="text-sm">{row.getValue("date")}</div>,
      },
      {
        accessorKey: "status",
        header: () => <div className="text-left font-semibold">Status</div>,
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        id: "actions",
        enableHiding: false,
        header: () => <div className="text-right font-semibold">Actions</div>,
        cell: ({ row }) => {
          const { id } = row.original;
          return (
            <div className="flex justify-end" onClick={stop}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="h-8 w-8 p-0"
                    aria-label="Row actions"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => setSelectedId(id)}
                    className="cursor-pointer"
                  >
                    <Eye className="mr-2 h-4 w-4" /> View details
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => updateStatus(id, "ACCEPTED")}
                    className="cursor-pointer"
                  >
                    <Check className="mr-2 h-4 w-4 text-emerald-600" /> Accept
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => updateStatus(id, "REJECTED")}
                    className="cursor-pointer"
                  >
                    <X className="mr-2 h-4 w-4 text-red-600" /> Reject
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return (
    <>
      <DynamicTable
        data={data}
        columns={columns}
        filterColumn="fullName"
        tableCaption="Click a row to see the full application"
        onRowClick={(row) => setSelectedId(row.id)}
      />
      <ApplicantDetailSheet
        application={selected}
        jobTitle={applicants?.title}
        onClose={() => setSelectedId(null)}
      />
    </>
  );
};

export default ApplicantsTable;
