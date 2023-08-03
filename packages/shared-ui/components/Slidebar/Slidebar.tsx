import './slidebar.scss';
import React from 'react';

type Props = {
  children: React.ReactNode;
};

const Slidebar = (props: Props) => {
  return (
    <div className="slidebar">
      <h1 className="company-name">peckish</h1>
      <div className="slidebar-items-container">{props.children}</div>
    </div>
  );
};

export default Slidebar;
