import React, { useState } from "react";
import { 
  useGetVenueCategoriesQuery, 
  useGetServiceCategoriesQuery, 
  useGetServiceSubCategoriesQuery,
  useCreateVenuePackageMutation,
  useCreateServicePackageMutation
} from "../store/api/vendorApi";
import { Button } from "../components/ui/button";
import { toast } from "sonner";

const dummyVenues = [
  {
    title: "Royal Grand Banquet",
    description: "A luxurious banquet hall perfect for weddings and large gatherings. Features crystal chandeliers and premium catering.",
    startingPrice: 150000,
    location: {
      locality: "Civil Lines",
      fullAddress: "123, Civil Lines, Near Railway Station",
      city: "Delhi",
      state: "Delhi",
      country: "India",
      pincode: "110054",
      googleMapsLink: "https://maps.google.com/?q=civil+lines+delhi"
    }
  },
  {
    title: "Green Meadows Lawn",
    description: "Spacious open lawn for outdoor events under the stars. Ideal for receptions and parties.",
    startingPrice: 75000,
    location: {
      locality: "Chattarpur",
      fullAddress: "Farm No. 45, Chattarpur Road",
      city: "Delhi",
      state: "Delhi",
      country: "India",
      pincode: "110074",
      googleMapsLink: "https://maps.google.com/?q=chattarpur+delhi"
    }
  }
];

const dummyServices = [
  {
    title: "Candid Wedding Photography",
    description: "Capture your special moments with our premium candid photography package. Includes 300 edited photos.",
    startingPrice: 40000,
    location: {
      locality: "South Ex",
      fullAddress: "Studio 5, South Extension Part 2",
      city: "Delhi",
      state: "Delhi",
      country: "India",
      pincode: "110049",
      googleMapsLink: ""
    }
  },
  {
    title: "Bridal Makeup Artist",
    description: "HD Bridal Makeup with premium international products (MAC, Bobbi Brown). Trial included.",
    startingPrice: 15000,
    location: {
      locality: "Rajouri Garden",
      fullAddress: "Main Market, Rajouri Garden",
      city: "Delhi",
      state: "Delhi",
      country: "India",
      pincode: "110027",
      googleMapsLink: ""
    }
  }
];

// Placeholder image (1x1 transparent pixel or a placeholder URL if allowed)
// Since API requires a file upload, we need to create a dummy File object.
const createDummyFile = () => {
  const content = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=";
  const byteCharacters = atob(content);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new File([byteArray], "dummy.png", { type: "image/png" });
};

const SeedData = () => {
  const { data: venueCategories } = useGetVenueCategoriesQuery();
  const { data: serviceCategories } = useGetServiceCategoriesQuery();
  // Fetch subcategories for the first service category found
  const firstServiceCatId = serviceCategories?.data?.[0]?._id;
  const { data: subCategories } = useGetServiceSubCategoriesQuery(firstServiceCatId, { skip: !firstServiceCatId });

  const [createVenuePackage, { isLoading: isVenueLoading }] = useCreateVenuePackageMutation();
  const [createServicePackage, { isLoading: isServiceLoading }] = useCreateServicePackageMutation();
  
  const [logs, setLogs] = useState([]);

  const addLog = (msg) => setLogs(prev => [...prev, msg]);

  const handleSeed = async () => {
    setLogs([]);
    addLog("Starting seed process...");

    if (!venueCategories?.data?.length) {
      addLog("Error: No Venue Categories found. Please ask Admin to create some.");
      return;
    }
    if (!subCategories?.data?.length) {
      addLog("Error: No Service Sub-Categories found. Please ask Admin to create some.");
      return;
    }

    const dummyImage = createDummyFile();

    // 1. Create Venue Packages
    for (const venue of dummyVenues) {
      try {
        const formData = new FormData();
        formData.append("title", venue.title);
        formData.append("description", venue.description);
        formData.append("startingPrice", venue.startingPrice);
        formData.append("venueCategory", venueCategories.data[0]._id); // Use first category
        formData.append("location", JSON.stringify(venue.location));
        formData.append("featuredImage", dummyImage);

        await createVenuePackage(formData).unwrap();
        addLog(`✅ Venue Created: ${venue.title}`);
      } catch (err) {
        console.error(err);
        addLog(`❌ Failed Venue: ${venue.title} - ${err?.data?.message || err.message}`);
      }
    }

    // 2. Create Service Packages
    for (const service of dummyServices) {
      try {
        const formData = new FormData();
        formData.append("title", service.title);
        formData.append("description", service.description);
        formData.append("startingPrice", service.startingPrice);
        formData.append("serviceSubCategory", subCategories.data[0]._id); // Use first subcategory
        formData.append("location", JSON.stringify(service.location));
        formData.append("featuredImage", dummyImage);

        await createServicePackage(formData).unwrap();
        addLog(`✅ Service Created: ${service.title}`);
      } catch (err) {
        console.error(err);
        addLog(`❌ Failed Service: ${service.title} - ${err?.data?.message || err.message}`);
      }
    }

    addLog("Seed process completed.");
    toast.success("Seed process completed.");
  };

  return (
    <div className="p-10 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Seed Dummy Data</h1>
      <p className="mb-6 text-muted-foreground">
        This will create 2 Venue Packages and 2 Service Packages for the currently logged-in vendor.
        Ensure you have Venue Categories and Service Sub-Categories existing in the system.
      </p>
      
      <Button onClick={handleSeed} disabled={isVenueLoading || isServiceLoading}>
        {isVenueLoading || isServiceLoading ? "Seeding..." : "Start Seeding"}
      </Button>

      <div className="mt-6 p-4 bg-muted rounded-md font-mono text-sm h-64 overflow-y-auto">
        {logs.length === 0 ? "Logs will appear here..." : logs.map((log, i) => <div key={i}>{log}</div>)}
      </div>
    </div>
  );
};

export default SeedData;
