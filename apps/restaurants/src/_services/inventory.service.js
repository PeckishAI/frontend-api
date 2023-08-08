import axios from './index';
let getIngredientList = () => {
  return axios.get('/ingredients');
};

export const inventoryService = {
  getIngredientList,
};
