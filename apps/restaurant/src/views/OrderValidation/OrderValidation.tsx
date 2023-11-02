import { Button, EmptyPage, useTitle } from 'shared-ui';
import styles from './OrderValidation.module.scss';
import { useTranslation } from 'react-i18next';
import { Tooltip } from 'react-tooltip';
import { SupplierOrderSection } from './components/SupplierOrderSection';
import { useState } from 'react';
import { FaPlus } from 'react-icons/fa';
import { SelectIngredientPopup } from './components/SelectIngredientPopup';
import { Ingredient } from '../../services';
import { useOrders } from '../../utils/orders-mock';
import { formatCurrency } from '../../utils/helpers';
import { useRestaurantStore } from '../../store/useRestaurantStore';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

export const OrderValidation = () => {
  const { t } = useTranslation('common');
  useTitle(t('pages.orders.validation'));
  const navigate = useNavigate();

  const {
    predictedOrders: orderForecast,
    updateIngredient,
    addIngredient,
    removeIngredient,
    removePredictedOrder,
    addOrder,
  } = useOrders();
  const restaurantCurrency = useRestaurantStore((state) => {
    return (
      state.restaurants.find((r) => r.uuid === state.selectedRestaurantUUID)
        ?.currency || 'EUR'
    );
  });

  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [validationLoading, setValidationLoading] = useState(false);
  const [isSelectIngredientPopupVisible, setSelectIngredientPopupVisible] =
    useState(false);

  const handleUpdateIngredient = (ingredientUUID: string, quantity: number) => {
    updateIngredient(ingredientUUID, quantity);
  };

  const handleDeleteIngredient = (ingredientUUID: string) => {
    removeIngredient(ingredientUUID);
  };

  const handleAddIngredient = (ingredient: Ingredient, quantity: number) => {
    addIngredient(ingredient, quantity);
    setSelectIngredientPopupVisible(false);
  };

  const sendOrders = () => {
    console.log('ok');

    setValidationLoading(true);
    setTimeout(() => {
      setValidationLoading(false);
      selectedOrders.forEach((uuid) => {
        const order = orderForecast!.find((order) => order.uuid === uuid);
        if (!order) return;

        addOrder({
          ...order,
          status: 'pending',
          deliveryDate: 'Unknown',
          orderDate: dayjs().format('DD/MM/YYYY'),
          price: order.products.reduce((acc, item) => {
            return acc + item.cost;
          }, 0),
        });
        removePredictedOrder(uuid);

        // setSelectedOrders(selectedOrders.filter((u) => u !== uuid));
      });
      navigate('/inventory/orders');
      toast.success(t('order.validation.submit.success'));
    }, 1000);
  };

  return (
    <div className={styles.pageLayout}>
      <div className={styles.pageHeader}>
        <p className={styles.pageDescription}>
          {t('order.validation.description')}
        </p>
        <Button
          icon={<FaPlus />}
          onClick={() => setSelectIngredientPopupVisible(true)}
          type="primary"
          value={t('order.validation.addIngredient')}
        />
      </div>

      {!orderForecast ||
        (!orderForecast.length && (
          <EmptyPage
            className={styles.emptyPage}
            title={t('order.validation.empty.title')}
            description={t('order.validation.empty.description')}
          />
        ))}

      {orderForecast &&
        orderForecast.map((order) => (
          <SupplierOrderSection
            key={order.uuid}
            data={order}
            isSelected={selectedOrders.includes(order.uuid)}
            toggleSelect={() => {
              if (selectedOrders.includes(order.uuid)) {
                setSelectedOrders(
                  selectedOrders.filter((uuid) => uuid !== order.uuid)
                );
              } else {
                setSelectedOrders([...selectedOrders, order.uuid]);
              }
            }}
            onUpdateIngredient={handleUpdateIngredient}
            onDeleteIngredient={handleDeleteIngredient}
          />
        ))}

      <div className={styles.bottomSection}>
        <div className={styles.totalOrderPriceContainer}>
          <p className={styles.totalOrderPriceLabel}>Total :</p>
          <p className={styles.totalOrderPrice}>
            {formatCurrency(
              orderForecast &&
                orderForecast.reduce((acc, order) => {
                  return (
                    acc +
                    order.products.reduce((acc, item) => {
                      return acc + item.cost;
                    }, 0)
                  );
                }, 0),
              restaurantCurrency
            )}
          </p>
        </div>

        <div className={styles.validateOrderContainer}>
          <Button
            value={t('order.validation.submitOrder', {
              count: selectedOrders.length,
            })}
            type="primary"
            disabled={!selectedOrders.length}
            className={styles.validateOrderButton}
            loading={validationLoading}
            onClick={sendOrders}
          />

          <p className={styles.selectedCount}>
            {t('order.validation.selectedOrders', {
              count: selectedOrders.length,
            })}
          </p>
        </div>
      </div>

      <Tooltip id="order-tooltip" className="tooltip" />

      <SelectIngredientPopup
        isVisible={isSelectIngredientPopupVisible}
        onRequestClose={() => setSelectIngredientPopupVisible(false)}
        onAddIngredient={handleAddIngredient}
      />
    </div>
  );
};
