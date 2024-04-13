import { Order } from '../views/Orders/Orders';
import axios from './index';

type OrdersResponse = {
  restaurant_name: string;
  restaurant_uuid: string;
  supplier_uuid: string;
  created_at: Date;
  date: string;
  price: number;
  currency: string;
  status: string;
  note: string;
  ingredients: {
    // check if it matches with ingredient type returned from backend
    name: string;
    quantity: number;
    unit: string;
    price: number;
    availability: string;
  }[];
};

const getOrderList = async (supplierUUID: string): Promise<Order[]> => {
  const res = await axios.get<OrdersResponse[]>('/orders/' + supplierUUID);
  console.log('getOrderList res: ', res);

  if (res.data[0] === undefined) return [];

  return res.data.map((order) => ({
    id: order.restaurant_uuid,
    orderDate: order.date,
    deliveryDate: order.created_at.toISOString(),
    customer: order.restaurant_name,
    status: order.status,
    detail: `${order.currency} ${order.price.toFixed(2)}`,
    price: order.price,
    note: order.note,
    ingredients: order.ingredients.map((ingredient) => ({
      name: ingredient.name,
      quantity: ingredient.quantity,
      unit: ingredient.unit,
      price: ingredient.price,
      availability:
        ingredient.availability === 'true'
          ? true
          : ingredient.availability === 'false'
          ? false
          : 'N/A',
    })),
  }));
};

export const orderService = {
  getOrderList,
};
