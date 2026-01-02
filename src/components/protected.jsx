import { useEffect } from "react";
import { useNavigate } from "react-router";
import Spinner from "./ui/spinner";
import { useGetProfileQuery } from "../store/api/vendorApi";
import { useDispatch } from "react-redux";
import { setCredentials } from "../store/slices/authSlice";

export default function Protected({ children, authentication = true }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Use profile query to validate token and get user data
  const { data: profileData, isLoading, isError, error } = useGetProfileQuery(null, {
    skip: !authentication,
    refetchOnMountOrArgChange: true,
  });

  useEffect(() => {
    // console.log("Protected Check:", { isLoading, isError, hasData: !!profileData });
    if (!isLoading) {
      if (authentication) {
        if (isError) {
           console.warn("Protected: Auth failed, redirecting to login");
           navigate("/login");
        } else if (profileData?.data) {
           // Sync Redux state with fresh profile data
           const user = profileData.data;
           const role = user.role;
           const token = localStorage.getItem("token"); 
           
           dispatch(setCredentials({ user, token, role }));
        }
      } else if (!authentication && !isError) {
        navigate("/dashboard");
      }
    }
  }, [isLoading, isError, authentication, navigate, profileData, dispatch]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center gap-4">
        <Spinner />
      </div>
    );
  }

  // ✅ only render after auth check is done
  if ((authentication && isError) || (!authentication && !isError)) {
    return null; // avoid flash of protected page
  }

  return <>{children}</>;
}
