import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Sidebar, SidebarItem, Navbar, Lottie, Dropdown } from 'shared-ui';
import { useRestaurantStore } from '../store/useRestaurantStore';
import { useUserStore } from 'user-management';

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
        {/* <SidebarSeparator sectionName="Services" />
        <SidebarItem
          name={t('simulation')}
          icon={<i className="fa-brands fa-unity"></i>}
          onClick={() => {
            navigate('/simulation');
          }}
        /> */}
        <div className="restaurant-dropdown">
          <p className="label">{t('navbar.restaurants')} :</p>
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
          title={navTitle}
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
