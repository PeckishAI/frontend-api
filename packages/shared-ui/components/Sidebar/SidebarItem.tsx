import './sidebarItem.scss';
import React from 'react';

type Props = {
  name: string;
  icon: React.ReactNode;
  onClick: () => void;
};

const SidebarItem = (props: Props) => {
  return (
    <div className="sidebar-item" onClick={props.onClick}>
      <div className="icon-container">{props.icon}</div>
      <span>{props.name}</span>
    </div>
  );
};

export default SidebarItem;
