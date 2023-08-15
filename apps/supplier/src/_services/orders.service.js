import axios from './index';
let getOrderList = () => {
  return axios.get('/orders');
};

export const orderService = {
  getOrderList,
};
