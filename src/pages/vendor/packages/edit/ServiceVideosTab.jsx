import React, { useState } from "react";
import { useAddServiceVideoMutation, useDeleteServiceVideoMutation } from "../../../../store/api/vendorApi";
import { toast } from "sonner";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";
import { IconPlus, IconTrash, IconBrandYoutube } from "@tabler/icons-react";
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

const ServiceVideosTab = ({ pkg }) => {
  const [addVideo, { isLoading: isAdding }] = useAddServiceVideoMutation();
  const [deleteVideo, { isLoading: isDeleting }] = useDeleteServiceVideoMutation();
  
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleAddVideo = async (e) => {
    e.preventDefault();
    if (!url) {
      toast.error("Video URL is required");
      return;
    }

    try {
      await addVideo({ id: pkg._id, data: { title, url } }).unwrap();
      toast.success("Video added successfully!");
      setIsDialogOpen(false);
      setTitle("");
      setUrl("");
    } catch (error) {
      toast.error(error?.data?.message || "Failed to add video");
    }
  };

  const handleDeleteVideo = async (index) => {
    try {
      await deleteVideo({ id: pkg._id, index }).unwrap();
      toast.success("Video deleted successfully");
    } catch (error) {
        toast.error(error?.data?.message || "Failed to delete video");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Videos</h3>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <IconPlus className="mr-2 size-4" /> Add New Video
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Video</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddVideo} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Video Title (Optional)</Label>
                <Input 
                  placeholder="e.g. Service Demo" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Video URL (YouTube/Vimeo)</Label>
                <Input 
                  placeholder="https://youtube.com/..." 
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isAdding}>
                {isAdding ? "Adding..." : "Add Video"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {pkg?.videos?.length === 0 ? (
        <div className="text-center py-10 border-2 border-dashed rounded-xl text-muted-foreground">
          No videos added yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {pkg?.videos?.map((video, index) => (
            <div key={index} className="border rounded-xl p-4 flex justify-between items-start bg-card">
              <div className="flex gap-4 items-center">
                  <div className="w-12 h-12 rounded bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                      <IconBrandYoutube size={28} />
                  </div>
                  <div>
                    <h4 className="font-semibold truncate max-w-[200px]">{video.title || "Untitled Video"}</h4>
                    <a href={video.url} target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:underline truncate block max-w-[200px]">
                        {video.url}
                    </a>
                  </div>
              </div>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10">
                        <IconTrash className="size-4" />
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Remove Video?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This video will be permanently removed from your gallery.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Go Back</AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={() => handleDeleteVideo(index)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Yes, Remove
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ServiceVideosTab;
