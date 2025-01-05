
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";

export default function SignIn() {
  const [showPassword, setShowPassword] = useState(false);

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
      
      <div className="relative flex min-h-screen items-center p-8">
        <div className="w-full max-w-sm rounded-lg bg-white/95 p-8 shadow-xl backdrop-blur ml-8">
          <div className="flex justify-center">
            <img src="/images/peckish-logo.jpg" alt="Peckish" className="h-12 w-auto" />
          </div>
          
          <h2 className="mt-8 text-4xl font-display text-center">Welcome back!</h2>
          <p className="mt-2 text-sm text-center text-gray-600">
            Enter your email and password to log in to Peckish
          </p>

          <div className="mt-8 space-y-6">
            <div className="grid gap-2">
              <Button variant="outline" className="w-full">
                <img src="https://www.google.com/favicon.ico" alt="" className="mr-2 h-4 w-4" />
                Continue with Google
              </Button>
              <Button variant="outline" className="w-full">
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

            <Button className="w-full bg-[#0F1916] hover:bg-[#0F1916]/90">
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
