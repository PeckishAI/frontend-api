import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { restaurantService } from "@/services/restaurantService";
import { ChevronDown, Plus, Settings } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Restaurant } from "@/types/restaurant";
import { useRestaurantContext } from "@/contexts/RestaurantContext";

interface RestaurantSelectorProps {
  onCreateNew: () => void;
  onManageRestaurants: () => void;
}

export function RestaurantSelector({
  onCreateNew,
  onManageRestaurants,
}: RestaurantSelectorProps) {
  const [open, setOpen] = useState(false);
  const { currentRestaurant, setCurrentRestaurant, setIsLoading } = useRestaurantContext();
  const queryClient = useQueryClient();

  const handleRestaurantChange = (restaurant: Restaurant) => {
    setCurrentRestaurant(restaurant);
    queryClient.invalidateQueries({ queryKey: ["inventory"] });
  };

  const { data: restaurants = [], isLoading } = useQuery({
    queryKey: ["restaurants"],
    queryFn: restaurantService.getRestaurants,
    onSuccess: (fetchedData) => {
      if (fetchedData.length > 0 && !currentRestaurant?.restaurant_uuid) {
        setCurrentRestaurant(fetchedData[0]);
      }
      setIsLoading(false);
    },
    onError: () => {
      setIsLoading(false);
    }
  });

  if (isLoading) {
    return <div>Loading restaurants...</div>;
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          role="combobox"
          aria-expanded={open}
          aria-label="Select a restaurant"
          className="w-full justify-between hover:bg-accent hover:text-accent-foreground px-3 py-6"
        >
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              {currentRestaurant?.logo_url ? (
                <AvatarImage src={currentRestaurant.logo_url} alt={currentRestaurant.name} />
              ) : (
                <AvatarFallback>
                  {currentRestaurant?.name?.[0]?.toUpperCase() || ""}
                </AvatarFallback>
              )}
            </Avatar>
            <span className="flex-1 text-left font-medium">
              {currentRestaurant?.name || "Select a restaurant"}
            </span>
          </div>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <Command>
          <CommandList>
            <CommandInput placeholder="Search restaurants..." />
            <CommandEmpty>No restaurants found.</CommandEmpty>
            <CommandGroup heading="Your restaurants">
              {restaurants.map((restaurant) => (
                <CommandItem
                  key={restaurant.restaurant_uuid}
                  onSelect={() => {
                    handleRestaurantChange(restaurant);
                    setOpen(false);
                  }}
                  className="flex items-center gap-2 px-4 py-2"
                >
                  <Avatar className="h-8 w-8">
                    {restaurant.logo_url ? (
                      <AvatarImage src={restaurant.logo_url} alt={restaurant.name} />
                    ) : (
                      <AvatarFallback>{restaurant.name[0].toUpperCase()}</AvatarFallback>
                    )}
                  </Avatar>
                  <span>{restaurant.name}</span>
                  <span
                    className={cn(
                      "ml-auto",
                      restaurant.restaurant_uuid === currentRestaurant?.restaurant_uuid
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  >
                    ✓
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
          <div className="border-t p-2 flex flex-col gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-2"
              onClick={() => {
                onCreateNew();
                setOpen(false);
              }}
            >
              <Plus className="h-4 w-4" />
              Create new restaurant
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-2"
              onClick={() => {
                onManageRestaurants();
                setOpen(false);
              }}
            >
              <Settings className="h-4 w-4" />
              Manage restaurants
            </Button>
          </div>
        </Command>
      </PopoverContent>
    </Popover>
  );
}