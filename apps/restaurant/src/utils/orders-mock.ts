import { create } from 'zustand';
import { Ingredient } from '../services';
import dayjs from 'dayjs';

type Product = Omit<Ingredient, 'actions' | 'theoreticalStock' | 'supplier'>;

const generateRandomProducts = () => {
  const productNames = [
    'Tomato',
    'Potato',
    'Onion',
    'Carrot',
    'Cucumber',
    'Salad',
    'Beef',
    'Chicken',
    'Pork',
    'Fish',
    'Egg',
    'Milk',
    'Bread',
    'Rice',
    'Pasta',
    'Lettuce',
    'Spinach',
    'Broccoli',
    'Apple',
    'Banana',
    'Orange',
    'Grapes',
    'Strawberries',
    'Blueberries',
    'Pineapple',
    'Watermelon',
    'Cantaloupe',
    'Lemon',
    'Lime',
    'Avocado',
    'Peach',
    'Plum',
    'Cherry',
    'Pears',
    'Kiwi',
    'Mango',
    'Pineapple',
    'Coconut',
    'Papaya',
    'Pomegranate',
    'Grapefruit',
    'Honeydew',
    'Asparagus',
    'Brussels Sprouts',
    'Zucchini',
    'Mushrooms',
    'Peas',
    'Sweet Potato',
  ];
  const nbProducts = Math.floor(Math.random() * 15) + 1;
  const products: Product[] = [];

  for (let i = 0; i < nbProducts; i++) {
    products.push({
      id: `${i}`,
      name: productNames[Math.floor(Math.random() * productNames.length)],
      unit: ['kg', 'g', 'l', 'cl', 'ml'][Math.floor(Math.random() * 5)],
      cost: Math.floor(Math.random() * 10) + 1,
      quantity: Math.floor(Math.random() * 10),
    });
  }

  return products;
};

let lastRandomDate: Date = new Date(2023, 9, 1);
const getRandomDate = () => {
  const start = new Date(2023, 9, 1);
  const end = dayjs().subtract(1, 'day').toDate();
  lastRandomDate = new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  );

  return dayjs(lastRandomDate).format('DD/MM/YYYY');
};

// Date delivered is always after the order date (between 1 and 15 days)
const getRandomDateDelivered = () => {
  const start = lastRandomDate;
  const end = new Date(
    lastRandomDate.getFullYear(),
    lastRandomDate.getMonth(),
    lastRandomDate.getDate() + 15
  );

  const randomDeliveryDate = new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  );

  return dayjs(randomDeliveryDate).format('DD/MM/YYYY');
};

const supplierName = ['Metro', 'REKKI', 'Sligro', 'Patrick', 'Jumbo'];
const status = ['pending', 'delivered', 'cancelled'] as const;
// Mock data
const orderList: Order[] = [
  // Generate 5 orders
  ...Array.from({ length: 5 }, (_, index) => {
    const products = generateRandomProducts();

    return {
      uuid: `${index + 2}`,
      orderDate: getRandomDate(),
      deliveryDate: getRandomDateDelivered(),
      supplier: supplierName[Math.floor(Math.random() * supplierName.length)],
      status: status[Math.floor(Math.random() * status.length)],
      price: products.reduce((acc, curr) => acc + curr.cost * curr.quantity, 0),
      products,
    };
  }),
  // sort by status (pending first)
].sort((a) => (a.status === 'pending' ? -1 : 1));

export type PredictedOrder = Omit<
  Order,
  'deliveryDate' | 'orderDate' | 'price' | 'status' | 'products'
> & {
  products: (Product & { availability: string })[];
};

const predictedOrderList: PredictedOrder[] = [
  {
    uuid: '1dghgdjgnv',
    supplier: 'Metro',

    products: [
      {
        id: '1ghhhd',
        name: 'White Wine',
        quantity: 10,
        unit: 'u',
        cost: 10,
        availability: 'Yes',
      },
      {
        id: 'dcdcdvgdzgz2',
        name: 'Sugar',
        quantity: 2,
        unit: 'kg',
        cost: 6.1,
        availability: 'No',
      },
      {
        id: '3htretht',
        name: 'Flour',
        quantity: 2,
        unit: 'kg',
        cost: 4.2,
        availability: 'Yes',
      },
    ],
  },
  {
    uuid: '2ccd',
    supplier: 'Sligro',
    products: [
      {
        id: 'afag1',
        name: 'Tomato pack',
        quantity: 10,
        unit: 'kg',
        cost: 12,
        availability: 'Yes',
      },
      {
        id: 'agagag2',
        name: 'Beef',
        quantity: 10,
        unit: 'kg',
        cost: 62,
        availability: 'Yes',
      },
      {
        id: 'ggggdd3',
        name: 'Onion',
        quantity: 2,
        unit: 'kg',
        cost: 4.5,
        availability: 'Unknown',
      },
    ],
  },
];

