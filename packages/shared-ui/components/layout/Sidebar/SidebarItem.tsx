import './sidebarItem.scss';
import React from 'react';
import { NavLink } from 'react-router-dom';

type Props = {
  name: string;
  icon: React.ReactNode;
  to: string;
};

const SidebarItem = (props: Props) => {
  return (
    <NavLink className="sidebar-item" to={props.to}>
      <div className="icon-container">{props.icon}</div>
      <span>{props.name}</span>
    </NavLink>
  );
};

export default SidebarItem;
