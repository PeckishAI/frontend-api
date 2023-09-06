import axios from './index';

const getCatalog = () => {
  return axios.get('http://127.0.0.1:8080/api/catalog');
};

const getCustomers = () => {
  return axios.get('http://127.0.0.1:8080/api/customers');
};

const getCustomerDetail = (restaurantId: string) => {
  return axios.get('http://127.0.0.1:8080/api/customer-detail/' + restaurantId);
};

const getShareLink = ()=>{
  console.log('request for getting share link');
  
  return axios.get('http://127.0.0.1:8080/api/customer/share-link');
}

export const customersService = { getCatalog, getCustomers, getCustomerDetail, getShareLink };
