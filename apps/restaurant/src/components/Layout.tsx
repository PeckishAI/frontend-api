import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Sidebar,
  SidebarItem,
  Navbar,
  Lottie,
  SidebarSeparator,
  Select,
} from 'shared-ui';
import { useRestaurantStore } from '../store/useRestaurantStore';
import { useUserStore } from '@peckishai/user-management';
import { restaurantService } from '../services';

const Layout = () => {
  const { t } = useTranslation();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [navTitle, setNavTitle] = useState('');
  const { pathname } = useLocation();
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

    restaurantService.reloadPOS(selectedRestaurantUUID).then((success) => {
      if (success) {
        setIsRefreshing(true);

        setTimeout(() => {
          navigate(0);
        }, 2500);
      }
    });
  };

  const handleLogout = () => {
    logout();
  };

  useEffect(() => {
    // Convert path to dot notation (ex :user.profile)
    let path = pathname;
    if (pathname.slice(-1) === '/') {
      path = pathname.slice(0, -1);
    }
    if (pathname.charAt(0) === '/') {
      path = path.substring(1);
    }
    path = path.replaceAll('/', '.');

    if (path === '') path = 'myRestaurant';

    // Get possible translation
    const title: string = t(path as unknown as TemplateStringsArray, {
      defaultValue: '',
    });
    setNavTitle(title !== '' ? title : path);
  }, [t, pathname]);

  if (user && !user.onboarded) {
    return <Navigate to="/onboarding" />;
  }

  const restaurantsOptions = restaurants.map((restaurant) => ({
    label: restaurant.name,
    value: restaurant.uuid,
  }));

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
          name={t('inventory.stock')}
          icon={<i className="fa-solid fa-cubes-stacked"></i>}
          onClick={() => {
            navigate('/inventory/stock');
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
          name={t('integrations')}
          icon={<i className="fa-solid fa-puzzle-piece"></i>}
          onClick={() => {
            navigate('/integrations');
          }}
        />
        <SidebarItem
          name={t('support')}
          icon={<i className="fa-solid fa-circle-question"></i>}
          onClick={() => {
            navigate('/support');
          }}
        />
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
          title={navTitle}
          refreshIcon={
            isRefreshing ? (
              <Lottie type="loading" width="50px" />
            ) : (
              <i className="fa-solid fa-rotate icon"></i>
            )
          }
          onRefresh={handleRefreshClick}
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
