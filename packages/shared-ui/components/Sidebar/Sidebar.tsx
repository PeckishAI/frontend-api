import Lottie from 'react-lottie';
import './sidebar.scss';
import React, { useRef, useState } from 'react';
import bruger from '../../asset/lotties/burger.json';

type Props = {
  children: React.ReactNode;
};

const Sidebar = (props: Props) => {
  const [burgerClicked, setBurgerClicked] = useState(false);

  return (
    <div className={`sidebar ${burgerClicked ? 'sidebar-floating' : ''}`}>
      {burgerClicked ? (
        <i
          className="fa-solid fa-xmark burger"
          onClick={() => setBurgerClicked(!burgerClicked)}></i>
      ) : (
        <i
          className="fa-solid fa-bars burger"
          onClick={() => setBurgerClicked(!burgerClicked)}></i>
      )}

      <h1 className="company-name">peckish</h1>
      <div className="sidebar-items-container">{props.children}</div>
    </div>
  );
};

export default Sidebar;
