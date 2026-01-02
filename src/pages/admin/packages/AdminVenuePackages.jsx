import React, { useState } from "react";
import { useGetAdminVenuePackagesQuery, useUpdateVenuePackageStatusMutation } from "../../../store/api/adminApi";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/ui/table";
import { Badge } from "../../../components/ui/badge";
import { toast } from "sonner";
import { Loader2, Check, X, ExternalLink } from "lucide-react";
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

const AdminVenuePackages = ({ status }) => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [confirmDialog, setConfirmDialog] = useState({ open: false, id: null, approved: false });

  const { data, isLoading, isFetching } = useGetAdminVenuePackagesQuery({
    page,
    limit: 10,
    status: status, // "approved", "pending", or undefined
    search
  });

  const [updateStatus, { isLoading: isUpdating }] = useUpdateVenuePackageStatusMutation();

  const handleStatusChange = (id, approved) => {
    setConfirmDialog({ open: true, id, approved });
  };

  const confirmAction = async () => {
    const { id, approved } = confirmDialog;
    if (!id) return;

    try {
      await updateStatus({ id, approved, visibility: approved ? 'public' : 'private' }).unwrap();
      toast.success(approved ? "Package Approved" : "Package Rejected");
    } catch (error) {
      toast.error("Failed to update status");
    } finally {
      setConfirmDialog({ open: false, id: null, approved: false });
    }
  };

  const packages = data?.data?.packages || [];
  const total = data?.data?.total || 0;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold capitalize">{status || "All"} Venue Packages</h2>
        <Input 
          placeholder="Search by title..." 
          className="max-w-xs"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Image</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Vendor</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
               <TableRow>
                 <TableCell colSpan={8} className="text-center h-24">
                   <Loader2 className="animate-spin mx-auto" />
                 </TableCell>
               </TableRow>
            ) : packages.length === 0 ? (
               <TableRow>
                 <TableCell colSpan={8} className="text-center h-24 text-muted-foreground">
                   No packages found.
                 </TableCell>
               </TableRow>
            ) : (
              packages.map((pkg) => (
                <TableRow key={pkg._id}>
                  <TableCell>
                    <img src={pkg.featuredImage?.url} alt="" className="w-12 h-12 rounded object-cover" />
                  </TableCell>
                  <TableCell className="font-medium">
                    {pkg.title}
                    <div className="text-xs text-muted-foreground truncate max-w-[200px]">{pkg.slug}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{pkg.vendor?.vendorName}</div>
                    <div className="text-xs text-muted-foreground">{pkg.vendor?.phone}</div>
                  </TableCell>
                  <TableCell>{pkg.location?.city?.name}</TableCell>
                  <TableCell>{pkg.venueCategory?.name}</TableCell>
                  <TableCell>₹{pkg.startingPrice}</TableCell>
                  <TableCell>
                    <Badge variant={pkg.approved ? "success" : "secondary"} className={pkg.approved ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
                      {pkg.approved ? "Approved" : "Pending"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {!pkg.approved && (
                        <Button size="sm" onClick={() => handleStatusChange(pkg._id, true)} disabled={isUpdating} className="bg-green-600 hover:bg-green-700">
                          <Check className="w-4 h-4 mr-1" /> Approve
                        </Button>
                      )}
                      {pkg.approved && (
                        <Button size="sm" variant="destructive" onClick={() => handleStatusChange(pkg._id, false)} disabled={isUpdating}>
                          <X className="w-4 h-4 mr-1" /> Reject
                        </Button>
                      )}
                      <Button size="icon" variant="ghost" asChild>
                         <a href={`${import.meta.env.VITE_SITE_URL}/venue/${pkg.slug}`} target="_blank" rel="noreferrer">
                            <ExternalLink className="w-4 h-4" />
                         </a>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-between items-center">
         <div className="text-sm text-muted-foreground">
            Total: {total}
         </div>
         <div className="space-x-2">
            <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
            <Button variant="outline" size="sm" disabled={packages.length < 10} onClick={() => setPage(p => p + 1)}>Next</Button>
         </div>
      </div>

      <AlertDialog open={confirmDialog.open} onOpenChange={(open) => !open && setConfirmDialog(p => ({...p, open: false}))}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmDialog.approved ? "Approve Package?" : "Reject Package?"}</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDialog.approved 
                ? "This will make the package visible to the public on the website."
                : "This will hide the package from the public. You can approve it later."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmAction} className={confirmDialog.approved ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}>
              {confirmDialog.approved ? "Yes, Approve" : "Yes, Reject"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminVenuePackages;
