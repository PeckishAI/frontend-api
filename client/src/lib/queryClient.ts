import { QueryClient } from "@tanstack/react-query";

// Configure the base URL for all API requests
import { config } from '../config/config';
const API_BASE_URL = `${config.apiBaseUrl}/`; // Empty string for same-origin requests

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: async ({ queryKey }) => {
        const url = `${API_BASE_URL}${queryKey[0]}`;
        const res = await fetch(url, {
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) {
          const errorText = await res.text();
          if (res.status >= 500) {
            throw new Error(`Server Error (${res.status}): ${errorText}`);
          }
          throw new Error(`API Error (${res.status}): ${errorText}`);
        }

        return res.json();
      },
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      mutationFn: async ({ url, method, data }) => {
        const res = await fetch(`${API_BASE_URL}${url}`, {
          method,
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });

        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(`API Error (${res.status}): ${errorText}`);
        }

        return res.json();
      },
      retry: false,
    },
  },
});
