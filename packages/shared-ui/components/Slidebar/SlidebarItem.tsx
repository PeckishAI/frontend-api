import './SlidebarItem.scss';
import React from 'react';

type Props = {
  name: string;
  icon: React.ReactNode;
  onClick: () => void;
};

const SlidebarItem = (props: Props) => {
  return (
    <div className="slidebar-item" onClick={props.onClick}>
      <div className="icon-container">{props.icon}</div>
      <span>{props.name}</span>
    </div>
  );
};

export default SlidebarItem;
