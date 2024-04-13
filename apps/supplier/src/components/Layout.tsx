import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarItem,
  SidebarSeparator,
  Navbar,
  IconButton,
} from 'shared-ui';
import { useUserStore } from '@peckishai/user-management';
import { Tooltip } from 'react-tooltip';
import { useSupplierStore } from '../store/useSupplierStore';
import { Toaster } from 'react-hot-toast';

// type Props = {};

const Layout = () => {
  const { t } = useTranslation();
  const [navTitle, setNavTitle] = useState('');
  const { pathname } = useLocation();

  const { logout } = useUserStore();
  const { loadSupplier } = useSupplierStore();

  useEffect(() => {
    loadSupplier();
  }, [loadSupplier]);

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
          options={
            <>
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
          <Toaster />
        </div>
      </div>
    </>
  );
};

export default Layout;
