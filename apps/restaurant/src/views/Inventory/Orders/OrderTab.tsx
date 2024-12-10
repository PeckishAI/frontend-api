import { forwardRef, useImperativeHandle, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Table, OrderDetail, Loading } from 'shared-ui';
import { useNavigate } from 'react-router-dom';
import styles from './OrderTab.module.scss';
import { Order } from '../../../utils/orders-mock';
import { useRestaurantStore } from '../../../store/useRestaurantStore';
import Fuse from 'fuse.js';
import { ordersService } from '../../../services/orders.service';
import { format } from 'date-fns';

export type OrderTabRef = {
  renderOptions: () => React.ReactNode;
};

type Props = {
  forceOptionsUpdate: () => void;
  isVisible: boolean;
  onRequestClose: () => void;
  searchValue: string;
};

export const OrderTab = forwardRef<OrderTabRef, Props>(
  (props, forwardedRef) => {
    const { t } = useTranslation('common');
    const navigate = useNavigate();
    const [orderList, setOrderList] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [isReceiveMode, setIsReceiveMode] = useState(false);

    const selectedRestaurantUUID = useRestaurantStore(
      (state) => state.selectedRestaurantUUID
    )!;

    const getOrders = async () => {
      if (!selectedRestaurantUUID) return;

      setIsLoading(true);
      try {
        const res = await ordersService.getOrders(selectedRestaurantUUID);
        if (res) {
          setOrderList(res);
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setIsLoading(false);
      }
    };

    useEffect(() => {
      getOrders();
    }, [selectedRestaurantUUID]);

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

    const columns = [
      { key: 'orderNumber', header: t('orders.orderNumber') },
      { key: 'supplier', header: t('orders.supplier') },
      { key: 'orderDate', header: t('orders.orderDate') },
      { key: 'deliveryDate', header: t('orders.deliveryDate') },
      { key: 'status', header: t('orders.status') },
      { key: 'price', header: t('price') },
    ];

    const handleRowClick = (row) => {
      setSelectedOrder(row);
      if (row.status === 'draft') {
        setIsEditMode(true);
      } else if (row.status === 'pending') {
        setIsReceiveMode(true);
      } else {
        setIsEditMode(false);
        setIsReceiveMode(false);
      }
    };

    const refreshOrders = async () => {
      setIsLoading(true);
      try {
        const res = await ordersService.getOrders(selectedRestaurantUUID);
        setOrderList(res); // Update orderList with the latest data
      } catch (error) {
        console.error('Error refreshing orders:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const handleSaveOrder = async ({
      tableData: updatedTableData,
      deliveryDate,
    }) => {
      setIsLoading(true);
      if (!selectedOrder || !selectedRestaurantUUID) return;

      // Calculate the total price from the updated table data
      const totalPrice = updatedTableData.reduce(
        (total, item) => total + item.price,
        0
      );

      const payload = {
        order_uuid: selectedOrder.uuid,
        order_number: selectedOrder.orderNumber,
        supplier_uuid: selectedOrder.supplier_uuid,
        delivery_date: deliveryDate ? format(deliveryDate, 'yyyy-MM-dd') : '',
        price: totalPrice, // Use the calculated total price
        status: selectedOrder.status,
        ingredients: updatedTableData.map((product) => ({
          uuid: product.uuid,
          ingredient_uuid: product.ingredientUUID,
          unit_uuid: product.unitUUID,
          unit_name: product.unitName,
          quantity: product.quantity,
          price: product.price,
        })),
      };

      try {
        await ordersService.updateOrder(
          selectedRestaurantUUID,
          selectedOrder.uuid,
          payload
        );
        await refreshOrders();
        setSelectedOrder(null);
      } catch (error) {
        console.error('Error updating order:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const handleApproveOrder = async () => {
      setIsLoading(true);
      if (!selectedOrder || !selectedRestaurantUUID) return;

      const orderDetails = {
        order_uuid: selectedOrder.uuid,
        order_number: selectedOrder.orderNumber,
        supplier_uuid: selectedOrder.supplier_uuid,
        delivery_date: selectedOrder.deliveryDate,
        price: selectedOrder.price,
        status: 'pending',
        ingredients: selectedOrder.products.map((product) => ({
          uuid: product.uuid,
          ingredient_uuid: product.ingredient_uuid,
          unit_uuid: product.unit_uuid,
          unit_name: product.unit_name,
          quantity: product.quantity,
          price: product.price,
        })),
      };

      try {
        await ordersService.updateOrder(
          selectedRestaurantUUID,
          selectedOrder.uuid,
          orderDetails
        );
        await refreshOrders();
        setSelectedOrder(null);
        // Optionally, refresh the orders list or update UI state here
      } catch (error) {
        console.error('Error approving order:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const OrderFilter = props.searchValue
      ? new Fuse(orderList, {
          keys: ['supplier', 'orderNumber'],
          distance: 10,
        })
          .search(props.searchValue)
          .map((r) => r.item)
      : orderList;

    // Transform order items to match the expected structure
    const transformOrderItems = (products, supplierUUID) => {
      return products.map((product) => ({
        uuid: product.uuid,
        ingredientUUID: product.ingredient_uuid,
        ingredientName: product.name,
        quantity: product.quantity,
        unitName: product.unit_name,
        unitUUID: product.unit_uuid,
        price: product.price || 0,
        receivedQuantity: product.received_quantity,
        supplierUUID: supplierUUID,
      }));
    };

    const tableData = transformOrderItems(
      selectedOrder?.products || [],
      selectedOrder?.supplier_uuid
    );

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
            onRowClick={handleRowClick}
          />
        )}
        {selectedOrder && (
          <OrderDetail
            isVisible={selectedOrder !== null}
            onRequestClose={() => setSelectedOrder(null)}
            upperBanner={[
              {
                title: 'Order Number',
                value: selectedOrder?.orderNumber || 'N/A',
              },
              { title: 'Supplier', value: selectedOrder?.supplier || 'N/A' },
              {
                title: 'Delivery Date',
                value: selectedOrder?.deliveryDate || 'N/A',
              },
              { title: 'Price', value: selectedOrder?.price || 'N/A' },
              { title: 'Status', value: selectedOrder?.status || 'N/A' },
            ]}
            tableData={transformOrderItems(
              selectedOrder?.products || [],
              selectedOrder?.supplier_uuid
            )}
            note={selectedOrder?.note}
            orderStatus={selectedOrder?.status || 'N/A'}
            onSave={handleSaveOrder}
            onApprove={handleApproveOrder}
            isLoading={isLoading}
          />
        )}
      </div>
    );
  }
);

OrderTab.displayName = 'OrderTab';
