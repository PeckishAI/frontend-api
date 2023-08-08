import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import {
  Slidebar,
  SlidebarItem,
  SlidebarSeparator,
  Navbar,
  Lottie,
} from 'shared-ui';

// type Props = {};

const Layout = () => {
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const handleIconClick = () => {
    setIsRefreshing(true);
  };
  return (
    <>
      <Slidebar>
        <SlidebarItem
          name={t('myRestaurant')}
          icon={<i className="fa-solid fa-utensils"></i>}
          onClick={() => {
            navigate('/myRestaurant');
          }}
        />
        <SlidebarItem
          name={t('overview')}
          icon={<i className="fa-solid fa-chart-line"></i>}
          onClick={() => {
            navigate('/overview');
          }}
        />
        <SlidebarItem
          name={t('inventory')}
          icon={<i className="fa-solid fa-cubes-stacked"></i>}
          onClick={() => {
            navigate('/inventory');
          }}
        />
        <SlidebarItem
          name={t('recipes')}
          icon={<i className="fa-solid fa-burger"></i>}
          onClick={() => {
            navigate('/recipes');
          }}
        />
        <SlidebarSeparator sectionName="Services" />
        <SlidebarItem
          name={t('simulation')}
          icon={<i className="fa-brands fa-unity"></i>}
          onClick={() => {
            navigate('/simulation');
          }}
        />
      </Slidebar>
      <div className="main">
        <Navbar
          refreshIcon={
            isRefreshing ? (
              <Lottie type="validate" />
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
