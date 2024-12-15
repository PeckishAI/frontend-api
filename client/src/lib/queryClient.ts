import { QueryClient } from "@tanstack/react-query";

// Configure mock data client
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity,
      refetchOnWindowFocus: false,
      refetchInterval: false,
      retry: false,
    },
  },
});
