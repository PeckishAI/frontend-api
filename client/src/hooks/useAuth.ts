import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authService } from "@/services/authService";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

export function useAuth() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  // Query for current user
  const { data: user, isLoading: isLoadingUser } = useQuery({
    queryKey: ["user"],
    queryFn: authService.getCurrentUser,
    retry: false,
    staleTime: 1000 * 60 * 30, // Cache for 30 minutes
    cacheTime: 1000 * 60 * 35, // Keep in cache for 35 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchInterval: false,
    enabled: !!localStorage.getItem("accessToken") // Only run if we have a token
  });
  console.log("USER", user);

  // Query for user's restaurants
  const { data: restaurants = [] } = useQuery({
    queryKey: ["restaurants"],
    queryFn: authService.getUserRestaurants,
    enabled: !!user,
  });
  console.log("RESTAURANTS", restaurants);

  // Sign in mutation
  const signInMutation = useMutation({
    mutationFn: authService.signIn,
    onSuccess: (data) => {
      // Update the cache immediately
      queryClient.setQueryData(["user"], data.user);
      queryClient.setQueryData(["restaurants"], data.restaurants);
      setLocation("/");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to sign in",
        variant: "destructive",
      });
    },
  });

  // Sign up mutation
  const signUpMutation = useMutation({
    mutationFn: authService.signUp,
    onSuccess: (data) => {
      // Update the cache immediately
      queryClient.setQueryData(["user"], data.user);
      queryClient.setQueryData(["restaurants"], data.restaurants);
      // Force refetch user data to ensure we have the latest
      queryClient.invalidateQueries({ queryKey: ["user"] });
      setLocation("/");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to sign up",
        variant: "destructive",
      });
    },
  });

  // Google sign in mutation
  const googleSignInMutation = useMutation({
    mutationFn: authService.googleSignIn,
    onSuccess: (data) => {
      queryClient.setQueryData(["user"], data.user);
      queryClient.setQueryData(["restaurants"], data.restaurants);
      setLocation("/");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to sign in with Google",
        variant: "destructive",
      });
    },
  });

  // Apple sign in mutation
  const appleSignInMutation = useMutation({
    mutationFn: ({
      identityToken,
      name,
    }: {
      identityToken: string;
      name: any;
    }) => authService.appleSignIn(identityToken, name),
    onSuccess: (data) => {
      queryClient.setQueryData(["user"], data.user);
      queryClient.setQueryData(["restaurants"], data.restaurants);
      setLocation("/");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to sign in with Apple",
        variant: "destructive",
      });
    },
  });

  // Sign out mutation
  const signOutMutation = useMutation({
    mutationFn: authService.signOut,
    onSuccess: () => {
      // Clear all queries from the cache on logout
      queryClient.clear();
      setLocation("/signin");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to sign out",
        variant: "destructive",
      });
    },
  });

  return {
    user,
    restaurants,
    isLoadingUser,
    signIn: signInMutation.mutateAsync,
    signUp: signUpMutation.mutateAsync,
    googleSignIn: googleSignInMutation.mutateAsync,
    appleSignIn: appleSignInMutation.mutateAsync,
    signOut: signOutMutation.mutateAsync,
  };
}