import { BurgerMenu, Switch } from 'shared-ui';
import './style.scss';
import { useState } from 'react';
import classNames from 'classnames';

type Props = {
  hexagonEnable: boolean;
  toggleHexagon: () => void;
  showRestaurants: boolean;
  toggleShowRestaurants: () => void;
};

function ControlLayer(props: Props) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="control-layer">
      <BurgerMenu
        isOpen={isOpen}
        toggle={() => setIsOpen(!isOpen)}
        className="map-burger"
      />
      <div
        className={classNames('menu', isOpen && 'open')}
        onClick={(e) => e.stopPropagation()}>
        <div className="options">
          <div className="option">
            <span>Hexagons</span>
            <Switch
              isActive={props.hexagonEnable}
              toggle={props.toggleHexagon}
              width={36}
            />
          </div>
          <div className="option">
            <span>Restaurants</span>
            <Switch
              isActive={props.showRestaurants}
              toggle={props.toggleShowRestaurants}
              width={36}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default ControlLayer;
