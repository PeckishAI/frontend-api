import { Button, DialogBox, useTitle } from 'shared-ui';
import styles from './styles.module.scss';
import { useTranslation } from 'react-i18next';

import ShoppingView, {
  GeneratedOrder,
} from './Components/ShoppingView/ShoppingView';
import { useState } from 'react';
import { ordersService } from '../../services/orders.service';
import { useRestaurantStore } from '../../store/useRestaurantStore';

const PlaceOrder = () => {
  const { t } = useTranslation(['placeOrder']);
  useTitle(t('placeOrder:placeOrder.title'));

  const selectedRestaurantUUID = useRestaurantStore(
    (state) => state.selectedRestaurantUUID
  );

  const [isDialogBoxVisible, setIsDialogBoxVisible] = useState(false);
  const [generatedOrder, setGeneratedOrder] = useState<
    GeneratedOrder | undefined
  >();

  const handlePrefillOrder = async () => {
    if (selectedRestaurantUUID) {
      const order = await ordersService.getOrderGeneration(
        selectedRestaurantUUID
      );
      setGeneratedOrder(order);
      setIsDialogBoxVisible(false);
    }
  };

  return (
    <div className={styles.placeOrder}>
      <div className={styles.header}>
        <p className={styles.message}>{t('placeOrder:placeOrder.message')}</p>
        <div className={styles.tools}>
          <Button
            type="primary"
            value={t('placeOrder:orderGeneration')}
            onClick={() => setIsDialogBoxVisible(true)}
          />
        </div>
      </div>
      <ShoppingView generatedOrder={generatedOrder} />
      <DialogBox
        msg={t('placeOrder:orderGeneration')}
        subMsg={t('placeOrder:orderGeneration.message')}
        isOpen={isDialogBoxVisible}
        type="warning"
        onRequestClose={() => setIsDialogBoxVisible((state) => !state)}
        onConfirm={handlePrefillOrder}
      />
    </div>
  );
};

export default PlaceOrder;
