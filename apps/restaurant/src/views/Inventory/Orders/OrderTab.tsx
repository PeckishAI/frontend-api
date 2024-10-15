import {
  forwardRef,
  useImperativeHandle,
  useMemo,
  useState,
  useEffect,
} from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Table, OrderDetail, Loading, LabeledInput } from 'shared-ui';
import { DropdownOptionsDefinitionType } from 'shared-ui/components/Dropdown/Dropdown';
import { ColumnDefinitionType } from 'shared-ui/components/Table/Table';
import { useNavigate } from 'react-router-dom';
import classNames from 'classnames';
import styles from './OrderTab.module.scss';
import { Tooltip } from 'react-tooltip';
import { Order } from '../../../utils/orders-mock';
import { formatCurrency } from '../../../utils/helpers';
import {
  useRestaurantCurrency,
  useRestaurantStore,
} from '../../../store/useRestaurantStore';
import Fuse from 'fuse.js';
import { ordersService } from '../../../services/orders.service';
import { FaCheck, FaEdit, FaTimes } from 'react-icons/fa';
import toast from 'react-hot-toast';

export type OrderTabRef = {
  renderOptions: () => React.ReactNode;
};

type Props = {
  forceOptionsUpdate: () => void;
  isVisible: boolean;
  onRequestClose: () => void;
  searchValue: string;
};

export const units: DropdownOptionsDefinitionType[] = [
  { label: 'kg', value: 'kg' },
  { label: 'g', value: 'g' },
  { label: 'tbsp', value: 'tbsp' },
  { label: 'l', value: 'L' },
  { label: 'ml', value: 'ml' },
  { label: 'unit', value: 'unit' },
];

