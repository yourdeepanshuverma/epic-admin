import { useSelector } from "react-redux";
import { selectCurrentRole } from "../store/slices/authSlice";
import { Navigate, Outlet } from "react-router";
import { IconLock } from "@tabler/icons-react";
import { Button } from "./ui/button";

export default function AdminOnly() {
  const role = useSelector(selectCurrentRole);

  if (role !== "admin") {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center gap-6 p-8 text-center animate-in fade-in zoom-in duration-300">
        <div className="bg-red-50 p-6 rounded-full">
            <IconLock size={64} className="text-red-500" />
        </div>
        <div className="space-y-2">
            <h1 className="text-3xl font-black tracking-tighter uppercase text-red-600">Restricted Access</h1>
            <p className="text-muted-foreground font-medium max-w-sm mx-auto leading-relaxed">
                This area is strictly for <strong>Administrators</strong> only. 
                Your account privileges do not allow access to this configuration.
            </p>
        </div>

        <Button variant="outline" onClick={() => window.history.back()}>
            Go Back
        </Button>
      </div>
    );
  }

  return <Outlet />;
}