import axios from './index';

const getPOSList = async () => {
  const res = await axios.get('/integrations');
  console.log('Onboarding request status', res.status);
  return res;
};

const login = (
  user_uuid: string,
  credentials: { username: string; password: string }
) => {
  return axios.post('/integrate/' + user_uuid, credentials);
};

export type ProductPrediction = {
  is_product: boolean;
  name: string;
  uuid: string;
};

const getProductsPrediction = async (restaurantUUID: string) => {
  const res = await axios.get<ProductPrediction[]>(
    `/onboarding/${restaurantUUID}/products`
  );
  return res.data;
};

const saveProducts = async (
  restaurantUUID: string,
  productsUUID: string[],
  taskCompleted: boolean = false
) => {
  const res = await axios.post<ProductPrediction[]>(
    `/onboarding/${restaurantUUID}/products`,
    {
      products: productsUUID,
      task_completed: taskCompleted,
    }
  );
  return res.data;
};

export const onboardingService = {
  getPOSList,
  login,
  getProductsPrediction,
  saveProducts,
};
