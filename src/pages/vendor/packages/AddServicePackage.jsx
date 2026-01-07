import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { 
  useCreateServicePackageMutation, 
  useGetServiceCategoriesQuery, 
  useGetServiceSubCategoriesQuery 
} from "../../../store/api/vendorApi";
import { toast } from "sonner";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Textarea } from "../../../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { Checkbox } from "../../../components/ui/checkbox";
import { useNavigate } from "react-router";
import Autocomplete from "react-google-autocomplete";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../components/ui/card";
import { Loader2, ArrowLeft, ImagePlus, X, MapPin, Briefcase, Banknote, List } from "lucide-react";

const AddServicePackage = () => {
  const navigate = useNavigate();
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm();
  const [createServicePackage, { isLoading }] = useCreateServicePackageMutation();
  
  const { data: categoriesData } = useGetServiceCategoriesQuery();
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const { data: subCategoriesData } = useGetServiceSubCategoriesQuery(selectedCategoryId, {
    skip: !selectedCategoryId
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  
  const [availableServices, setAvailableServices] = useState([]);
  const [selectedServices, setSelectedServices] = useState({});

  const selectedSubCategoryId = watch("serviceSubCategory");

  useEffect(() => {
    if (selectedSubCategoryId && subCategoriesData?.data) {
        const subCat = subCategoriesData.data.find(s => s._id === selectedSubCategoryId);
        if (subCat && subCat.services) {
            setAvailableServices(subCat.services);
            setSelectedServices({});
        } else {
            setAvailableServices([]);
        }
    }
  }, [selectedSubCategoryId, subCategoriesData]);

  const handleServiceChange = (serviceName, value) => {
      setSelectedServices(prev => ({
          ...prev,
          [serviceName]: value
      }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    setSelectedFile(null);
  };

  const handlePlaceSelected = (place) => {
    if (!place.address_components) return;

    const getComponent = (type) => place.address_components.find(c => c.types.includes(type))?.long_name || "";

    let locality = getComponent("locality") || getComponent("sublocality") || getComponent("neighborhood");
    const city = getComponent("locality") || getComponent("administrative_area_level_2");
    const state = getComponent("administrative_area_level_1");
    const country = getComponent("country");
    let pincode = getComponent("postal_code");

    if (!pincode && place.formatted_address) {
        const pincodeMatch = place.formatted_address.match(/\b\d{6}\b/);
        if (pincodeMatch) pincode = pincodeMatch[0];
    }

    if (!locality) locality = city;

    setValue("location.locality", locality);
    setValue("location.city", city);
    setValue("location.state", state);
    setValue("location.country", country);
    setValue("location.pincode", pincode);
    setValue("location.googleMapsLink", place.url || "");
  };

  const onSubmit = async (data) => {
    if (!selectedFile) {
      toast.error("Featured Image is required");
      return;
    }

    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("description", data.description);
    formData.append("startingPrice", data.startingPrice);
    formData.append("serviceSubCategory", data.serviceSubCategory);
    formData.append("featuredImage", selectedFile);
    formData.append("location", JSON.stringify(data.location));
    
    // Transform services map to array of objects
    const servicesArray = availableServices
      .map(service => ({
        name: service.name,
        value: selectedServices[service.name],
        icon: service.icon,
        type: service.type
      }))
      .filter(s => s.value !== undefined && s.value !== "" && s.value !== false && s.value !== null);

    formData.append("services", JSON.stringify(servicesArray));

    try {
      await createServicePackage(formData).unwrap();
      toast.success("Service Package created successfully!");
      navigate("/my-packages/services");
    } catch (error) {
      toast.error(error?.data?.message || "Failed to create package");
      console.error(error);
    }
  };

  const onError = (errors) => {
      console.log("Validation Errors:", errors);
      toast.error("Please fill all required fields");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate("/my-packages/services")}>
            <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
            <h1 className="text-2xl font-bold tracking-tight">Add New Service Package</h1>
            <p className="text-muted-foreground">Offer your professional services to clients.</p>
        </div>
      </div>
      
      <form onSubmit={handleSubmit(onSubmit, onError)} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN */}
        <div className="lg:col-span-2 space-y-6">
            
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Briefcase className="w-5 h-5 text-primary" />
                        <CardTitle>Service Details</CardTitle>
                    </div>
                    <CardDescription>Tell us about the service you are providing.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Package Title <span className="text-red-500">*</span></Label>
                        <Input 
                            id="title" 
                            placeholder="e.g. Premium Wedding Photography" 
                            className="text-lg font-medium"
                            {...register("title", { required: "Title is required" })} 
                        />
                        {errors.title && <p className="text-red-500 text-xs">{errors.title.message}</p>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Category <span className="text-red-500">*</span></Label>
                            <Select onValueChange={(val) => setSelectedCategoryId(val)}>
                                <SelectTrigger>
                                <SelectValue placeholder="Select Category" />
                                </SelectTrigger>
                                <SelectContent>
                                {categoriesData?.data?.map((cat) => (
                                    <SelectItem key={cat._id} value={cat._id}>{cat.name}</SelectItem>
                                ))}
                                </SelectContent>
                            </Select>
                        </div>
                        
                        <div className="space-y-2">
                            <Label>Sub Category <span className="text-red-500">*</span></Label>
                            <Select onValueChange={(val) => setValue("serviceSubCategory", val, { shouldValidate: true })} disabled={!selectedCategoryId}>
                                <SelectTrigger>
                                <SelectValue placeholder="Select Sub Category" />
                                </SelectTrigger>
                                <SelectContent>
                                {subCategoriesData?.data?.map((sub) => (
                                    <SelectItem key={sub._id} value={sub._id}>{sub.name}</SelectItem>
                                ))}
                                </SelectContent>
                            </Select>
                            <input type="hidden" {...register("serviceSubCategory", { required: "Sub Category is required" })} />
                            {errors.serviceSubCategory && <p className="text-red-500 text-xs">{errors.serviceSubCategory.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="startingPrice">Starting Price (₹) <span className="text-red-500">*</span></Label>
                            <div className="relative">
                                <Banknote className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input 
                                    type="number" 
                                    id="startingPrice" 
                                    className="pl-9"
                                    placeholder="25000" 
                                    {...register("startingPrice", { required: "Price is required" })} 
                                />
                            </div>
                            {errors.startingPrice && <p className="text-red-500 text-xs">{errors.startingPrice.message}</p>}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description <span className="text-red-500">*</span></Label>
                        <Textarea 
                            id="description" 
                            placeholder="Describe your service offering in detail..." 
                            className="min-h-[150px]"
                            {...register("description", { required: "Description is required" })} 
                        />
                        {errors.description && <p className="text-red-500 text-xs">{errors.description.message}</p>}
                    </div>
                </CardContent>
            </Card>

            {availableServices.length > 0 && (
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <List className="w-5 h-5 text-primary" />
                            <CardTitle>Features & Inclusions</CardTitle>
                        </div>
                        <CardDescription>Specify the features included in this package.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                            {availableServices.map((service) => (
                                <div key={service._id} className="space-y-1">
                                    <Label className="text-xs font-semibold uppercase text-muted-foreground">{service.name}</Label>
                                    {service.type === "checkbox" ? (
                                        <div className="flex items-center space-x-2 border p-3 rounded-md">
                                            <Checkbox 
                                                id={service._id} 
                                                onCheckedChange={(checked) => handleServiceChange(service.name, checked)}
                                            />
                                            <label
                                                htmlFor={service._id}
                                                className="text-sm font-medium leading-none cursor-pointer"
                                            >
                                                Included / Yes
                                            </label>
                                        </div>
                                    ) : service.type === "textarea" ? (
                                        <Textarea 
                                            className="h-20"
                                            placeholder={`Details about ${service.name}`}
                                            onChange={(e) => handleServiceChange(service.name, e.target.value)}
                                        />
                                    ) : (
                                        <Input 
                                            type={service.type === "number" ? "number" : "text"}
                                            placeholder={service.type === "number" ? "0" : "Enter value"}
                                            onChange={(e) => handleServiceChange(service.name, e.target.value)}
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-primary" />
                        <CardTitle>Service Location</CardTitle>
                    </div>
                    <CardDescription>Where do you provide this service?</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Search Area (Auto-fill)</Label>
                        <div className="relative">
                            <Autocomplete
                                apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
                                onPlaceSelected={handlePlaceSelected}
                                options={{
                                    types: ["geocode", "establishment"],
                                    componentRestrictions: { country: "in" },
                                }}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                placeholder="Start typing city or area..."
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Locality <span className="text-red-500">*</span></Label>
                            <Input {...register("location.locality", { required: "Locality is required" })} />
                            {errors.location?.locality && <p className="text-red-500 text-xs">{errors.location.locality.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label>City <span className="text-red-500">*</span></Label>
                            <Input {...register("location.city", { required: "City is required" })} readOnly className="bg-muted" />
                        </div>
                        <div className="space-y-2">
                            <Label>State <span className="text-red-500">*</span></Label>
                            <Input {...register("location.state", { required: "State is required" })} readOnly className="bg-muted" />
                        </div>
                        <div className="space-y-2">
                            <Label>Pincode <span className="text-red-500">*</span></Label>
                            <Input {...register("location.pincode", { required: "Pincode is required" })} />
                            {errors.location?.pincode && <p className="text-red-500 text-xs">{errors.location.pincode.message}</p>}
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <Label>Full Address <span className="text-red-500">*</span></Label>
                            <Textarea {...register("location.fullAddress", { required: "Full Address is required" })} />
                            {errors.location?.fullAddress && <p className="text-red-500 text-xs">{errors.location.fullAddress.message}</p>}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Featured Image</CardTitle>
                    <CardDescription>Cover image for your service.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center gap-4">
                        <div className="relative w-full aspect-video rounded-lg overflow-hidden border-2 border-dashed border-muted-foreground/25 flex flex-col items-center justify-center bg-muted/50 hover:bg-muted/80 transition-colors">
                            {imagePreview ? (
                                <div className="relative w-full h-full group">
                                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <Button 
                                            type="button" 
                                            variant="destructive" 
                                            size="sm"
                                            onClick={removeImage}
                                        >
                                            <X className="w-4 h-4 mr-2" /> Remove
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <Label 
                                    htmlFor="image" 
                                    className="flex flex-col items-center justify-center w-full h-full cursor-pointer"
                                >
                                    <div className="p-4 text-center">
                                        <ImagePlus className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                                        <span className="text-muted-foreground text-sm font-medium">Click to upload image</span>
                                        <p className="text-xs text-muted-foreground mt-1">PNG, JPG, WEBP up to 5MB</p>
                                    </div>
                                </Label>
                            )}
                            <input 
                                id="image" 
                                type="file" 
                                accept="image/*"
                                className="hidden"
                                onChange={handleImageChange}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="flex flex-col gap-3">
                <Button type="submit" size="lg" className="w-full font-bold" disabled={isLoading}>
                    {isLoading ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating...
                        </>
                    ) : (
                        "Create Package"
                    )}
                </Button>
                <Button type="button" variant="outline" size="lg" className="w-full" onClick={() => navigate("/my-packages/services")}>
                    Cancel
                </Button>
            </div>
        </div>

      </form>
    </div>
  );
};

export default AddServicePackage;