import './style.scss';
import { useMap } from 'react-leaflet';

function ZoomControl() {
  const map = useMap();

  const handleZoomIn = () => {
    map.zoomIn();
  };

  const handleZoomOut = () => {
    map.zoomOut();
  };

  return (
    <div className="zoom-control">
      <i className="fa-solid fa-plus" onClick={handleZoomIn}></i>
      <i className="fa-solid fa-minus" onClick={handleZoomOut}></i>
    </div>
  );
}

export default ZoomControl;
