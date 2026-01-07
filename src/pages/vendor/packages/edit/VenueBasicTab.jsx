import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useUpdateVenueBasicMutation, useGetVenueCategoriesQuery } from "../../../../store/api/vendorApi";
import { toast } from "sonner";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";
import { Textarea } from "../../../../components/ui/textarea";
import { Checkbox } from "../../../../components/ui/checkbox";
import Autocomplete from "react-google-autocomplete";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../../components/ui/card";
import { Loader2, ImagePlus, X, MapPin, Building, Banknote, List } from "lucide-react";
import { DynamicIcon } from "../../../../components/DynamicIcon";

const VenueBasicTab = ({ pkg }) => {
  const { register, handleSubmit, setValue, formState: { errors } } = useForm();
  const [updateVenueBasic, { isLoading }] = useUpdateVenueBasicMutation();
  
  const [imagePreview, setImagePreview] = useState(pkg.featuredImage?.url || null);
  const [selectedFile, setSelectedFile] = useState(null);
  
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

      if (pkg.venueCategory && pkg.venueCategory.services) {
          setAvailableServices(pkg.venueCategory.services);
      }
      
      if (pkg.services) {
          if (Array.isArray(pkg.services)) {
              const serviceMap = {};
              pkg.services.forEach(s => {
                  serviceMap[s.name] = { value: s.value, icon: s.icon, type: s.type };
              });
              setSelectedServices(serviceMap);
          } else {
              setSelectedServices(pkg.services);
          }
      }
    }
  }, [pkg, setValue]);

  const handleServiceChange = (service, value) => {
    setSelectedServices(prev => ({
        ...prev,
        [service.name]: {
            value: value,
            icon: service.icon,
            type: service.type
        }
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
    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("description", data.description);
    formData.append("startingPrice", data.startingPrice);
    
    if (selectedFile) {
      formData.append("featuredImage", selectedFile);
    }
    
    formData.append("location", JSON.stringify(data.location));
    
    // Transform selectedServices object to array
    const servicesArray = Object.entries(selectedServices).map(([name, data]) => ({
      name,
      value: data.value,
      icon: data.icon,
      type: data.type
    })).filter(s => s.value !== undefined && s.value !== "" && s.value !== false && s.value !== null);
    
    formData.append("services", JSON.stringify(servicesArray));

    try {
      await updateVenueBasic({ id: pkg._id, data: formData }).unwrap();
      toast.success("Basic details updated successfully!");
    } catch (error) {
      toast.error(error?.data?.message || "Failed to update details");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Left Column */}
      <div className="lg:col-span-2 space-y-6">
        <Card>
            <CardHeader>
                <div className="flex items-center gap-2">
                    <Building className="w-5 h-5 text-primary" />
                    <CardTitle>Basic Details</CardTitle>
                </div>
                <CardDescription>Update essential information about your venue.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Package Title</Label>
                        <Input 
                            id="title" 
                            className="text-lg font-medium"
                            {...register("title", { required: "Title is required" })} 
                        />
                        {errors.title && <p className="text-red-500 text-xs">{errors.title.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="startingPrice">Starting Price (₹)</Label>
                        <div className="relative">
                            <Banknote className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input 
                                type="number" 
                                id="startingPrice" 
                                className="pl-9"
                                {...register("startingPrice", { required: "Price is required" })} 
                            />
                        </div>
                        {errors.startingPrice && <p className="text-red-500 text-xs">{errors.startingPrice.message}</p>}
                    </div>
                </div>

                <div className="space-y-2">
                    <Label>Category</Label>
                    <Input 
                        value={pkg?.venueCategory?.name || "N/A"} 
                        disabled 
                        className="bg-muted text-muted-foreground"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea 
                        id="description" 
                        className="min-h-[120px]"
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
                        <CardTitle>Amenities & Features</CardTitle>
                    </div>
                    <CardDescription>Update the amenities provided in this package.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                        {availableServices.map((service) => (
                            <div key={service._id} className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <DynamicIcon name={service.icon} className="w-4 h-4 text-primary" />
                                    <Label className="text-xs font-semibold uppercase text-muted-foreground">{service.name}</Label>
                                </div>
                                {service.type === "checkbox" ? (
                                    <div className="flex items-center space-x-2 border p-3 rounded-md">
                                        <Checkbox 
                                            id={service._id} 
                                            checked={!!selectedServices[service.name]?.value}
                                            onCheckedChange={(checked) => handleServiceChange(service, checked)}
                                        />
                                        <label htmlFor={service._id} className="text-sm cursor-pointer">Available / Yes</label>
                                    </div>
                                ) : service.type === "textarea" ? (
                                    <Textarea 
                                        className="h-20"
                                        defaultValue={selectedServices[service.name]?.value || ""}
                                        placeholder={`Enter details for ${service.name}`}
                                        onChange={(e) => handleServiceChange(service, e.target.value)}
                                    />
                                ) : (
                                    <Input 
                                        type={service.type === "number" ? "number" : "text"}
                                        defaultValue={selectedServices[service.name]?.value || ""}
                                        placeholder={`Enter ${service.name}`}
                                        onChange={(e) => handleServiceChange(service, e.target.value)}
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
                    <CardTitle>Location</CardTitle>
                </div>
                <CardDescription>Update location details if necessary.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
                            placeholder="Start typing to search..."
                        />
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Locality</Label>
                        <Input {...register("location.locality", { required: "Locality is required" })} />
                    </div>
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
                        <Label>Pincode</Label>
                        <Input {...register("location.pincode", { required: "Pincode is required" })} />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                        <Label>Full Address</Label>
                        <Textarea {...register("location.fullAddress", { required: "Full Address is required" })} />
                    </div>
                </div>
            </CardContent>
        </Card>
      </div>

      {/* Right Column */}
      <div className="space-y-6">
        <Card>
            <CardHeader>
                <CardTitle>Featured Image</CardTitle>
                <CardDescription>Main cover image.</CardDescription>
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

        <Button type="submit" size="lg" className="w-full font-bold" disabled={isLoading}>
            {isLoading ? (
                <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Updating...
                </>
            ) : (
                "Save Changes"
            )}
        </Button>
      </div>
    </form>
  );
};

export default VenueBasicTab;
