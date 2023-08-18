import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import {
  Sidebar,
  SidebarItem,
  SidebarSeparator,
  Navbar,
  Lottie,
  Dropdown,
} from 'shared-ui';
import useUserStore from '../store/useUserStore';
import { useRestaurantStore } from '../store/useRestaurantStore';

// type Props = {};

const Layout = () => {
  const { t } = useTranslation('common');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const navigate = useNavigate();

  const { logout } = useUserStore();
  const {
    selectedRestaurantUUID,
    setSelectedRestaurantUUID,
    restaurants,
    loadRestaurants,
  } = useRestaurantStore();

  useEffect(() => {
    loadRestaurants();
  }, [loadRestaurants]);

  const handleIconClick = () => {
    setIsRefreshing(true);
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <>
      <Sidebar>
        <SidebarItem
          name={t('myRestaurant')}
          icon={<i className="fa-solid fa-utensils"></i>}
          onClick={() => {
            navigate('/');
          }}
        />
        <SidebarItem
          name={t('overview')}
          icon={<i className="fa-solid fa-chart-line"></i>}
          onClick={() => {
            navigate('/overview');
          }}
        />
        <SidebarItem
          name={t('inventory')}
          icon={<i className="fa-solid fa-cubes-stacked"></i>}
          onClick={() => {
            navigate('/inventory');
          }}
        />
        <SidebarItem
          name={t('recipes')}
          icon={<i className="fa-solid fa-burger"></i>}
          onClick={() => {
            navigate('/recipes');
          }}
        />
        <SidebarSeparator sectionName="Services" />
        <SidebarItem
          name={t('simulation')}
          icon={<i className="fa-brands fa-unity"></i>}
          onClick={() => {
            navigate('/simulation');
          }}
        />
        <div className="restaurant-dropdown">
          <p className="label">Restaurants :</p>
          <Dropdown
            options={restaurants.map((restaurant) => ({
              label: restaurant.name,
              value: restaurant.uuid,
            }))}
            onOptionChange={setSelectedRestaurantUUID}
            selectedOption={selectedRestaurantUUID}
          />
        </div>
      </Sidebar>
      <div className="main">
        <Navbar
          title="Peckish"
          refreshIcon={
            isRefreshing ? (
              <Lottie width="30px" type="validate" />
            ) : (
              <i className="fa-solid fa-rotate icon"></i>
            )
          }
          onRefresh={handleIconClick}
          onLogout={handleLogout}
        />
        <div className="content">
          <Outlet />
        </div>
      </div>
    </>
  );
};

export default Layout;
