import './navbar.scss';
import React from 'react';

type Props = {
  title: string;
  isRefreshing: boolean;
  onRefresh: () => void;
  onLogout: () => void;
  options?: React.ReactNode;
};

const Navbar = (props: Props) => {
  return (
    <div className="navbar">
      <h2 className="page-title">{props.title}</h2>
      <div className="nav-actions">{props.options}</div>
    </div>
  );
};

export default Navbar;
