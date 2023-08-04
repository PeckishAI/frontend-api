import { Table } from 'shared-ui';
import { ColumnDefinitionType } from 'shared-ui/components/Table/Table';
import Dropdown from '../components/Dropdown/Dropdown';
import { OptionsDefinitionType } from '../components/Dropdown/Dropdown';
import { useMemo, useState } from 'react';

// type Props = {};

type Order = {
  id: string;
  orderDate: string;
  deliveryDate: string;
  customer: string;
  status: string;
  detail: string;
  price: number;
};
const data: Order[] = [
  {
    id: '1',
    orderDate: '2023-08-03',
    deliveryDate: '2023-08-10',
    customer: 'Nude Burger',
    status: 'Shipped',
    detail: 'Sample order',
    price: 100.99,
  },
  {
    id: '2',
    orderDate: '2023-08-02',
    deliveryDate: '2023-08-12',
    customer: 'La Madonna',
    status: 'On going',
    detail: 'Bulk order',
    price: 350.25,
  },
  {
    id: '3',
    orderDate: '2023-08-01',
    deliveryDate: '2023-08-05',
    customer: `Humphrey's`,
    status: 'Preparing',
    detail: 'Urgent order',
    price: 50.5,
  },
];

const orderStatus: OptionsDefinitionType[] = [
  { label: 'Predicted', value: 'predicted', color: '#5e72e4' },
  { label: 'On going', value: 'onGoing', color: '#f1f1f1' },
  { label: 'Preparing', value: 'preparing', color: '#fffb90' },
  { label: 'Shipped', value: 'shipped', color: '#7ef5b7' },
];

const Orders = () => {
  const [selectedOrderStatus, setSelectedOrderStatus] = useState<{
    [key: string]: string;
  }>({});

  const sendNewOrderStatus = (row, event) => {
    setSelectedOrderStatus({
      ...selectedOrderStatus,
      [row.id]: event.target.value,
    });
    console.log(event.target.value);
  };
  const columns: ColumnDefinitionType<Order, keyof Order>[] = useMemo(
    () => [
      { key: 'id', header: '#' },
      { key: 'orderDate', header: 'Order date' },
      { key: 'deliveryDate', header: 'Delivery date' },
      { key: 'customer', header: 'Customer' },
      {
        key: 'status',
        header: 'Status',
        renderItem: (row) => (
          <Dropdown
            options={orderStatus}
            selectedOption={selectedOrderStatus[row.id]}
            onOptionChange={(e) => sendNewOrderStatus(row, e)}
          />
        ),
      },
      {
        key: 'price',
        header: 'Price',
        renderItem: (row) => `${row.price} €`,
        classname: 'column-bold',
      },
      {
        key: 'detail',
        header: 'Detail',
        renderItem: () => {
          return <i className="fa-solid fa-arrow-up-right-from-square"></i>;
        },
      },
    ],
    [selectedOrderStatus]
  );

  return (
    <div className="orders">
      <Table data={data} columns={columns} />
    </div>
  );
};

export default Orders;
