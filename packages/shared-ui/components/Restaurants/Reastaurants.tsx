import React, { useState, useEffect } from 'react';
import Card from '../Card/Card';

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

const App: React.FC = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);

  useEffect(() => {
    fetch('http://localhost:8080/restaurants')
      .then((response) => response.json())
      .then((data: Restaurant[]) => {
        setRestaurants(data);
      })
      .catch((error) => console.error('Error when receiving data:', error));
  }, []);

  return (
    <div className="app">
      {restaurants.map((restaurant) => (
        <Card key={restaurant.restaurant_uuid} restaurant={restaurant} />
      ))}
    </div>
  );
};

export default App;
