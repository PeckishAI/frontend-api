import { RestaurantCard } from 'shared-ui';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRestaurantStore } from '../store/useRestaurantStore';

const MyRestaurant = () => {
  const navigate = useNavigate();
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
