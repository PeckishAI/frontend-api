import { forwardRef, useImperativeHandle, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Table } from 'shared-ui';
import { ColumnDefinitionType } from 'shared-ui/components/Table/Table';
import { OrderDetail } from './components/OrderDetail';
import { useNavigate } from 'react-router-dom';
import classNames from 'classnames';
import styles from './OrderTab.module.scss';

type Order = {
  id: string;
  orderDate: string;
  deliveryDate: string;
  supplier: string;
  status: string;
  detail: string;
  price: number;
};

const orderList: Order[] = [
  {
    id: '1',
    orderDate: '2021-10-01',
    deliveryDate: '2021-10-01',
    supplier: 'Metro',
    status: 'ordered',
    detail: 'detail',
    price: 100,
  },
  // Generate 5 orders
  ...Array.from({ length: 5 }, (_, index) => ({
    id: `${index + 2}`,
    orderDate: '2021-10-01',
    deliveryDate: '2021-10-01',
    supplier: 'REKKI',
    status: 'delivered',
    detail: 'detail',
    price: 100,
  })),
];

export type OrderTabRef = {
  renderOptions: () => React.ReactNode;
};

type Props = {};

export const OrderTab = forwardRef<OrderTabRef, Props>(
  (props, forwardedRef) => {
    const { t } = useTranslation('common');
    const [isOrderDetailVisible, setOrderDetailVisible] = useState(false);
    const navigate = useNavigate();

    // Render options for the tab bar
    useImperativeHandle(
      forwardedRef,
      () => ({
        renderOptions: () => (
          <Button
            value={t('inventory.orders.validateNewOrderBtn')}
            type="primary"
            onClick={() => navigate('/orders/validation')}
          />
        ),
      }),
      []
    );

    const columns: ColumnDefinitionType<Order>[] = useMemo(
      () => [
        { key: 'supplier', header: t('supplier') },
        { key: 'orderDate', header: t('orderDate') },
        { key: 'deliveryDate', header: t('deliveryDate') },
        {
          key: 'status',
          header: t('status'),
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
                  className={classNames(
                    'fa-solid fa-arrow-up-right-from-square',
                    styles.icon
                  )}
                  data-tooltip-id="detail-tooltip"
                  data-tooltip-content={t('viewDetail')}
                  onClick={() => setOrderDetailVisible(true)}
                />
              </>
            );
          },
        },
      ],
      [t]
    );

    return (
      <div className="orders">
        <Table data={orderList} columns={columns} />
        <OrderDetail
          isVisible={isOrderDetailVisible}
          onRequestClose={() => setOrderDetailVisible(false)}
          orderUUID="55"
        />
      </div>
    );
  }
);

OrderTab.displayName = 'OrderTab';
