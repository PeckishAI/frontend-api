import './style.scss';
type RestaurantMap = {
  name: string;
  location: string;
  pos: { lat: number; lng: number };
};

type Props = {
  restaurant?: RestaurantMap;
};

const CustomerData = (props: Props) => {
  if (props.restaurant === undefined) {
    return;
  }
  return (
    <div className="customer-data">
      <p className="name">{props.restaurant.name}</p>
      <p className="location">
        <i className="fa-solid fa-location-dot"></i>
        {props.restaurant.location}
      </p>
    </div>
  );
};

export default CustomerData;
