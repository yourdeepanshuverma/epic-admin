import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import {
  useCreateVenueCategoryMutation,
  useGetVenueCategoriesQuery,
  useUpdateVenueCategoryMutation,
  useGetAllServicesQuery,
} from "../../../store/api/adminApi";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Textarea } from "../../../components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../../components/ui/card";
import { Loader2, ArrowLeft, ImagePlus, X } from "lucide-react";
import Select from "react-select";
import { AddServiceDialog } from "../../../components/AddServiceDialog";

const AddVenueCategory = () => {
  const { id } = useParams();
  const isEditMode = !!id;
  const navigate = useNavigate();

  const { data: categoriesData, isLoading: isFetching } =
    useGetVenueCategoriesQuery(undefined, {
      skip: !isEditMode,
    });

  const { data: servicesData, isLoading: isServicesLoading } =
    useGetAllServicesQuery();

  const categoryToEdit = isEditMode
    ? categoriesData?.data?.find((c) => c._id === id)
    : null;

  const [createCategory, { isLoading: isCreating }] =
    useCreateVenueCategoryMutation();
  const [updateCategory, { isLoading: isUpdating }] =
    useUpdateVenueCategoryMutation();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors },
  } = useForm();
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    if (isEditMode && categoryToEdit) {
      setValue("name", categoryToEdit.name);
      setValue("description", categoryToEdit.description);
      setImagePreview(categoryToEdit.image?.url);

      if (categoryToEdit.services) {
        const selectedServices = categoryToEdit.services.map((s) => ({
          value: s._id,
          label: s.name,
        }));
        setValue("services", selectedServices);
      }
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

    if (data.services) {
      data.services.forEach((s) => {
        formData.append("services[]", s.value);
      });
    }

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
      navigate("/venues/categories");
    } catch (error) {
      console.error(error);
      toast.error(error?.data?.message || "Something went wrong");
    }
  };

  if ((isEditMode && isFetching) || isServicesLoading)
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="animate-spin" />
      </div>
    );

  const serviceOptions =
    servicesData?.data?.map((s) => ({
      value: s._id,
      label: s.name,
    })) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate("/venues/categories")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {isEditMode ? "Edit Category" : "Create New Category"}
          </h1>
          <p className="text-muted-foreground">
            Manage venue categories and their assigned service fields.
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid grid-cols-1 gap-6 md:grid-cols-3"
      >
        {/* Left Column - Main Details */}
        <div className="space-y-6 md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Category Details</CardTitle>
              <CardDescription>
                Basic information about the venue category.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Category Name</Label>
                <Input
                  id="name"
                  {...register("name", { required: "Name is required" })}
                  placeholder="e.g. 5 Star Hotel, Banquet Hall"
                  className="text-lg font-medium"
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  {...register("description")}
                  placeholder="Describe what this category represents..."
                  className="min-h-[120px]"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-col gap-2 pb-2">
              <div>
                <CardTitle>Service Fields</CardTitle>
                <CardDescription>
                  Select the data fields vendors need to provide.
                </CardDescription>
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
                    <Select
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
                <p className="text-muted-foreground mt-2 text-xs">
                  These fields will appear in the vendor's "Add Package" form
                  when this category is selected.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Media */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Category Image</CardTitle>
              <CardDescription>Upload a representative image.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col items-center gap-4">
                  <div className="relative aspect-square w-full overflow-hidden rounded-lg">
                    {imagePreview ? (
                      <div className="relative h-full w-full">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="h-full w-full object-cover"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2 h-8 w-8 rounded-full z-10"
                          onClick={removeImage}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <Label
                        htmlFor="image"
                        className="border-muted-foreground/25 bg-muted/50 hover:bg-muted/80 flex h-full w-full cursor-pointer flex-col items-center justify-center border-2 border-dashed transition-colors"
                      >
                        <div className="p-4 text-center">
                          <ImagePlus className="text-muted-foreground mx-auto mb-2 h-12 w-12" />
                          <span className="text-muted-foreground text-sm">
                            Click to upload image
                          </span>
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
                  <p className="text-muted-foreground text-center text-xs">
                    Recommended size: 800x600px.
                    <br />
                    Format: JPG, PNG, WEBP.
                  </p>
                </div>
            </CardContent>
          </Card>

          <div className="flex flex-col gap-3">
            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={isCreating || isUpdating}
            >
              {(isCreating || isUpdating) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isEditMode ? "Save Changes" : "Create Category"}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="w-full"
              onClick={() => navigate("/venues/categories")}
            >
              Cancel
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddVenueCategory;
