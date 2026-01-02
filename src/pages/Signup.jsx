import React, { useState } from 'react';
import { toast } from 'sonner';
import { 
    IconUser, 
    IconBriefcase, 
    IconMapPin, 
    IconFileText, 
    IconMail, 
    IconLock, 
    IconPhone, 
    IconWorld, 
    IconCalendar, 
    IconUsers, 
    IconChevronRight, 
    IconChevronLeft, 
    IconCheck, 
    IconShieldCheck,
    IconUpload,
    IconLoader
} from '@tabler/icons-react';
import { useGetStatesQuery, useGetCitiesByStateQuery, useSendOtpMutation, useVerifyOtpMutation } from "../store/api/adminApi";
import { useCreateVendorMutation } from "../store/api/vendorApi";
import { Link, useNavigate } from 'react-router';
import { useDispatch } from "react-redux";
import { setCredentials } from "../store/slices/authSlice";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import Autocomplete from "react-google-autocomplete";

const Signup = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [currentStep, setCurrentStep] = useState(1);
  const [createVendor, { isLoading }] = useCreateVendorMutation();
  const [sendOtp, { isLoading: isSendingOtp }] = useSendOtpMutation();
  const [verifyOtpApi, { isLoading: isVerifyingOtp }] = useVerifyOtpMutation();

  const [showOtpScreen, setShowOtpScreen] = useState(false);
  const [otp, setOtp] = useState('');
  const [tempPhone, setTempPhone] = useState('');

  const [formData, setFormData] = useState({
    contactPerson: '', phone: '', email: '', password: '',
    vendorName: '', experience: '', teamSize: '', workingSince: '', website: '',
    state: '', city: '', locality: '', address: '', pincode: '', googleMapLink: '',
    profile: null, coverImage: null, gst: null, pan: null, idProof: null, registrationProof: null
  });

  const steps = [
    { number: 1, title: 'Personal Details', icon: IconUser },
    { number: 2, title: 'Business Details', icon: IconBriefcase },
    { number: 3, title: 'Location Details', icon: IconMapPin },
    { number: 4, title: 'Documents & Media', icon: IconFileText }
  ];

  const backgroundImages = [
    'https://images.unsplash.com/photo-1519741497674-611481863552?w=1200',
    'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=1200',
    'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=1200',
    'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=1200'
  ];

  const [profilePreview, setProfilePreview] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      const file = files[0];
      setFormData(prev => ({ ...prev, [name]: file }));

      if (name === 'profile') {
          setProfilePreview(URL.createObjectURL(file));
      } else if (name === 'coverImage') {
          setCoverPreview(URL.createObjectURL(file));
      }
    }
  };

  const handleGooglePlaceSelected = (place) => {
    if (!place.address_components) return;

    const getComponent = (type) => place.address_components.find(c => c.types.includes(type))?.long_name || "";

    const locality = getComponent("locality") || getComponent("sublocality") || getComponent("neighborhood");
    const city = getComponent("locality") || getComponent("administrative_area_level_2"); 
    const state = getComponent("administrative_area_level_1");
    let pincode = getComponent("postal_code");

    // Fallback: Extract pincode from formatted address if missing
    if (!pincode && place.formatted_address) {
        const pincodeMatch = place.formatted_address.match(/\b\d{6}\b/); // Matches 6-digit Indian pincodes
        if (pincodeMatch) pincode = pincodeMatch[0];
    }

    setFormData((prev) => ({
      ...prev,
      city: city,
      state: state,
      pincode: pincode,
      locality: locality,
      googleMapLink: place.url || "",
      // Address is NOT auto-filled
    }));
  };

  const handleNext = () => {
      // Validation Logic
      let isValid = true;
      if (currentStep === 1) {
          if (!formData.contactPerson || !formData.phone || !formData.email || !formData.password) isValid = false;
      } else if (currentStep === 2) {
          if (!formData.vendorName || !formData.experience || !formData.workingSince) isValid = false;
      } else if (currentStep === 3) {
          if (!formData.state || !formData.city || !formData.locality || !formData.address || !formData.pincode) isValid = false;
      } else if (currentStep === 4) {
          if (!formData.profile) isValid = false;
      }

      if (!isValid) {
          toast.error("Please fill all required fields");
          return;
      }

      if (currentStep < 4) setCurrentStep(currentStep + 1);
  };
  const handlePrevious = () => currentStep > 1 && setCurrentStep(currentStep - 1);

  // OTP & Registration Functions
  const handleSendOtp = async () => {
    if (!formData.phone) {
      toast.error("Please enter a phone number!");
      return;
    }

    try {
        await sendOtp({ phone: formData.phone, forWhat: 'registration' }).unwrap();
        setTempPhone(formData.phone);
        setShowOtpScreen(true);
        toast.success(`OTP sent to ${formData.phone}`);
    } catch (error) {
        toast.error(error.data?.message || "Failed to send OTP");
    }
  };

  const verifyOtp = async () => {
    if (otp.length !== 4) return;

    try {
        await verifyOtpApi({ phone: formData.phone, otp }).unwrap();
        toast.success("Phone verified successfully!");
        registerVendor();
    } catch (error) {
        toast.error(error.data?.message || "Invalid OTP. Please try again.");
        setOtp('');
    }
  };

  const registerVendor = async () => {
    const data = new FormData();

    // Append all fields
    Object.keys(formData).forEach(key => {
      if (formData[key]) {
        data.append(key, formData[key]);
      }
    });

    try {
      const response = await createVendor(data).unwrap();
      const { vendor, token } = response.data;

      if (vendor && token) {
        dispatch(setCredentials({
            user: vendor,
            token: token,
            role: vendor.role
        }));
        
        toast.success("Registration successful! Welcome aboard.");
        navigate("/dashboard");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.data?.message || "Something went wrong, please try again");
    } finally {
      setShowOtpScreen(false);
      setOtp('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex">
      {/* LEFT FORM */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 overflow-y-auto">
        <div className="max-w-xl w-full">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold mb-2 text-gray-900">Vendor Registration</h2>
            <p className="mt-1 text-sm text-gray-600">Join our wedding professionals network</p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6 backdrop-blur-sm">

            {/* Step 1 */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center">
                  <IconUser className="w-5 h-5 mr-2 text-primary" /> Personal Information
                </h3>
                
                <div className="space-y-1">
                    <Label>Contact Person Name *</Label>
                    <div className="relative">
                        <IconUser className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input name="contactPerson" value={formData.contactPerson} onChange={handleInputChange} className="pl-9" placeholder="Full name" />
                    </div>
                </div>

                <div className="space-y-1">
                    <Label>Phone Number *</Label>
                    <div className="relative">
                        <IconPhone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="pl-9" placeholder="Phone number" />
                    </div>
                </div>

                <div className="space-y-1">
                    <Label>Email Address *</Label>
                    <div className="relative">
                        <IconMail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input type="email" name="email" value={formData.email} onChange={handleInputChange} className="pl-9" placeholder="Email" />
                    </div>
                </div>

                <div className="space-y-1">
                    <Label>Password *</Label>
                    <div className="relative">
                        <IconLock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input type="password" name="password" value={formData.password} onChange={handleInputChange} className="pl-9" placeholder="Password" />
                    </div>
                </div>
              </div>
            )}

           {/* Step 2: Business Details */}
            {currentStep === 2 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center">
                  <IconBriefcase className="w-5 h-5 mr-2 text-primary" />
                  Business Information
                </h3>
                
                <div className="space-y-1">
                  <Label>Business/Vendor Name *</Label>
                  <div className="relative">
                    <IconBriefcase className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input name="vendorName" value={formData.vendorName} onChange={handleInputChange} className="pl-9" placeholder="Enter business name" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label>Experience (Years) *</Label>
                    <div className="relative">
                      <IconCalendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input type="number" name="experience" value={formData.experience} onChange={handleInputChange} className="pl-9" placeholder="Years" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label>Working Since *</Label>
                    <div className="relative">
                      <IconCalendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input type="number" name="workingSince" value={formData.workingSince} onChange={handleInputChange} className="pl-9" placeholder="Year" />
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <Label>Team Size</Label>
                  <div className="relative">
                    <IconUsers className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input type="number" name="teamSize" value={formData.teamSize} onChange={handleInputChange} className="pl-9" placeholder="Number of members" />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label>Website</Label>
                  <div className="relative">
                    <IconWorld className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input type="url" name="website" value={formData.website} onChange={handleInputChange} className="pl-9" placeholder="https://yourwebsite.com" />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Location Details */}
            {currentStep === 3 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center">
                  <IconMapPin className="w-5 h-5 mr-2 text-primary" />
                  Location Information
                </h3>
            
                <div className="space-y-1">
                    <Label>Search Address (Google Maps)</Label>
                    <div className="relative">
                        <IconMapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground z-10" />
                        <Autocomplete
                            apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
                            onPlaceSelected={handleGooglePlaceSelected}
                            options={{ 
                                types: ["geocode", "establishment"],
                                componentRestrictions: { country: "in" } 
                            }}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pl-9"
                            placeholder="Start typing address..."
                        />
                    </div>
                    <p className="text-xs text-muted-foreground">Select from dropdown to auto-fill details.</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label>State *</Label>
                    <Input name="state" value={formData.state} readOnly className="bg-muted" />
                  </div>

                  <div className="space-y-1">
                    <Label>City *</Label>
                    <Input name="city" value={formData.city} readOnly className="bg-muted" />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label>Locality *</Label>
                  <Input name="locality" value={formData.locality} onChange={handleInputChange} placeholder="Enter locality/area" />
                </div>

                <div className="space-y-1">
                  <Label>Address *</Label>
                  <Input name="address" value={formData.address} onChange={handleInputChange} placeholder="Enter full address" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label>Pincode *</Label>
                    <Input name="pincode" value={formData.pincode} onChange={handleInputChange} placeholder="Pincode" />
                  </div>

                  <div className="space-y-1">
                    <Label>Google Map Link</Label>
                    <Input type="url" name="googleMapLink" value={formData.googleMapLink} onChange={handleInputChange} placeholder="Map link" />
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Documents & Media */}
            {currentStep === 4 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center">
                  <IconFileText className="w-5 h-5 mr-2 text-primary" />
                  Documents & Media
                </h3>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label>Profile Image *</Label>
                    <div className="border-2 border-dashed border-muted rounded-lg h-32 relative overflow-hidden group hover:border-primary transition-all">
                      {profilePreview ? (
                          <img src={profilePreview} alt="Profile Preview" className="w-full h-full object-cover" />
                      ) : null}
                      
                      <div className={`absolute inset-0 flex flex-col items-center justify-center bg-background/50 hover:bg-background/80 transition-colors ${profilePreview ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'}`}>
                          <IconUpload className="h-6 w-6 text-muted-foreground mb-1" />
                          <span className="text-xs text-muted-foreground">Upload Profile</span>
                      </div>
                      <input type="file" name="profile" onChange={handleFileChange} accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label>Cover Image</Label>
                    <div className="border-2 border-dashed border-muted rounded-lg h-32 relative overflow-hidden group hover:border-primary transition-all">
                      {coverPreview ? (
                          <img src={coverPreview} alt="Cover Preview" className="w-full h-full object-cover" />
                      ) : null}
                      
                      <div className={`absolute inset-0 flex flex-col items-center justify-center bg-background/50 hover:bg-background/80 transition-colors ${coverPreview ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'}`}>
                          <IconUpload className="h-6 w-6 text-muted-foreground mb-1" />
                          <span className="text-xs text-muted-foreground">Upload Cover</span>
                      </div>
                      <input type="file" name="coverImage" onChange={handleFileChange} accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" />
                    </div>
                  </div>
                </div>

                <div className="bg-muted/20 p-4 rounded-lg border border-muted">
                  <h4 className="font-semibold text-sm text-foreground mb-3">Business Documents (Optional)</h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    {['gst', 'pan', 'idProof', 'registrationProof'].map((docType) => (
                        <div key={docType} className="space-y-1">
                            <Label className="uppercase text-[10px]">{docType.replace(/([A-Z])/g, ' $1').trim()}</Label>
                            <Input type="file" name={docType} onChange={handleFileChange} className="text-xs h-9 cursor-pointer" />
                        </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* NAVIGATION + OTP MODAL */}
            <div className="relative pt-4 mt-6 border-t border-gray-200">
              <div className="flex flex-col-reverse gap-4 sm:flex-row justify-between items-center relative">

                <Button 
                    variant="ghost" 
                    onClick={handlePrevious} 
                    disabled={currentStep === 1}
                    className="gap-1"
                >
                  <IconChevronLeft className="w-4 h-4" /> Previous
                </Button>

                <div>
                  <p className="text-xs text-muted-foreground">
                    Already have account? <Link to="/login" className="font-bold text-primary hover:underline">Sign in</Link>
                  </p>
                </div>

                {/* OTP SCREEN */}
                {showOtpScreen && (
                  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
                    <Card className="max-w-[360px] w-full border-4 rounded-[32px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 bg-white">
                      <CardContent className="p-8 text-center space-y-6">
                        <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
                          <IconShieldCheck className="w-10 h-10 text-green-600" />
                        </div>
                        
                        <div className="space-y-1">
                          <h2 className="text-2xl font-black tracking-tighter uppercase">Verify Phone</h2>
                          <p className="text-xs text-muted-foreground font-medium">
                            We've sent a 4-digit code to <br/>
                            <span className="text-foreground font-black text-sm">+91 {tempPhone}</span>
                          </p>
                        </div>

                        <div className="space-y-3">
                          <input
                            type="text" 
                            value={otp} 
                            onChange={e => setOtp(e.target.value.replace(/\D/g,'').slice(0,4))}
                            className="w-full text-center text-4xl font-black tracking-[1rem] py-4 border-2 border-muted rounded-2xl focus:border-green-500 focus:ring-4 focus:ring-green-500/10 outline-none transition-all bg-muted/30"
                            placeholder="0000"
                            maxLength="4"
                          />
                          <p className="text-[9px] text-green-600 font-black uppercase tracking-widest">
                            Testing Mode: Use code 1234
                          </p>
                        </div>

                        <div className="space-y-2">
                                                <Button onClick={verifyOtp} disabled={otp.length !== 4 || isLoading || isVerifyingOtp}
                                                  className="w-full py-6 text-xl font-bold rounded-xl h-auto bg-green-600 hover:bg-green-700">
                                                  {isLoading || isVerifyingOtp ? <><IconLoader className="animate-spin mr-2" /> Processing...</> : 'Verify & Register'}
                                                </Button>                          
                          <Button 
                            variant="ghost" 
                            onClick={() => { setShowOtpScreen(false); setOtp(''); }} 
                            className="w-full font-bold text-muted-foreground uppercase text-[10px]"
                          >
                            Change Phone Number
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Buttons */}
                {!showOtpScreen && currentStep < 4 ? (
                  <Button onClick={handleNext} className="gap-1 shadow-lg">
                    Next <IconChevronRight className="w-4 h-4" />
                  </Button>
                ) : !showOtpScreen && (
                  <Button onClick={handleSendOtp} disabled={isSendingOtp} className="gap-2 bg-green-600 hover:bg-green-700 shadow-xl min-w-[200px]">
                    {isSendingOtp ? <IconLoader className="animate-spin" /> : <IconShieldCheck className="w-5 h-5" />}
                    {isSendingOtp ? "Sending..." : "Send OTP & Register"}
                  </Button>
                )}

              </div>
            </div>

          </div>
        </div>
      </div>

      {/* RIGHT SIDE */}
       <div  className="hidden lg:block w-1/2 bg-cover bg-center transition-all duration-700 ease-in-out relative"
        style={{ 
          backgroundImage: `url('${backgroundImages[currentStep - 1]}')` 
        }}
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"></div>
        <div className="relative h-full flex flex-col justify-between px-12 py-10 ">
          {/* Top: Step Info */}
          <div className="text-white">
            <div className="inline-block bg-white/10 backdrop-blur-md px-4 pt-1 rounded-full border border-white/20 mb-4">
              <span className="text-sm font-semibold">Step {currentStep} of 4</span>
            </div>
            {currentStep === 1 && (
              <>
                <h1 className="text-5xl font-bold mb-2 leading-tight animate-in slide-in-from-bottom-4">Welcome Aboard!</h1>
                <p className="text-lg text-gray-200 leading-relaxed">Let's get started with your personal information</p>
              </>
            )}
            {currentStep === 2 && (
              <>
                <h1 className="text-5xl font-bold mb-2 leading-tight animate-in slide-in-from-bottom-4">Your Business</h1>
                <p className="text-lg text-gray-200 leading-relaxed">Share details about your amazing services and experience</p>
              </>
            )}
            {currentStep === 3 && (
              <>
                <h1 className="text-5xl font-bold mb-2 leading-tight animate-in slide-in-from-bottom-4">Where Are You?</h1>
                <p className="text-lg text-gray-200 leading-relaxed">Help couples find you easily with your location details</p>
              </>
            )}
            {currentStep === 4 && (
              <>
                <h1 className="text-5xl font-bold mb-2 leading-tight animate-in slide-in-from-bottom-4">Final Step!</h1>
                <p className="text-lg text-gray-200 leading-relaxed">Upload your documents and showcase your brand</p>
              </>
            )}
          </div>

            {/* Progress Steps */}
          <div className="mb-6">
            <div className="flex justify-between items-center">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isCompleted = currentStep > step.number;
                const isCurrent = currentStep === step.number;
                
                return (
                  <React.Fragment key={step.number}>
                    <div className="flex flex-col bg-white/10 backdrop-blur-md rounded-xl p-5 items-center flex-1 border border-white/10">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 transform ${
                        isCompleted ? 'bg-green-500 scale-110' : 
                        isCurrent ? 'bg-primary scale-110 shadow-lg' : 
                        'bg-white/20 scale-100'
                      }`}>
                        {isCompleted ? (
                          <IconCheck className="w-5 h-5 text-white" />
                        ) : (
                          <Icon className="w-5 h-5 text-white" />
                        )}
                      </div>
                      <span className={`text-xs mt-2 font-medium text-center transition-colors duration-300 ${
                        isCurrent ? 'text-primary-foreground' : 'text-white/80'
                      }`}>
                        {step.title}
                      </span>
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`flex-1 h-0.5 mx-2 transition-all duration-500 ${
                        currentStep > step.number ? 'bg-green-500' : 'bg-white/20'
                      }`} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* Bottom: Features */}
          <div className="space-y-3">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/20">
              <div className="flex items-center space-x-3">
                <div className="bg-primary rounded-lg p-2">
                  <IconCheck className="w-5 h-5 text-white" />
                </div>
                <div className="text-white">
                  <h3 className="font-semibold text-sm">Verified Platform</h3>
                  <p className="text-xs text-gray-300">Trusted by 10,000+ vendors</p>
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
              <div className="flex items-center space-x-3">
                <div className="bg-primary rounded-lg p-2">
                  <IconUsers className="w-5 h-5 text-white" />
                </div>
                <div className="text-white">
                  <h3 className="font-semibold text-sm">Wide Reach</h3>
                  <p className="text-xs text-gray-300">Connect with thousands of couples</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;

