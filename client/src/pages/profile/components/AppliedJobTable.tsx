import { type ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { DynamicTable } from "@/components/dynamic-table/DynamicTable";
import { Badge } from "@/components/ui/badge";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";

export type AppliedJobState = {
  id: string;
  date: string;
  jobRole: string;
  companyName: string;
  status: string;
};

export const columns: ColumnDef<AppliedJobState>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <div className="flex justify-center">
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex justify-center">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "date",
    header: () => <div className="text-left font-medium ">Date</div>,
    cell: ({ row }) => <div className="text-left ">{row.getValue("date")}</div>,
  },
  {
    accessorKey: "companyName",
    header: () => <div>Company Name</div>,
    cell: ({ row }) => <div className=" ">{row.getValue("companyName")}</div>,
  },
  {
    accessorKey: "jobRole",
    header: () => <div className="text-left font-medium ">Job Role</div>,
    cell: ({ row }) => (
      <div className="text-left capitalize ">{row.getValue("jobRole")}</div>
    ),
  },
  {
    accessorKey: "status",
    header: () => <div className="text-right font-medium">Status</div>,
    cell: ({ row }) => {
      const status = (row.getValue("status") as string)?.toUpperCase();

      let badgeClass = "";

      switch (status) {
        case "ACCEPTED":
          badgeClass = "bg-green-100 text-green-700";
          break;
        case "REJECTED":
          badgeClass = "bg-red-100 text-red-700";
          break;
        case "PENDING":
        default:
          badgeClass = "bg-yellow-100 text-yellow-700";
          break;
      }

      return (
        <div className="flex justify-end">
          <Badge className={`uppercase font-medium ${badgeClass}`}>
            {status}
          </Badge>
        </div>
      );
    },
  },
];

export function AppliedJobTable() {
  const { allAppliedJobs } = useSelector((state: RootState) => state.job);

  // an application can outlive its job if the job was deleted
  const data: AppliedJobState[] = allAppliedJobs
    .filter((appliedJob) => appliedJob.job)
    .map((appliedJob) => ({
      id: appliedJob._id,
      date: appliedJob.createdAt.split("T")[0],
      jobRole: appliedJob.job.title || appliedJob.job.jobType,
      companyName: appliedJob.job.company?.name ?? "",
      status: appliedJob.status,
    }));

  return (
    <div className="w-full p-4">
      <DynamicTable data={data} columns={columns} filterColumn="jobRole" />
    </div>
  );
}
