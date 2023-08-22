import { RestaurantCard } from 'shared-ui';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { restaurantService } from '../services';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from 'user-management';
import { Restaurant, useRestaurantStore } from '../store/useRestaurantStore';

const MyRestaurant = () => {
  const navigate = useNavigate();
  const { t } = useTranslation('common');
  const { restaurants, loadRestaurants, setSelectedRestaurantUUID } =
    useRestaurantStore();

  // Fetch data from API Backend (Get restaurants)
  useEffect(() => {
    if (restaurants) return;

    loadRestaurants();
  }, [restaurants, loadRestaurants]);

  return (
    <div className="my-restaurants">
      {restaurants &&
        restaurants.map((restaurant) => {
          return (
            <RestaurantCard
              key={restaurant.uuid}
              restaurant={restaurant}
              onClick={() => {
                setSelectedRestaurantUUID(restaurant.uuid);
                navigate('/overview');
              }}
            />
          );
        })}
    </div>
  );
};

export default MyRestaurant;
