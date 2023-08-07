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
          name={t('orders')}
          icon={<i className="fa-solid fa-list-ul"></i>}
          onClick={() => {
            navigate('/orders');
          }}
        />
        <SlidebarItem
          name={t('catalog')}
          icon={<i className="fa-solid fa-shop"></i>}
          onClick={() => {
            navigate('/catalog');
          }}
        />
        <SlidebarItem
          name={t('map')}
          icon={<i className="fa-solid fa-map-location-dot"></i>}
          onClick={() => {
            navigate('/map');
          }}
        />
        <SlidebarSeparator sectionName="Resources" />
        <SlidebarItem
          name={t('support')}
          icon={<i className="fa-regular fa-handshake"></i>}
          onClick={() => {
            navigate('/support');
          }}
        />
      </Slidebar>
      <div className="main">
        <Navbar
          refreshIcon={
            isRefreshing ? (
              <Lottie />
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
