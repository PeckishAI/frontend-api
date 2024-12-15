import { useState } from 'react';
import { ChevronDown, Plus, Settings, Search } from 'lucide-react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type Restaurant = {
  id: number;
  name: string;
  logo?: string;
};

interface RestaurantSelectorProps {
  restaurants: Restaurant[];
  currentRestaurant?: Restaurant;
  onRestaurantChange: (restaurant: Restaurant) => void;
  onCreateNew: () => void;
  onManageRestaurants: () => void;
}

export function RestaurantSelector({
  restaurants,
  currentRestaurant,
  onRestaurantChange,
  onCreateNew,
  onManageRestaurants,
}: RestaurantSelectorProps) {
  const [open, setOpen] = useState(false);

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
              {currentRestaurant?.logo ? (
                <AvatarImage src={currentRestaurant.logo} alt={currentRestaurant.name} />
              ) : (
                <AvatarFallback>{currentRestaurant?.name?.[0]?.toUpperCase() || '?'}</AvatarFallback>
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
                  key={restaurant.id}
                  onSelect={() => {
                    onRestaurantChange(restaurant);
                    setOpen(false);
                  }}
                  className="flex items-center gap-2 px-4 py-2"
                >
                  <Avatar className="h-8 w-8">
                    {restaurant.logo ? (
                      <AvatarImage src={restaurant.logo} alt={restaurant.name} />
                    ) : (
                      <AvatarFallback>{restaurant.name[0].toUpperCase()}</AvatarFallback>
                    )}
                  </Avatar>
                  <span>{restaurant.name}</span>
                  <span 
                    className={cn(
                      "ml-auto",
                      restaurant.id === currentRestaurant?.id ? "opacity-100" : "opacity-0"
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
