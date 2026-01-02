import React, { useState } from "react";
import { 
    useAddVenueAlbumMutation, 
    useDeleteVenueAlbumMutation,
    useAddVenueAlbumPhotosMutation,
    useDeleteVenueAlbumPhotoMutation,
    useUpdateVenueAlbumTitleMutation
} from "../../../../store/api/vendorApi";
import { toast } from "sonner";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";
import { IconPlus, IconTrash, IconPhoto } from "@tabler/icons-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../../../components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
  } from "../../../../components/ui/alert-dialog";

const VenuePhotosTab = ({ pkg }) => {
  const [addAlbum, { isLoading: isAdding }] = useAddVenueAlbumMutation();
  const [deleteAlbum] = useDeleteVenueAlbumMutation();
  
  // Manage Album Mutations
  const [addPhotos, { isLoading: isAddingPhotos }] = useAddVenueAlbumPhotosMutation();
  const [deletePhoto] = useDeleteVenueAlbumPhotoMutation();
  const [updateTitle] = useUpdateVenueAlbumTitleMutation();

  const [newAlbumTitle, setNewAlbumTitle] = useState("");
  const [selectedPhotos, setSelectedPhotos] = useState(null);
  const [selectedPhotoPreviews, setSelectedPhotosPreviews] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Manage Album State
  const [managingAlbumIndex, setManagingAlbumIndex] = useState(null);
  const [manageTitle, setManageTitle] = useState("");
  const [morePhotos, setMorePhotos] = useState(null);
  const [morePhotoPreviews, setMorePhotosPreviews] = useState([]);

  const handlePhotoSelection = (e, type) => {
    const files = Array.from(e.target.files);
    const previews = files.map(file => URL.createObjectURL(file));
    
    if (type === 'new') {
        setSelectedPhotos(e.target.files);
        setSelectedPhotosPreviews(previews);
    } else {
        setMorePhotos(e.target.files);
        setMorePhotosPreviews(previews);
    }
  };

  const handleAddAlbum = async (e) => {
    e.preventDefault();
    if (!selectedPhotos || selectedPhotos.length === 0) {
      toast.error("Please select at least one photo");
      return;
    }

    const formData = new FormData();
    formData.append(`albums[0][title]`, newAlbumTitle || "New Album");
    for (let i = 0; i < selectedPhotos.length; i++) {
      formData.append(`albums[0][photos]`, selectedPhotos[i]);
    }

    try {
      await addAlbum({ id: pkg._id, data: formData }).unwrap();
      toast.success("Album added successfully!");
      setIsDialogOpen(false);
      setNewAlbumTitle("");
      setSelectedPhotos(null);
      setSelectedPhotosPreviews([]);
    } catch (error) {
      toast.error(error?.data?.message || "Failed to add album");
    }
  };

  const handleDeleteAlbum = async (index) => {
    try {
      await deleteAlbum({ id: pkg._id, index }).unwrap();
      toast.success("Album deleted successfully");
    } catch (error) {
        toast.error(error?.data?.message || "Failed to delete album");
    }
  };

  // --- Manage Album Functions ---
  const openManageModal = (index) => {
      setManagingAlbumIndex(index);
      setManageTitle(pkg.photoAlbums[index].title);
      setMorePhotos(null);
      setMorePhotosPreviews([]);
  };

  const handleUpdateTitle = async () => {
      if(!manageTitle.trim()) return;
      try {
          await updateTitle({ id: pkg._id, index: managingAlbumIndex, title: manageTitle }).unwrap();
          toast.success("Album title updated");
      } catch (error) {
          toast.error("Failed to update title");
      }
  };

  const handleAddMorePhotos = async () => {
      if (!morePhotos || morePhotos.length === 0) return;
      
      const formData = new FormData();
      for (let i = 0; i < morePhotos.length; i++) {
          formData.append("photos", morePhotos[i]);
      }

      try {
          await addPhotos({ id: pkg._id, index: managingAlbumIndex, data: formData }).unwrap();
          toast.success("Photos added successfully");
          setMorePhotos(null);
          setMorePhotosPreviews([]);
      } catch (error) {
          toast.error("Failed to add photos");
      }
  };

  const handleDeletePhoto = async (photoIndex) => {
      if(!window.confirm("Remove this photo? This will delete it permanently.")) return;
      try {
          await deletePhoto({ id: pkg._id, albumIndex: managingAlbumIndex, photoIndex }).unwrap();
          toast.success("Photo deleted");
      } catch (error) {
          toast.error("Failed to delete photo");
      }
  };

  const currentAlbum = managingAlbumIndex !== null ? pkg?.photoAlbums[managingAlbumIndex] : null;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Photo Albums</h3>
        
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if(!open) setSelectedPhotosPreviews([]); }}>
          <DialogTrigger asChild>
            <Button>
              <IconPlus className="mr-2 size-4" /> Add New Album
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Album</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddAlbum} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Album Title</Label>
                <Input 
                  placeholder="e.g. Wedding Reception" 
                  value={newAlbumTitle}
                  onChange={(e) => setNewAlbumTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Select Photos</Label>
                <Input 
                  type="file" 
                  multiple 
                  accept="image/*"
                  onChange={(e) => handlePhotoSelection(e, 'new')}
                  required
                />
                
                {selectedPhotoPreviews.length > 0 && (
                    <div className="grid grid-cols-4 gap-2 mt-4">
                        {selectedPhotoPreviews.map((preview, i) => (
                            <img key={i} src={preview} className="w-full aspect-square object-cover rounded-md border" alt="" />
                        ))}
                    </div>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={isAdding}>
                {isAdding ? "Uploading..." : "Create Album"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {pkg?.photoAlbums?.length === 0 ? (
        <div className="text-center py-10 border-2 border-dashed rounded-xl text-muted-foreground">
          No albums added yet. Click "Add New Album" to get started.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pkg?.photoAlbums?.map((album, index) => (
            <div key={index} className="border rounded-xl overflow-hidden shadow-sm group">
              <div className="relative h-48 bg-muted">
                {album.thumbnail ? (
                  <img 
                    src={album.thumbnail.url} 
                    alt={album.title} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    <IconPhoto size={32} />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                   <Button variant="secondary" size="sm" onClick={() => openManageModal(index)}>Manage Photos</Button>
                </div>
              </div>
              <div className="p-4 flex justify-between items-center bg-card">
                <div>
                  <h4 className="font-semibold truncate max-w-[150px]">{album.title || `Album ${index + 1}`}</h4>
                  <p className="text-xs text-muted-foreground">{album.images?.length || 0} Photos</p>
                </div>
                
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10">
                            <IconTrash className="size-4" />
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Remove this Album?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This will permanently remove the album <strong>"{album.title}"</strong> and all its photos. This action cannot be undone.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Go Back</AlertDialogCancel>
                            <AlertDialogAction 
                                onClick={() => handleDeleteAlbum(index)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                                Yes, Remove
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MANAGE ALBUM MODAL */}
      <Dialog open={managingAlbumIndex !== null} onOpenChange={(open) => { if(!open) { setManagingAlbumIndex(null); setMorePhotosPreviews([]); } }}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
                <DialogTitle>Manage Album: {currentAlbum?.title}</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6 mt-4">
                {/* Update Title */}
                <div className="flex gap-2 items-end">
                    <div className="flex-1 space-y-2">
                        <Label>Album Title</Label>
                        <Input 
                            value={manageTitle} 
                            onChange={(e) => setManageTitle(e.target.value)} 
                        />
                    </div>
                    <Button onClick={handleUpdateTitle} disabled={!manageTitle || manageTitle === currentAlbum?.title}>Update</Button>
                </div>

                {/* Add More Photos */}
                <div className="space-y-2 p-4 bg-muted/30 rounded-lg border border-dashed">
                    <Label>Add More Photos</Label>
                    <div className="space-y-4">
                        <div className="flex gap-2">
                            <Input 
                                type="file" 
                                multiple 
                                accept="image/*"
                                onChange={(e) => handlePhotoSelection(e, 'more')}
                            />
                            <Button onClick={handleAddMorePhotos} disabled={isAddingPhotos || !morePhotos}>
                                {isAddingPhotos ? "Uploading..." : "Upload"}
                            </Button>
                        </div>
                        
                        {morePhotoPreviews.length > 0 && (
                            <div className="grid grid-cols-6 gap-2">
                                {morePhotoPreviews.map((preview, i) => (
                                    <img key={i} src={preview} className="w-full aspect-square object-cover rounded-md border" alt="" />
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Photos Grid */}
                <div className="space-y-2">
                    <Label>Existing Photos ({currentAlbum?.images?.length})</Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {currentAlbum?.images?.map((img, i) => (
                            <div key={img.public_id} className="relative group aspect-square rounded-lg overflow-hidden border">
                                <img src={img.url} className="w-full h-full object-cover" alt="" />
                                <button 
                                    onClick={() => handleDeletePhoto(i)}
                                    className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                                >
                                    <IconTrash className="size-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VenuePhotosTab;