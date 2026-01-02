import React, { useEffect, useState, useRef } from "react";
import { 
    useGetProfileQuery, 
    useUpdateVendorMutation,
    useSendPhoneUpdateOtpMutation,
    useVerifyPhoneUpdateOtpMutation
} from "../../store/api/vendorApi";
import { toast } from "sonner";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Separator } from "../../components/ui/separator";
import { Badge } from "../../components/ui/badge";
import { 
  IconBriefcase, 
  IconMapPin, 
  IconPhone, 
  IconMail, 
  IconBuildingStore, 
  IconUser,
  IconDeviceFloppy,
  IconWorld,
  IconCalendar,
  IconUsers,
  IconCamera,
  IconLock
} from "@tabler/icons-react";
import Spinner from "../../components/ui/spinner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "../../components/ui/input-otp";

const VendorProfile = () => {
  const { data: profileData, isLoading, refetch } = useGetProfileQuery();
  const [updateVendor, { isLoading: isUpdating }] = useUpdateVendorMutation();
  const [sendPhoneOtp, { isLoading: isSendingOtp }] = useSendPhoneUpdateOtpMutation();
  const [verifyPhoneOtp, { isLoading: isVerifyingOtp }] = useVerifyPhoneUpdateOtpMutation();
  
  const [activeTab, setActiveTab] = useState("general");
  const [formData, setFormData] = useState({
    vendorName: "",
    contactPerson: "",
    phone: "",
    website: "",
    experience: "",
    teamSize: "",
    workingSince: "",
    address: "",
    locality: "",
    city: "",
    pincode: "",
    googleMapLink: "",
  });

  const [initialPhone, setInitialPhone] = useState("");
  
  // OTP States
  const [showOtpDialog, setShowOtpDialog] = useState(false);
  const [otp, setOtp] = useState("");
  const [newPhoneToVerify, setNewPhoneToVerify] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  // Image States
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [coverImageFile, setCoverImageFile] = useState(null);
  const [profilePreview, setProfilePreview] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);

  const profileInputRef = useRef(null);
  const coverInputRef = useRef(null);

  // Handle read-only display data
  const vendor = profileData?.data;

  useEffect(() => {
    if (vendor) {
      setFormData({
        vendorName: vendor.vendorName || "",
        contactPerson: vendor.contactPerson || "",
        phone: vendor.phone || "",
        website: vendor.website || "",
        experience: vendor.experience || "",
        teamSize: vendor.teamSize || "",
        workingSince: vendor.workingSince || "",
        address: vendor.address || "",
        locality: vendor.locality || "",
        pincode: vendor.pincode || "",
        googleMapLink: vendor.googleMapLink || "",
      });
      setInitialPhone(vendor.phone || "");
      // Reset previews on data load
      setProfilePreview(vendor.profile?.url || null);
      setCoverPreview(vendor.coverImage?.url || null);
    }
  }, [vendor]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    if (type === "profile") {
        setProfileImageFile(file);
        setProfilePreview(URL.createObjectURL(file));
    } else {
        setCoverImageFile(file);
        setCoverPreview(URL.createObjectURL(file));
    }
  };

  const handleSendOtp = async () => {
      try {
          await sendPhoneOtp({ phone: newPhoneToVerify }).unwrap();
          setOtpSent(true);
          toast.success(`OTP sent to ${newPhoneToVerify}`);
      } catch (error) {
          toast.error(error?.data?.message || "Failed to send OTP");
      }
  };

  const handleVerifyOtp = async () => {
      try {
          await verifyPhoneOtp({ otp }).unwrap();
          toast.success("Phone number verified and updated!");
          setShowOtpDialog(false);
          setOtp("");
          setOtpSent(false);
          setInitialPhone(newPhoneToVerify); // Update initial phone so subsequent saves don't trigger OTP
          refetch(); // Refetch profile to get backend state
          
          // After phone update, continue saving other fields if any
          submitProfileUpdate(newPhoneToVerify);
      } catch (error) {
          toast.error(error?.data?.message || "Invalid OTP");
      }
  };

  const submitProfileUpdate = async (verifiedPhone = null) => {
    try {
      const submissionData = new FormData();

      // Append all text fields
      Object.keys(formData).forEach(key => {
          // If we just verified a phone, use that. 
          // Note: Backend might ignore 'phone' in updateVendor if we restricted it, 
          // but sending it keeps consistency. 
          // If we verified phone, it's already in DB.
          if (key === 'phone' && verifiedPhone) {
              submissionData.append(key, verifiedPhone);
          } else {
              submissionData.append(key, formData[key]);
          }
      });

      // Append images if changed
      if (profileImageFile) {
          submissionData.append("profile", profileImageFile);
      }
      if (coverImageFile) {
          submissionData.append("coverImage", coverImageFile);
      }

      await updateVendor({ id: vendor._id, data: submissionData }).unwrap();
      toast.success("Profile updated successfully!");
      refetch();
    } catch (error) {
      console.error(error);
      toast.error(error?.data?.message || "Failed to update profile");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check if phone number changed
    if (formData.phone !== initialPhone) {
        setNewPhoneToVerify(formData.phone);
        setShowOtpDialog(true);
        // Reset OTP state for new attempt
        setOtpSent(false);
        setOtp("");
        return; // Stop here, wait for OTP
    }

    // If phone didn't change, proceed with normal update
    submitProfileUpdate();
  };

  if (isLoading) return (
    <div className="flex h-[50vh] w-full items-center justify-center">
        <Spinner />
    </div>
  );

  return (
    <div className="container max-w-6xl mx-auto p-4 md:p-8 space-y-8">
      
      {/* HEADER / BANNER SECTION */}
      <div className="relative w-full">
        {/* Cover Image */}
        <div className="h-48 md:h-64 w-full rounded-2xl overflow-hidden bg-gradient-to-r from-blue-100 to-indigo-100 border relative group/cover">
            {coverPreview ? (
                <img 
                    src={coverPreview} 
                    alt="Cover" 
                    className="w-full h-full object-cover"
                />
            ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground/30">
                    <IconBuildingStore size={64} />
                </div>
            )}
            
            {/* Cover Upload Overlay */}
            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/cover:opacity-100 transition-opacity flex items-center justify-center">
                <Button variant="secondary" size="sm" onClick={() => coverInputRef.current.click()}>
                    <IconCamera className="mr-2 h-4 w-4" /> Change Cover
                </Button>
                <input 
                    type="file" 
                    ref={coverInputRef} 
                    className="hidden" 
                    accept="image/*"
                    onChange={(e) => handleImageChange(e, "cover")}
                />
            </div>
        </div>

        {/* Profile Stats / Info Card overlay */}
        <div className="relative px-6 -mt-16 md:-mt-20 flex flex-col md:flex-row items-start md:items-end gap-6">
             
             {/* Profile Avatar with Upload */}
             <div className="relative group/avatar">
                <Avatar className="h-32 w-32 md:h-40 md:w-40 border-4 border-background shadow-xl rounded-2xl cursor-pointer">
                    <AvatarImage src={profilePreview} className="object-cover" />
                    <AvatarFallback className="text-4xl bg-primary/10 text-primary">
                        {vendor?.vendorName?.[0]}
                    </AvatarFallback>
                </Avatar>
                
                {/* Avatar Upload Overlay */}
                <div 
                    className="absolute inset-0 rounded-2xl bg-black/40 opacity-0 group-hover/avatar:opacity-100 flex items-center justify-center transition-opacity cursor-pointer border-4 border-transparent"
                    onClick={() => profileInputRef.current.click()}
                >
                    <IconCamera className="text-white h-8 w-8" />
                </div>
                <input 
                    type="file" 
                    ref={profileInputRef} 
                    className="hidden" 
                    accept="image/*"
                    onChange={(e) => handleImageChange(e, "profile")}
                />
             </div>
             
             <div className="flex-1 pb-2">
                 <div className="bg-background/80 backdrop-blur-sm p-4 rounded-xl border shadow-sm inline-block md:min-w-[300px]">
                    <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
                        {vendor?.vendorName}
                        {vendor?.verifiedBadge && (
                            <Badge variant="default" className="bg-blue-500 hover:bg-blue-600 text-[10px] h-5 px-1.5">Verified</Badge>
                        )}
                    </h1>
                    <div className="text-muted-foreground text-sm flex flex-col gap-1 mt-1">
                        <div className="flex items-center gap-2">
                            <IconMail size={14} /> {vendor?.email}
                        </div>
                        <div className="flex items-center gap-2">
                            <IconBriefcase size={14} /> {vendor?.role === 'admin' ? 'Administrator' : 'Vendor Partner'}
                        </div>
                    </div>
                 </div>
             </div>

             <div className="hidden md:flex gap-2 pb-4">
                 <Button onClick={() => document.getElementById('profile-form-submit')?.click()} disabled={isUpdating}>
                    {isUpdating ? <Spinner className="mr-2 h-4 w-4" /> : <IconDeviceFloppy className="mr-2 h-4 w-4" />}
                    Save Changes
                 </Button>
             </div>
        </div>
      </div>

      {/* MAIN CONTENT TABS */}
      <Tabs defaultValue="general" className="w-full" onValueChange={setActiveTab}>
        <div className="flex flex-col md:flex-row gap-8">
            
            {/* Sidebar Navigation */}
            <aside className="w-full md:w-64 flex-shrink-0 space-y-4">
                <Card>
                    <CardContent className="p-4">
                        <TabsList className="flex flex-col h-auto w-full bg-transparent gap-1 p-0">
                            <TabsTrigger 
                                value="general" 
                                className="w-full justify-start px-3 py-2.5 data-[state=active]:bg-primary/5 data-[state=active]:text-primary rounded-lg transition-all"
                            >
                                <IconUser className="mr-2 h-4 w-4" /> General Info
                            </TabsTrigger>
                            <TabsTrigger 
                                value="location" 
                                className="w-full justify-start px-3 py-2.5 data-[state=active]:bg-primary/5 data-[state=active]:text-primary rounded-lg transition-all"
                            >
                                <IconMapPin className="mr-2 h-4 w-4" /> Location Details
                            </TabsTrigger>
                            <TabsTrigger 
                                value="stats" 
                                className="w-full justify-start px-3 py-2.5 data-[state=active]:bg-primary/5 data-[state=active]:text-primary rounded-lg transition-all"
                            >
                                <IconBuildingStore className="mr-2 h-4 w-4" /> Business Stats
                            </TabsTrigger>
                        </TabsList>
                    </CardContent>
                </Card>

                {/* Status Card */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Account Status</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Status</span>
                            <Badge variant={vendor?.status === 'active' ? "success" : "secondary"}>
                                {vendor?.status || 'Pending'}
                            </Badge>
                        </div>
                        <Separator />
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Featured</span>
                            <span className="text-sm text-muted-foreground">{vendor?.featured ? 'Yes' : 'No'}</span>
                        </div>
                    </CardContent>
                </Card>
            </aside>

            {/* Forms Area */}
            <div className="flex-1">
                <form onSubmit={handleSubmit} id="profile-form">
                    
                    {/* GENERAL TAB */}
                    <TabsContent value="general" className="mt-0">
                        <Card>
                            <CardHeader>
                                <CardTitle>General Information</CardTitle>
                                <CardDescription>Update your basic business contact details.</CardDescription>
                            </CardHeader>
                            <Separator />
                            <CardContent className="space-y-6 pt-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="vendorName">Business Name <span className="text-red-500">*</span></Label>
                                        <div className="relative">
                                            <IconBuildingStore className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input 
                                                id="vendorName" 
                                                name="vendorName" 
                                                className="pl-9" 
                                                value={formData.vendorName} 
                                                onChange={handleChange} 
                                                required 
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="contactPerson">Contact Person <span className="text-red-500">*</span></Label>
                                        <div className="relative">
                                            <IconUser className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input 
                                                id="contactPerson" 
                                                name="contactPerson" 
                                                className="pl-9" 
                                                value={formData.contactPerson} 
                                                onChange={handleChange} 
                                                required 
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Phone Number <span className="text-red-500">*</span></Label>
                                        <div className="relative">
                                            <IconPhone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input 
                                                id="phone" 
                                                name="phone" 
                                                className="pl-9" 
                                                value={formData.phone} 
                                                onChange={handleChange} 
                                                required 
                                            />
                                        </div>
                                        {formData.phone !== initialPhone && (
                                            <p className="text-xs text-amber-600 flex items-center gap-1">
                                                <IconLock size={12} /> Verification required to update phone
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="website">Website</Label>
                                        <div className="relative">
                                            <IconWorld className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input 
                                                id="website" 
                                                name="website" 
                                                className="pl-9" 
                                                placeholder="https://..."
                                                value={formData.website} 
                                                onChange={handleChange} 
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2 md:col-span-2">
                                        <Label>Email Address</Label>
                                        <div className="relative">
                                            <IconMail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input 
                                                value={vendor?.email} 
                                                className="pl-9 bg-muted/50" 
                                                disabled 
                                            />
                                        </div>
                                        <p className="text-[11px] text-muted-foreground">Email address cannot be changed. Contact support for assistance.</p>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="bg-muted/20 border-t flex justify-between">
                                <span className="text-xs text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</span>
                                <Button type="submit" disabled={isUpdating} className="md:hidden">Save Changes</Button>
                            </CardFooter>
                        </Card>
                    </TabsContent>

                    {/* LOCATION TAB */}
                    <TabsContent value="location" className="mt-0">
                        <Card>
                            <CardHeader>
                                <CardTitle>Location Details</CardTitle>
                                <CardDescription>Where can customers find you?</CardDescription>
                            </CardHeader>
                            <Separator />
                            <CardContent className="space-y-6 pt-6">
                                <div className="space-y-2">
                                    <Label htmlFor="address">Street Address <span className="text-red-500">*</span></Label>
                                    <Textarea 
                                        id="address" 
                                        name="address" 
                                        rows={3}
                                        value={formData.address} 
                                        onChange={handleChange} 
                                        required 
                                    />
                                </div>

                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="locality">Locality / Area</Label>
                                        <Input 
                                            id="locality" 
                                            name="locality" 
                                            value={formData.locality} 
                                            onChange={handleChange} 
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="pincode">Pincode</Label>
                                        <Input 
                                            id="pincode" 
                                            name="pincode" 
                                            value={formData.pincode} 
                                            onChange={handleChange} 
                                        />
                                    </div>

                                    <div className="space-y-2 md:col-span-2">
                                        <Label htmlFor="googleMapLink">Google Map Link</Label>
                                        <div className="relative">
                                            <IconMapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input 
                                                id="googleMapLink" 
                                                name="googleMapLink" 
                                                className="pl-9" 
                                                placeholder="https://maps.google.com/..."
                                                value={formData.googleMapLink} 
                                                onChange={handleChange} 
                                            />
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="bg-muted/20 border-t flex justify-end md:hidden">
                                <Button type="submit" disabled={isUpdating}>Save Changes</Button>
                            </CardFooter>
                        </Card>
                    </TabsContent>

                    {/* STATS TAB */}
                    <TabsContent value="stats" className="mt-0">
                        <Card>
                            <CardHeader>
                                <CardTitle>Business Statistics</CardTitle>
                                <CardDescription>Share more about your experience and team.</CardDescription>
                            </CardHeader>
                            <Separator />
                            <CardContent className="space-y-6 pt-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="experience">Years of Experience</Label>
                                        <div className="relative">
                                            <IconBriefcase className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input 
                                                id="experience" 
                                                name="experience" 
                                                className="pl-9" 
                                                type="number"
                                                value={formData.experience} 
                                                onChange={handleChange} 
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="teamSize">Team Size</Label>
                                        <div className="relative">
                                            <IconUsers className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input 
                                                id="teamSize" 
                                                name="teamSize" 
                                                className="pl-9" 
                                                type="number"
                                                value={formData.teamSize} 
                                                onChange={handleChange} 
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="workingSince">Working Since (Year)</Label>
                                        <div className="relative">
                                            <IconCalendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input 
                                                id="workingSince" 
                                                name="workingSince" 
                                                className="pl-9" 
                                                type="number"
                                                placeholder="e.g. 2018"
                                                value={formData.workingSince} 
                                                onChange={handleChange} 
                                            />
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                             <CardFooter className="bg-muted/20 border-t flex justify-end md:hidden">
                                <Button type="submit" disabled={isUpdating}>Save Changes</Button>
                            </CardFooter>
                        </Card>
                    </TabsContent>

                </form>
            </div>
        </div>
      </Tabs>
      
      {/* Hidden button for top bar submission */}
      <button 
        id="profile-form-submit" 
        form="profile-form" 
        type="submit" 
        className="hidden" 
      />

      {/* OTP DIALOG */}
      <Dialog open={showOtpDialog} onOpenChange={setShowOtpDialog}>
        <DialogContent className="sm:max-w-md">
            <DialogHeader>
                <DialogTitle>Verify Phone Number</DialogTitle>
                <DialogDescription>
                    To update your phone number to <b>{newPhoneToVerify}</b>, please verify it with an OTP.
                </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col items-center gap-4 py-4">
                {!otpSent ? (
                    <Button onClick={handleSendOtp} disabled={isSendingOtp} className="w-full">
                        {isSendingOtp ? "Sending..." : "Send OTP"}
                    </Button>
                ) : (
                    <div className="flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-300">
                        <Label>Enter OTP</Label>
                        <InputOTP
                            maxLength={6}
                            value={otp}
                            onChange={(value) => setOtp(value)}
                        >
                            <InputOTPGroup>
                                <InputOTPSlot index={0} />
                                <InputOTPSlot index={1} />
                                <InputOTPSlot index={2} />
                                <InputOTPSlot index={3} />
                                <InputOTPSlot index={4} />
                                <InputOTPSlot index={5} />
                            </InputOTPGroup>
                        </InputOTP>
                        <p className="text-xs text-muted-foreground">
                            Didn't receive code? <span className="text-primary cursor-pointer hover:underline" onClick={handleSendOtp}>Resend</span>
                        </p>
                    </div>
                )}
            </div>
            <DialogFooter className="sm:justify-end">
                <Button variant="secondary" onClick={() => setShowOtpDialog(false)}>
                    Cancel
                </Button>
                {otpSent && (
                    <Button onClick={handleVerifyOtp} disabled={isVerifyingOtp || otp.length < 6}>
                        {isVerifyingOtp ? "Verifying..." : "Verify & Save"}
                    </Button>
                )}
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VendorProfile;