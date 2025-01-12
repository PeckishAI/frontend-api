import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { config } from "@/config/config";
import { authService } from "@/services/authService";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";

const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type SignInForm = z.infer<typeof signInSchema>;

export default function SignIn() {
  const [showPassword, setShowPassword] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const form = useForm<SignInForm>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: SignInForm) => {
    try {
      const result = await authService.signIn(data);
      // Store the access token if needed
      localStorage.setItem('accessToken', result.accessToken);
      // On successful login, redirect to home page
      setLocation('/');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to sign in",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    // Load Google API
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    // Load Apple API
    const appleScript = document.createElement('script');
    appleScript.src = 'https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js';
    appleScript.async = true;
    appleScript.defer = true;
    document.body.appendChild(appleScript);

    return () => {
      document.body.removeChild(script);
      document.body.removeChild(appleScript);
    };
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      const google = (window as any).google;
      if (!google) {
        toast({
          title: "Error",
          description: "Google API not loaded",
          variant: "destructive",
        });
        return;
      }

      const client = google.accounts.oauth2.initTokenClient({
        client_id: config.googleClientId,
        scope: 'email profile',
        callback: async (response: any) => {
          if (response.access_token) {
            try {
              const result = await authService.googleSignIn(response.access_token);
              localStorage.setItem('accessToken', result.accessToken);
              setLocation('/');
            } catch (error: any) {
              toast({
                title: "Error",
                description: error.response?.data?.message || "Failed to sign in with Google",
                variant: "destructive",
              });
            }
          }
        },
      });
      client.requestAccessToken();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Google login failed",
        variant: "destructive",
      });
    }
  };

  const handleAppleSignIn = async () => {
    try {
      const auth = (window as any).AppleID;
      if (!auth) {
        toast({
          title: "Error",
          description: "Apple API not loaded",
          variant: "destructive",
        });
        return;
      }

      const response = await auth.auth.signIn();
      if (response.authorization?.id_token) {
        try {
          const result = await authService.appleSignIn(
            response.authorization.id_token,
            response.user ? {
              firstName: response.user.name.firstName,
              lastName: response.user.name.lastName
            } : null
          );
          localStorage.setItem('accessToken', result.accessToken);
          setLocation('/');
        } catch (error: any) {
          toast({
            title: "Error",
            description: error.response?.data?.message || "Failed to sign in with Apple",
            variant: "destructive",
          });
        }
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Apple login failed",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="relative min-h-screen">
      <video
        className="absolute inset-0 h-full w-full object-cover"
        autoPlay
        loop
        muted
        playsInline
      >
        <source src="/videos/signin-bg.mp4" type="video/mp4" />
      </video>

      <div className="relative flex min-h-screen items-center p-[20px]">
        <div className="w-full max-w-lg rounded-lg bg-white/95 p-8 shadow-xl backdrop-blur ml-[20px]">
          <div className="flex justify-center">
            <img src="/images/peckish-logo.jpg" alt="Peckish" className="h-12 w-12 rounded-full object-cover" />
          </div>

          <h2 className="mt-8 text-4xl font-display text-center">Welcome back!</h2>
          <p className="mt-2 text-sm text-center text-gray-600">
            Enter your email and password to log in to Peckish
          </p>

          <div className="mt-8 space-y-6">
            <div className="grid gap-2">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={handleGoogleSignIn}
              >
                <img src="https://www.google.com/favicon.ico" alt="" className="mr-2 h-4 w-4" />
                Continue with Google
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={handleAppleSignIn}
              >
                <img src="https://www.apple.com/favicon.ico" alt="" className="mr-2 h-4 w-4" />
                Continue with Apple
              </Button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-2 text-gray-500">or</span>
              </div>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input type="email" placeholder="Email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <div className="relative">
                        <FormControl>
                          <Input 
                            type={showPassword ? "text" : "password"} 
                            placeholder="Password" 
                            {...field}
                          />
                        </FormControl>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-2 top-1/2 -translate-y-1/2"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full bg-[#0F1916] hover:bg-[#0F1916]/90 text-white">
                  Sign in
                </Button>
              </form>
            </Form>

            <div className="flex items-center justify-between text-sm">
              <Button
                variant="link"
                className="text-gray-600 hover:text-gray-900 px-0"
                onClick={() => setLocation('/signup')}
              >
                Create an account
              </Button>
              <Button
                variant="link"
                className="text-gray-600 hover:text-gray-900 px-0"
                onClick={() => setLocation('/reset-password')}
              >
                Restore password
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}