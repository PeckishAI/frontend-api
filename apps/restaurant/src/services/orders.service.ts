import { IngredientOption } from '../views/PlaceOrder/Components/IngredientsTable/IngredientsTable';
import { GeneratedOrder } from '../views/PlaceOrder/Components/ShoppingView/ShoppingView';
import { axiosClient } from './index';

export type PredictOrderResponse = {
  ingredientUUID: string;
  quantity: number;
};

export type SupplierOrder = {
  supplier_uuid: string;
  price: number;
  ingredients: IngredientOption[];
  note?: string | null;
  deliveryDates?: string | null;
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
    name: string;
    uuid: string;
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
      orderNumber: item.orderNumber,
      status: item.status,
      price: item.price,
      uuid: item.uuid,
      supplier_uuid: item.supplier_uuid,
      products: item.products.map((product: any) => ({
        unit: product.unit,
        name: product.name,
        quantity: product.quantity,
        received_quantity: product.received_quantity,
        unitCost: product.price,
        received_quantity: product.received_quantity,
        uuid: product.uuid,
        // actualStock: product.actualStock,
        // id: product.id,
        // tagUUID: product.tagUUID,
        // theoriticalStock: product.theoriticalStock,
        // parLevel: product.parLevel,
        // amount: product.amount,
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
  return axiosClient.post('orders/' + restaurantUUID, supplierOrder);
};

const updateQuantity = (restaurantUUID: string, payload: ReceivedQtyChange) => {
  return axiosClient.post(
    `/orders/${restaurantUUID}/update_received_stock`,
    payload
  );
};

export const ordersService = {
  getOrders,
  getOrderGeneration,
  placeSupplierOrder,
  updateQuantity,
};
