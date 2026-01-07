import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import { 
    useCreateServiceSubCategoryMutation, 
    useGetServiceSubCategoriesQuery, 
    useUpdateServiceSubCategoryMutation,
    useGetServiceCategoriesQuery,
    useGetAllServicesQuery
} from "../../../store/api/adminApi";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Textarea } from "../../../components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../components/ui/card";
import { Loader2, ArrowLeft, ImagePlus, X } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "../../../components/ui/select";
import SelectMulti from "react-select"; 
import { AddServiceDialog } from "../../../components/AddServiceDialog";

const AddServiceSubCategory = () => {
  const { id } = useParams();
  const isEditMode = !!id;
  const navigate = useNavigate();
  
  // Fetch existing subcategories to find the one to edit
  const { data: subCategoriesData, isLoading: isFetching } = useGetServiceSubCategoriesQuery(undefined, {
    skip: !isEditMode
  });

  // Fetch Parent Categories for dropdown
  const { data: parentCategories, isLoading: isCategoriesLoading } = useGetServiceCategoriesQuery();

  // Fetch Services
  const { data: servicesData, isLoading: isServicesLoading } = useGetAllServicesQuery();

  const subCategoryToEdit = isEditMode ? subCategoriesData?.data?.find(c => c._id === id) : null;

  const [createSubCategory, { isLoading: isCreating }] = useCreateServiceSubCategoryMutation();
  const [updateSubCategory, { isLoading: isUpdating }] = useUpdateServiceSubCategoryMutation();

  const { register, handleSubmit, control, setValue, formState: { errors } } = useForm();
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    if (isEditMode && subCategoryToEdit) {
      setValue("name", subCategoryToEdit.name);
      setValue("description", subCategoryToEdit.description);
      // Handle parent category ID
      const parentId = typeof subCategoryToEdit.serviceCategory === 'object' 
        ? subCategoryToEdit.serviceCategory._id 
        : subCategoryToEdit.serviceCategory;
      setValue("serviceCategory", parentId);
      
      setImagePreview(subCategoryToEdit.image?.url);

      // Populate Services
      if (subCategoryToEdit.services) {
         const selectedServices = subCategoryToEdit.services.map(s => ({
            value: s._id,
            label: s.name
         }));
         setValue("services", selectedServices);
      }
    }
  }, [isEditMode, subCategoryToEdit, setValue]);

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
    formData.append("serviceCategory", data.serviceCategory);
    if (data.description) formData.append("description", data.description);
    
    // Handle Services
    if (data.services) {
        data.services.forEach(s => {
            formData.append("services[]", s.value); 
        });
    }

    if (data.image instanceof File) {
        formData.append("image", data.image);
    }

    try {
      if (isEditMode) {
        await updateSubCategory({ id, data: formData }).unwrap();
        toast.success("Sub Category updated successfully");
      } else {
        if (!data.image) {
            toast.error("Image is required");
            return;
        }
        await createSubCategory(formData).unwrap();
        toast.success("Sub Category created successfully");
      }
      navigate("/services/subcategories");
    } catch (error) {
      console.error(error);
      toast.error(error?.data?.message || "Something went wrong");
    }
  };

  if ((isEditMode && isFetching) || isCategoriesLoading || isServicesLoading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;

  const serviceOptions = servicesData?.data?.map(s => ({
      value: s._id,
      label: s.name
  })) || [];

  return (
    <div className="space-y-6">
       {/* Header */}
       <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate("/services/subcategories")}>
             <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
             <h1 className="text-2xl font-bold tracking-tight">{isEditMode ? "Edit Sub Category" : "Create Sub Category"}</h1>
             <p className="text-muted-foreground">Define specific service types within a main category.</p>
          </div>
       </div>

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Column */}
        <div className="md:col-span-2 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Details</CardTitle>
                    <CardDescription>Basic information and parent categorization.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="serviceCategory">Parent Category</Label>
                        <Controller
                            name="serviceCategory"
                            control={control}
                            rules={{ required: "Parent Category is required" }}
                            render={({ field }) => (
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <SelectTrigger className="h-12 text-base">
                                        <SelectValue placeholder="Select Parent Category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {parentCategories?.data?.map((cat) => (
                                            <SelectItem key={cat._id} value={cat._id}>
                                                {cat.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.serviceCategory && <p className="text-red-500 text-sm">{errors.serviceCategory.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="name">Sub Category Name</Label>
                        <Input 
                            id="name" 
                            {...register("name", { required: "Name is required" })} 
                            placeholder="e.g. Candid Photography, Traditional Video"
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
                            className="min-h-[100px]"
                        />
                    </div>
                </CardContent>
            </Card>

             <Card>
                <CardHeader className="flex flex-col gap-2 pb-2">
                    <div>
                        <CardTitle>Service Fields</CardTitle>
                        <CardDescription>Select data fields required from vendors.</CardDescription>
                    </div>
                    <div className="w-full sm:w-auto">
                        <AddServiceDialog />
                    </div>
                </CardHeader>
                <CardContent>
                   <div className="space-y-2 pt-4">
                        <Controller
                            name="services"
                            control={control}
                            render={({ field }) => (
                            <SelectMulti
                                {...field}
                                options={serviceOptions}
                                isMulti
                                className="react-select-container"
                                classNamePrefix="react-select"
                                placeholder="Search and select fields..."
                                styles={{
                                    control: (base) => ({
                                        ...base,
                                        borderColor: "hsl(var(--input))",
                                        borderRadius: "var(--radius)",
                                        minHeight: "44px",
                                        backgroundColor: "hsl(var(--background))",
                                        color: "hsl(var(--foreground))",
                                    }),
                                    multiValue: (base) => ({
                                        ...base,
                                        backgroundColor: "hsl(var(--secondary))",
                                        borderRadius: "4px",
                                    }),
                                    multiValueLabel: (base) => ({
                                        ...base,
                                        color: "hsl(var(--secondary-foreground))",
                                    }),
                                }}
                            />
                            )}
                        />
                        <p className="text-xs text-muted-foreground mt-2">
                            Vendors offering this service type will be asked to provide these details.
                        </p>
                   </div>
                </CardContent>
            </Card>
        </div>

        {/* Right Column - Media */}
        <div className="space-y-6">
             <Card>
                <CardHeader>
                    <CardTitle>Image</CardTitle>
                    <CardDescription>Representative image.</CardDescription>
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
                    {isEditMode ? "Save Changes" : "Create Sub Category"}
                </Button>
                <Button type="button" variant="outline" size="lg" className="w-full" onClick={() => navigate("/services/subcategories")}>
                    Cancel
                </Button>
            </div>
        </div>
      </form>
    </div>
  );
};

export default AddServiceSubCategory;
