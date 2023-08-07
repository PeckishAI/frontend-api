import axios from './caller.service';

let getOrderList = () => {
  return axios.get('/orders');
};

export const orderService = {
  getOrderList,
};
