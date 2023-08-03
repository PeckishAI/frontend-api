import { Table } from 'shared-ui';

// type Props = {};

type Order = {
  id: string;
  orderDate: string;
  deliveryDate: string;
  customer: string;
  status: string;
  channel: string;
  detail: string;
  price: number;
};
const data: Order[] = [
  {
    id: '1',
    orderDate: '2023-08-03',
    deliveryDate: '2023-08-10',
    customer: 'John Doe',
    status: 'Shipped',
    channel: 'Online',
    detail: 'Sample order',
    price: 100.99,
  },
  {
    id: '2',
    orderDate: '2023-08-02',
    deliveryDate: '2023-08-12',
    customer: 'Jane Smith',
    status: 'Processing',
    channel: 'In-store',
    detail: 'Bulk order',
    price: 350.25,
  },
  {
    id: '3',
    orderDate: '2023-08-01',
    deliveryDate: '2023-08-05',
    customer: 'Michael Johnson',
    status: 'Delivered',
    channel: 'Phone',
    detail: 'Urgent order',
    price: 50.5,
  },
  // Ajoutez plus d'objets d'ordre ici si nécessaire
];

const Orders = () => {
  return (
    <div className="orders">
      <Table
        data={data}
        columns={[
          { key: 'id', header: 'Identifiant' },
          { key: 'customer', header: 'Client' },
        ]}
      />
    </div>
  );
};

export default Orders;
