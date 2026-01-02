import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import { SidebarTrigger } from "./ui/sidebar";
import { ExternalLinkIcon } from "lucide-react";
import { useSelector } from "react-redux";
import { selectCurrentUser, selectCurrentRole } from "../store/slices/authSlice";
import { useGetWalletBalanceQuery } from "../store/api/leadApi";
import { IconWallet, IconTicket, IconCurrencyRupee } from "@tabler/icons-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { Link } from "react-router";

export function SiteHeader() {
  const user = useSelector(selectCurrentUser);
  const role = useSelector(selectCurrentRole);
  const { data: balanceData } = useGetWalletBalanceQuery(undefined, {
    skip: role !== "vendor",
  });

  // Prioritize local user state (updated optimistically) over server query
  const walletBalance = user?.wallet?.balance ?? balanceData?.data?.balance ?? 0;
  const totalCredits = user?.leadCredits || 0;

  return (
    <header className="sticky top-0 z-50 flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height) bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        
        {role === "vendor" && (
          <div className="flex items-center gap-4 ml-2">
            {/* Wallet Display */}
            <Link to="/wallet">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 text-green-700 rounded-full border border-green-500/20 hover:bg-green-500/20 transition-colors cursor-pointer">
                <IconWallet size={16} className="font-bold" />
                <span className="text-xs font-black flex items-center tracking-tighter">
                  ₹{walletBalance.toLocaleString()}
                </span>
              </div>
            </Link>

            {/* Universal Credits Display */}
            <Link to="/leads/bundles">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-full border border-primary/20 hover:bg-primary/20 transition-colors cursor-pointer">
                <IconTicket size={16} className="font-bold" />
                <span className="text-xs font-black tracking-tighter">
                  {totalCredits.toLocaleString()} CREDITS
                </span>
              </div>
            </Link>
          </div>
        )}

        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="outline"
            asChild
            size="sm"
            className="hidden sm:flex rounded-full border-2 font-bold text-xs uppercase tracking-tighter"
          >
            <a
              href="https://epicsite.successsign.co.in"
              rel="noopener noreferrer"
              target="_blank"
            >
              View Website <ExternalLinkIcon className="ml-1 size-3" />
            </a>
          </Button>
        </div>
      </div>
    </header>
  );
}
