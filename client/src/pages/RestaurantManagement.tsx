import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Restaurant } from "@/types/restaurant";
import { restaurantService } from "@/services/restaurantService";

const restaurantSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  address: z.string().nullable(),
  city: z.string().nullable(),
  country: z.string().nullable(),
  country_code: z.string().nullable(),
  currency: z.string().nullable(),
  email: z.string().email().nullable(),
  latitude: z.number().nullable(),
  longitude: z.number().nullable(),
  logo_url: z.string().nullable(),
  phone: z.string().nullable(),
  postcode: z.string().nullable(),
  restaurant_uuid: z.string().optional(),
});

export default function RestaurantManagement() {
  const { toast } = useToast();
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);

  const { data: restaurants = [], isLoading, error } = useQuery({
    queryKey: ['/api/restaurants/v2'],
    queryFn: restaurantService.getRestaurants,
  });

  const form = useForm<z.infer<typeof restaurantSchema>>({
    resolver: zodResolver(restaurantSchema),
    defaultValues: {
      name: "",
      address: null,
      city: null,
      country: null,
      country_code: null,
      currency: null,
      email: null,
      latitude: null,
      longitude: null,
      logo_url: null,
      phone: null,
      postcode: null,
    }
  });

  // Reset form when a restaurant is selected
  useEffect(() => {
    if (selectedRestaurant) {
      form.reset({
        name: selectedRestaurant.name,
        address: selectedRestaurant.address,
        city: selectedRestaurant.city,
        country: selectedRestaurant.country,
        country_code: selectedRestaurant.country_code,
        currency: selectedRestaurant.currency,
        email: selectedRestaurant.email,
        latitude: selectedRestaurant.latitude,
        longitude: selectedRestaurant.longitude,
        logo_url: selectedRestaurant.logo_url,
        phone: selectedRestaurant.phone,
        postcode: selectedRestaurant.postcode,
        restaurant_uuid: selectedRestaurant.restaurant_uuid,
      });
    } else {
      form.reset({
        name: "",
        address: null,
        city: null,
        country: null,
        country_code: null,
        currency: null,
        email: null,
        latitude: null,
        longitude: null,
        logo_url: null,
        phone: null,
        postcode: null,
      });
    }
  }, [selectedRestaurant, form]);

  const onSubmit = (data: z.infer<typeof restaurantSchema>) => {
    console.log("Restaurant data:", data);
    toast({
      title: "Restaurant Updated",
      description: "Your restaurant information has been updated successfully.",
    });
    setSelectedRestaurant(null);
    form.reset();
  };

  if (error) {
    return <div className="text-red-500">Error loading restaurants: {error.message}</div>;
  }

  return (
    <div className="flex-1 space-y-4 p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Restaurant Management</h1>
      </div>

      <div className="space-y-4">
        <div className="rounded-lg border bg-card">
          <div className="p-6">
            <h3 className="text-lg font-medium">Select Restaurant</h3>
            <p className="text-sm text-muted-foreground">
              Choose a restaurant to manage its details
            </p>

            <div className="mt-4">
              <Select
                onValueChange={(value) => {
                  const restaurant = restaurants.find(r => r.restaurant_uuid === value);
                  setSelectedRestaurant(restaurant || null);
                }}
                value={selectedRestaurant?.restaurant_uuid || ""}
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a restaurant" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {restaurants?.map((restaurant) => (
                    <SelectItem
                      key={restaurant.restaurant_uuid}
                      value={restaurant.restaurant_uuid}
                    >
                      {restaurant.name}
                      {restaurant.city && ` - ${restaurant.city}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {selectedRestaurant && (
          <div className="rounded-lg border bg-card p-6">
            <h3 className="text-lg font-medium mb-4">Restaurant Details</h3>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Restaurant Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setSelectedRestaurant(null);
                      form.reset();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Save Changes</Button>
                </div>
              </form>
            </Form>
          </div>
        )}
      </div>
    </div>
  );
}
