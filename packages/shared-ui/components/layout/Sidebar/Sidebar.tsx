import BurgerMenu from '../BurgerMenu/BurgerMenu';
import './sidebar.scss';
import React, { useState } from 'react';

type Props = {
  children: React.ReactNode;
};

const Sidebar = (props: Props) => {
  const [burgerClicked, setBurgerClicked] = useState(false);

  return (
    <div className={`sidebar ${burgerClicked ? 'sidebar-floating' : ''}`}>
      {/* {burgerClicked ? (
        <i
          className="fa-solid fa-xmark burger"
          onClick={() => setBurgerClicked(!burgerClicked)}></i>
      ) : (
        <i
          className="fa-solid fa-bars burger"
          onClick={() => setBurgerClicked(!burgerClicked)}></i>
      )} */}

      <BurgerMenu
        isOpen={burgerClicked}
        toggle={() => setBurgerClicked(!burgerClicked)}
        className="sidebar-burger"
      />
      <div className="logo-container">
        <img src="/logo.png" alt="logo" className="logo-img" />
      </div>
      <div className="sidebar-items-container">{props.children}</div>
    </div>
  );
};

export default Sidebar;
