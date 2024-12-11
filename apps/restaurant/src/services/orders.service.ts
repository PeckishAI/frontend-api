import { IngredientOption } from '../views/PlaceOrder/Components/IngredientsTable/IngredientsTable';
import { GeneratedOrder } from '../views/PlaceOrder/Components/ShoppingView/ShoppingView';
import { axiosClient } from './index';

export type PredictOrderResponse = {
  ingredientUUID: string;
  quantity: number;
};

// const getOrders = async (restaurantUUID: string) => {
//   const res = await axiosClient.get(`/order/${restaurantUUID}`);
//   return res;
// }

export type OrderResponse = {
  supplier: string;
  supplier_uuid: string;
  orderDate: string;
  orderNumber: string;
  deliveryDate: string;
  status: string;
  price: number;
  uuid: number;
  products: {
    unit: string;
    uuid: string;
    name: string;
    unit_uuid: string;
    unit_name: string;
    quantity: number;
    received_quantity: number;
    unitCost: number;
    // actualStock: number;
    // id: string;
    // tagUUID?: string | null | undefined;
    // theoriticalStock?: number | undefined;
    // parLevel: number;
    // amount: number;
  }[];
};

export type ReceivedQtyChange = {
  supplier: string;
  supplier_uuid: string;
  orderDate: string;
  orderNumber: string;
  order_uuid: string;
  deliveryDate: string;
  uuid: number;
  received_ingredients: {
    unit: string;
    name: string;
    received_quantity: string;
    uuid: string;
    quantity: number;
  }[];
};

export type UpdateOrderPayload = {
  order_uuid: number;
  order_number: string;
  supplier_uuid: string;
  delivery_date: string;
  price: number;
  status: string;
  ingredients: {
    uuid: string;
    ingredient_uuid: string;
    unit_uuid: string;
    unit_name: string;
    quantity: number;
    price: number;
  }[];
};

export type SupplierOrder = {
  supplier_uuid: string;
  price: number;
  note?: string | null;
  deliveryDates?: string | null;
  ingredients: {
    ingredient_uuid: string;
    unit_uuid: string;
    unit_name: string;
    quantity: number;
    price: number;
  }[];
};

const getOrders = async (
  restaurantUUID: string
): Promise<OrderResponse[] | null> => {
  try {
    const res = await axiosClient.get<OrderResponse>(
      `/orders/${restaurantUUID}`
    );
    return res.data.map((item) => ({
      supplier: item.supplier,
      orderDate: item.orderDate,
      orderNumber: item.orderNumber,
      deliveryDate: item.deliveryDate,
      status: item.status,
      price: item.price,
      uuid: item.uuid,
      supplier_uuid: item.supplier_uuid,
      products: item.products.map((entry: any) => ({
        uuid: entry.uuid,
        ingredient_uuid: entry.ingredient_uuid,
        name: entry.name,
        unit_uuid: entry.unit_uuid,
        unit_name: entry.unit_name,
        quantity: entry.quantity,
        received_quantity: entry.received_quantity || entry.quantity,
        price: entry.price,
      })),
    }));
  } catch (error) {
    console.error('Error fetching orders:', error);
    return null;
  }
};

const getOrderGeneration = async (
  restaurantUUID: string
): Promise<GeneratedOrder> => {
  const res = await axiosClient.get<PredictOrderResponse[]>(
    'documents/' + restaurantUUID + '/predict_order'
  );

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
  return axiosClient.post('orders/' + restaurantUUID, supplierOrder);
};

const updateQuantity = (restaurantUUID: string, payload: ReceivedQtyChange) => {
  return axiosClient.post(
    `/orders/${restaurantUUID}/update_received_stock`,
    payload
  );
};

const updateOrder = async (
  restaurantUUID: string,
  orderUUID: string,
  payload: UpdateOrderPayload
) => {
  try {
    console.log('Payload:', payload);
    const response = await axiosClient.post(
      `orders/${restaurantUUID}/update/${orderUUID}`,
      payload
    );
    return response.data;
  } catch (error) {
    console.error('Error updating order:', error);
    throw error;
  }
};

export const ordersService = {
  getOrders,
  updateOrder,
  getOrderGeneration,
  placeSupplierOrder,
  updateQuantity,
};
