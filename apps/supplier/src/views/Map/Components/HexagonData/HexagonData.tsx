import './style.scss';
import { HexagonType } from '../Hexagon/Hexagon';

type Props = {
  hexagonList: HexagonType[];
};

const HexagonData = (props: Props) => {
  if (props.hexagonList.length === 0) {
    return;
  }

  return (
    <div className="hexagon-data">
      <p className="name">Selected zone information</p>
      {props.hexagonList.map((hexagon) => (
        <p key={`id-key-${hexagon.id}`}>
          ID : {hexagon.id}, <br />
          Coordinates :{' '}
          {hexagon.coordinates.map((coordinate) => (
            <p
              style={{ fontSize: '0.6rem' }}
              key={`coordinate-key-${hexagon.id}`}>
              {coordinate.toString()}
            </p>
          ))}
        </p>
      ))}
    </div>
  );
};

export default HexagonData;
