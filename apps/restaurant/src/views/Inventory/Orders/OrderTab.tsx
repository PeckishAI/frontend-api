import { forwardRef, useImperativeHandle, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Table, OrderDetail } from 'shared-ui';
import { ColumnDefinitionType } from 'shared-ui/components/Table/Table';
import { useNavigate } from 'react-router-dom';
import classNames from 'classnames';
import styles from './OrderTab.module.scss';
import { Tooltip } from 'react-tooltip';

type Order = {
  id: string;
  orderDate: string;
  deliveryDate: string;
  supplier: string;
  status: 'pending' | 'delivered' | 'cancelled';
  detail: string;
  price: number;
};

const orderList: Order[] = [
  // {
  //   id: '1',
  //   orderDate: '2021-10-01',
  //   deliveryDate: '2021-10-01',
  //   supplier: 'Metro',
  //   status: 'pending',
  //   detail: 'detail',
  //   price: 100,
  // },
  // // Generate 5 orders
  // ...Array.from({ length: 5 }, (_, index) => ({
  //   id: `${index + 2}`,
  //   orderDate: '2021-10-01',
  //   deliveryDate: '2021-10-01',
  //   supplier: 'REKKI',
  //   status: 'delivered' as const,
  //   detail: 'detail',
  //   price: 100,
  // })),
];

export type OrderTabRef = {
  renderOptions: () => React.ReactNode;
};

type Props = {
  forceOptionsUpdate: () => void;
};

export const OrderTab = forwardRef<OrderTabRef, Props>(
  (props, forwardedRef) => {
    const { t } = useTranslation('common');
    const [isOrderDetailVisible, setOrderDetailVisible] = useState(false);
    const navigate = useNavigate();

    // Render options for the tab bar
    useImperativeHandle(
      forwardedRef,
      () => {
        props.forceOptionsUpdate();

        return {
          renderOptions: () => (
            <Button
              value={t('orders.showPredictedOrder')}
              type="primary"
              onClick={() => navigate('/orders/validation')}
            />
          ),
        };
      },
      []
    );

    const columns: ColumnDefinitionType<Order>[] = useMemo(
      () => [
        { key: 'supplier', header: t('orders.supplier') },
        { key: 'orderDate', header: t('orders.orderDate') },
        { key: 'deliveryDate', header: t('orders.deliveryDate') },
        {
          key: 'status',
          header: t('orders.status'),
          renderItem: ({ row }) => t(`orders.statusStates.${row.status}`),
        },
        {
          key: 'price',
          header: t('price'),
          renderItem: ({ row }) => `${row.price} €`,
          classname: 'column-bold',
        },
        {
          key: 'detail',
          header: t('orders.detail'),
          renderItem: () => {
            return (
              <>
                <i
                  className={classNames(
                    'fa-solid fa-arrow-up-right-from-square',
                    styles.icon
                  )}
                  data-tooltip-id="detail-tooltip"
                  data-tooltip-content={t('orders.detail.tooltip')}
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
        <Tooltip className="tooltip" id="detail-tooltip" />
      </div>
    );
  }
);

OrderTab.displayName = 'OrderTab';
