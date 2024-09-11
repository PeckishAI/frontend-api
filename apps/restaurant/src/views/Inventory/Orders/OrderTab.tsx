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
import { FaCheck, FaTimes } from 'react-icons/fa';
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

    // const orders = useOrders((state) => state.orders).sort((a, b) => {
    //   const aDate = dayjs(a.orderDate, 'DD/MM/YYYY');
    //   const bDate = dayjs(b.orderDate, 'DD/MM/YYYY');
    //   return bDate.unix() - aDate.unix();
    // });
    const [orderList, setOrderList] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingData, setIsLoadingData] = useState(false);

    const selectedOrder = orderList.find((order) => order.uuid === orderDetail);
    const { currencyISO } = useRestaurantCurrency();
    const selectedRestaurantUUID = useRestaurantStore(
      (state) => state.selectedRestaurantUUID
    )!;

    const [isEditMode, setIsEditMode] = useState(false);
    const [receivedQuantities, setReceivedQuantities] = useState({});

    // Initialize receivedQuantities with default values from the selected order's products
    useEffect(() => {
      if (selectedOrder) {
        const initialQuantities = {};
        selectedOrder.products.forEach((product) => {
          initialQuantities[product.id] = product.quantity;
        });
        setReceivedQuantities(initialQuantities);
      }
    }, [selectedOrder]);

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
          resetQuantities[product.id] = product.quantity;
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
            receivedQuantities[product.uuid] || product.quantity,
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
              {/* <Button
                value={t('orders.showPredictedOrder')}
                type="primary"
                onClick={() => navigate('/orders/validation')}
              /> */}
            </div>
          ),
        };
      },
      []
    );

    const columns: ColumnDefinitionType<Order>[] = useMemo(
      () => [
        { key: 'orderNumber', header: t('orders.orderNumber') },
        { key: 'supplier', header: t('orders.supplier') },
        { key: 'orderDate', header: t('orders.orderDate') },
        { key: 'orderNumber', header: t('orders.orderNumber') },
        { key: 'deliveryDate', header: t('orders.deliveryDate') },
        {
          key: 'status',
          header: t('orders.status'),
          renderItem: ({ row }) => row.status,
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

    const OrderFilter = props.searchValue
      ? new Fuse(orderList, {
          keys: ['supplier'],
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
          <Table data={OrderFilter} columns={columns} />
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
                    value:
                      selectedOrder.status === 'pending' ? (
                        isEditMode ? (
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
                        ) : (
                          <Button
                            value={'Received Stock'}
                            type="primary"
                            className="add"
                            onClick={() => setIsEditMode(true)}
                          />
                        )
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
              renderItem: ({ row }) => `${row.quantity} ${row.unit}`,
            },
            {
              key: 'unitCost',
              header: t('price'),
              renderItem: ({ row }) =>
                formatCurrency(row.unitCost, currencyISO),
              classname: 'column-bold',
            },
            ...(isEditMode
              ? [
                  {
                    key: 'receivedQuantity',
                    header: t('orders.receivedQtys'),
                    renderItem: ({ row }) => (
                      <LabeledInput
                        type="number"
                        min={0}
                        className={styles.input}
                        step={'any'}
                        value={
                          receivedQuantities[row.uuid] !== undefined
                            ? receivedQuantities[row.uuid]
                            : row.quantity
                        }
                        onChange={(e) =>
                          handleReceivedQuantityChange(row.uuid, e.target.value)
                        }
                        placeholder={t('orders.receivedQtys')}
                      />
                    ),
                  },
                ]
              : []),
          ]}
          tableData={selectedOrder?.products || []}
        />

        <Tooltip className="tooltip" id="detail-tooltip" />
      </div>
    );
  }
);

OrderTab.displayName = 'OrderTab';
