import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { Navigate, Outlet, useNavigate } from 'react-router-dom';
import {
  Sidebar,
  SidebarItem,
  Navbar,
  SidebarSeparator,
  Select,
  IconButton,
  useNavTitle,
} from 'shared-ui';
import { useRestaurantStore } from '../store/useRestaurantStore';
import { useUserStore } from '@peckishai/user-management';
import { restaurantService } from '../services';
import { Tooltip } from 'react-tooltip';
import { NotificationCenter } from './NotificationCenter/NotificationCenter';

const Layout = () => {
  const { t } = useTranslation();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const navigate = useNavigate();

  const { logout, user } = useUserStore();
  const {
    selectedRestaurantUUID,
    setSelectedRestaurantUUID,
    restaurants,
    loadRestaurants,
    restaurantsLoading,
  } = useRestaurantStore();

  useEffect(() => {
    loadRestaurants();
  }, [loadRestaurants]);

  const handleRefreshClick = () => {
    if (!selectedRestaurantUUID) return;

    setIsRefreshing(true);
    restaurantService.reloadPOS(selectedRestaurantUUID).then((success) => {
      if (success) {
        setTimeout(() => {
          setIsRefreshing(false);
          navigate(0);
        }, 2500);
      }
    });
  };

  const handleLogout = () => {
    logout();
  };

  const title = useNavTitle();

  if (user && !user.onboarded) {
    return <Navigate to="/onboarding" />;
  }

  const restaurantsOptions = restaurants.map((restaurant) => ({
    label: restaurant.name,
    value: restaurant.uuid,
  }));

  const sidebarItems = [
    {
      name: t('pages.myRestaurants'),
      icon: <i className="fa-solid fa-utensils"></i>,
      navigateTo: '/',
    },
    {
      name: t('pages.overview'),
      icon: <i className="fa-solid fa-chart-line"></i>,
      navigateTo: '/overview',
    },
    {
      name: t('pages.inventory.stock'),
      icon: <i className="fa-solid fa-cubes-stacked"></i>,
      navigateTo: '/inventory/stock',
    },
    {
      name: t('pages.recipes'),
      icon: <i className="fa-solid fa-burger"></i>,
      navigateTo: '/recipes',
    },
    {
      name: t('pages.documents'),
      icon: <i className="fa-solid fa-file"></i>,
      navigateTo: '/documents',
    },
    {
      separatorName: t('services'),
    },
    {
      name: t('pages.integrations'),
      icon: <i className="fa-solid fa-puzzle-piece"></i>,
      navigateTo: '/integrations',
    },
    {
      name: t('pages.support'),
      icon: <i className="fa-solid fa-circle-question"></i>,
      navigateTo: '/support',
    },
  ];

  return (
    <>
      <Sidebar>
        {sidebarItems.map((item) =>
          item.separatorName !== undefined ? (
            <SidebarSeparator
              key={item.separatorName}
              sectionName={item.separatorName}
            />
          ) : (
            <SidebarItem
              key={item.name}
              name={item.name}
              icon={item.icon}
              to={item.navigateTo}
            />
          )
        )}
        <div className="restaurant-dropdown">
          <p className="label">{t('navbar.restaurantsDropdown')} :</p>
          <Select
            menuPlacement="top"
            isLoading={restaurantsLoading}
            options={restaurantsOptions}
            value={restaurantsOptions.find(
              (opt) => opt.value === selectedRestaurantUUID
            )}
            onChange={(option) => {
              if (option === null) return;
              setSelectedRestaurantUUID(option.value);
            }}
          />
        </div>
      </Sidebar>
      <div className="main">
        <Navbar
          title={title}
          isRefreshing={isRefreshing}
          onRefresh={handleRefreshClick}
          onLogout={handleLogout}
          options={
            <>
              <NotificationCenter />
              <IconButton
                icon={<i className="fa-solid fa-rotate"></i>}
                onClick={handleRefreshClick}
                tooltipMsg={t('refresh')}
                tooltipId="nav-tooltip"
                loading={isRefreshing}
              />
              <IconButton
                icon={<i className="fa-solid fa-arrow-right-from-bracket"></i>}
                onClick={handleLogout}
                tooltipMsg={t('logout')}
                tooltipId="nav-tooltip"
              />
              <Tooltip className="tooltip" id="nav-tooltip" />
            </>
          }
        />
        <div className="content">
          <Outlet />
        </div>
      </div>
    </>
  );
};

export default Layout;
