import { Outlet, useNavigate } from 'react-router-dom';
import { Slidebar, SlidebarItem, SlidebarSeparator, Navbar } from 'shared-ui';

// type Props = {};

const Layout = () => {
  const navigate = useNavigate();
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
        <Navbar />
        <div className="content">
          <Outlet />
        </div>
      </div>
    </>
  );
};

export default Layout;
