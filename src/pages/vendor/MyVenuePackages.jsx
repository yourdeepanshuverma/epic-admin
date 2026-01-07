import React, { useState } from "react";
import { useGetVenuePackagesQuery, useDeleteVenuePackageMutation, useUpdateVenueStatusMutation } from "../../store/api/vendorApi";
import ReusableTable from "../../components/reusableTable";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { IconEdit, IconTrash } from "@tabler/icons-react";
import { Link } from "react-router";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";

const MyVenuePackages = () => {
  const { data, isLoading } = useGetVenuePackagesQuery();
  const [deletePackage, { isLoading: isDeleting }] = useDeleteVenuePackageMutation();
  const [updateStatus] = useUpdateVenueStatusMutation();
  
  const [packageToDelete, setPackageToDelete] = useState(null);

  const handleDelete = async () => {
    if (!packageToDelete) return;
    try {
      await deletePackage(packageToDelete).unwrap();
      toast.success("Package deleted successfully");
      setPackageToDelete(null);
    } catch (error) {
      toast.error(error?.data?.message || "Failed to delete package");
    }
  };

  const handleVisibilityChange = async (id, newVisibility) => {
    try {
        await updateStatus({ id, visibility: newVisibility }).unwrap();
        toast.success(`Visibility updated to ${newVisibility}`);
    } catch (error) {
        toast.error("Failed to update visibility");
    }
  };
  
  const columns = [
    {
      accessorKey: "featuredImage",
      header: "Image",
      cell: ({ row }) => (
        <img 
          src={row.original.featuredImage?.url} 
          alt={row.original.title} 
          className="w-12 h-12 object-cover rounded"
        />
      ),
    },
    {
      accessorKey: "title",
      header: "Title",
    },
    {
      accessorKey: "venueCategory",
      header: "Category",
      cell: ({ row }) => <Badge variant="outline">{row.original.venueCategory?.name}</Badge>,
    },
    {
      accessorKey: "startingPrice",
      header: "Starting Price",
      cell: ({ row }) => `₹${row.original.startingPrice}`,
    },
    {
      accessorKey: "approved",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={row.original.approved ? "success" : "warning"}>
          {row.original.approved ? "Approved" : "Pending"}
        </Badge>
      ),
    },
    {
      accessorKey: "visibility",
      header: "Visibility",
      cell: ({ row }) => (
        <Select 
            defaultValue={row.original.visibility} 
            onValueChange={(val) => handleVisibilityChange(row.original._id, val)}
        >
            <SelectTrigger className="w-[100px] h-8 text-xs">
                <SelectValue />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="public">Public</SelectItem>
                <SelectItem value="private">Private</SelectItem>
            </SelectContent>
        </Select>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link to={`/my-packages/venues/edit/${row.original._id}`}>
              <IconEdit className="size-4" />
            </Link>
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-destructive hover:bg-destructive/10"
            onClick={() => setPackageToDelete(row.original._id)}
          >
            <IconTrash className="size-4" />
          </Button>
        </div>
      ),
    },
  ];

  if (isLoading) return <div>Loading Packages...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">My Venue Packages</h2>
        <Button asChild>
          <Link to="/my-packages/add">Add New Package</Link>
        </Button>
      </div>

      <ReusableTable 
        columns={columns} 
        data={data?.data?.packages || []} 
      />

      <AlertDialog open={!!packageToDelete} onOpenChange={(open) => !open && setPackageToDelete(null)}>
        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle>Remove this Package?</AlertDialogTitle>
            <AlertDialogDescription>
                This will permanently delete the venue package from your listings. This action cannot be reversed.
            </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
            <AlertDialogCancel>Go Back</AlertDialogCancel>
            <AlertDialogAction 
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                disabled={isDeleting}
            >
                {isDeleting ? "Removing..." : "Yes, Remove"}
            </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MyVenuePackages;
