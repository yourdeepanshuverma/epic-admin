import {
  IconCreditCard,
  IconDotsVertical,
  IconLogout,
  IconNotification,
  IconUserCircle,
  IconPlus,
  IconSwitchHorizontal,
  IconUser,
} from "@tabler/icons-react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { useDispatch, useSelector } from "react-redux"
import { logout, selectAvailableAccounts, switchAccount } from "@/store/slices/authSlice"
import { useNavigate } from "react-router"
import { vendorApi } from "@/store/api/vendorApi"
import { leadApi } from "@/store/api/leadApi"
import { adminApi } from "@/store/api/adminApi"

import { toast } from "sonner";

export function NavUser({
  user
}) {
  const { isMobile } = useSidebar()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const availableAccounts = useSelector(selectAvailableAccounts);

  const otherAccounts = availableAccounts.filter(acc => acc.user._id !== user?._id);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const handleSwitchAccount = async (targetUserId) => {
      // 1. Clear Cache
      dispatch(vendorApi.util.resetApiState());
      dispatch(leadApi.util.resetApiState());
      dispatch(adminApi.util.resetApiState());
      
      // 2. Switch User
      dispatch(switchAccount(targetUserId));
      toast.success("Account switched successfully");
  };

  const handleAddAccount = () => {
      navigate("/add-account");
  };

  const avatarUrl = user?.profile?.url || "/avatars/default.jpg";
  const displayName = user?.vendorName || user?.fullName || "User";

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
              <Avatar className="h-8 w-8 rounded-lg grayscale">
                <AvatarImage src={avatarUrl} alt={displayName} />
                <AvatarFallback className="rounded-lg">CN</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{displayName}</span>
                <span className="text-muted-foreground truncate text-xs">
                  {user?.email}
                </span>
              </div>
              <IconDotsVertical className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}>
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={avatarUrl} alt={displayName} />
                  <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{displayName}</span>
                  <span className="text-muted-foreground truncate text-xs">
                    {user?.email}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            
            {/* SWITCH ACCOUNT SECTION */}
            {otherAccounts.length > 0 && (
                <>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel className="text-xs text-muted-foreground uppercase tracking-wider font-bold px-2 py-1">
                        Switch Account
                    </DropdownMenuLabel>
                    <DropdownMenuGroup>
                        {otherAccounts.map((account) => (
                            <DropdownMenuItem key={account.user._id} onClick={() => handleSwitchAccount(account.user._id)}>
                                <Avatar className="h-6 w-6 rounded-md mr-2">
                                    <AvatarImage src={account.user?.profile?.url} />
                                    <AvatarFallback className="text-[10px]">{account.user.vendorName?.[0] || "U"}</AvatarFallback>
                                </Avatar>
                                <span className="truncate flex-1">{account.user.vendorName || account.user.name}</span>
                                <IconSwitchHorizontal className="size-4 text-muted-foreground" />
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuGroup>
                </>
            )}

            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={handleAddAccount}>
                <IconPlus className="mr-2" />
                Add another account
              </DropdownMenuItem>
            </DropdownMenuGroup>
            
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => navigate("/profile")}>
                <IconUserCircle />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <IconCreditCard />
                Billing
              </DropdownMenuItem>
              <DropdownMenuItem>
                <IconNotification />
                Notifications
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
              <IconLogout />
              Log out {user.name}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
