
import { useState, useEffect } from "react";
import { config } from "@/config/config";
import { authService } from "@/services/authService";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";

export default function SignIn() {
  const [showPassword, setShowPassword] = useState(false);

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
                onClick={async () => {
                  try {
                    const google = (window as any).google;
                    if (!google) {
                      console.error('Google API not loaded');
                      return;
                    }

                    const client = google.accounts.oauth2.initTokenClient({
                      client_id: config.googleClientId,
                      scope: 'email profile',
                      callback: async (response: any) => {
                        if (response.access_token) {
                          const result = await authService.googleLogIn(response.access_token);
                          // Handle successful login (redirect, set tokens, etc)
                          window.location.href = '/';
                        }
                      },
                    });
                    client.requestAccessToken();
                  } catch (error) {
                    console.error('Google login failed:', error);
                  }
                }}
              >
                <img src="https://www.google.com/favicon.ico" alt="" className="mr-2 h-4 w-4" />
                Continue with Google
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={async () => {
                  try {
                    const auth = (window as any).AppleID;
                    if (!auth) {
                      console.error('Apple API not loaded');
                      return;
                    }

                    const response = await auth.auth.signIn();
                    if (response.authorization?.id_token) {
                      const result = await authService.appleLogIn(
                        response.authorization.id_token,
                        response.user ? {
                          firstName: response.user.name.firstName,
                          lastName: response.user.name.lastName
                        } : null
                      );
                      // Handle successful login (redirect, set tokens, etc)
                      window.location.href = '/';
                    }
                  } catch (error) {
                    console.error('Apple login failed:', error);
                  }
                }}
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

            <div className="space-y-4">
              <Input type="email" placeholder="Email" />
              <div className="relative">
                <Input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="Password" 
                />
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
            </div>

            <Button className="w-full bg-[#0F1916] hover:bg-[#0F1916]/90 text-white">
              Sign in
            </Button>

            <div className="flex items-center justify-between text-sm">
              <a href="#" className="text-gray-600 hover:text-gray-900">
                Create an account
              </a>
              <a href="#" className="text-gray-600 hover:text-gray-900">
                Restore password
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
