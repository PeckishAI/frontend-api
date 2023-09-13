import axios from './index';

const getCustomers = () => {
  return axios.get('http://127.0.0.1:8080/api/customers');
};

const getCustomerDetail = (restaurantId: string) => {
  return axios.get('http://127.0.0.1:8080/api/customer-detail/' + restaurantId);
};

const getShareLink = () => {
  console.log('request for getting share link');

  return axios.get('http://127.0.0.1:8080/api/customer/share-link');
};

export const customersService = {
  getCustomers,
  getCustomerDetail,
  getShareLink,
};
