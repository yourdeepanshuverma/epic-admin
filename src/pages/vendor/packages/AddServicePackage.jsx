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
  
  // Services Logic
  const [availableServices, setAvailableServices] = useState([]);
  const [selectedServices, setSelectedServices] = useState({});

  const selectedSubCategoryId = watch("serviceSubCategory");

  useEffect(() => {
    if (selectedSubCategoryId && subCategoriesData?.data) {
        const subCat = subCategoriesData.data.find(s => s._id === selectedSubCategoryId);
        if (subCat && subCat.services) {
            setAvailableServices(subCat.services);
            setSelectedServices({}); // Reset
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

  const handlePlaceSelected = (place) => {
    if (!place.address_components) return;

    const getComponent = (type) => place.address_components.find(c => c.types.includes(type))?.long_name || "";

    let locality = getComponent("locality") || getComponent("sublocality") || getComponent("neighborhood");
    const city = getComponent("locality") || getComponent("administrative_area_level_2");
    const state = getComponent("administrative_area_level_1");
    const country = getComponent("country");
    let pincode = getComponent("postal_code");

    // Fallback: Extract pincode from formatted address if missing
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
    // setValue("location.fullAddress", fullAddress); // Do not auto-fill full address
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
    formData.append("services", JSON.stringify(selectedServices));

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
    <div className="max-w-3xl mx-auto p-6 bg-card border rounded-xl shadow-sm my-6">
      <h2 className="text-2xl font-bold mb-6">Add New Service Package</h2>
      
      <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-6">
        
        {/* Basic Details */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold border-b pb-2">Basic Details</h3>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Package Title <span className="text-red-500">*</span></Label>
              <Input 
                id="title" 
                placeholder="e.g. Premium Wedding Photography" 
                {...register("title", { required: "Title is required" })} 
              />
              {errors.title && <p className="text-red-500 text-xs">{errors.title.message}</p>}
            </div>

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
              <Input 
                type="number" 
                id="startingPrice" 
                placeholder="e.g. 25000" 
                {...register("startingPrice", { required: "Price is required" })} 
              />
               {errors.startingPrice && <p className="text-red-500 text-xs">{errors.startingPrice.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description <span className="text-red-500">*</span></Label>
            <Textarea 
              id="description" 
              placeholder="Describe your service..." 
              className="h-32"
              {...register("description", { required: "Description is required" })} 
            />
            {errors.description && <p className="text-red-500 text-xs">{errors.description.message}</p>}
          </div>
        </div>

        {/* Amenities & Services */}
        {availableServices.length > 0 && (
            <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Amenities & Services</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {availableServices.map((service) => (
                        <div key={service._id} className="space-y-1">
                            <Label>{service.name}</Label>
                            {service.type === "checkbox" ? (
                                <div className="flex items-center space-x-2">
                                    <Checkbox 
                                        id={service._id} 
                                        onCheckedChange={(checked) => handleServiceChange(service.name, checked)}
                                    />
                                    <label
                                        htmlFor={service._id}
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                    >
                                        Yes
                                    </label>
                                </div>
                            ) : service.type === "textarea" ? (
                                <Textarea 
                                    placeholder={`Enter details for ${service.name}`}
                                    onChange={(e) => handleServiceChange(service.name, e.target.value)}
                                />
                            ) : (
                                <Input 
                                    type={service.type === "number" ? "number" : "text"}
                                    placeholder={`Enter ${service.name}`}
                                    onChange={(e) => handleServiceChange(service.name, e.target.value)}
                                />
                            )}
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* Location Details */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold border-b pb-2">Location</h3>
          
          <div className="space-y-2">
            <Label>Search Address (Google Maps)</Label>
            <div className="relative">
              <Autocomplete
                apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
                onPlaceSelected={handlePlaceSelected}
                options={{
                  types: ["geocode", "establishment"],
                  componentRestrictions: { country: "in" },
                }}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Start typing area or city..."
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>City <span className="text-red-500">*</span></Label>
              <Input {...register("location.city", { required: "City is required" })} readOnly className="bg-muted" />
            </div>
            <div className="space-y-2">
              <Label>State <span className="text-red-500">*</span></Label>
              <Input {...register("location.state", { required: "State is required" })} readOnly className="bg-muted" />
            </div>
            <div className="space-y-2">
              <Label>Country <span className="text-red-500">*</span></Label>
              <Input {...register("location.country", { required: "Country is required" })} readOnly className="bg-muted" />
            </div>
            <div className="space-y-2">
              <Label>Pincode <span className="text-red-500">*</span></Label>
              <Input {...register("location.pincode", { required: "Pincode is required" })} />
              {errors.location?.pincode && <p className="text-red-500 text-xs">{errors.location.pincode.message}</p>}
            </div>
             <div className="space-y-2 md:col-span-2">
              <Label>Locality <span className="text-red-500">*</span></Label>
              <Input {...register("location.locality", { required: "Locality is required" })} />
              {errors.location?.locality && <p className="text-red-500 text-xs">{errors.location.locality.message}</p>}
            </div>
             <div className="space-y-2 md:col-span-2">
              <Label>Full Address <span className="text-red-500">*</span></Label>
              <Textarea {...register("location.fullAddress", { required: "Full Address is required" })} />
              {errors.location?.fullAddress && <p className="text-red-500 text-xs">{errors.location.fullAddress.message}</p>}
            </div>
          </div>
        </div>

        {/* Featured Image */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold border-b pb-2">Media</h3>
           <div className="space-y-2">
            <Label htmlFor="image">Featured Image <span className="text-red-500">*</span></Label>
            <Input 
              id="image" 
              type="file" 
              accept="image/*" 
              onChange={handleImageChange}
            />
            {imagePreview && (
              <div className="mt-4">
                <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover rounded-md" />
              </div>
            )}
           </div>
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Creating Package..." : "Create Service Package"}
        </Button>
      </form>
    </div>
  );
};

export default AddServicePackage;
