import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Slidebar, SlidebarItem, SlidebarSeparator, Navbar } from 'shared-ui';
import LottieFile from './Lottie/Lottie';

// type Props = {};

const Layout = () => {
  const navigate = useNavigate();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const handleIconClick = () => {
    setIsRefreshing(true);
  };
  return (
    <>
      <Slidebar>
        <SlidebarItem
          name="Orders"
          icon={<i className="fa-solid fa-list-ul"></i>}
          onClick={() => {
            navigate('/orders');
          }}
        />
        <SlidebarItem
          name="Catalog"
          icon={<i className="fa-solid fa-shop"></i>}
          onClick={() => {
            navigate('/catalog');
          }}
        />
        <SlidebarItem
          name="Map"
          icon={<i className="fa-solid fa-map-location-dot"></i>}
          onClick={() => {
            navigate('/map');
          }}
        />
        <SlidebarSeparator sectionName="Resources" />
        <SlidebarItem
          name="Support"
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
              <LottieFile />
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
