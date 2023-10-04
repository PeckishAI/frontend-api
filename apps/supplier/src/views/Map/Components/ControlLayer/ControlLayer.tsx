import { Switch } from 'shared-ui';
import './style.scss';

type Props = {
  hexagonEnable: boolean;
  onToogleHexagon: () => void;
};

function ControlLayer(props: Props) {
  return (
    <div className="control-layer">
      <input type="checkbox" id="menu" />
      <label htmlFor="menu" className="burger">
        <div className="bar leftBar"></div>
        <div className="bar"></div>
        <div className="bar rightBar"></div>
      </label>
      <div className="menu">
        <div className="options">
          <div className="option">
            <span>Hexagons</span>
            <Switch
              isActive={props.hexagonEnable}
              toggle={props.onToogleHexagon}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default ControlLayer;
