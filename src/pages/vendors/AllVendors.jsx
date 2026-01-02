import React from "react";
import { useGetVendorsQuery } from "../../store/api/vendorApi";
import { DataTable } from "../../components/data-table"; // Adjust path if necessary, previously was @/components
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { IconCircleCheck, IconCircleX, IconClock } from "@tabler/icons-react";

const AllVendors = () => {
  const { data: vendorsData, isLoading, isError } = useGetVendorsQuery();

  const columns = [
    {
      accessorKey: "vendorName",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Vendor Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "phone",
      header: "Phone",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status");
        let color = "bg-gray-500";
        let icon = <IconClock size={14} />;
        
        if (status === "active") {
            color = "bg-green-500";
            icon = <IconCircleCheck size={14} />;
        } else if (status === "rejected" || status === "blocked") {
            color = "bg-red-500";
            icon = <IconCircleX size={14} />;
        } else if (status === "pending") {
            color = "bg-yellow-500";
        }

        return (
          <Badge className={`${color} text-white hover:${color} flex items-center gap-1 w-fit capitalize`}>
            {icon} {status}
          </Badge>
        );
      },
    },
    {
      accessorKey: "leadCredits",
      header: "Lead Credits",
      cell: ({ row }) => {
        const credits = row.original.leadCredits || 0;
        return (
          <Badge variant="outline" className="font-bold border-primary/20 text-primary">
             {credits.toLocaleString()} Credits
          </Badge>
        );
      },
    },
    {
      accessorKey: "wallet.balance",
      header: "Wallet",
      cell: ({ row }) => {
        const balance = row.original.wallet?.balance || 0;
        return <span className="font-bold text-green-700">₹{balance.toLocaleString()}</span>;
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const vendor = row.original;
 
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(vendor._id)}
              >
                Copy Vendor ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>View Profile</DropdownMenuItem>
              <DropdownMenuItem>View Packages</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  if (isLoading) return <div className="p-8">Loading vendors...</div>;
  if (isError) return <div className="p-8 text-red-500">Error loading vendors.</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-black tracking-tight uppercase">All Vendors</h1>
        <Button>Add New Vendor</Button>
      </div>
      
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <DataTable columns={columns} data={vendorsData?.data || []} />
      </div>
    </div>
  );
};

export default AllVendors;