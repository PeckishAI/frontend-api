import React, { useState } from 'react';
import styles from './TransferHistorySection.module.scss';
import { useRestaurantStore } from '../../../../store/useRestaurantStore';
import { FaArrowDown, FaArrowUp } from 'react-icons/fa';
type Ingredient = {
  name: string;
  quantity: number;
  unit: string;
  amount: number;
};

type TransferEvent = {
  fromSite: string;
  toSite: string;
  fromSiteUUID: string;
  toSiteUUID: string;
  transferDate: string;
  transferredBy: string;
  transferAmount: number;
  transferNumber: number;
  ingredients: Ingredient[];
};

type TransferHistorySectionProps = {
  event: {
    transfer_event: TransferEvent; // If `transfer_event` is a nested object
  };
};

const TransferHistorySection: React.FC<TransferHistorySectionProps> = ({
  event,
}) => {
  const [isIngredientsVisible, setIsIngredientsVisible] = useState(false);

  const toggleIngredientsVisibility = () => {
    setIsIngredientsVisible(!isIngredientsVisible);
  };

  const selectedRestaurantUUID = useRestaurantStore(
    (state) => state.selectedRestaurantUUID
  );

  const titleClass =
    event.transfer_event.fromSiteUUID === selectedRestaurantUUID
      ? styles.sending
      : event.transfer_event.toSiteUUID === selectedRestaurantUUID
      ? styles.receiving
      : '';

  return (
    <div className={styles.transferHistorySection}>
      <div className={styles.header}>
        <h3>
          {event.transfer_event.fromSiteUUID === selectedRestaurantUUID ? (
            <>
              <FaArrowUp className={styles.sending} />

              {`  ${event.transfer_event.toSite}`}
            </>
          ) : event.transfer_event.toSiteUUID === selectedRestaurantUUID ? (
            <>
              <FaArrowDown className={styles.receiving} />

              {`  ${event.transfer_event.fromSite}`}
            </>
          ) : (
            `Transfer from ${event.transfer_event.fromSite} to ${event.transfer_event.toSite}`
          )}
        </h3>
        <p className={styles.date}>{event.transfer_event.transferDate}</p>
      </div>
      <div className={styles.details}>
        <p>
          {event.transfer_event.transferredBy ? (
            <>
              Transferred by: <b>{event.transfer_event.transferredBy}</b>
            </>
          ) : (
            'Transferred by -'
          )}
        </p>
        <p>
          Transfer Number:{' '}
          <b>
            {event.transfer_event.transferNumber
              ? event.transfer_event.transferNumber
              : '--'}
          </b>
        </p>
        <p>
          Total Amount:{' '}
          <b>
            {event?.transfer_event?.transferAmount
              ? `€ ${event.transfer_event.transferAmount.toFixed(2)}`
              : '--'}
          </b>
        </p>
        <div
          className={styles.ingredientsToggle}
          onClick={toggleIngredientsVisibility}>
          <span>
            {isIngredientsVisible
              ? '▼ Hide ingredients'
              : `▶ Show ingredients (${event?.transfer_event.ingredients?.length})`}
          </span>
        </div>
        {isIngredientsVisible && (
          <div>
            {event?.transfer_event?.ingredients?.map((ingredient, index) => (
              <div key={index} className={styles.ingredient}>
                <span>{ingredient.name}</span>
                <span>
                  {ingredient.quantity > 1
                    ? `${ingredient.quantity} ${ingredient.unit}s`
                    : `${ingredient.quantity} ${ingredient.unit}`}
                </span>
                <span> - €{ingredient.amount.toFixed(2)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TransferHistorySection;
