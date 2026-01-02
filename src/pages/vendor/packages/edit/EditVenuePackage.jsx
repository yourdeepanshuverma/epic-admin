import React from "react";
import { useParams, Link, useSearchParams } from "react-router";
import { useGetVenuePackageQuery } from "../../../../store/api/vendorApi";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../../components/ui/tabs";
import { Button } from "../../../../components/ui/button";
import { IconArrowLeft } from "@tabler/icons-react";

import VenueBasicTab from "./VenueBasicTab";
import VenuePhotosTab from "./VenuePhotosTab";
import VenueVideosTab from "./VenueVideosTab";
import VenueFaqsTab from "./VenueFaqsTab";

const EditVenuePackage = () => {
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "basic";

  const { data: packageData, isLoading, error } = useGetVenuePackageQuery(id);
  
  if (isLoading) return <div>Loading Package...</div>;
  if (error) return <div>Error loading package</div>;

  const pkg = packageData?.data;

  const handleTabChange = (value) => {
    setSearchParams({ tab: value });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/my-packages/venues">
            <IconArrowLeft className="size-5" />
          </Link>
        </Button>
        <div>
           <h1 className="text-2xl font-bold">Edit Package</h1>
           <p className="text-muted-foreground">{pkg?.title}</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:w-[600px]">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="photos">Photos</TabsTrigger>
          <TabsTrigger value="videos">Videos</TabsTrigger>
          <TabsTrigger value="faqs">FAQs</TabsTrigger>
        </TabsList>
        
        <TabsContent value="basic" className="mt-6">
          <VenueBasicTab pkg={pkg} />
        </TabsContent>
        
        <TabsContent value="photos" className="mt-6">
          <VenuePhotosTab pkg={pkg} />
        </TabsContent>

        <TabsContent value="videos" className="mt-6">
          <VenueVideosTab pkg={pkg} />
        </TabsContent>

        <TabsContent value="faqs" className="mt-6">
          <VenueFaqsTab pkg={pkg} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EditVenuePackage;
