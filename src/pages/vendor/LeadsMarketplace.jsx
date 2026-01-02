import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
    leadApi,
    useGetMarketplaceLeadsQuery,
    useGetMyLeadsQuery,
    useBuyLeadMutation,
    useGetWalletBalanceQuery,
    useGetLeadFiltersQuery
} from "../../store/api/leadApi";
import { useGetSystemSettingQuery } from "../../store/api/adminApi";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Checkbox } from "../../components/ui/checkbox";
import { Slider } from "../../components/ui/slider";
import { Label } from "../../components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { toast } from "sonner";
import { 
    IconMapPin, 
    IconCalendar, 
    IconCurrencyRupee, 
    IconLock, 
    IconCheck, 
    IconTicket, 
    IconFilter,
    IconTags,
    IconLoader
} from "@tabler/icons-react";
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
import { useSelector, useDispatch } from "react-redux";
import { selectCurrentUser, updateUserStats } from "../../store/slices/authSlice";

// --- LEAD CARD COMPONENT ---
const LeadCard = ({ lead, onBuy, walletBalance, leadCredits, leadCosts }) => {
  const [confirmation, setConfirmation] = useState(null); // null, 'credit', 'wallet'

  const leadTierKey = lead.category?.toLowerCase() || "standard";
  const tierConfig = leadCosts?.[leadTierKey] || leadCosts?.standard || { 
      label: "Standard", credits: 10, amount: 50, color: "slate" 
  };

  const creditCost = tierConfig.credits || 10;
  // Prioritize dynamic tier price (from Admin Settings) over the stored lead.price (which is often stale default 50)
  const walletCost = tierConfig.amount || lead.price || 50;

  // Helper to map color names to classes (matching Admin map)
  const getColorClass = (colorName) => {
      const colors = {
          slate: "bg-slate-100 text-slate-700 border-slate-200",
          blue: "bg-blue-100 text-blue-700 border-blue-200",
          purple: "bg-purple-100 text-purple-700 border-purple-200",
          amber: "bg-amber-100 text-amber-700 border-amber-200",
          green: "bg-green-100 text-green-700 border-green-200",
          rose: "bg-rose-100 text-rose-700 border-rose-200",
          indigo: "bg-indigo-100 text-indigo-700 border-indigo-200",
      };
      return colors[colorName] || colors.slate;
  };

  const tierColorClass = getColorClass(tierConfig.color || "slate");

  return (
    <Card className={`group transition-all hover:shadow-lg border-t-4 ${lead.isPurchased ? "border-t-green-500" : "border-t-primary"} bg-white rounded-2xl overflow-hidden`}>
      <CardHeader className="pb-2 space-y-1">
        <div className="flex justify-between items-start">
          <div className="flex gap-2">
            <Badge variant="secondary" className={`${tierColorClass} border font-black uppercase text-[9px] px-2 py-0`}>
                {tierConfig.label || leadTierKey}
            </Badge>
            <Badge variant="outline" className="bg-muted/50 font-black uppercase text-[9px] px-2 py-0 border-none">
                {lead.businessCategory || "General"}
            </Badge>
          </div>
          <span className="text-[10px] text-muted-foreground font-bold flex items-center gap-1">
            <IconCalendar size={12} />
            {new Date(lead.createdAt).toLocaleDateString()}
          </span>
        </div>
        <CardTitle className="text-xl font-black flex items-center gap-2 mt-2 tracking-tight">
          {lead.isPurchased ? lead.name : `${lead.businessCategory || "New Inquiry"}`}
        </CardTitle>
        <CardDescription className="flex items-center gap-1 text-xs font-bold text-muted-foreground">
            <IconMapPin size={14} className="text-primary" /> {lead.location?.city}, {lead.location?.state}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4 pt-2">
        <div className="grid grid-cols-2 gap-3 bg-muted/20 p-3 rounded-xl border border-dashed">
            <div className="space-y-0.5">
                <p className="text-[9px] uppercase text-muted-foreground font-black tracking-tight">Event Date</p>
                <p className="text-xs font-black">{new Date(lead.eventDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</p>
            </div>
            <div className="space-y-0.5 text-right">
                <p className="text-[9px] uppercase text-muted-foreground font-black tracking-tight">Guests</p>
                <p className="text-xs font-black flex items-center justify-end gap-1">{lead.guestCount}</p>
            </div>
            <div className="space-y-0.5">
                <p className="text-[9px] uppercase text-muted-foreground font-black tracking-tight">Budget</p>
                <p className="text-sm font-black text-primary">₹{lead.budget?.toLocaleString()}</p>
            </div>
            <div className="space-y-0.5 text-right">
                <p className="text-[9px] uppercase text-muted-foreground font-black tracking-tight">Lead Price</p>
                <p className="text-xs font-black">₹{walletCost}</p>
            </div>
        </div>

        <div className="space-y-1 bg-primary/5 p-2.5 rounded-xl border border-primary/10">
            <p className="text-[9px] uppercase text-primary font-black tracking-widest">Client Message</p>
            <p className="text-xs text-foreground/80 line-clamp-2 leading-relaxed italic font-medium">
                {lead.message ? `"${lead.message}"` : "Customer is looking for urgent event services. Tap to unlock details."}
            </p>
        </div>
        
        {lead.isPurchased ? (
            <div className="bg-green-500/10 p-3 rounded-xl border border-green-500/20 space-y-2 animate-in slide-in-from-bottom-2 duration-500">
                <div className="flex items-center gap-2 text-green-700 text-[10px] font-black uppercase tracking-wider">
                    <IconCheck size={14} /> Direct Contact Unlocked
                </div>
                <div className="grid gap-1.5">
                    <div className="flex justify-between items-center bg-white p-2 rounded-lg shadow-sm border border-green-100">
                        <span className="text-[10px] font-black text-muted-foreground uppercase">Phone</span>
                        <span className="text-sm font-black text-green-800 tracking-wider">{lead.phone}</span>
                    </div>
                    <div className="flex justify-between items-center bg-white p-2 rounded-lg shadow-sm border border-green-100">
                        <span className="text-[10px] font-black text-muted-foreground uppercase">Email</span>
                        <span className="text-xs font-black text-green-800">{lead.email}</span>
                    </div>
                    {lead.location?.fullAddress && (
                        <div className="flex justify-between items-start bg-white p-2 rounded-lg shadow-sm border border-green-100">
                            <span className="text-[10px] font-black text-muted-foreground uppercase whitespace-nowrap mr-2">Address</span>
                            <span className="text-xs font-black text-green-800 text-right">{lead.location.fullAddress}</span>
                        </div>
                    )}
                </div>
            </div>
        ) : (
            <div className="bg-muted/50 p-4 rounded-xl border border-dashed flex flex-col items-center justify-center gap-1.5 grayscale opacity-60">
                <IconLock size={24} className="text-muted-foreground" />
                <p className="text-[10px] uppercase font-black tracking-tighter">Information Masked</p>
            </div>
        )}
      </CardContent>

      <CardFooter className="pt-0">
        {!lead.isPurchased ? (
          <AlertDialog onOpenChange={(open) => !open && setConfirmation(null)}>
            <AlertDialogTrigger asChild>
              <Button className="w-full shadow-md font-black uppercase text-[10px] h-11 group rounded-xl" variant="default">
                Unlock Contact Details
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="rounded-3xl border-4">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-2xl font-black tracking-tighter uppercase">
                    {confirmation ? "Unlock Opportunity" : "Unlock Business Lead"}
                </AlertDialogTitle>
                <AlertDialogDescription className="font-bold">
                  {confirmation 
                    ? `Great choice! You are about to unlock this lead using ${confirmation === 'credit' ? `${creditCost} Credits` : 'your Wallet Balance'}. Ready to connect?`
                    : "Instantly reveal the customer's direct contact information and start your conversation."}
                </AlertDialogDescription>
              </AlertDialogHeader>
              
              {!confirmation ? (
                  <div className="grid gap-4 py-6">
                                    <div 
                                        className={`flex items-center justify-between p-5 border-2 rounded-2xl transition-all ${leadCredits >= creditCost ? "border-primary/20 hover:border-primary hover:bg-primary/5 cursor-pointer" : "opacity-40 grayscale cursor-not-allowed"}`}
                                        onClick={() => leadCredits >= creditCost && setConfirmation('credit')}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-primary text-white rounded-xl shadow-lg shadow-primary/20">
                                                <IconTicket size={24} />
                                            </div>
                                            <div>
                                                <p className="font-black text-base uppercase tracking-tight">Use Credits</p>
                                                <p className="text-xs text-muted-foreground font-bold">Available: {leadCredits || 0} Credits</p>
                                            </div>
                                        </div>
                                        <Badge className="bg-primary/10 text-primary border-primary/20 font-black text-sm px-3 py-1 rounded-lg">{creditCost} Credits</Badge>
                                    </div>
                    <div 
                        className={`flex items-center justify-between p-5 border-2 rounded-2xl transition-all ${walletBalance >= walletCost ? "border-green-500/20 hover:border-green-500 hover:bg-green-500/5 cursor-pointer" : "opacity-40 grayscale cursor-not-allowed"}`}
                        onClick={() => walletBalance >= walletCost && setConfirmation('wallet')}
                    >
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-green-500 text-white rounded-xl shadow-lg shadow-green-500/20">
                                <IconCurrencyRupee size={24} />
                            </div>
                            <div>
                                <p className="font-black text-base uppercase tracking-tight">Wallet Balance</p>
                                <p className="text-xs text-muted-foreground font-bold">Balance: ₹{walletBalance.toLocaleString()}</p>
                            </div>
                        </div>
                        <Badge className="bg-green-100 text-green-700 border-green-200 font-black text-sm px-3 py-1 rounded-lg">₹{walletCost}</Badge>
                    </div>
                  </div>
              ) : (
                  <div className="py-8 flex flex-col items-center gap-4 text-center">
                      <div className="w-16 h-16 rounded-full bg-muted/30 flex items-center justify-center">
                          {confirmation === 'credit' ? <IconTicket size={32} className="text-primary" /> : <IconCurrencyRupee size={32} className="text-green-600" />}
                      </div>
                      <div className="space-y-1">
                          <p className="font-black text-3xl tracking-tighter">
                              {confirmation === 'credit' ? `${creditCost} Credits` : walletCost.toLocaleString()}
                          </p>
                          <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">
                              will be deducted from your account
                          </p>
                      </div>
                  </div>
              )}

              <AlertDialogFooter className="sm:justify-center gap-2">
                {confirmation ? (
                    <Button 
                        variant="outline" 
                        className="rounded-xl font-black uppercase text-xs px-8 border-2" 
                        onClick={() => setConfirmation(null)}
                    >
                        Change Method
                    </Button>
                ) : (
                    <AlertDialogCancel className="rounded-xl font-black uppercase text-xs px-8 border-2" onClick={() => setConfirmation(null)}>
                        Not Now
                    </AlertDialogCancel>
                )}
                {confirmation && (
                    <AlertDialogAction 
                        className="rounded-xl font-black uppercase text-xs px-8" 
                        onClick={() => onBuy(lead._id, confirmation === 'credit')}
                    >
                        Yes, Unlock Now!
                    </AlertDialogAction>
                )}
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        ) : (
            <Button className="w-full bg-green-500/10 text-green-600 border-2 border-green-500/20 hover:bg-green-500/10 font-black uppercase text-[10px] h-11 rounded-xl" disabled>
                <IconCheck className="mr-2" size={18} /> Already Unlocked
            </Button>
        )}
      </CardFooter>
    </Card>
  );
};

// --- GENERIC LEAD FEED COMPONENT WITH INFINITE SCROLL ---
const LeadFeed = ({ 
    useQueryHook, 
    queryArgs, 
    filterFunc, 
    walletBalance, 
    leadCredits, 
    leadCosts,
    onBuy,
    emptyMessage,
    hookOptions = {} 
}) => {
    const [page, setPage] = useState(1);
    const [allLeads, setAllLeads] = useState([]);
    const [hasMore, setHasMore] = useState(true);
    const [isDelayedFetching, setIsDelayedFetching] = useState(false);

    const { data, isLoading, isFetching } = useQueryHook({ 
        page, 
        limit: 10, 
        ...queryArgs 
    }, { refetchOnMountOrArgChange: true, ...hookOptions });

    // Reset when queryArgs change (e.g. filters)
    useEffect(() => {
        setPage(1);
        setAllLeads([]);
        setHasMore(true);
    }, [JSON.stringify(queryArgs)]);

    // Append data
    useEffect(() => {
        if (data?.data?.leads) {
            if (page === 1) {
                setAllLeads(data.data.leads);
            } else {
                setAllLeads(prev => {
                    const newLeads = data.data.leads.filter(nl => !prev.find(pl => pl._id === nl._id));
                    return [...prev, ...newLeads];
                });
            }
            if (data.data.leads.length < 10) setHasMore(false);
        }
    }, [data, page]);

    // Apply client-side filters if needed (optional)
    const displayLeads = filterFunc ? allLeads.filter(filterFunc) : allLeads;

    // Infinite Scroll Observer
    const observer = useRef();
    const lastElementRef = useCallback(node => {
        if (isFetching || isDelayedFetching) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                setIsDelayedFetching(true);
                setTimeout(() => {
                   setPage(prev => prev + 1);
                   setIsDelayedFetching(false);
                }, 2000);
            }
        });
        if (node) observer.current.observe(node);
    }, [isFetching, hasMore, isDelayedFetching]);

    // Wrapper for onBuy to update local state immediately
    const handleLocalBuy = async (leadId, useCredits) => {
        const updatedLead = await onBuy(leadId, useCredits);
        if (updatedLead) {
            setAllLeads(prev => prev.map(l => 
                l._id === leadId 
                ? { ...l, ...updatedLead, isPurchased: true } // Merge new details (phone/email) and force purchased status
                : l
            ));
        }
    };

    if (isLoading && page === 1) return (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="font-black text-primary uppercase tracking-widest text-xs">Loading Leads...</p>
        </div>
    );

    if (!isLoading && displayLeads.length === 0) return (
        <div className="flex flex-col items-center justify-center py-32 border-4 border-dashed rounded-[40px] bg-muted/5 space-y-6">
            <div className="p-6 bg-white rounded-full shadow-xl shadow-muted">
                <IconTags size={48} className="text-muted-foreground/30" />
            </div>
            <div className="text-center space-y-2">
                <p className="text-2xl font-black uppercase tracking-tighter">No Leads Found</p>
                <p className="text-sm text-muted-foreground font-bold">{emptyMessage || "No leads available at the moment."}</p>
            </div>
        </div>
    );

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {displayLeads.map((lead, index) => {
                if (index === displayLeads.length - 1) {
                    return (
                        <div ref={lastElementRef} key={lead._id}>
                             <LeadCard 
                                lead={lead} 
                                onBuy={handleLocalBuy} 
                                walletBalance={walletBalance} 
                                leadCredits={leadCredits} 
                                leadCosts={leadCosts} 
                             />
                        </div>
                    );
                }
                return (
                    <LeadCard 
                        key={lead._id} 
                        lead={lead} 
                        onBuy={handleLocalBuy} 
                        walletBalance={walletBalance} 
                        leadCredits={leadCredits} 
                        leadCosts={leadCosts} 
                    />
                );
            })}
            {(isFetching || isDelayedFetching) && page > 1 && (
                <div className="col-span-full flex justify-center py-4">
                    <IconLoader className="animate-spin text-primary" />
                </div>
            )}
        </div>
    );
};

