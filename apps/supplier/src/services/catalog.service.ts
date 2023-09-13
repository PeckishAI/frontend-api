import axios from './index';

const getCatalog = () => {
  return axios.get('http://127.0.0.1:8080/api/catalog');
};

export const catalogService = { getCatalog };
