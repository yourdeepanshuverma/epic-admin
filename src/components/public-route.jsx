import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useSelector } from "react-redux";
import { selectCurrentToken } from "../store/slices/authSlice";
import { useGetProfileQuery } from "../store/api/vendorApi";

export default function PublicRoute({ children, allowAuthenticated = false }) {
  const navigate = useNavigate();
  const token = useSelector(selectCurrentToken);
  
  // Optional: Verify token validity via API if needed, but for public route redirect, 
  // checking store token is usually enough for UX speed.
  // If token is invalid, Protected route logic will handle logout later.
  
  useEffect(() => {
    if (token && !allowAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [token, navigate, allowAuthenticated]);

  if (token && !allowAuthenticated) {
      return null; // or a loading spinner while redirecting
  }

  return <>{children}</>;
}