// --- MAIN PAGE COMPONENT ---
const LeadsMarketplace = () => {
  const user = useSelector(selectCurrentUser);
  const dispatch = useDispatch();
  const { data: balanceData } = useGetWalletBalanceQuery();
  const [buyLead] = useBuyLeadMutation();

  // FETCH FILTER OPTIONS (Distinct Business Categories)
  const { data: filterOptions } = useGetLeadFiltersQuery();
  const availableBizCats = filterOptions?.data?.categories || [];

  const [activeTab, setActiveTab] = useState("marketplace");

  const { data: leadCostsData } = useGetSystemSettingQuery("lead_costs");
  
  // Normalize leadCosts to ensure consistent object structure (handle legacy number values)
  const leadCosts = useMemo(() => {
      const rawData = leadCostsData?.data;
      if (!rawData) return { standard: { label: "Standard", credits: 10, amount: 50, color: "slate" } };
      
      const normalized = {};
      Object.keys(rawData).forEach(key => {
          const val = rawData[key];
          if (typeof val === 'number') {
              normalized[key] = { 
                  label: key.charAt(0).toUpperCase() + key.slice(1), 
                  credits: val, 
                  amount: 50, 
                  color: "slate" 
              };
          } else {
              normalized[key] = val;
          }
      });
      return normalized;
  }, [leadCostsData]);

  // Filters State (Dynamically initialize based on leadCosts keys if available)
  const [selectedTiers, setSelectedTiers] = useState({});
  const [selectedBizCats, setSelectedBizCats] = useState([]);
  const [budgetRange, setBudgetRange] = useState([0, 1000000]);
  const [showOnlyPurchased, setShowOnlyPurchased] = useState(false);
  const [cityFilter, setCityFilter] = useState("");

  // Initialize filters once costs are loaded
  useEffect(() => {
      if (Object.keys(leadCosts).length > 0 && Object.keys(selectedTiers).length === 0) {
          const initialTiers = {};
          Object.keys(leadCosts).forEach(key => initialTiers[key] = true);
          setSelectedTiers(initialTiers);
      }
  }, [leadCosts]);

  // Helper to extract filters for client-side (budget, tiers) 
  const clientFilter = (lead) => {
      const tier = lead.category?.toLowerCase() || "standard";
      const bizCat = lead.businessCategory;
      const matchesTier = selectedTiers[tier] !== false; // Default to true if key missing
      const matchesBizCat = selectedBizCats.length === 0 || selectedBizCats.includes(bizCat);
      const leadBudget = lead.budget || 0;
      const matchesBudget = leadBudget >= 0 && leadBudget <= budgetRange[1];
      const matchesCity = !cityFilter || (lead.location?.city || "").toLowerCase().includes(cityFilter.toLowerCase());
      
      return matchesTier && matchesBizCat && matchesBudget && matchesCity;
  };

  const handleBuyLead = async (leadId, useCredits) => {
    try {
      const res = await buyLead({ leadId, useCredits }).unwrap();
      
      // 1. Update Global Auth State (Redux)
      if (res.data?.leadCredits !== undefined || res.data?.walletBalance !== undefined) {
          dispatch(updateUserStats({
              leadCredits: res.data.leadCredits,
              walletBalance: res.data.walletBalance
          }));
      }

      // 2. Manually update Wallet Query Cache (prevents stale balance display)
      if (res.data?.walletBalance !== undefined) {
          dispatch(
            leadApi.util.updateQueryData('getWalletBalance', undefined, (draft) => {
              if (draft?.data) {
                draft.data.balance = res.data.walletBalance;
              }
            })
          );
      }

      toast.success("Lead unlocked successfully!");
      return res.data.lead; 
    } catch (error) {
      toast.error(error?.data?.message || "Failed to purchase lead");
      return null;
    }
  };

  const walletBalance = balanceData?.data?.balance || 0;
  const leadCredits = user?.leadCredits || 0;

  const marketplaceQueryArgs = {
      city: cityFilter,
      businessCategory: selectedBizCats.length === 1 ? selectedBizCats[0] : undefined
  };

  return (
    <div className="w-full mx-auto pb-20 px-2 sm:px-6 lg:px-8">
      <div className="grid lg:grid-cols-12 gap-8 xl:gap-12 items-start relative">
          
          {/* MAIN CONTENT AREA */}
          <main className="lg:col-span-9 space-y-8">
              <div className="flex justify-between items-end pb-6 border-b-2 border-muted pt-4">
                  <div className="space-y-1">
                    <h2 className="text-4xl font-black tracking-tighter uppercase leading-none">
                        {activeTab === "marketplace" ? "Marketplace" : "My Leads"}
                    </h2>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" /> Live System
                    </p>
                  </div>
              </div>

              <Tabs defaultValue="marketplace" value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-8 bg-muted/50 p-1 rounded-2xl">
                      <TabsTrigger value="marketplace" className="rounded-xl font-bold uppercase text-xs py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm">Explore Marketplace</TabsTrigger>
                      <TabsTrigger value="purchased" className="rounded-xl font-bold uppercase text-xs py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm">Purchased Leads</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="marketplace" className="mt-0">
                      <LeadFeed 
                          useQueryHook={useGetMarketplaceLeadsQuery}
                          queryArgs={marketplaceQueryArgs} 
                          filterFunc={clientFilter}
                          walletBalance={walletBalance}
                          leadCredits={leadCredits}
                          leadCosts={leadCosts}
                          onBuy={handleBuyLead}
                          emptyMessage="No matching leads found in the marketplace."
                          hookOptions={{ refetchOnMountOrArgChange: 1 }}
                      />
                  </TabsContent>
                  
                  <TabsContent value="purchased" className="mt-0">
                      <LeadFeed 
                          useQueryHook={useGetMyLeadsQuery}
                          queryArgs={{}}
                          filterFunc={clientFilter}
                          walletBalance={walletBalance}
                          leadCredits={leadCredits}
                          leadCosts={leadCosts}
                          onBuy={handleBuyLead} // Already purchased, but prop needed
                          emptyMessage="You haven't purchased any leads yet."
                          hookOptions={{ refetchOnMountOrArgChange: 1 }}
                      />
                  </TabsContent>
              </Tabs>
          </main>

          {/* SIDEBAR FILTERS (Show for both tabs) */}
          <aside className="lg:col-span-3 sticky top-24 h-[calc(100vh-8rem)] overflow-y-auto pr-2 pb-10 hide-scrollbar">
                  <Card className="rounded-[32px] border-2 shadow-sm bg-white overflow-hidden">
                      <CardHeader className="pb-4 border-b bg-muted/20">
                          <CardTitle className="text-lg font-black flex items-center gap-2 tracking-tighter uppercase">
                              <IconFilter size={20} className="text-primary" /> {activeTab === "marketplace" ? "Search Filters" : "Filter My Leads"}
                          </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-10 pt-8 px-6">
                          
                          {/* City Filter */}
                          <div className="space-y-2">
                              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Location</Label>
                              <div className="relative">
                                  <IconMapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                                  <input 
                                      type="text" 
                                      placeholder="Search City (e.g. Indore)" 
                                      value={cityFilter}
                                      onChange={(e) => setCityFilter(e.target.value)}
                                      className="w-full pl-9 pr-4 py-2 text-sm font-bold border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                                  />
                              </div>
                          </div>

                          {/* Business Category Filter */}
                          {availableBizCats.length > 0 && (
                            <div className="space-y-4">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Service Type</Label>
                                <div className="space-y-3">
                                    {availableBizCats.map(cat => (
                                        <div key={cat} className="flex items-center justify-between group cursor-pointer p-2 rounded-xl hover:bg-muted/30 transition-colors" 
                                            onClick={() => {
                                                if (selectedBizCats.includes(cat)) {
                                                    setSelectedBizCats(prev => prev.filter(c => c !== cat));
                                                } else {
                                                    setSelectedBizCats(prev => [...prev, cat]);
                                                }
                                            }}
                                        >
                                            <div className="flex items-center space-x-3">
                                                <Checkbox id={cat} checked={selectedBizCats.includes(cat)} className="h-5 w-5 rounded-md" />
                                                <Label className="text-sm font-bold capitalize cursor-pointer tracking-tight">
                                                    {cat}
                                                </Label>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                          )}

                          {/* Budget Filter */}
                          <div className="space-y-5">
                              <div className="flex justify-between items-center">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Max Budget</Label>
                                <Badge className="bg-primary text-white font-black border-none rounded-lg px-2">₹{(budgetRange[1]/1000).toFixed(0)}K</Badge>
                              </div>
                              <Slider 
                                defaultValue={[0, 1000000]} 
                                max={1000000} 
                                step={10000} 
                                value={[budgetRange[1]]}
                                onValueChange={(val) => setBudgetRange([0, val[0]])}
                                className="py-2"
                              />
                              <div className="flex justify-between text-[9px] font-black text-muted-foreground uppercase tracking-tighter">
                                  <span>Low</span>
                                  <span>High (10L+)</span>
                              </div>
                          </div>

                          {/* Lead Tier Filter (Dynamic) */}
                          <div className="space-y-4">
                              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Inquiry Quality</Label>
                              <div className="space-y-3">
                                  {Object.keys(leadCosts).map(key => (
                                      <div key={key} className="flex items-center justify-between group cursor-pointer p-2 rounded-xl hover:bg-muted/30 transition-colors" onClick={() => setSelectedTiers(prev => ({ ...prev, [key]: !prev[key] }))}>
                                          <div className="flex items-center space-x-3">
                                              <Checkbox id={key} checked={selectedTiers[key] !== false} className="h-5 w-5 rounded-md" />
                                              <Label className="text-sm font-bold capitalize cursor-pointer tracking-tight">
                                                  {leadCosts[key].label || key}
                                              </Label>
                                          </div>
                                      </div>
                                  ))}
                              </div>
                          </div>
                          
                          <div className="pt-4">
                            <Button 
                                variant="ghost" 
                                className="w-full text-[10px] font-black text-muted-foreground uppercase underline hover:bg-transparent hover:text-primary transition-colors"
                                onClick={() => { 
                                    const resetTiers = {};
                                    Object.keys(leadCosts).forEach(k => resetTiers[k] = true);
                                    setSelectedTiers(resetTiers); 
                                    setSelectedBizCats([]); 
                                    setBudgetRange([0, 1000000]); 
                                    setShowOnlyPurchased(false); 
                                }}
                            >
                                Reset All Filters
                            </Button>
                          </div>
                      </CardContent>
                  </Card>
              </aside>
      </div>
    </div>
  );
};

export default LeadsMarketplace;
