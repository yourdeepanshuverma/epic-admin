import React, { useState, useEffect } from "react";
import { useGetSystemSettingQuery, useUpdateSystemSettingMutation } from "../../store/api/adminApi";
import { Card, CardContent, CardHeader } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { toast } from "sonner";
import { 
    IconSettings, 
    IconCurrencyRupee, 
    IconTicket, 
    IconDeviceFloppy, 
    IconPlus, 
    IconTrash,
    IconPalette,
    IconUsers,
    IconMoneybag
} from "@tabler/icons-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";

const LeadPricing = () => {
  const { data: pricingData, isLoading } = useGetSystemSettingQuery("lead_costs");
  const [updatePricing, { isLoading: isUpdating }] = useUpdateSystemSettingMutation();

  const [costs, setCosts] = useState({});
  const [newTierOpen, setNewTierOpen] = useState(false);
  const [newTierData, setNewTierData] = useState({ key: "", label: "", color: "slate" });

  const predefinedKeys = [
      { key: "standard", label: "Standard" },
      { key: "premium", label: "Premium" },
      { key: "elite", label: "Elite" },
      { key: "bronze", label: "Bronze" },
      { key: "silver", label: "Silver" },
      { key: "gold", label: "Gold" },
      { key: "platinum", label: "Platinum" },
      { key: "diamond", label: "Diamond" },
  ];

  useEffect(() => {
    if (pricingData?.data) {
        // Ensure legacy data is normalized
        const normalized = {};
        Object.keys(pricingData.data).forEach(key => {
            const val = pricingData.data[key];
            if (typeof val === 'number') {
                normalized[key] = { 
                    label: key.charAt(0).toUpperCase() + key.slice(1), 
                    credits: val, 
                    amount: val * 10, 
                    minBudget: 0,
                    minGuests: 0,
                    color: "slate",
                    description: "Standard tier" 
                };
            } else {
                normalized[key] = {
                    ...val,
                    // Ensure new fields exist
                    minBudget: val.minBudget || 0,
                    minGuests: val.minGuests || 0
                };
            }
        });
        setCosts(normalized);
    }
  }, [pricingData]);

  const handleChange = (key, field, value) => {
    setCosts(prev => ({
      ...prev,
      [key]: {
          ...prev[key],
          [field]: ['credits', 'amount', 'minBudget', 'minGuests'].includes(field) ? Number(value) : value
      }
    }));
  };

  const handleDelete = (key) => {
      const newCosts = { ...costs };
      delete newCosts[key];
      setCosts(newCosts);
  };

  const handleAddTier = () => {
      if (!newTierData.key || !newTierData.label) {
          toast.error("Key and Label are required");
          return;
      }
      
      if (costs[newTierData.key]) {
          toast.error("Tier key already exists");
          return;
      }

      setCosts(prev => ({
          ...prev,
          [newTierData.key]: {
              label: newTierData.label,
              credits: 10,
              amount: 100,
              minBudget: 0,
              minGuests: 0,
              color: newTierData.color,
              description: "New tier description"
          }
      }));
      setNewTierOpen(false);
      setNewTierData({ key: "", label: "", color: "slate" });
      toast.success("New tier added!");
  };

  const handleSave = async () => {
    try {
      await updatePricing({ key: "lead_costs", value: costs }).unwrap();
      toast.success("Lead pricing updated successfully!");
    } catch (error) {
      toast.error(error?.data?.message || "Failed to update pricing");
    }
  };

  const colorOptions = [
      { value: "slate", label: "Slate (Default)", class: "bg-slate-100 text-slate-700 border-slate-200" },
      { value: "blue", label: "Blue", class: "bg-blue-100 text-blue-700 border-blue-200" },
      { value: "purple", label: "Purple", class: "bg-purple-100 text-purple-700 border-purple-200" },
      { value: "amber", label: "Amber", class: "bg-amber-100 text-amber-700 border-amber-200" },
      { value: "green", label: "Green", class: "bg-green-100 text-green-700 border-green-200" },
      { value: "rose", label: "Rose", class: "bg-rose-100 text-rose-700 border-rose-200" },
      { value: "indigo", label: "Indigo", class: "bg-indigo-100 text-indigo-700 border-indigo-200" },
  ];

  const getColorClass = (colorName) => {
      return colorOptions.find(c => c.value === colorName)?.class || colorOptions[0].class;
  };

  if (isLoading) return <div className="p-10 text-center">Loading settings...</div>;

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <div className="flex justify-between items-end">
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tighter uppercase leading-none">Lead Pricing & Rules</h1>
          <p className="text-muted-foreground font-bold uppercase tracking-widest text-xs flex items-center gap-2">
            <IconSettings size={14} /> Configure Categories, Costs & Classification Rules
          </p>
        </div>
        <div className="flex gap-4">
            <Dialog open={newTierOpen} onOpenChange={setNewTierOpen}>
                <DialogTrigger asChild>
                    <Button variant="outline" className="rounded-2xl h-12 border-2 border-dashed font-bold uppercase text-xs">
                        <IconPlus className="mr-2" size={18} /> Add New Tier
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add New Pricing Tier</DialogTitle>
                        <DialogDescription>Define a new category for lead classification.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label>Tier Category</Label>
                            <Select 
                                value={newTierData.key} 
                                onValueChange={(val) => {
                                    const predefined = predefinedKeys.find(p => p.key === val);
                                    setNewTierData({
                                        ...newTierData, 
                                        key: val,
                                        label: predefined ? predefined.label : "" 
                                    });
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {predefinedKeys.filter(p => !costs[p.key]).map(p => (
                                        <SelectItem key={p.key} value={p.key}>
                                            {p.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label>Display Label</Label>
                            <Input 
                                placeholder="e.g. Platinum Plus" 
                                value={newTierData.label} 
                                onChange={(e) => setNewTierData({...newTierData, label: e.target.value})} 
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label>Color Theme</Label>
                            <Select 
                                value={newTierData.color} 
                                onValueChange={(val) => setNewTierData({...newTierData, color: val})}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {colorOptions.map(c => (
                                        <SelectItem key={c.value} value={c.value}>
                                            <div className="flex items-center gap-2">
                                                <div className={`w-3 h-3 rounded-full ${c.class.split(' ')[0].replace('bg-', 'bg-')}`}></div>
                                                {c.label}
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleAddTier} disabled={!newTierData.key}>Create Tier</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Button 
                onClick={handleSave} 
                disabled={isUpdating}
                className="rounded-2xl font-black uppercase text-xs px-8 h-12 shadow-lg shadow-primary/20"
            >
                {isUpdating ? "Saving..." : <><IconDeviceFloppy className="mr-2" size={18} /> Save Changes</>}
            </Button>
        </div>
      </div>

      {Object.keys(costs).length === 0 && (
          <div className="p-10 border-2 border-dashed rounded-3xl text-center text-muted-foreground">
              No pricing tiers configured. Add one to get started.
          </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Object.entries(costs)
            .map(([key, tier]) => (
            <Card key={key} className="rounded-[32px] border-2 overflow-hidden shadow-sm hover:border-primary/50 transition-colors group relative flex flex-col">
                <CardHeader className={`border-b pb-6 ${getColorClass(tier.color).split(' ')[0]} bg-opacity-20`}>
                    <div className="flex justify-between items-center">
                        <Badge className={`${getColorClass(tier.color)} font-black uppercase text-[10px]`}>
                            {tier.label || key}
                        </Badge>
                        <div className="flex items-center gap-2">
                            <IconTicket size={24} className="opacity-50" />
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-6 w-6 text-red-400 hover:text-red-600 hover:bg-red-50"
                                onClick={() => handleDelete(key)}
                            >
                                <IconTrash size={14} />
                            </Button>
                        </div>
                    </div>
                    <div className="mt-4">
                        <Label className="text-[10px] uppercase font-bold opacity-50">Display Name</Label>
                        <Input 
                            value={tier.label} 
                            onChange={(e) => handleChange(key, 'label', e.target.value)}
                            className="bg-transparent border-transparent hover:border-input focus:border-input px-0 h-auto text-xl font-black shadow-none -ml-1" 
                        />
                    </div>
                </CardHeader>
                <CardContent className="pt-6 space-y-6 flex-1">
                    {/* RULES SECTION */}
                    <div className="space-y-4 bg-muted/20 p-4 rounded-xl border border-dashed">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                            <IconSettings size={12} /> Classification Rules
                        </Label>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <Label className="text-[9px] uppercase font-bold text-muted-foreground">Min Budget (₹)</Label>
                                <div className="relative">
                                    <Input 
                                        type="number" 
                                        value={tier.minBudget === 0 ? "" : tier.minBudget} 
                                        onChange={(e) => handleChange(key, 'minBudget', e.target.value)}
                                        className="h-9 text-sm font-bold pl-7 bg-white"
                                        placeholder="0"
                                    />
                                    <IconMoneybag className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" size={12} />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-[9px] uppercase font-bold text-muted-foreground">Min Guests</Label>
                                <div className="relative">
                                    <Input 
                                        type="number" 
                                        value={tier.minGuests === 0 ? "" : tier.minGuests} 
                                        onChange={(e) => handleChange(key, 'minGuests', e.target.value)}
                                        className="h-9 text-sm font-bold pl-7 bg-white"
                                        placeholder="0"
                                    />
                                    <IconUsers className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" size={12} />
                                </div>
                            </div>
                        </div>
                        <p className="text-[10px] text-muted-foreground italic leading-tight">
                            Leads above ₹{tier.minBudget?.toLocaleString() || 0} or {tier.minGuests || 0} guests fall into this tier.
                        </p>
                    </div>

                    {/* PRICING SECTION */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Cost (Credits)</Label>
                            <div className="relative">
                                <Input 
                                    type="number" 
                                    value={tier.credits === 0 ? "" : tier.credits} 
                                    onChange={(e) => handleChange(key, 'credits', e.target.value)}
                                    className="h-12 rounded-xl border-2 text-lg font-black pl-10"
                                    placeholder="0"
                                />
                                <IconTicket className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Price (₹)</Label>
                            <div className="relative">
                                <Input 
                                    type="number" 
                                    value={tier.amount === 0 ? "" : tier.amount} 
                                    onChange={(e) => handleChange(key, 'amount', e.target.value)}
                                    className="h-12 rounded-xl border-2 text-lg font-black pl-10"
                                    placeholder="0"
                                />
                                <IconCurrencyRupee className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                            </div>
                        </div>
                    </div>
                    
                    {/* DETAILS SECTION */}
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Description</Label>
                            <div className="flex items-center gap-2">
                                <IconPalette size={12} className="text-muted-foreground" />
                                <select 
                                    value={tier.color || "slate"} 
                                    onChange={(e) => handleChange(key, 'color', e.target.value)}
                                    className="text-[10px] uppercase font-bold bg-transparent border-none outline-none cursor-pointer text-muted-foreground hover:text-foreground"
                                >
                                    {colorOptions.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                                </select>
                            </div>
                        </div>
                        <Input 
                            value={tier.description || ""} 
                            onChange={(e) => handleChange(key, 'description', e.target.value)}
                            className="text-xs text-muted-foreground font-medium italic bg-muted/30 border-dashed"
                            placeholder="Enter short description..."
                        />
                    </div>
                </CardContent>
            </Card>
        ))}
      </div>
    </div>
  );
};

export default LeadPricing;