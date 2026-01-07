import React, { useState, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateServiceMutation } from "../store/api/adminApi";
import { toast } from "sonner";
import { Loader2, Plus, Search } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export function AddServiceDialog({ trigger }) {
  const [open, setOpen] = useState(false);
  const [createService, { isLoading }] = useCreateServiceMutation();
  const { register, handleSubmit, reset, setValue, control, watch } = useForm({
    defaultValues: {
      type: "text",
      icon: "",
    },
  });

  const selectedIcon = watch("icon");

  const onSubmit = async (data) => {
    try {
      await createService(data).unwrap();
      toast.success("Service created successfully");
      reset();
      setOpen(false);
    } catch (error) {
      toast.error(error?.data?.message || "Failed to create service");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="w-full">
            <Plus className="mr-2 h-4 w-4" /> Create New Service
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Service Field</DialogTitle>
          <DialogDescription>
            Create a new service field that vendors can fill out.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Service Name</Label>
            <Input
              id="name"
              placeholder="e.g. Valet Parking"
              {...register("name", { required: true })}
            />
          </div>
          
          <div className="space-y-2">
            <Label>Icon</Label>
            <Controller
              name="icon"
              control={control}
              render={({ field }) => (
                <IconPicker 
                  value={field.value} 
                  onChange={field.onChange} 
                />
              )}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Input Type</Label>
            <Select onValueChange={(val) => setValue("type", val)} defaultValue="text">
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">Text (Single Line)</SelectItem>
                <SelectItem value="textarea">Textarea (Multi Line)</SelectItem>
                <SelectItem value="number">Number</SelectItem>
                <SelectItem value="checkbox">Checkbox (Yes/No)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Service
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function IconPicker({ value, onChange }) {
  const [search, setSearch] = useState("");
  
  // Filter icons based on search
  const iconList = useMemo(() => {
    const allIcons = Object.keys(LucideIcons).filter(key => key !== "icons" && key !== "createLucideIcon" && isNaN(key));
    if (!search) return allIcons.slice(0, 60); // Show top 60 initially for performance
    return allIcons
      .filter((name) => name.toLowerCase().includes(search.toLowerCase()))
      .slice(0, 60); // Limit results
  }, [search]);

  // Render the selected icon component dynamically
  const SelectedIconComponent = value && LucideIcons[value] ? LucideIcons[value] : null;

  return (
    <div className="space-y-2 border rounded-md p-3">
      <div className="flex items-center gap-2 mb-2">
        <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
                placeholder="Search icons (e.g. wifi, car)..." 
                className="pl-8 h-9" 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />
        </div>
        {value && (
             <div className="flex items-center gap-2 border px-2 py-1 rounded bg-secondary/20">
                <span className="text-xs text-muted-foreground">Selected:</span>
                {SelectedIconComponent && <SelectedIconComponent className="h-4 w-4" />}
                <span className="text-sm font-medium">{value}</span>
                <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon" 
                    className="h-4 w-4 ml-1" 
                    onClick={() => onChange("")}
                >
                    <span className="sr-only">Clear</span>
                    &times;
                </Button>
             </div>
        )}
      </div>
      
      <ScrollArea className="h-[200px]">
        <div className="grid grid-cols-6 gap-2 p-1">
            {iconList.map((iconName) => {
                const Icon = LucideIcons[iconName];
                if (!Icon) return null;
                const isSelected = value === iconName;

                return (
                    <button
                        key={iconName}
                        type="button"
                        onClick={() => onChange(iconName)}
                        className={cn(
                            "flex flex-col items-center justify-center p-2 rounded-md hover:bg-secondary transition-colors gap-1 h-16 w-full border border-transparent",
                            isSelected ? "bg-primary text-primary-foreground hover:bg-primary/90 border-primary" : "bg-background"
                        )}
                        title={iconName}
                    >
                        <Icon className="h-5 w-5" />
                        <span className="text-[10px] truncate w-full text-center">{iconName}</span>
                    </button>
                );
            })}
            {iconList.length === 0 && (
                <div className="col-span-6 text-center text-sm text-muted-foreground py-8">
                    No icons found.
                </div>
            )}
        </div>
      </ScrollArea>
    </div>
  );
}