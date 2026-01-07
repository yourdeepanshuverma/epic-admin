import React, { useState, useEffect } from "react";
import {
  useGetWalletBalanceQuery,
  useGetWalletTransactionsQuery,
} from "../../store/api/vendorApi";
import {
  useGetRazorpayKeyQuery,
  useCreateOrderMutation,
  useVerifyPaymentMutation,
} from "../../store/api/transactionApi";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import { toast } from "sonner";
import {
  IconWallet,
  IconCurrencyRupee,
  IconHistory,
} from "@tabler/icons-react";
import ReusableTable from "../../components/reusableTable";
import { Badge } from "../../components/ui/badge";
import { useSelector, useDispatch } from "react-redux";
import { selectCurrentUser, updateUserStats } from "../../store/slices/authSlice";

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const WalletPage = () => {
  const user = useSelector(selectCurrentUser);
  const dispatch = useDispatch();
  const {
    data: balanceData,
    isLoading: isBalanceLoading,
    refetch: refetchBalance,
  } = useGetWalletBalanceQuery();
  const { data: transactionsData, refetch: refetchTransactions } =
    useGetWalletTransactionsQuery();

  // Key Query
  const {
    data: keyResponse,
    isError: isKeyError,
    error: keyError,
  } = useGetRazorpayKeyQuery();
  const [createOrder, { isLoading: isCreatingOrder }] =
    useCreateOrderMutation();
  const [verifyPayment] = useVerifyPaymentMutation();

  const [amount, setAmount] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    loadRazorpayScript();
  }, []);

  const handlePayment = async () => {
    if (!amount || Number(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    console.log("Razorpay Key Response:", keyResponse);
    const razorKey = keyResponse?.data; // The key is inside the 'data' field of SuccessResponse

    if (!razorKey) {
      toast.error("Razorpay Key is missing! Check console.");
      console.error(
        "Full Key Error:",
        isKeyError ? keyError : "No key in response",
      );
      return;
    }

    const sdkLoaded = await loadRazorpayScript();
    if (!sdkLoaded) {
      toast.error("Razorpay SDK failed to load");
      return;
    }

    try {
      const orderRes = await createOrder(amount).unwrap();
      console.log("Order Res:", orderRes);

      const { id: order_id, currency, amount: order_amount } = orderRes.data;

      const options = {
        key: razorKey,
        amount: order_amount,
        currency: currency,
        name: "Epic Vendor Wallet",
        description: "Wallet Top-up",
        order_id: order_id,
        handler: async function (response) {
          try {
            const verifyRes = await verifyPayment({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
            }).unwrap();

            // Update local user wallet balance (for Header)
            if (verifyRes?.data?.updatedBalance !== undefined) {
               dispatch(updateUserStats({
                 walletBalance: verifyRes.data.updatedBalance
               }));
            }

            // Refetch data for this page
            refetchBalance();
            refetchTransactions();

            toast.success("Payment Successful!");
            setIsDialogOpen(false);
            setAmount("");
          } catch (error) {
            toast.error("Payment Verification Failed");
          }
        },
        prefill: {
          name: user?.vendorName || "",
          email: user?.email || "",
          contact: user?.phone || "",
        },
        theme: { color: "#0F172A" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      toast.error(error?.data?.message || "Payment Failed");
    }
  };

  const columns = [
    {
      accessorKey: "createdAt",
      header: "Date",
      cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString(),
    },
    {
      accessorKey: "orderId",
      header: "Transaction ID",
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => (
        <Badge
          variant={row.original.type === "credit" ? "success" : "destructive"}
        >
          {row.original.type.toUpperCase()}
        </Badge>
      ),
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ row }) => (
        <span
          className={
            row.original.type === "credit"
              ? "font-bold text-green-600"
              : "font-bold text-red-600"
          }
        >
          {row.original.type === "credit" ? "+" : "-"}₹{row.original.amount}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant="outline" className="capitalize">
          {row.original.status}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-8 px-4 pb-20">
      <h1 className="flex items-center gap-3 text-3xl font-black tracking-tighter uppercase">
        <div className="bg-primary rounded-xl p-2 text-white">
          <IconWallet size={28} />
        </div>
        My Wallet
      </h1>

      <div className="w-full">
        <Card className="overflow-hidden rounded-[2rem] border-2 shadow-sm">
          <CardHeader className="bg-muted/30 pb-8">
            <CardTitle className="text-muted-foreground text-xs font-black tracking-widest uppercase">
              Total Available Balance
            </CardTitle>
            <div className="flex items-center pt-2 text-6xl font-black tracking-tighter">
              <IconCurrencyRupee size={48} className="text-primary" />
              {isBalanceLoading
                ? "..."
                : balanceData?.data?.balance?.toLocaleString() || 0}
            </div>
          </CardHeader>
          <CardContent className="p-8">
            <div className="flex flex-col gap-4">
              <Label className="text-sm font-bold">Quick Top-up</Label>
              <div className="flex flex-wrap gap-3">
                {[500, 1000, 2000, 5000].map((val) => (
                  <Button
                    key={val}
                    variant={amount === val.toString() ? "default" : "outline"}
                    className="rounded-xl border-2 px-6 font-bold"
                    onClick={() => setAmount(val.toString())}
                  >
                    ₹{val}
                  </Button>
                ))}
              </div>
              <div className="mt-2 flex gap-3">
                <Input
                  type="number"
                  placeholder="Enter Custom Amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="h-12 rounded-xl border-2 text-lg font-bold"
                />
                <Button
                  className="shadow-primary/20 h-12 rounded-xl px-10 font-black tracking-widest uppercase shadow-lg"
                  onClick={handlePayment}
                  disabled={isCreatingOrder || !amount}
                >
                  {isCreatingOrder ? "Processing..." : "Add Funds"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h2 className="flex items-center gap-2 text-2xl font-black tracking-tight uppercase">
          <IconHistory className="text-primary" /> Transaction History
        </h2>
        <ReusableTable
          columns={columns}
          data={transactionsData?.data?.transactions || []}
        />
      </div>
    </div>
  );
};

export default WalletPage;
