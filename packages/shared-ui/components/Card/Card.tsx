import React from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import '../Card/Card.css';

interface Employee {
  employee_uuid: string;
  employee_name: string;
  employee_picture: string;
}

interface Restaurant {
  restaurant_uuid: string;
  restaurant_name: string;
  restaurant_address: string;
  restaurant_city: string;
  restaurant_state: string;
  restaurant_picture: string;
  employees: Employee[];
}

interface CardProps {
  restaurant: Restaurant;
}

const Card: React.FC<CardProps> = ({ restaurant }) => {
  const sliderSettings = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 3,
  };

  return (
    <div className="card">
      <h2>{restaurant.restaurant_name}</h2>
      <p>
        {restaurant.restaurant_address}, {restaurant.restaurant_city},{' '}
        {restaurant.restaurant_state}
      </p>
      <div className="restaurant-picture">
        <img
          src={`../src/images/${restaurant.restaurant_picture}`}
          alt={restaurant.restaurant_name}
          className="restaurant-image"
        />
      </div>
      <div className="employees-container">
        <Slider {...sliderSettings}>
          {restaurant.employees.map((employee) => (
            <div key={employee.employee_uuid} className="employee">
              <div className="avatar">
                <img
                  src={`../src/images/${employee.employee_picture}`}
                  alt={employee.employee_name}
                />
                <div className="employee-popup">
                  <div className="employee-popup-content">
                    {employee.employee_name}
                  </div>
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

export default Card;
