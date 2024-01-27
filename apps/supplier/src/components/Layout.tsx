import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarItem,
  SidebarSeparator,
  Navbar,
  Lottie,
} from 'shared-ui';
import { useUserStore } from '@peckishai/user-management';

// type Props = {};

const Layout = () => {
  const { t } = useTranslation();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [navTitle, setNavTitle] = useState('');
  const { pathname } = useLocation();

  const { logout, user } = useUserStore();
  // const {
  //   selectedRestaurantUUID,
  //   setSelectedRestaurantUUID,
  //   restaurants,
  //   loadRestaurants,
  //   restaurantsLoading,
  // } = useRestaurantStore();

  // useEffect(() => {
  //   loadRestaurants();
  // }, [loadRestaurants]);

  const handleRefreshClick = () => {
    // if (!selectedRestaurantUUID) return;
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

  // if (user && !user.onboarded) {
  //   return <Navigate to="/onboarding" />;
  // }

  // const restaurantsOptions = restaurants.map((restaurant) => ({
  //   label: restaurant.name,
  //   value: restaurant.uuid,
  // }));
  return (
    <>
      <Sidebar>
        <SidebarItem
          name={t('sidebarItem.orders')}
          icon={<i className="fa-solid fa-list-ul"></i>}
          to="/orders"
        />
        <SidebarItem
          name={t('sidebarItem.catalog')}
          icon={<i className="fa-solid fa-shop"></i>}
          to="/catalog"
        />
        <SidebarItem
          name={t('sidebarItem.customers')}
          icon={<i className="fa-solid fa-share-nodes"></i>}
          to="/customers"
        />
        <SidebarItem
          name={t('sidebarItem.map')}
          icon={<i className="fa-solid fa-map-location-dot"></i>}
          to="/map"
        />
        <SidebarItem
          name={t('sidebarItem.integrations')}
          icon={<i className="fa-solid fa-puzzle-piece"></i>}
          to="/integrations"
        />
        <SidebarSeparator sectionName="Resources" />
        <SidebarItem
          name={t('sidebarItem.support')}
          icon={<i className="fa-regular fa-handshake"></i>}
          to="/support"
        />
      </Sidebar>
      <div className="main">
        <Navbar
          title={navTitle}
          onLogout={handleLogout}
          refreshIcon={
            isRefreshing ? (
              <Lottie width="50px" type="loading" />
            ) : (
              <i className="fa-solid fa-rotate icon"></i>
            )
          }
          onRefresh={handleRefreshClick}
        />
        <div className="content">
          <Outlet />
        </div>
      </div>
    </>
  );
};

export default Layout;
