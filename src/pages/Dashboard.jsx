import React from "react";
import { useSelector } from "react-redux";
import { selectCurrentRole } from "@/store/slices/authSlice";
import AdminDashboard from "./dashboard/AdminDashboard";
import VendorDashboard from "./dashboard/VendorDashboard";

const Dashboard = () => {
  const role = useSelector(selectCurrentRole);

  if (role === "admin") {
    return <AdminDashboard />;
  }

  return <VendorDashboard />;
};

export default Dashboard;
