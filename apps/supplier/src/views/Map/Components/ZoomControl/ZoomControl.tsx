// import { useState } from 'react';
import './style.scss';
import { useMap } from 'react-leaflet';

function ZoomControl() {
  const map = useMap();
  // const [clickCount, setClickCount] = useState(0);
  // let clickTimer: any;

  const handleZoomIn = (e) => {
    map.zoomIn();
    e.stopPropagation();
  };

  const handleZoomOut = (e) => {
    map.zoomOut();
    e.stopPropagation();
  };

  return (
    <div className="zoom-control">
      <i className="fa-solid fa-plus" onClick={(e) => handleZoomIn(e)}></i>
      <i className="fa-solid fa-minus" onClick={(e) => handleZoomOut(e)}></i>
    </div>
  );
}

export default ZoomControl;