export const OrderTab = forwardRef<OrderTabRef, Props>(
  (props, forwardedRef) => {
    const { t } = useTranslation('common');
    const [orderDetail, setOrderDetail] = useState<string>();
    const navigate = useNavigate();
    const [orderList, setOrderList] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingData, setIsLoadingData] = useState(false);

    const selectedOrder = orderList.find((order) => order.uuid === orderDetail);
    console.log('selectedOrder', selectedOrder);
    const { currencyISO } = useRestaurantCurrency();
    const selectedRestaurantUUID = useRestaurantStore(
      (state) => state.selectedRestaurantUUID
    )!;

    const [isEditMode, setIsEditMode] = useState(false);
    const [receivedQuantities, setReceivedQuantities] = useState({});

    const handleReceivedQuantityChange = (id, value) => {
      setReceivedQuantities((prevState) => ({
        ...prevState,
        [id]: value,
      }));
    };

    const handleCancelEdit = () => {
      if (selectedOrder) {
        const resetQuantities = {};
        selectedOrder.products.forEach((product) => {
          resetQuantities[product.id] = product.received_quantity;
        });
        setReceivedQuantities(resetQuantities);
      }
      setIsEditMode(false);
    };

    const getOrders = async () => {
      if (!selectedRestaurantUUID) return;

      setIsLoading(true);
      try {
        const res = await ordersService.getOrders(selectedRestaurantUUID);
        if (res) {
          setOrderList(res);
          setIsLoading(false);
          console.log('OOO', orderList);
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const saveReceivedQuantities = async () => {
      const ReceivedQtyChange = {
        order_uuid: selectedOrder.uuid,
        orderNumber: selectedOrder.orderNumber,
        supplier: selectedOrder.supplier,
        uuid: selectedOrder.uuid,
        deliveryDate: selectedOrder.deliveryDate,
        supplier_uuid: selectedOrder.supplier_uuid,
        received_ingredients: selectedOrder.products.map((product) => ({
          name: product.name,
          received_quantity:
            receivedQuantities[product.uuid] || product.received_quantity,
          unit: product.unit,
          uuid: product.uuid,
          quantity: product.quantity,
        })),
      };

      setIsLoadingData(true);
      try {
        const response = await ordersService.updateQuantity(
          selectedRestaurantUUID,
          ReceivedQtyChange
        );
        console.log('Update successful:', response.data);

        setIsEditMode(false);
        getOrders();
        toast.success('Order quantity updated');
        setOrderDetail(undefined);
        setIsLoadingData(false);
      } catch (error) {
        console.error('Error updating quantities:', error);
      } finally {
        setIsLoadingData(false);
      }
    };

    useEffect(() => {
      getOrders(); // Fetch orders when selectedRestaurantUUID changes
    }, [selectedRestaurantUUID]);

    // Render options for the tab bar
    useImperativeHandle(
      forwardedRef,
      () => {
        props.forceOptionsUpdate();

        return {
          renderOptions: () => (
            <div className={styles.orderButtonSection}>
              <Button
                value={t('orders.placeOrder')}
                type="primary"
                onClick={() => navigate('/orders/place-order')}
                className={styles.orderButton}
              />
            </div>
          ),
        };
      },
      []
    );

    const columns: ColumnDefinitionType<Order>[] = useMemo(
      () => [
        {
          key: 'orderNumber',
          header: t('orders.orderNumber'),
          classname: 'column-bold',
        },
        { key: 'supplier', header: t('orders.supplier') },
        { key: 'orderDate', header: t('orders.orderDate') },
        {
          key: 'deliveryDate',
          header: t('orders.deliveryDate'),
          renderItem: ({ row }) => {
            if (!row.deliveryDate) {
              return null; // Return nothing if deliveryDate is null or undefined
            }

            const formattedDeliveryDate = new Intl.DateTimeFormat('en-GB', {
              weekday: 'short',
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            }).format(new Date(row.deliveryDate));

            return <span>{formattedDeliveryDate}</span>;
          },
        },
        {
          key: 'status',
          header: t('orders.status'),
          renderItem: ({ row }) => {
            const statusClass =
              row.status === 'pending'
                ? `${styles.status} ${styles.pending}`
                : row.status === 'received'
                ? `${styles.status} ${styles.received}`
                : `${styles.status} ${styles.default}`;

            return <span className={statusClass}>{t(`${row.status}`)}</span>;
          },
        },
        {
          key: 'price',
          header: t('price'),
          renderItem: ({ row }) => formatCurrency(row.price, currencyISO),
          classname: 'column-bold',
        },
      ],
      [t, currencyISO]
    );

    const handleRowClick = (row) => {
      setOrderDetail(row.uuid); // Set the selected order detail based on the clicked row
      setIsEditMode(false); // Start in view mode
    };

    const OrderFilter = props.searchValue
      ? new Fuse(orderList, {
          keys: ['supplier', 'orderNumber'],
          distance: 10,
        })
          .search(props.searchValue)
          .map((r) => r.item)
      : orderList;

    return (
      <div className="orders">
        {isLoading ? (
          <Loading size="large" />
        ) : orderList.length === 0 ? (
          <p className={styles.noOrder}>There is no order.</p>
        ) : (
          <Table
            data={OrderFilter}
            columns={columns}
            onRowClick={handleRowClick} // Use handleRowClick for full row click
          />
        )}
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
                    value: selectedOrder.status,
                  },
                  {
                    value: isEditMode ? (
                      <div className={styles.quantitySection}>
                        <FaCheck
                          onClick={saveReceivedQuantities}
                          className={styles.rightIcon}
                        />
                        <FaTimes
                          onClick={handleCancelEdit}
                          className={styles.icon}
                        />
                      </div>
                    ) : selectedOrder.status === 'pending' ? (
                      <Button
                        value="Receive Stock"
                        className={styles.pendingStock}
                        onClick={() => setIsEditMode(true)}
                      />
                    ) : selectedOrder.status === 'received' ? (
                      <div className={styles.receivedSection}>
                        <span className={styles.receivedStock}>Received</span>
                        <FaEdit
                          onClick={() => setIsEditMode(true)}
                          className={styles.editIcon}
                        />
                      </div>
                    ) : null,
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
              renderItem: ({ row }) => `${row.quantity} ${row.unit_name}`,
            },
            {
              key: 'unitCost',
              header: t('price'),
              renderItem: ({ row }) =>
                formatCurrency(row.unitCost, currencyISO),
              classname: 'column-bold',
            },
            {
              key: 'receivedQuantity',
              header: t('orders.receivedQtys'),
              renderItem: ({ row }) =>
                isEditMode ? (
                  <LabeledInput
                    type="number"
                    min={0}
                    className={styles.input}
                    step="any"
                    value={
                      receivedQuantities[row.uuid] !== undefined
                        ? receivedQuantities[row.uuid]
                        : row.received_quantity
                    }
                    onChange={(e) =>
                      handleReceivedQuantityChange(row.uuid, e.target.value)
                    }
                    placeholder={t('orders.receivedQtys')}
                  />
                ) : (
                  `${
                    receivedQuantities[row.uuid] !== undefined ||
                    row.received_quantity
                      ? receivedQuantities[row.uuid]
                      : '-'
                  }`
                ),
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
