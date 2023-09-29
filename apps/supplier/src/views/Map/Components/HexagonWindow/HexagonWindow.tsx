import { LatLngExpression } from 'leaflet';
import './style.scss';

type Props = {
  hexagon?: LatLngExpression[];
  onClose: () => void;
};

const HexagonWindow = (props: Props) => {
  if (!props.hexagon) return;
  props.hexagon.forEach((element) => console.log(element));
  return (
    <div className="hexagon-window">
      <i className="fa-solid fa-xmark close" onClick={props.onClose}></i>
      <p className="name">Hexagon zone</p>
      <p>corners coordinates : </p>
      <p></p>
    </div>
  );
};

export default HexagonWindow;
