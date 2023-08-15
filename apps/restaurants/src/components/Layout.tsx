import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import {
  Sidebar,
  SidebarItem,
  SidebarSeparator,
  Navbar,
  Lottie,
} from 'shared-ui';
import useUserStore from '../store/useUserStore';

// type Props = {};

const Layout = () => {
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { accessToken } = useUserStore();

  const handleIconClick = () => {
    setIsRefreshing(true);
  };

  useEffect(() => {
    if (!accessToken) {
      navigate('/login-handler');
    }
  }, [accessToken, navigate]);

  return (
    <>
      <Sidebar>
        <SidebarItem
          name={t('myRestaurant')}
          icon={<i className="fa-solid fa-utensils"></i>}
          onClick={() => {
            navigate('/myRestaurant');
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
      </Sidebar>
      <div className="main">
        <Navbar
          refreshIcon={
            isRefreshing ? (
              <Lottie width="30px" type="validate" />
            ) : (
              <i className="fa-solid fa-rotate icon"></i>
            )
          }
          onRefresh={handleIconClick}
        />
        <div className="content">
          <Outlet />
        </div>
      </div>
    </>
  );
};

export default Layout;
