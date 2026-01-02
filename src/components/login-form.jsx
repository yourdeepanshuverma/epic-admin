import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "./ui/field";
import { Input } from "./ui/input";
import { cn } from "../lib/utils";
import loginLogo from "../assets/loginImg.jpg";
import { useLoginMutation, useGoogleLoginMutation } from "../store/api/adminApi";
import { toast } from "sonner";
import { useNavigate, useLocation } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { setCredentials, selectAvailableAccounts, switchAccount, removeAccount } from "../store/slices/authSlice";
import { vendorApi } from "../store/api/vendorApi";
import { leadApi } from "../store/api/leadApi";
import { adminApi } from "../store/api/adminApi";
import { IconEye, IconEyeOff, IconPlus, IconX, IconUser, IconChevronLeft } from "@tabler/icons-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useGoogleLogin } from "@react-oauth/google";

export function LoginForm({ className, ...props }) {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const availableAccounts = useSelector(selectAvailableAccounts);
  
  const [showPassword, setShowPassword] = useState(false);
  const [isAddingAccount, setIsAddingAccount] = useState(false);
  
  // Determine initial view: if accounts exist, show list first
  const hasAccounts = availableAccounts && availableAccounts.length > 0;
  
  // Effect to handle view mode based on accounts presence
  useEffect(() => {
      if (!hasAccounts) {
          setIsAddingAccount(true);
      }
  }, [hasAccounts]);

  const [login, { isLoading }] = useLoginMutation();
  const [googleLogin, { isLoading: isGoogleLoading }] = useGoogleLoginMutation();

  const handleAccountSwitch = (targetUserId) => {
      dispatch(vendorApi.util.resetApiState());
      dispatch(leadApi.util.resetApiState());
      dispatch(adminApi.util.resetApiState());
      
      dispatch(switchAccount(targetUserId));
      toast.success("Switched account successfully");
      navigate("/dashboard");
  };

  const handleRemoveAccount = (e, userId) => {
      e.stopPropagation();
      dispatch(removeAccount(userId));
      if (availableAccounts.length <= 1) {
          setIsAddingAccount(true);
      }
  };

  const loginWithGoogle = useGoogleLogin({
    onSuccess: async (codeResponse) => {
        try {
            const payload = await googleLogin({ code: codeResponse.code }).unwrap();
            const { data } = payload;
            
            // Check for unregistered vendor first
            if (data.isNewVendor) {
                toast.error("Account not found. Please sign up first.");
                return;
            }

            if (!data || !data.token) {
                toast.error("Google login failed: Invalid server response");
                return;
            }

            const { vendor, token } = data;
            const userRole = vendor.role;
            const displayName = vendor.vendorName || "User";

            // Clear any existing API state to prevent stale data
            dispatch(vendorApi.util.resetApiState());
            dispatch(leadApi.util.resetApiState());
            dispatch(adminApi.util.resetApiState());

            dispatch(setCredentials({
                user: vendor,
                token: token,
                role: userRole
            }));

            toast.success(`Welcome back, ${displayName}!`);
            navigate("/dashboard");

        } catch (error) {
            console.error("Google Login Error:", error);
            toast.error(error?.data?.message || "Google login failed");
        }
    },
    onError: (error) => {
        console.error("Google OAuth Error:", error);
        toast.error("Google login failed");
    },
    onNonOAuthError: (error) => {
        console.error("Non-OAuth Error:", error);
    },
    flow: "auth-code",
    ux_mode: "popup",
  });

  const handleSubmit = (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const identifier = formData.get("identifier");
    const password = formData.get("password");

    let email = null;
    let phone = null;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;

    if (emailRegex.test(identifier)) {
      email = identifier;
    } else if (phoneRegex.test(identifier)) {
      phone = identifier;
    }

    login({ email, phone, password })
      .unwrap()
      .then((payload) => {
        const { data } = payload; 
        
        if (!data || !data.token) {
            toast.error("Login failed: Invalid server response.");
            return;
        }

        const { vendor, token } = data;
        const userRole = vendor.role;
        const displayName = vendor.vendorName || "User";
        
        // Clear any existing API state to prevent stale data
        dispatch(vendorApi.util.resetApiState());
        dispatch(leadApi.util.resetApiState());
        dispatch(adminApi.util.resetApiState());

        dispatch(setCredentials({
          user: vendor,
          token: token,
          role: userRole
        }));
        
        toast.success(`Welcome back, ${displayName}!`);
        navigate("/dashboard");
      })
      .catch((error) => {
        toast.error(error?.data?.message || "Login failed. Please try again.");
      });
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className={cn("grid p-0", (!hasAccounts || isAddingAccount) ? "md:grid-cols-2" : "md:grid-cols-1")}>
          
          {/* ACCOUNT SELECTION VIEW */}
          {hasAccounts && !isAddingAccount ? (
             <div className="p-6 md:p-8 flex flex-col justify-center items-center min-h-[500px] md:min-h-[600px] max-w-md mx-auto w-full">
                <div className="flex flex-col items-center gap-2 text-center mb-8">
                    <h1 className="text-2xl font-bold tracking-tight">Choose an account</h1>
                    <p className="text-muted-foreground text-sm">Select an account to continue</p>
                </div>

                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar w-full">
                    {availableAccounts.map((acc) => (
                        <div 
                            key={acc.user._id} 
                            onClick={() => handleAccountSwitch(acc.user._id)}
                            className="group flex items-center gap-4 p-3 rounded-xl border-2 border-muted hover:border-primary/50 hover:bg-primary/5 cursor-pointer transition-all relative bg-card"
                        >
                            <Avatar className="h-10 w-10 border-2 border-background shadow-sm">
                                <AvatarImage src={acc.user.profile?.url} />
                                <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                                    {acc.user.vendorName?.[0] || <IconUser size={18} />}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 overflow-hidden">
                                <p className="font-bold text-sm truncate">{acc.user.vendorName || "User"}</p>
                                <p className="text-[11px] text-muted-foreground truncate">{acc.user.email}</p>
                            </div>
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"
                                onClick={(e) => handleRemoveAccount(e, acc.user._id)}
                            >
                                <IconX size={14} />
                            </Button>
                        </div>
                    ))}
                </div>

                <div className="mt-8 w-full">
                    <Button 
                        variant="outline" 
                        className="w-full h-12 rounded-xl gap-2 font-bold border-2 hover:bg-muted"
                        onClick={() => setIsAddingAccount(true)}
                    >
                        <IconPlus size={18} /> Use another account
                    </Button>
                </div>
             </div>
          ) : (
             /* STANDARD LOGIN FORM */
             <form className="p-6 md:p-8 relative flex flex-col justify-center min-h-[500px] md:min-h-[600px]" onSubmit={handleSubmit}>
                {hasAccounts && (
                    <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm" 
                        className="absolute top-4 left-4 text-muted-foreground hover:text-foreground gap-1 pl-0"
                        onClick={() => setIsAddingAccount(false)}
                    >
                        <IconChevronLeft size={16} /> Back
                    </Button>
                )}

                <FieldGroup>
                <div className="flex flex-col items-center gap-2 text-center mt-6">
                    <h1 className="text-2xl font-bold">Welcome back</h1>
                    <p className="text-muted-foreground text-balance">
                    Login to your Epic account
                    </p>
                </div>
                <Field>
                    <FieldLabel htmlFor="identifier">Email/Phone</FieldLabel>
                    <Input
                    id="identifier"
                    name="identifier"
                    type="text"
                    placeholder="Enter your email or phone"
                    required
                    />
                </Field>
                <Field>
                    <FieldLabel htmlFor="password">Password</FieldLabel>
                    <div className="relative">
                    <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        className="pr-10"
                        required
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-muted-foreground absolute right-3 top-1/2 -translate-y-1/2 hover:text-foreground focus:outline-none"
                    >
                        {showPassword ? (
                        <IconEyeOff className="size-4" />
                        ) : (
                        <IconEye className="size-4" />
                        )}
                    </button>
                    </div>
                </Field>
                <Field>
                    <Button type="submit" disabled={isLoading || isGoogleLoading}>
                    {isLoading ? "Logging in..." : "Login"}
                    </Button>
                </Field>
                <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
                    Or continue with
                </FieldSeparator>
                <Field className="grid grid-cols-1 gap-4">
                    <Button variant="outline" type="button" onClick={() => loginWithGoogle()} disabled={isGoogleLoading}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <path
                        d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                        fill="currentColor"
                        />
                    </svg>
                    <span className="sr-only">Login with Google</span>
                    {isGoogleLoading ? "Connecting..." : ""}
                    </Button>
                </Field>
                <div className="text-center text-sm">
                    Don&apos;t have an account?{" "}
                    <span 
                        className="underline cursor-pointer" 
                        onClick={() => {
                            if (location.pathname.includes("/add-account")) {
                                navigate("/add-account/signup");
                            } else {
                                navigate("/signup");
                            }
                        }}
                    >
                        Sign up
                    </span>
                </div>
                </FieldGroup>
             </form>
          )}

          {(!hasAccounts || isAddingAccount) && (
            <div className="bg-muted relative hidden md:block">
                <img
                src={loginLogo}
                alt="Image"
                className="absolute inset-0 h-full w-full object-cover"
                />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}