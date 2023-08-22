import { Restaurant } from '../../../../apps/restaurant/src/store/useRestaurantStore';
import ProfilePicture from '../ProfilePicture/ProfilePicture';
import './style.scss';
import Slider from 'react-slick';

type Props = {
  restaurant: Restaurant;

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
    <div className="RestaurantCard" onClick={props.onClick}>
      <h2>{props.restaurant.name}</h2>
      <p>
        {props.restaurant.address}, {props.restaurant.city},{' '}
        {props.restaurant.country}
      </p>
      <div className="employees-container">
        <Slider {...sliderSettings}>
          {props.restaurant.users.map((user) => (
            <div key={user.user_uuid} className="employee">
              {/* <div className="avatar">
                <img src={`../src/images/${user.picture}`} alt={user.name} />
                <div className="employee-popup">
                  <div className="employee-popup-content">{user.name}</div>
                </div>
              </div> */}
              <ProfilePicture
                picture={user.picture}
                alt={user.name}
                tooltip={user.name}
              />
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
