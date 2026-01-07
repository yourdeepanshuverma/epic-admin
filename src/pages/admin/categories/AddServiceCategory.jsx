import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import { 
    useCreateServiceCategoryMutation, 
    useGetServiceCategoriesQuery, 
    useUpdateServiceCategoryMutation 
} from "../../../store/api/adminApi";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Textarea } from "../../../components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../components/ui/card";
import { Loader2, ArrowLeft, ImagePlus, X } from "lucide-react";

const AddServiceCategory = () => {
  const { id } = useParams();
  const isEditMode = !!id;
  const navigate = useNavigate();
  
  const { data: categoriesData, isLoading: isFetching } = useGetServiceCategoriesQuery(undefined, {
    skip: !isEditMode
  });

  const categoryToEdit = isEditMode ? categoriesData?.data?.find(c => c._id === id) : null;

  const [createCategory, { isLoading: isCreating }] = useCreateServiceCategoryMutation();
  const [updateCategory, { isLoading: isUpdating }] = useUpdateServiceCategoryMutation();

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    if (isEditMode && categoryToEdit) {
      setValue("name", categoryToEdit.name);
      setValue("description", categoryToEdit.description);
      setImagePreview(categoryToEdit.image?.url);
    }
  }, [isEditMode, categoryToEdit, setValue]);

  const onImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImagePreview(URL.createObjectURL(file));
      setValue("image", file);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    setValue("image", null);
  };

  const onSubmit = async (data) => {
    const formData = new FormData();
    formData.append("name", data.name);
    if (data.description) formData.append("description", data.description);
    
    if (data.image instanceof File) {
        formData.append("image", data.image);
    }

    try {
      if (isEditMode) {
        await updateCategory({ id, data: formData }).unwrap();
        toast.success("Category updated successfully");
      } else {
        if (!data.image) {
            toast.error("Image is required");
            return;
        }
        await createCategory(formData).unwrap();
        toast.success("Category created successfully");
      }
      navigate("/services/categories");
    } catch (error) {
      console.error(error);
      toast.error(error?.data?.message || "Something went wrong");
    }
  };

  if (isEditMode && isFetching) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="space-y-6">
       {/* Header */}
       <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate("/services/categories")}>
             <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
             <h1 className="text-2xl font-bold tracking-tight">{isEditMode ? "Edit Service Category" : "Create Service Category"}</h1>
             <p className="text-muted-foreground">Manage main service categories (e.g., Photography, Catering).</p>
          </div>
       </div>

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {/* Left Column */}
         <div className="md:col-span-2">
            <Card>
                <CardHeader>
                    <CardTitle>Category Details</CardTitle>
                    <CardDescription>General information.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input 
                            id="name" 
                            {...register("name", { required: "Name is required" })} 
                            placeholder="e.g. Photography"
                            className="text-lg font-medium"
                        />
                        {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea 
                            id="description" 
                            {...register("description")} 
                            placeholder="Short description..."
                            className="min-h-[120px]"
                        />
                    </div>
                </CardContent>
            </Card>
         </div>

         {/* Right Column */}
         <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Category Image</CardTitle>
                    <CardDescription>Upload cover image.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center gap-4">
                        <div className="relative w-full aspect-square rounded-lg overflow-hidden">
                            {imagePreview ? (
                                <div className="relative w-full h-full">
                                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                    <Button 
                                        type="button" 
                                        variant="destructive" 
                                        size="icon" 
                                        className="absolute top-2 right-2 h-8 w-8 rounded-full z-10"
                                        onClick={removeImage}
                                    >
                                        <X className="w-4 h-4" />
                                    </Button>
                                </div>
                            ) : (
                                <Label 
                                    htmlFor="image" 
                                    className="border-2 border-dashed border-muted-foreground/25 bg-muted/50 hover:bg-muted/80 flex flex-col items-center justify-center w-full h-full cursor-pointer transition-colors"
                                >
                                    <div className="text-center p-4">
                                        <ImagePlus className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                                        <span className="text-sm text-muted-foreground">Click to upload</span>
                                    </div>
                                </Label>
                            )}
                            <input 
                                id="image" 
                                type="file" 
                                accept="image/*"
                                className="hidden"
                                onChange={onImageChange}
                            />
                        </div>
                        {imagePreview && (
                            <Label htmlFor="image" className="text-xs text-primary hover:underline cursor-pointer font-medium">
                                Change Image
                            </Label>
                        )}
                    </div>
                </CardContent>
            </Card>

            <div className="flex flex-col gap-3">
                <Button type="submit" size="lg" className="w-full" disabled={isCreating || isUpdating}>
                    {(isCreating || isUpdating) && <Loader2 className="animate-spin mr-2 h-4 w-4" />}
                    {isEditMode ? "Save Changes" : "Create Category"}
                </Button>
                <Button type="button" variant="outline" size="lg" className="w-full" onClick={() => navigate("/services/categories")}>
                    Cancel
                </Button>
            </div>
         </div>
      </form>
    </div>
  );
};

export default AddServiceCategory;