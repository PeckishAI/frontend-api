import './navbar.scss';
import { Tooltip } from 'react-tooltip';
import React from 'react';
import { Link } from 'react-router-dom';
type Props = {
  title: string;
  refreshIcon: React.ReactNode;
  onRefresh: () => void;
  onLogout: () => void;
};

const Navbar = (props: Props) => {
  return (
    <div className="navbar">
      <h2 className="page-title">{props.title}</h2>
      <div className="nav-actions">
        <div
          className="refresh"
          onClick={props.onRefresh}
          data-tooltip-id="nav-tooltip"
          data-tooltip-content="Refresh">
          {props.refreshIcon}
        </div>
        <div className="my-account icon">
          <Link
            to="/profile"
            className="profile-icon"
            data-tooltip-id="nav-tooltip"
            data-tooltip-content="Profile">
            <i className="fa-solid fa-user-ninja"></i>
          </Link>
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
