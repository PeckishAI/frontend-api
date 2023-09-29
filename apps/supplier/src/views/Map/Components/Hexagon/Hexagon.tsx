import './style.scss';
import { LatLngExpression } from 'leaflet';
import { useEffect, useRef, useState } from 'react';
import { Polygon } from 'react-leaflet';

type Props = {
  hexagon: LatLngExpression[];
  onHexagonClick: () => void;
};

const Hexagon = (props: Props) => {
  const hexagonRef = useRef<any>();

  const handleHexagonClick = () => {
    console.log('hexagon clicked coordinates :', props.hexagon);
    props.onHexagonClick();
  };

  const handleHexagonHover = () => {
    console.log('hovered');
  };
  useEffect(() => {
    hexagonRef?.current?.on('click', () => {
      handleHexagonClick();
    });
    hexagonRef?.current?.on('mouseover', () => {
      handleHexagonHover();
    });
    hexagonRef?.current?.on('mouseout', () => {
      console.log('plus hover');
    });
  }, []);

  return (
    <div className="hexagon">
      <Polygon
        ref={hexagonRef}
        positions={props.hexagon}
        color="blue"
        fillOpacity={0.05}
        weight={1.5}
      />
    </div>
  );
};

export default Hexagon;
