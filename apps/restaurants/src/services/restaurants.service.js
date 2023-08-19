import axios from './index';

let getRestaurantsList = async () => {
  const res = await axios.get('/overview/1234');
  console.log('Restaurant request status', res.status);
  return res;
};

export const restaurantService = {
  getRestaurantsList,
};
