import './style.scss';

type RestaurantMap = {
  name: string;
  location: string;
  pos: { lat: number; lng: number };
};

type Props = {
  restaurant?: RestaurantMap;
  onClose: () => void;
};

const POIWindow = (props: Props) => {
  if (props.restaurant === undefined) {
    return;
  }
  return (
    <div className="poi-window">
      <i className="fa-solid fa-xmark close" onClick={props.onClose}></i>
      <p className="name">{props.restaurant.name}</p>
      <p className="location">
        <i className="fa-solid fa-location-dot"></i>
        {props.restaurant.location}
      </p>
    </div>
  );
};

export default POIWindow;
