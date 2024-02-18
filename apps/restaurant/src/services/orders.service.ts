import { IngredientOption } from '../views/PlaceOrder/Components/IngredientsTable/IngredientsTable';
import { GeneratedOrder } from '../views/PlaceOrder/Components/ShoppingView/ShoppingView';
import axios from './index';

export type PredictOrderResponse = {
  ingredientUUID: string;
  quantity: number;
};

export type SupplierOrder = {
  supplier_uuid: string;
  price: number;
  ingredients: IngredientOption[];
  note?: string | null;
};

const getOrders = async (restaurantUUID: string) => {
  const res = await axios.get(`/order/${restaurantUUID}`);
  return res;
};

const getOrderGeneration = async (
  restaurantUUID: string
): Promise<GeneratedOrder> => {
  const res = await axios.get<PredictOrderResponse[]>(
    'documents/' + restaurantUUID + '/predict_order'
  );

  console.log('generated order res: ', res);

  const order: GeneratedOrder = {
    ingredients: res.data.map((item) => ({
      uuid: item.ingredientUUID,
      quantity: item.quantity,
    })),
  };

  // waiting endpoint works, return fake generated ingredients
  // const order: GeneratedOrder = {
  //   ingredients: [
  //     { uuid: '1e1cb360-1e8e-439f-a1eb-0ff0e8b82af9', quantity: 3 },
  //     { uuid: 'd2fdab07-a1ed-4dc2-a31e-2400afee9a82', quantity: 1 },
  //   ],
  // };
  return order;
};

const placeSupplierOrder = (
  restaurantUUID: string,
  supplierOrder: SupplierOrder
) => {
  return axios.post('order/' + restaurantUUID, supplierOrder);
};

export const ordersService = {
  getOrders,
  getOrderGeneration,
  placeSupplierOrder,
};
