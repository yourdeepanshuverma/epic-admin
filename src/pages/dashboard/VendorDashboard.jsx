import React from "react";
import { SectionCards } from "@/components/section-cards";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "@/store/slices/authSlice";

const vendorStats = [
  {
    title: "Wallet Balance",
    value: "₹0.00", 
    trend: "neutral",
    change: "0%",
    footerText: "Available for withdrawal",
    subText: "Current Balance",
  },
  {
    title: "Active Packages",
    value: "0",
    trend: "neutral",
    change: "0",
    footerText: "Live on site",
    subText: "Venues & Services",
  },
  {
    title: "Profile Views",
    value: "0",
    trend: "up",
    change: "+0%",
    footerText: "This month",
    subText: "Potential Leads",
  },
  {
    title: "Reviews",
    value: "0.0",
    trend: "neutral",
    change: "0",
    footerText: "Average Rating",
    subText: "Based on user feedback",
  },
];

const VendorDashboard = () => {
    const user = useSelector(selectCurrentUser);

  return (
    <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-bold">Welcome, {user?.vendorName || "Vendor"}!</h2>
            <p className="text-muted-foreground">Here's what's happening with your business today.</p>
        </div>
      
      <SectionCards items={vendorStats} loading={false} />
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4 p-6 border rounded-xl bg-card">
            <h3 className="text-lg font-semibold mb-4">Recent Inquiries</h3>
            <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground border-2 border-dashed rounded-lg">
                No recent inquiries
            </div>
        </div>
        <div className="col-span-3 p-6 border rounded-xl bg-card">
             <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
             <div className="space-y-2">
                 <button className="w-full text-left p-3 rounded-lg hover:bg-muted transition-colors border text-sm font-medium">
                    + Add New Package
                 </button>
                 <button className="w-full text-left p-3 rounded-lg hover:bg-muted transition-colors border text-sm font-medium">
                    Update Profile
                 </button>
                 <button className="w-full text-left p-3 rounded-lg hover:bg-muted transition-colors border text-sm font-medium">
                    Check Wallet History
                 </button>
             </div>
        </div>
      </div>
    </div>
  );
};

export default VendorDashboard;
