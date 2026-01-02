import React from "react";
import { Link } from "react-router";
import { IconBuildingBank, IconBriefcase } from "@tabler/icons-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const AddPackageSelection = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8 p-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">What would you like to list?</h1>
        <p className="text-muted-foreground">Choose the type of package you want to add to your profile.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Link to="/my-packages/add/venue" className="group">
          <Card className="h-full transition-all hover:border-primary hover:shadow-md cursor-pointer group-hover:bg-accent/5">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <IconBuildingBank size={32} />
              </div>
              <CardTitle className="text-xl">Venue Package</CardTitle>
              <CardDescription>
                List a banquet hall, lawn, hotel, or resort for weddings and events.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                <li>Detailed amenities & capacity</li>
                <li>Photo albums & videos</li>
                <li>Room configurations</li>
              </ul>
            </CardContent>
          </Card>
        </Link>

        <Link to="/my-packages/add/service" className="group">
          <Card className="h-full transition-all hover:border-primary hover:shadow-md cursor-pointer group-hover:bg-accent/5">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <IconBriefcase size={32} />
              </div>
              <CardTitle className="text-xl">Service Package</CardTitle>
              <CardDescription>
                List your professional services like photography, catering, decoration, etc.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                <li>Service deliverables</li>
                <li>Portfolio showcase</li>
                <li>Pricing tiers</li>
              </ul>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
};

export default AddPackageSelection;
