import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import {
  Sidebar,
  SidebarItem,
  SidebarSeparator,
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
      <Sidebar>
        <SidebarItem
          name={t('orders')}
          icon={<i className="fa-solid fa-list-ul"></i>}
          onClick={() => {
            navigate('/orders');
          }}
        />
        <SidebarItem
          name={t('catalog')}
          icon={<i className="fa-solid fa-shop"></i>}
          onClick={() => {
            navigate('/catalog');
          }}
        />
        <SidebarItem
          name={t('customers')}
          icon={<i className="fa-solid fa-share-nodes"></i>}
          onClick={() => {
            navigate('/customers');
          }}
        />
        <SidebarItem
          name={t('map')}
          icon={<i className="fa-solid fa-map-location-dot"></i>}
          onClick={() => {
            navigate('/map');
          }}
        />
        <SidebarSeparator sectionName="Resources" />
        <SidebarItem
          name={t('support')}
          icon={<i className="fa-regular fa-handshake"></i>}
          onClick={() => {
            navigate('/support');
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
