import { EmptyPage, RestaurantCard, useTitle } from 'shared-ui';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRestaurantStore } from '../store/useRestaurantStore';
import { useTranslation } from 'react-i18next';

const MyRestaurant = () => {
  const { t } = useTranslation();
  useTitle(t('pages.myRestaurants'));

  const navigate = useNavigate();
  const { restaurants, loadRestaurants, setSelectedRestaurantUUID } =
    useRestaurantStore();

  // Fetch data from API Backend (Get restaurants)
  useEffect(() => {
    if (restaurants) return;

    loadRestaurants();
  }, [restaurants, loadRestaurants]);

  console.log('restaurants', restaurants);

  return restaurants.length > 0 ? (
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
  ) : (
    <EmptyPage
      title={t('myRestaurants.emptyTitle')}
      description={t('myrestaurants.emptyText')}
    />
  );
};

export default MyRestaurant;
