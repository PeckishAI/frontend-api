import { forwardRef, useImperativeHandle, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Table, OrderDetail } from 'shared-ui';
import { ColumnDefinitionType } from 'shared-ui/components/Table/Table';
import { useNavigate } from 'react-router-dom';
import classNames from 'classnames';
import styles from './OrderTab.module.scss';
import { Tooltip } from 'react-tooltip';
import { Order, useOrders } from '../../../utils/orders-mock';
import { formatCurrency } from '../../../utils/helpers';
import { useRestaurantCurrency } from '../../../store/useRestaurantStore';
import dayjs from 'dayjs';

export type OrderTabRef = {
  renderOptions: () => React.ReactNode;
};

type Props = {
  forceOptionsUpdate: () => void;
};

export const OrderTab = forwardRef<OrderTabRef, Props>(
  (props, forwardedRef) => {
    const { t } = useTranslation('common');
    const [orderDetail, setOrderDetail] = useState<string>();
    const navigate = useNavigate();

    const orders = useOrders((state) => state.orders).sort((a, b) => {
      const aDate = dayjs(a.orderDate, 'DD/MM/YYYY');
      const bDate = dayjs(b.orderDate, 'DD/MM/YYYY');
      return bDate.unix() - aDate.unix();
    });

    const selectedOrder = orders.find((order) => order.uuid === orderDetail);
    const { currencyISO } = useRestaurantCurrency();

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
          renderItem: ({ row }) => formatCurrency(row.price, currencyISO),
          classname: 'column-bold',
        },
        {
          key: 'uuid',
          header: t('orders.detail'),
          renderItem: ({ row }) => {
            return (
              <>
                <i
                  className={classNames(
                    'fa-solid fa-arrow-up-right-from-square',
                    styles.icon
                  )}
                  data-tooltip-id="detail-tooltip"
                  data-tooltip-content={t('orders.detail.tooltip')}
                  onClick={() => setOrderDetail(row.uuid)}
                />
              </>
            );
          },
        },
      ],
      [t, currencyISO]
    );

    return (
      <div className="orders">
        <Table data={orders} columns={columns} />
        <OrderDetail
          isVisible={orderDetail !== undefined}
          onRequestClose={() => setOrderDetail(undefined)}
          upperBanner={
            selectedOrder
              ? [
                  {
                    title: t('orders.supplier'),
                    value: selectedOrder.supplier,
                  },
                  {
                    title: t('orders.deliveryDate'),
                    value: selectedOrder.deliveryDate,
                  },
                  {
                    title: t('price'),
                    value: formatCurrency(selectedOrder.price, currencyISO),
                  },
                  {
                    title: t('orders.status'),
                    value: t(`orders.statusStates.${selectedOrder.status}`),
                  },
                ]
              : []
          }
          tableHeaders={[
            {
              key: 'name',
              header: t('name'),
            },
            {
              key: 'quantity',
              header: t('quantity'),
              renderItem: ({ row }) => `${row.quantity} ${row.unit}`,
            },

            {
              key: 'cost',
              header: t('price'),
              renderItem: ({ row }) => formatCurrency(row.cost, currencyISO),
              classname: 'column-bold',
            },
          ]}
          tableData={selectedOrder?.products || []}
        />
        <Tooltip className="tooltip" id="detail-tooltip" />
      </div>
    );
  }
);

OrderTab.displayName = 'OrderTab';
