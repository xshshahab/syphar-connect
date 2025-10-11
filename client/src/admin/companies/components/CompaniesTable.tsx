"use client";

import React from "react";
import { DynamicTable } from "@/components/dynamic-table/DynamicTable";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  Edit2,
  Trash2,
  Plus,
  ChevronsUpDown,
  ArrowUpRight,
} from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import { Link, useNavigate } from "react-router";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import { useDeleteCompanyById } from "@/hooks/useDeleteCompanyById";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export type CompanyTable = {
  id: string;
  logo: string | null;
  companyName: string;
  website: string;
  date: string;
};

export const columns: ColumnDef<CompanyTable>[] = [
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
          <Avatar className="siz-10">
            <AvatarImage src={logo || ""} alt={companyName} />
            <AvatarFallback>{companyName.charAt(0)}</AvatarFallback>
          </Avatar>
          <span className="font-medium">{companyName}</span>
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
    accessorKey: "date",
    header: () => <div className="text-left font-semibold ">Added On</div>,
    cell: ({ row }) => <div className="text-sm ">{row.getValue("date")}</div>,
  },
  {
    id: "actions",
    enableHiding: false,
    header: () => <div className="text-right font-semibold">Actions</div>,
    cell: ({ row }) => {
      const navigate = useNavigate();
      const id = row.original.id;
      const [open, setOpen] = React.useState(false);
      const deleteCompanyById = useDeleteCompanyById();

      const handleEdit = () => navigate(`/admin/companies/${id}`);
      const handleDelete = async () => {
        await deleteCompanyById(id);
        setOpen(false);
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
              <DropdownMenuItem onClick={handleEdit} className="cursor-pointer">
                <Edit2 className="mr-2 h-4 w-4" /> Edit
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => setOpen(true)}
                className="cursor-pointer text-red-500 focus:text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4 text-red-400" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Company</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete{" "}
                  <span className="font-semibold">
                    {row.original.companyName}
                  </span>
                  ? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setOpen(false)}>
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-red-500 hover:bg-red-600 text-white"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      );
    },
  },
];

const CompaniesTable: React.FC = () => {
  const navigate = useNavigate();

  const { allCompany } = useSelector((state: RootState) => state.company);

  const data: CompanyTable[] = allCompany
    ? allCompany.map((company) => ({
        id: company._id || "",
        logo: company.logo || "",
        companyName: company.name || "",
        website: company.website || "",
        date: company.createdAt.split("T")[0] || "",
      }))
    : [];

  const handleAddNew = () => {
    navigate("/admin/companies/register-company");
  };

  return (
    <div className="mt-4 rounded-xl border  p-4 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold ">Company Directory</h2>
        <Button
          onClick={handleAddNew}
          variant={"outline"}
          className="cursor-pointer"
        >
          <Plus /> Add New
        </Button>
      </div>
      <DynamicTable
        data={data}
        columns={columns}
        filterColumn="companyName"
        tableCaption="A list of your recent registered companies"
        key={Math.floor(
          Math.random() * (728734982 - (3287419238 / 897987979) * 22341323)
        )}
      />
    </div>
  );
};

export default CompaniesTable;
