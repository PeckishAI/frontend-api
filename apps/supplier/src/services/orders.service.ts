import axios from './index';

const getOrderList = () => {
  return axios.get('/orders');
};

export const orderService = {
  getOrderList,
};
