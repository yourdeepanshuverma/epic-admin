import {
  IconBriefcase,
  IconBuildingBank,
  IconCamera,
  IconFileAi,
  IconFileDescription,
  IconHeartHandshake,
  IconLayoutDashboard,
  IconLocation,
  IconUser,
  IconWallet,
  IconTicket,
} from "@tabler/icons-react";

import { NavMain } from "./nav-main";
import { NavUser } from "./nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "./ui/sidebar";
import { Link } from "react-router";
import { useSelector } from "react-redux";
import { selectCurrentRole, selectCurrentUser } from "../store/slices/authSlice";

const adminNavMain = [
  {
    title: "Dashboard",
    icon: IconLayoutDashboard,
    href: "/dashboard",
  },

  {
    title: "Vendors",
    icon: IconUser,
    children: [
      { title: "All Vendors", href: "/vendors/all" },
      { title: "Pending Approval", href: "/vendors/pending" },
      { title: "Approved", href: "/vendors/approved" },
      { title: "Rejected", href: "/vendors/rejected" },
      {
        title: "Vendor Packages",
        children: [
          { title: "Venue Packages", href: "/vendors/packages/venues" },
          { title: "Service Packages", href: "/vendors/packages/services" },
        ],
      },
    ],
  },

  {
    title: "Venues",
    icon: IconBuildingBank,
    children: [
      {
        title: "Categories",
        children: [
          { title: "All Categories", href: "/venues/categories" },
          { title: "Add New", href: "/venues/categories/add" },
        ],
      },
      {
        title: "Venue Packages",
        children: [
          { title: "Approved", href: "/venues/packages/approved" },
          { title: "Pending", href: "/venues/packages/pending" },
          { title: "Private/Hidden", href: "/venues/packages/hidden" },
        ],
      },
      { title: "Reviews", href: "/venues/reviews" },
    ],
  },

  {
    title: "Services",
    icon: IconBriefcase,
    children: [
      {
        title: "Categories",
        children: [
          { title: "All Categories", href: "/services/categories" },
          { title: "Add Category", href: "/services/categories/add" },
        ],
      },
      {
        title: "Sub Categories",
        children: [
          { title: "All Sub Categories", href: "/services/subcategories" },
          { title: "Add Sub Category", href: "/services/subcategories/add" },
        ],
      },
      {
        title: "Service Packages",
        children: [
          { title: "Approved", href: "/services/packages/approved" },
          { title: "Pending", href: "/services/packages/pending" },
          { title: "Hidden", href: "/services/packages/hidden" },
        ],
      },
    ],
  },

  {
    title: "Lead Pricing",
    icon: IconTicket,
    href: "/lead-pricing",
  },
  {
    title: "My Packages",
    icon: IconBriefcase,
    children: [
      { title: "Venue Packages", href: "/my-packages/venues" },
      { title: "Service Packages", href: "/my-packages/services" },
      { title: "Add New Package", href: "/my-packages/add" },
    ],
  },
  {
    title: "My Blogs",
    icon: IconFileDescription,
    href: "/my-blogs",
  },
];

const vendorNavMain = [
  {
    title: "Dashboard",
    icon: IconLayoutDashboard,
    href: "/dashboard",
  },
  {
    title: "My Wallet",
    icon: IconWallet,
    href: "/wallet",
  },
  {
    title: "Leads",
    icon: IconTicket,
    children: [
      { title: "Marketplace", href: "/leads/marketplace" },
      { title: "Lead Bundles", href: "/leads/bundles" },
    ],
  },
  {
    title: "My Packages",
    icon: IconBriefcase,
    children: [
      { title: "Venue Packages", href: "/my-packages/venues" },
      { title: "Service Packages", href: "/my-packages/services" },
      { title: "Add New Package", href: "/my-packages/add" },
    ],
  },
   {
    title: "My Blogs",
    icon: IconFileDescription,
    href: "/my-blogs",
  },
   {
    title: "Reviews",
    icon: IconHeartHandshake,
    href: "/my-reviews",
  },
];

export function AppSidebar({ ...props }) {
  const user = useSelector(selectCurrentUser);
  const role = useSelector(selectCurrentRole);

  const navMain = role === "admin" ? adminNavMain : vendorNavMain;
  
  const userData = {
    name: user?.vendorName || user?.fullName || "User",
    email: user?.email || "",
    avatar: user?.profile?.url || "/avatars/default.jpg",
  };

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
              tooltip="Reload"
              size="lg"
            >
              <Link href="#" className="flex items-center gap-2">
                <IconHeartHandshake className="size-10!" />
                <span className="text-2xl font-bold">Epic</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
