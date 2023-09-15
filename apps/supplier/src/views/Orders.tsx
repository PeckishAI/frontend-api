import { useTranslation } from 'react-i18next';
import { Table, Tabs, Dropdown, Input } from 'shared-ui';
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
  const [orderList, setOrderList] = useState<Order[]>();
  const [searchValue, setSearchValue] = useState<string | null>(null);

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
      setOrderList(res.data);
    });
  }, []);

  const handleOnSearchValueChange = (value: string) => {
    setSearchValue(value);
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
                data-tooltip-content={t('viewDetail')}></i>
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

      {selectedTab === 0 && <Table data={orderList} columns={columns} />}
      <Tooltip className="tooltip" id="detail-tooltip" />
    </div>
  );
};

export default Orders;
