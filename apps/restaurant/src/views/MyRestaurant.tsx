import { EmptyPage, RestaurantCard, useTitle } from 'shared-ui';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRestaurantStore } from '../store/useRestaurantStore';
import { useTranslation } from 'react-i18next';
import { useUserStore } from '@peckishai/user-management';
import { toast } from 'react-hot-toast';

const MyRestaurant = () => {
  const { t } = useTranslation();
  useTitle(t('pages.myRestaurants'));

  const navigate = useNavigate();
  const { restaurants, loadRestaurants, setSelectedRestaurantUUID } =
    useRestaurantStore();
  const { user } = useUserStore(); // Get the user from the user store

  useEffect(() => {
    if (restaurants) return;

    loadRestaurants();
  }, [restaurants, loadRestaurants]);

  console.log('restaurants', restaurants);

  const handleOverviewClick = (restaurantUUID) => {
    if (user?.permissions?.overview) {
      setSelectedRestaurantUUID(restaurantUUID);
      navigate('/overview');
    } else {
      toast.error('You do not have permission to access the Overview page.');
    }
  };

  return restaurants.length > 0 ? (
    <div className="my-restaurants">
      {restaurants &&
        restaurants.map((restaurant) => (
          <RestaurantCard
            key={restaurant.uuid}
            restaurant={restaurant}
            onClick={() => handleOverviewClick(restaurant.uuid)}
          />
        ))}
    </div>
  ) : (
    <EmptyPage
      title={t('myRestaurants.emptyTitle')}
      description={t('myrestaurants.emptyText')}
    />
  );
};

export default MyRestaurant;
