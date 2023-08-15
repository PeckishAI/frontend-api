import './navbar.scss';
import { useLocation } from 'react-router-dom';
import { Tooltip } from 'react-tooltip';
import React from 'react';
type Props = {
  refreshIcon: React.ReactNode;
  onRefresh: () => void;
  onLogout: () => void;
};

const Navbar = (props: Props) => {
  const location = useLocation();
  const pathName = location.pathname.replace('/', '');
  const pathNameFormated = pathName.charAt(0).toUpperCase() + pathName.slice(1);

  return (
    <div className="navbar">
      <h2 className="page-title">{pathNameFormated}</h2>
      <div className="nav-actions">
        <div
          className="refresh"
          onClick={props.onRefresh}
          data-tooltip-id="nav-tooltip"
          data-tooltip-content="Refresh">
          {props.refreshIcon}
        </div>
        <div
          className="my-account icon"
          data-tooltip-id="nav-tooltip"
          data-tooltip-content="Log-out"
          onClick={props.onLogout}>
          <i className="fa-solid fa-arrow-right-from-bracket"></i>
        </div>
        <Tooltip className="tooltip" id="nav-tooltip" />
      </div>
    </div>
  );
};

export default Navbar;
