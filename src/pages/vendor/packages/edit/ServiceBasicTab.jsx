import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useUpdateServiceBasicMutation, useGetServiceCategoriesQuery } from "../../../../store/api/vendorApi";
import { toast } from "sonner";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";
import { Textarea } from "../../../../components/ui/textarea";
import { Checkbox } from "../../../../components/ui/checkbox";
import Autocomplete from "react-google-autocomplete";

const ServiceBasicTab = ({ pkg }) => {
  const { register, handleSubmit, setValue, formState: { errors } } = useForm();
  const [updateServiceBasic, { isLoading }] = useUpdateServiceBasicMutation();
  
  const [imagePreview, setImagePreview] = useState(pkg.featuredImage?.url || null);
  const [selectedFile, setSelectedFile] = useState(null);
  
  // Services State
  const [availableServices, setAvailableServices] = useState([]);
  const [selectedServices, setSelectedServices] = useState(pkg.services || {});

  useEffect(() => {
    if (pkg) {
      setValue("title", pkg.title);
      setValue("description", pkg.description);
      setValue("startingPrice", pkg.startingPrice);
      
      if (pkg.location) {
        setValue("location.locality", pkg.location.locality);
        setValue("location.city", pkg.location.city);
        setValue("location.state", pkg.location.state);
        setValue("location.country", pkg.location.country);
        setValue("location.pincode", pkg.location.pincode);
        setValue("location.fullAddress", pkg.location.fullAddress);
        setValue("location.googleMapsLink", pkg.location.googleMapsLink);
      }

      // Services Logic for Service Package
      // In Service packages, services are linked to ServiceSubCategory
      // Backend populate in getServicePackage now includes services
      if (pkg.serviceSubCategory && pkg.serviceSubCategory.services) {
          setAvailableServices(pkg.serviceSubCategory.services);
      }
    }
  }, [pkg, setValue]);

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
    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("description", data.description);
    formData.append("startingPrice", data.startingPrice);
    
    if (selectedFile) {
      formData.append("featuredImage", selectedFile);
    }
    
    formData.append("location", JSON.stringify(data.location));
    formData.append("services", JSON.stringify(selectedServices));

    try {
      await updateServiceBasic({ id: pkg._id, data: formData }).unwrap();
      toast.success("Basic details updated successfully!");
    } catch (error) {
      toast.error(error?.data?.message || "Failed to update details");
    }
  };

  return (
    <div className="max-w-3xl border p-6 rounded-xl bg-card">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        
        <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Package Title</Label>
              <Input 
                id="title" 
                {...register("title", { required: "Title is required" })} 
              />
              {errors.title && <p className="text-red-500 text-sm">{errors.title.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="startingPrice">Starting Price (₹)</Label>
              <Input 
                type="number" 
                id="startingPrice" 
                {...register("startingPrice", { required: "Price is required" })} 
              />
               {errors.startingPrice && <p className="text-red-500 text-sm">{errors.startingPrice.message}</p>}
            </div>
        </div>
        
        <div className="space-y-2">
            <Label>Sub Category</Label>
            <Input 
                value={pkg?.serviceSubCategory?.name || "N/A"} 
                disabled 
                className="bg-muted"
            />
            <p className="text-xs text-muted-foreground">Category cannot be changed.</p>
        </div>

        <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea 
              id="description" 
              className="h-32"
              {...register("description", { required: "Description is required" })} 
            />
            {errors.description && <p className="text-red-500 text-sm">{errors.description.message}</p>}
        </div>

        {/* Amenities & Services */}
        {availableServices.length > 0 && (
            <div className="space-y-4 pt-4 border-t">
                <h3 className="text-lg font-semibold">Amenities & Services</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {availableServices.map((service) => (
                        <div key={service._id} className="space-y-1">
                            <Label>{service.name}</Label>
                            {service.type === "checkbox" ? (
                                <div className="flex items-center space-x-2">
                                    <Checkbox 
                                        id={service._id} 
                                        checked={!!selectedServices[service.name]}
                                        onCheckedChange={(checked) => handleServiceChange(service.name, checked)}
                                    />
                                    <label htmlFor={service._id} className="text-sm">Yes</label>
                                </div>
                            ) : service.type === "textarea" ? (
                                <Textarea 
                                    defaultValue={selectedServices[service.name] || ""}
                                    placeholder={`Enter details for ${service.name}`}
                                    onChange={(e) => handleServiceChange(service.name, e.target.value)}
                                />
                            ) : (
                                <Input 
                                    type={service.type === "number" ? "number" : "text"}
                                    defaultValue={selectedServices[service.name] || ""}
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
        <div className="space-y-4 pt-4 border-t">
          <h3 className="text-lg font-semibold">Location</h3>
          
          <div className="space-y-2">
            <Label>Update Address (Search Google Maps)</Label>
            <div className="relative">
              <Autocomplete
                apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
                onPlaceSelected={handlePlaceSelected}
                options={{
                  types: ["establishment", "geocode"],
                  componentRestrictions: { country: "in" },
                }}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>City</Label>
              <Input {...register("location.city", { required: "City is required" })} readOnly className="bg-muted" />
            </div>
            <div className="space-y-2">
              <Label>State</Label>
              <Input {...register("location.state", { required: "State is required" })} readOnly className="bg-muted" />
            </div>
            <div className="space-y-2">
              <Label>Country</Label>
              <Input {...register("location.country", { required: "Country is required" })} readOnly className="bg-muted" />
            </div>
            <div className="space-y-2">
              <Label>Pincode <span className="text-red-500">*</span></Label>
              <Input {...register("location.pincode", { required: "Pincode is required" })} />
            </div>
             <div className="space-y-2 md:col-span-2">
              <Label>Locality</Label>
              <Input {...register("location.locality", { required: "Locality is required" })} />
            </div>
             <div className="space-y-2 md:col-span-2">
              <Label>Full Address</Label>
              <Textarea {...register("location.fullAddress", { required: "Full Address is required" })} />
            </div>
          </div>
        </div>

        {/* Featured Image */}
        <div className="space-y-4 pt-4 border-t">
          <h3 className="text-lg font-semibold">Featured Image</h3>
           <div className="space-y-2">
            <Input 
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

        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Updating..." : "Update Basic Details"}
        </Button>
      </form>
    </div>
  );
};

export default ServiceBasicTab;
