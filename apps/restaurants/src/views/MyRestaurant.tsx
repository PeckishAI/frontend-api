import { RestaurantCard } from 'shared-ui';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { restaurantService } from '../_services';
import { useNavigate } from 'react-router-dom';

type Props = {};

type Restaurant = {
  restaurant_uuid: string;
  name: string;
  city: string;
  country: string;
  address: string;
  users: [
    {
      user_uuid: string;
      username: string;
      user_email: string;
      user_picture: string;
    },
  ];
};

const MyRestaurant = (props: Props) => {
  const navigate = useNavigate();
  const { t } = useTranslation('common');
  const [restaurantList, setRestaurantList] = useState<Restaurant[]>([]);

  // Fetch data from API Backend (Get POS)
  function reloadRestaurantData() {
    (async () => {
      try {
        const list = await restaurantService.getRestaurantsList();
        setRestaurantList(list.data);
        console.log(list.data);
      } catch (error) {
        console.error('Error fetching pos list:', error);
      }
    })();
  }
  useEffect(() => {
    reloadRestaurantData();
  }, []);

  return (
    <>
      {restaurantList &&
        restaurantList.map((restaurant) => {
          return (
            <RestaurantCard
              key={restaurant.restaurant_uuid}
              restaurant_uuid={restaurant.restaurant_uuid}
              restaurant_name={restaurant.name}
              restaurant_address={restaurant.address}
              restaurant_city={restaurant.city}
              restaurant_country={restaurant.country}
              user={restaurant.users}
              onClick={() => {
                navigate('/restaurant/test');
              }}
            />
          );
        })}
    </>
  );
};

export default MyRestaurant;
