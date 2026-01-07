import React, { useState } from "react";
import { 
    useGetServiceSubCategoriesQuery, 
    useDeleteServiceSubCategoryMutation 
} from "../../../store/api/adminApi";
import ReusableTable from "../../../components/reusableTable";
import { Button } from "../../../components/ui/button";
import { Loader2, Plus, Pencil, Trash } from "lucide-react";
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
} from "../../../components/ui/alert-dialog";
import { Badge } from "../../../components/ui/badge";

const ServiceSubCategories = () => {
  const { data, isLoading } = useGetServiceSubCategoriesQuery();
  const [deleteCategory, { isLoading: isDeleting }] = useDeleteServiceSubCategoryMutation();
  const [deleteId, setDeleteId] = useState(null);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteCategory(deleteId).unwrap();
      toast.success("Sub Category deleted successfully");
    } catch (error) {
      toast.error("Failed to delete sub category");
    } finally {
      setDeleteId(null);
    }
  };

  const columns = [
    {
      accessorKey: "image",
      header: "Image",
      cell: ({ row }) => (
        <img 
            src={row.original.image?.url} 
            alt={row.original.name} 
            className="w-12 h-12 rounded object-cover" 
        />
      ),
    },
    {
      accessorKey: "name",
      header: "Name",
    },
    {
      accessorKey: "slug",
      header: "Slug",
    },
    {
      accessorKey: "serviceCategory",
      header: "Parent Category",
      cell: ({ row }) => (
        <Badge variant="outline">
            {row.original.serviceCategory?.name || "Unknown"}
        </Badge>
      )
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => <div className="truncate max-w-[200px]">{row.original.description || "-"}</div>
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex gap-2">
            <Button variant="outline" size="icon" asChild>
                <Link to={`/services/subcategories/edit/${row.original._id}`}>
                    <Pencil className="w-4 h-4" />
                </Link>
            </Button>
            <Button 
                variant="destructive" 
                size="icon" 
                onClick={() => setDeleteId(row.original._id)}
            >
                <Trash className="w-4 h-4" />
            </Button>
        </div>
      ),
    },
  ];

  if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Service Sub Categories</h1>
        <Button asChild>
          <Link to="/services/subcategories/add">
            <Plus className="mr-2 h-4 w-4" /> Add New
          </Link>
        </Button>
      </div>

      <ReusableTable columns={columns} data={data?.data || []} />

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the sub category.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700" disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ServiceSubCategories;
