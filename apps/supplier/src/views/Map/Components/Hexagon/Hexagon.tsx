import './style.scss';
import { LatLngExpression } from 'leaflet';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Polygon } from 'react-leaflet';

export type HexagonType = { id: number; coordinates: LatLngExpression[] };

type Props = {
  hexagon: HexagonType;
  onHexagonClicked: (selected: boolean) => void;
};

const defaultStyle = {
  fillOpacity: 0.05,
  fillColor: 'blue',
  weight: 0.2,
};
const Hexagon = (props: Props) => {
  const hexagonRef = useRef<any>();
  const [hexagonStyle, setHexagonStyle] = useState(defaultStyle);
  const [resetPolygonKey, setResetPolygonKey] = useState(0);
  const [isSelected, setIsSelected] = useState(false);

  const handleHexagonClick = useCallback(() => {
    let newSelectedState = false;
    if (!isSelected) {
      setHexagonStyle((prevState) => ({
        ...prevState,
        weight: 1.5,
      }));
      newSelectedState = true;
    } else {
      setHexagonStyle(defaultStyle);
      newSelectedState = false;
    }

    setIsSelected(newSelectedState);
    props.onHexagonClicked(newSelectedState);

    setResetPolygonKey((prevKey) => prevKey + 1);
  }, [isSelected, props.onHexagonClicked]);

  useEffect(() => {
    const polygon = hexagonRef.current;

    if (polygon) {
      polygon.on('click', () => {
        handleHexagonClick();
      });
    }
    return () => {
      if (polygon) polygon.off('click');
    };
  }, [handleHexagonClick]);

  return (
    <div className="hexagon">
      <Polygon
        key={resetPolygonKey}
        ref={hexagonRef}
        positions={props.hexagon.coordinates}
        fillOpacity={hexagonStyle.fillOpacity}
        fillColor={hexagonStyle.fillColor}
        weight={hexagonStyle.weight}
      />
    </div>
  );
};

export default Hexagon;
