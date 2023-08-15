import './RestaurantCard.scss';
import Slider from 'react-slick';

type Props = {
  restaurant_uuid: string;
  restaurant_name: string;
  restaurant_address: string;
  restaurant_city: string;
  restaurant_country: string;
  user: [
    {
      user_uuid: string;
      user_picture: string;
      user_email: string;
      username: string;
    },
  ];
  onClick: () => void;
};

const sliderSettings = {
  dots: false,
  infinite: false,
  speed: 500,
  slidesToShow: 3,
  slidesToScroll: 3,
};

const RestaurantCard = (props: Props) => {
  return (
    <div className="card" onClick={props.onClick}>
      <h2>{props.restaurant_name}</h2>
      <p>
        {props.restaurant_address}, {props.restaurant_city},{' '}
        {props.restaurant_country}
      </p>
      <div className="employees-container">
        <Slider {...sliderSettings}>
          {props.user.map((user) => (
            <div key={user.user_uuid} className="employee">
              <div className="avatar">
                <img
                  src={`../src/images/${user.user_picture}`}
                  alt={user.username}
                />
                <div className="employee-popup">
                  <div className="employee-popup-content">{user.username}</div>
                </div>
              </div>
            </div>
          ))}
        </Slider>
      </div>
      <div className="buttons-container">
        <button className="overview-btn">Overview</button>
      </div>
    </div>
  );
};

export default RestaurantCard;