export type Order = {
  uuid: string;
  orderDate: string;
  deliveryDate: string;
  supplier: string;
  status: 'pending' | 'delivered' | 'cancelled';
  price: number;
  products?: Product[];
};

type OrdersState = {
  orders: Order[];
  predictedOrders: PredictedOrder[] | null;
  addIngredient: (ingredient: Ingredient, quantity: number) => void;
  updateIngredient: (ingredientUUID: string, quantity: number) => void;
  removeIngredient: (ingredientUUID: string) => void;
  removePredictedOrder: (orderUUID: string) => void;

  addOrder: (order: Order) => void;
  updateOrder: (order: Order) => void;
  removeOrder: (id: string) => void;
};

export const useOrders = create<OrdersState>((set, get) => ({
  orders: orderList,
  predictedOrders: predictedOrderList,
  updateIngredient: (ingredientUUID, quantity) => {
    const predictedOrders = [...(get().predictedOrders || [])];
    set({
      predictedOrders: predictedOrders.map((supplierOrder) => {
        return {
          ...supplierOrder,
          products: supplierOrder.products.map((item) => {
            const unitCost = item.cost / item.quantity;

            return {
              ...item,
              quantity: item.id === ingredientUUID ? quantity : item.quantity,
              cost:
                item.id === ingredientUUID ? unitCost * quantity : item.cost,
            };
          }),
        };
      }),
    });
  },

  addIngredient: (ingredient, quantity) => {
    const predictedOrders = [...(get().predictedOrders || [])];

    const supplierOrder = predictedOrders.find(
      (order) => order.supplier === ingredient.supplier
    );

    if (supplierOrder) {
      set({
        predictedOrders: predictedOrders.map((order) => {
          if (order.uuid !== supplierOrder.uuid) return order;
          console.log('order', order);

          return {
            ...order,
            products: [
              ...order.products,
              {
                id: ingredient.id,
                name: ingredient.name,
                quantity,
                unit: ingredient.unit,
                cost: ingredient.cost * quantity,
                availability: 'Unknown',
              },
            ],
          };
        }),
      });
    } else {
      set({
        predictedOrders: [
          ...predictedOrders,
          {
            uuid: ingredient.id,
            supplier: ingredient.supplier,
            products: [
              {
                id: ingredient.id,
                name: ingredient.name,
                quantity,
                unit: ingredient.unit,
                cost: ingredient.cost * quantity,
                availability: 'Unknown',
              },
            ],
          },
        ],
      });
    }
  },

  removeIngredient: (ingredientUUID) => {
    const predictedOrders = [...(get().predictedOrders || [])];

    const orderUUID = predictedOrders
      .filter((supplierOrder) =>
        supplierOrder.products.find((item) => item.id === ingredientUUID)
      )
      .map((supplierOrder) => supplierOrder.uuid)[0];

    if (
      predictedOrders.filter(
        (supplierOrder) => supplierOrder.uuid === orderUUID
      )[0].products.length === 1
    ) {
      set({
        predictedOrders: predictedOrders.filter(
          (supplierOrder) => supplierOrder.uuid !== orderUUID
        ),
      });
      return;
    }

    set({
      predictedOrders: predictedOrders.map((supplierOrder) => {
        return {
          ...supplierOrder,
          products: supplierOrder.products.filter(
            (item) => item.id !== ingredientUUID
          ),
        };
      }),
    });
  },

  removePredictedOrder: (orderUUID) => {
    const predictedOrders = [...(get().predictedOrders || [])];

    set({
      predictedOrders: predictedOrders.filter(
        (supplierOrder) => supplierOrder.uuid !== orderUUID
      ),
    });
  },

  addOrder: (order) =>
    set((state) => ({
      orders: [...state.orders, order],
    })),
  updateOrder: (order) =>
    set((state) => ({
      orders: state.orders.map((o) => (o.uuid === order.uuid ? order : o)),
    })),
  removeOrder: (id) =>
    set((state) => ({
      orders: state.orders.filter((o) => o.uuid !== id),
    })),
}));
