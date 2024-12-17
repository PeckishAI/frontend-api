
import { RestaurantSelector } from '@/components/layout/RestaurantSelector';

export function RestaurantList() {
  return (
    <div className="w-full max-w-xl mx-auto">
      <RestaurantSelector
        onCreateNew={() => {}}
        onManageRestaurants={() => {}}
      />
    </div>
  );
}
