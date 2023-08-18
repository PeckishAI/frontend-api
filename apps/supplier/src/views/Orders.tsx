import { useTranslation } from 'react-i18next';
import { Table, Tabs, Dropdown } from 'shared-ui';
import { ColumnDefinitionType } from 'shared-ui/components/Table/Table';
import { DropdownOptionsDefinitionType } from 'shared-ui/components/Dropdown/Dropdown';
import { useMemo, useState, useEffect } from 'react';
import { Tooltip } from 'react-tooltip';
import { orderService } from '../_services';

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

const tabs = ['Tab 1', 'Tab 2', 'Tab 3'];

const orderStatus: DropdownOptionsDefinitionType[] = [
  { label: 'Predicted', value: 'predicted', color: '#5e72e4' },
  { label: 'Ordered', value: 'ordered', color: '#fffb90' },
  { label: 'Shipped', value: 'shipped', color: '#7ef5b7' },
];

const Orders = () => {
  const { t } = useTranslation('common');

  const [selectedTab, setSelectedTab] = useState(0);
  const toggleTab = (tabIndex: number) => {
    setSelectedTab(tabIndex);
  };

  const [selectedOrderStatus, setSelectedOrderStatus] = useState<{
    [key: string]: string;
  }>({});
  const sendNewOrderStatus = (row, event) => {
    setSelectedOrderStatus({
      ...selectedOrderStatus,
      [row.id]: event.target.value,
    });
  };

  const [orderList, setOrderList] = useState<Order[]>();
  useEffect(() => {
    orderService.getOrderList().then((res) => {
      console.log(res);
      setOrderList(res.data);
    });
  }, []);

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
            onOptionChange={(e) => sendNewOrderStatus(row, e)}
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
                className="fa-solid fa-arrow-up-right-from-square"
                data-tooltip-id="detail-tooltip"
                data-tooltip-content={t('viewDetail')}></i>
            </>
          );
        },
      },
    ],
    [selectedOrderStatus]
  );

  return (
    <div className="orders">
      <Tabs tabs={tabs} onClick={toggleTab} selectedIndex={selectedTab} />

      {selectedTab === 0 && <Table data={orderList} columns={columns} />}
      <Tooltip className="tooltip" id="detail-tooltip" />
    </div>
  );
};

export default Orders;
