import React from "react";
import {
  useGetBundlesQuery,
  useBuyBundleMutation,
  useGetWalletBalanceQuery,
} from "../../store/api/leadApi";
import { useDispatch } from "react-redux";
import { updateUserStats } from "../../store/slices/authSlice";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
  CardDescription,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { toast } from "sonner";
import { IconPackage, IconCheck } from "@tabler/icons-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../../components/ui/alert-dialog";

const BundleCard = ({ bundle, onBuy, isBuying, walletBalance }) => (
  <Card className="border-primary/10 hover:border-primary group relative flex h-full flex-col justify-between overflow-hidden border-2 bg-white shadow-sm transition-all hover:shadow-md">
    <div className="absolute top-0 right-0 p-2">
      <IconPackage
        size={60}
        className="text-primary/5 -rotate-12 transition-transform duration-500 group-hover:rotate-0"
      />
    </div>
    <CardHeader className="pb-4">
      <Badge className="bg-primary mb-3 w-fit text-[10px] font-black tracking-wider text-white uppercase">
        {bundle.credits} {bundle.name.split(" ")[0]} Credits
      </Badge>
      <CardTitle className="text-2xl leading-tight font-black tracking-tight">
        {bundle.name}
      </CardTitle>
      <div className="mt-2 flex items-baseline gap-1">
        <span className="text-primary text-3xl font-black">
          ₹{bundle.price.toLocaleString()}
        </span>
        <span className="text-muted-foreground text-[10px] font-bold uppercase">
          Inc. GST
        </span>
      </div>
    </CardHeader>
    <CardContent className="space-y-4">
      <p className="text-muted-foreground text-sm leading-relaxed">
        Unlock high-intent business leads instantly across all categories using
        these credits.
      </p>
      <div className="space-y-2">
        <div className="text-foreground/80 flex items-center gap-2 text-xs font-medium">
          <IconCheck size={14} className="text-green-600" /> No Expiry Date
        </div>
        <div className="text-foreground/80 flex items-center gap-2 text-xs font-medium">
          <IconCheck size={14} className="text-green-600" /> Instant Activation
        </div>
      </div>
    </CardContent>
    <CardFooter className="pt-2">
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant={walletBalance < bundle.price ? "secondary" : "default"}
            size="lg"
            className="h-12 w-full text-xs font-black tracking-widest uppercase"
            disabled={isBuying || walletBalance < bundle.price}
          >
            {walletBalance < bundle.price
              ? "Insufficient Wallet Balance"
              : "Purchase Package"}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Boost Your Lead Flow!</AlertDialogTitle>
            <AlertDialogDescription>
              Excellent choice! You’re about to add <strong>{bundle.name}</strong> to your account for{" "}
              <strong>₹{bundle.price.toLocaleString()}</strong>. 🎉
              <br />
              <br />
              This will instantly give you access to more high-quality business leads.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Not Now</AlertDialogCancel>
            <AlertDialogAction onClick={() => onBuy(bundle._id)}>
              Yes, Activate Now!
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </CardFooter>
  </Card>
);

const LeadBundles = () => {
  const { data: bundlesData, isLoading: isBundlesLoading } =
    useGetBundlesQuery();
  const { data: balanceData } = useGetWalletBalanceQuery();
  const [buyBundle, { isLoading: isBuyingBundle }] = useBuyBundleMutation();
  const dispatch = useDispatch();

  const handleBuyBundle = async (bundleId) => {
    try {
      const res = await buyBundle(bundleId).unwrap();

      if (res.data?.leadCredits || res.data?.walletBalance !== undefined) {
        dispatch(
          updateUserStats({
            leadCredits: res.data.leadCredits,
            walletBalance: res.data.walletBalance,
          }),
        );
      }

      toast.success("Package purchased successfully!");
    } catch (error) {
      toast.error(error?.data?.message || "Failed to buy bundle");
    }
  };

  if (isBundlesLoading)
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-primary animate-pulse font-black uppercase">
          Loading Packages...
        </p>
      </div>
    );

  const walletBalance = balanceData?.data?.balance || 0;

  return (
    <div className="mx-auto w-full space-y-10 px-2 pb-20 sm:px-6 lg:px-8">
      <div className="flex flex-col items-start justify-between gap-6 border-b pb-8 lg:flex-row lg:items-center">
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tighter uppercase">
            Credit Packages
          </h1>
          <p className="text-muted-foreground text-lg font-semibold">
            Scale your business with high-quality targeted leads.
          </p>
        </div>
        <Card className="bg-primary/5 border-primary/10 flex items-center gap-8 rounded-[2rem] px-8 py-4 shadow-sm">
          <div className="text-right">
            <p className="text-primary text-[10px] font-black tracking-widest uppercase">
              Available Funds
            </p>
            <p className="text-3xl font-black">
              ₹{walletBalance.toLocaleString()}
            </p>
          </div>
          <Button
            size="lg"
            className="h-11 rounded-2xl px-6 text-xs font-black uppercase"
            asChild
          >
            <a href="/wallet">Add Money</a>
          </Button>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {bundlesData?.data?.map((bundle) => (
          <BundleCard
            key={bundle._id}
            bundle={bundle}
            onBuy={handleBuyBundle}
            isBuying={isBuyingBundle}
            walletBalance={walletBalance}
          />
        ))}
        {(!bundlesData?.data || bundlesData?.data?.length === 0) && (
          <div className="bg-muted/20 col-span-full flex flex-col items-center justify-center gap-4 rounded-3xl border-2 border-dashed py-20">
            <IconPackage size={48} className="text-muted-foreground/30" />
            <p className="text-muted-foreground font-bold">
              No active packages available right now.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeadBundles;
