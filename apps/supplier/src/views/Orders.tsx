import { useTranslation } from 'react-i18next';
import { Table, Tabs, Dropdown, Input, OrderDetail } from 'shared-ui';
import { ColumnDefinitionType } from 'shared-ui/components/Table/Table';
import { DropdownOptionsDefinitionType } from 'shared-ui/components/Dropdown/Dropdown';
import { useMemo, useState, useEffect, useCallback } from 'react';
import { Tooltip } from 'react-tooltip';
import { orderService } from '../services';

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
const orders = [
  {
    id: '1',
    orderDate: '2023-09-01',
    deliveryDate: '2023-09-10',
    customer: 'Poké Perfect',
    status: 'Processing',
    detail: 'Order details for Customer 1',
    price: 100.0,
  },
  {
    id: '2',
    orderDate: '2023-09-02',
    deliveryDate: '2023-09-11',
    customer: 'Joe & The Juice',
    status: 'Shipped',
    detail: 'Order details for Customer 2',
    price: 75.5,
  },
  {
    id: '3',
    orderDate: '2023-09-03',
    deliveryDate: '2023-09-12',
    customer: 'Joe & The Juice',
    status: 'Delivered',
    detail: 'Order details for Customer 3',
    price: 50.25,
  },
  {
    id: '4',
    orderDate: '2023-09-04',
    deliveryDate: '2023-09-13',
    customer: 'Poké Perfect',
    status: 'Processing',
    detail: 'Order details for Customer 4',
    price: 120.75,
  },
  {
    id: '5',
    orderDate: '2023-09-05',
    deliveryDate: '2023-09-14',
    customer: 'Poké Perfect',
    status: 'Shipped',
    detail: 'Order details for Customer 5',
    price: 90.0,
  },
  {
    id: '6',
    orderDate: '2023-09-06',
    deliveryDate: '2023-09-15',
    customer: 'Burger King',
    status: 'Delivered',
    detail: 'Order details for Customer 6',
    price: 35.5,
  },
  {
    id: '7',
    orderDate: '2023-09-07',
    deliveryDate: '2023-09-16',
    customer: 'Burger King',
    status: 'Processing',
    detail: 'Order details for Customer 7',
    price: 180.0,
  },
  {
    id: '8',
    orderDate: '2023-09-08',
    deliveryDate: '2023-09-17',
    customer: 'Poké Perfect',
    status: 'Shipped',
    detail: 'Order details for Customer 8',
    price: 62.75,
  },
  {
    id: '9',
    orderDate: '2023-09-09',
    deliveryDate: '2023-09-18',
    customer: 'Burger King',
    status: 'Delivered',
    detail: 'Order details for Customer 9',
    price: 42.0,
  },
  {
    id: '10',
    orderDate: '2023-09-10',
    deliveryDate: '2023-09-19',
    customer: 'Poké Perfect',
    status: 'Processing',
    detail: 'Order details for Customer 10',
    price: 150.25,
  },
  {
    id: '11',
    orderDate: '2023-09-11',
    deliveryDate: '2023-09-20',
    customer: 'Burger King',
    status: 'Shipped',
    detail: 'Order details for Customer 11',
    price: 55.5,
  },
  {
    id: '12',
    orderDate: '2023-09-12',
    deliveryDate: '2023-09-21',
    customer: 'Burger King',
    status: 'Delivered',
    detail: 'Order details for Customer 12',
    price: 90.75,
  },
  {
    id: '13',
    orderDate: '2023-09-13',
    deliveryDate: '2023-09-22',
    customer: 'Joe & The Juice',
    status: 'Processing',
    detail: 'Order details for Customer 13',
    price: 65.0,
  },
  {
    id: '14',
    orderDate: '2023-09-14',
    deliveryDate: '2023-09-23',
    customer: 'Burger King',
    status: 'Shipped',
    detail: 'Order details for Customer 14',
    price: 120.25,
  },
  {
    id: '15',
    orderDate: '2023-09-15',
    deliveryDate: '2023-09-24',
    customer: 'Joe & The Juice',
    status: 'Delivered',
    detail: 'Order details for Customer 15',
    price: 85.5,
  },
];

const tabs = ['Tab 1', 'Tab 2', 'Tab 3'];

const orderStatus: DropdownOptionsDefinitionType[] = [
  { label: 'Predicted', value: 'predicted' },
  { label: 'Ordered', value: 'ordered' },
  { label: 'Shipped', value: 'shipped' },
];

const Orders = () => {
  const { t } = useTranslation('common');

  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedOrderStatus, setSelectedOrderStatus] = useState<{
    [key: string]: string;
  }>({});
  const [orderList, setOrderList] = useState<Order[]>(orders);
  const [searchValue, setSearchValue] = useState<string | null>(null);
  const [showOrderDetail, setShowOrderDetail] = useState(false);

  const toggleTab = (tabIndex: number) => {
    setSelectedTab(tabIndex);
  };

  const sendNewOrderStatus = useCallback(
    (row: Order, value: string) => {
      setSelectedOrderStatus((oldState) => ({
        ...oldState,
        [row.id]: value,
      }));
    },
    [setSelectedOrderStatus]
  );

  useEffect(() => {
    orderService.getOrderList().then((res) => {
      console.log(res);
      // setOrderList(res.data);  temp disabled for hardcoded data
    });
  }, []);

  const handleOnSearchValueChange = (value: string) => {
    setSearchValue(value);
  };

  const handleViewDetail = () => {
    setShowOrderDetail(true);
  };

  const columns: ColumnDefinitionType<Order, keyof Order>[] = useMemo(
    () => [
      { key: 'id', header: t('orderId') },
      { key: 'orderDate', header: t('orderDate') },
      { key: 'deliveryDate', header: t('deliveryDate') },
      { key: 'customer', header: t('customer') },
      {
        key: 'status',
        header: t('status'),
        renderItem: ({ row }) => (
          <Dropdown
            options={orderStatus}
            selectedOption={selectedOrderStatus[row.id]}
            onOptionChange={(value) => sendNewOrderStatus(row, value)}
          />
        ),
      },
      {
        key: 'price',
        header: t('price'),
        renderItem: ({ row }) => `${row.price} €`,
        classname: 'column-bold',
      },
      {
        key: 'detail',
        header: t('detail'),
        renderItem: () => {
          return (
            <>
              <i
                className="fa-solid fa-arrow-up-right-from-square view-detail"
                data-tooltip-id="detail-tooltip"
                data-tooltip-content={t('viewDetail')}
                onClick={handleViewDetail}></i>
            </>
          );
        },
      },
    ],
    [selectedOrderStatus, sendNewOrderStatus, t]
  );

  return (
    <div className="orders">
      <div className="tabs-and-tools">
        <Tabs tabs={tabs} onClick={toggleTab} selectedIndex={selectedTab} />
        <div className="tools">
          <Input
            type="text"
            value={searchValue ?? ''}
            placeholder={t('search')}
            onChange={(value) => {
              handleOnSearchValueChange(value);
            }}
          />
        </div>
      </div>

      <OrderDetail
        isVisible={showOrderDetail}
        onRequestClose={() => setShowOrderDetail(false)}
        orderUUID="idk"
      />
      {selectedTab === 0 && <Table data={orderList} columns={columns} />}
      <Tooltip className="tooltip" id="detail-tooltip" />
    </div>
  );
};

export default Orders;
