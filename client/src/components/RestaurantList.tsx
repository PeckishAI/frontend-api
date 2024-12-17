import { useQuery } from "@tanstack/react-query";
import { restaurantService } from "../services/restaurantService";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";

export function RestaurantList() {
  const { data: restaurants, isLoading, error } = useQuery({
    queryKey: ['/api/restaurants/v2'],
    queryFn: restaurantService.getRestaurants,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 p-4">
        Error loading restaurants: {error.message}
      </div>
    );
  }

  return (
    <ScrollArea className="h-[500px] w-full rounded-md border p-4">
      <div className="space-y-4">
        {restaurants?.map((restaurant) => (
          <Card key={restaurant.restaurant_uuid}>
            <CardContent className="p-4">
              <h3 className="font-semibold">{restaurant.name}</h3>
              {restaurant.address && (
                <p className="text-sm text-gray-500">
                  {restaurant.address}, {restaurant.city}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
}
