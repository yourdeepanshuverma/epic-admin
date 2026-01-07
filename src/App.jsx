import { Navigate, Route, Routes } from "react-router";
import Protected from "./components/protected";
import Admin from "./layout/Admin";
import Dashboard from "./pages/Dashboard";
import LoginPage from "./pages/Login";
import AllVendors from "./pages/vendors/AllVendors";
import VendorProfile from "./pages/vendor/Profile";
import MyVenuePackages from "./pages/vendor/MyVenuePackages";
import MyServicePackages from "./pages/vendor/MyServicePackages";
import AddPackageSelection from "./pages/vendor/packages/AddPackageSelection";
import AddVenuePackage from "./pages/vendor/packages/AddVenuePackage";
import AddServicePackage from "./pages/vendor/packages/AddServicePackage";
import EditVenuePackage from "./pages/vendor/packages/edit/EditVenuePackage";
import EditServicePackage from "./pages/vendor/packages/edit/EditServicePackage";
import SeedData from "./pages/SeedData";
import SeedLeads from "./pages/SeedLeads";
import SeedLeadBundles from "./pages/SeedLeadBundles";
import LeadPricing from "./pages/admin/LeadPricing";
import WalletPage from "./pages/vendor/WalletPage";
import LeadsMarketplace from "./pages/vendor/LeadsMarketplace";
import LeadBundles from "./pages/vendor/LeadBundles";
import Signup from "./pages/Signup";
import PublicRoute from "./components/public-route";
import { Toaster } from "./components/ui/sonner";
import AdminOnly from "./components/AdminOnly";
import AdminVenuePackages from "./pages/admin/packages/AdminVenuePackages";
import AdminServicePackages from "./pages/admin/packages/AdminServicePackages";
import VenueCategories from "./pages/admin/categories/VenueCategories";
import AddVenueCategory from "./pages/admin/categories/AddVenueCategory";
import ServiceCategories from "./pages/admin/categories/ServiceCategories";
import AddServiceCategory from "./pages/admin/categories/AddServiceCategory";
import ServiceSubCategories from "./pages/admin/categories/ServiceSubCategories";
import AddServiceSubCategory from "./pages/admin/categories/AddServiceSubCategory";
import MyBlogs from "./pages/vendor/blogs/MyBlogs";
import BlogForm from "./pages/vendor/blogs/BlogForm";

function App() {
  return (
    <>
      <Routes>
        <Route
          element={
            <Protected authentication={true}>
              <Admin />
            </Protected>
          }
        >
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<VendorProfile />} />
          <Route path="/wallet" element={<WalletPage />} />
          <Route path="/leads/marketplace" element={<LeadsMarketplace />} />
          <Route path="/leads/bundles" element={<LeadBundles />} />
          
          <Route path="/my-packages">
            <Route path="venues" element={<MyVenuePackages />} />
            <Route path="venues/edit/:id" element={<EditVenuePackage />} />
            <Route path="services" element={<MyServicePackages />} />
            <Route path="services/edit/:id" element={<EditServicePackage />} />
            <Route path="add" element={<AddPackageSelection />} />
            <Route path="add/venue" element={<AddVenuePackage />} />
            <Route path="add/service" element={<AddServicePackage />} />
          </Route>
          <Route path="/my-reviews" element={<div>My Reviews</div>} />

          <Route path="/my-blogs" element={<MyBlogs />} />
          <Route path="/my-blogs/create" element={<BlogForm />} />
          <Route path="/my-blogs/edit/:id" element={<BlogForm />} />

          {/* ADMIN ONLY ROUTES */}
          <Route element={<AdminOnly />}>
            <Route path="/seed" element={<SeedData />} />
            <Route path="/seed-leads" element={<SeedLeads />} />
            <Route path="/seed-bundles" element={<SeedLeadBundles />} />
            <Route path="/lead-pricing" element={<LeadPricing />} />
            <Route path="vendors">
              <Route path="all" element={<AllVendors />} />
            </Route>

            {/* Venues Management */}
            <Route path="venues">
              <Route path="categories" element={<VenueCategories />} />
              <Route path="categories/add" element={<AddVenueCategory />} />
              <Route path="categories/edit/:id" element={<AddVenueCategory />} />
              <Route path="packages">
                <Route path="approved" element={<AdminVenuePackages status="approved" />} />
                <Route path="pending" element={<AdminVenuePackages status="pending" />} />
                <Route path="hidden" element={<AdminVenuePackages status="private" />} />
              </Route>
              <Route path="reviews" element={<div>Reviews</div>} />
            </Route>

            {/* Services Management */}
            <Route path="services">
              <Route path="categories" element={<ServiceCategories />} />
              <Route path="categories/add" element={<AddServiceCategory />} />
              <Route path="categories/edit/:id" element={<AddServiceCategory />} />
              <Route path="subcategories" element={<ServiceSubCategories />} />
              <Route path="subcategories/add" element={<AddServiceSubCategory />} />
              <Route path="subcategories/edit/:id" element={<AddServiceSubCategory />} />
              <Route path="packages">
                <Route path="approved" element={<AdminServicePackages status="approved" />} />
                <Route path="pending" element={<AdminServicePackages status="pending" />} />
                <Route path="hidden" element={<AdminServicePackages status="private" />} />
              </Route>
            </Route>
          </Route>

        </Route>
        
        {/* Standard Login - Redirects if already logged in */}
        <Route path="/login" element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        } />

        {/* Signup Route - Redirects if logged in unless explicitly adding account */}
        <Route path="/signup" element={
          <PublicRoute>
            <Signup />
          </PublicRoute>
        } />

        {/* Add Account - Allows login even if already authenticated */}
        <Route path="/add-account" element={<LoginPage />} />
        
        {/* Add Account Signup - Allows signup even if already authenticated */}
        <Route path="/add-account/signup" element={
          <PublicRoute allowAuthenticated={true}>
            <Signup />
          </PublicRoute>
        } />
      </Routes>
      <Toaster />
    </>
  );
}

export default App;