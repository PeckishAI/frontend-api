
import { useState } from 'react';
import { RestaurantSelector } from '@/components/layout/RestaurantSelector';
import { Restaurant } from '@/types/restaurant';

export function RestaurantList() {
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);

  const handleRestaurantChange = (restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant);
  };

  return (
    <div className="w-full max-w-xl mx-auto">
      <RestaurantSelector
        currentRestaurant={selectedRestaurant}
        onRestaurantChange={handleRestaurantChange}
        onCreateNew={() => {}}
        onManageRestaurants={() => {}}
      />
    </div>
  );
}
