import { BurgerMenu, Switch } from 'shared-ui';
import './style.scss';
import { useState } from 'react';
import classNames from 'classnames';

type Props = {
  hexagonEnable: boolean;
  onToogleHexagon: () => void;
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
      <div className={classNames('menu', isOpen && 'open')}>
        <div className="options">
          <div className="option">
            <span>Hexagons</span>
            <Switch
              isActive={props.hexagonEnable}
              toggle={props.onToogleHexagon}
              width={36}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default ControlLayer;
