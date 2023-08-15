import './sidebar.scss';
import React from 'react';

type Props = {
  children: React.ReactNode;
};

const Sidebar = (props: Props) => {
  return (
    <div className="sidebar">
      <h1 className="company-name">peckish</h1>
      <div className="sidebar-items-container">{props.children}</div>
    </div>
  );
};

export default Sidebar;
