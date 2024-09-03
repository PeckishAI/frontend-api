import React, { useState } from 'react';
import styles from './TransferHistorySection.module.scss';
import { useRestaurantStore } from '../../../../store/useRestaurantStore';

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
  ingredients: Ingredient[];
};

type TransferHistorySectionProps = {
  event: TransferEvent;
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
  console.log('check selectedRestaurantUUID');
  console.log(selectedRestaurantUUID);
  console.log('check event');
  console.log(event.fromSiteUUID);
  console.log(event.toSiteUUID);

  const titleClass =
    event.fromSiteUUID === selectedRestaurantUUID
      ? styles.sending
      : event.toSiteUUID === selectedRestaurantUUID
      ? styles.receiving
      : '';

  return (
    <div className={styles.transferHistorySection}>
      <div className={styles.header}>
        <h3 className={titleClass}>
          {event.fromSiteUUID === selectedRestaurantUUID
            ? `Sent to ${event.toSite}`
            : event.toSiteUUID === selectedRestaurantUUID
            ? `Received from ${event.fromSite}`
            : `Transfer from ${event.fromSite} to ${event.toSite}`}
        </h3>
        <p className={styles.date}>{event.transferDate}</p>
      </div>
      <div className={styles.details}>
        <p>
          {event.transferredBy
            ? `Transferred by ${event.transferredBy}`
            : 'Transferred by -'}
        </p>
        <p>
          Total Amount: <b>€{event.transferAmount.toFixed(2)}</b>
        </p>
        <div
          className={styles.ingredientsToggle}
          onClick={toggleIngredientsVisibility}>
          <span>
            {isIngredientsVisible
              ? '▼ Hide ingredients'
              : `▶ Show ingredients (${event.ingredients.length})`}
          </span>
        </div>
        {isIngredientsVisible && (
          <ul>
            {event.ingredients.map((ingredient, index) => (
              <li key={index} className={styles.ingredient}>
                <span>{ingredient.name}</span>
                <span>
                  {ingredient.quantity > 1
                    ? `${ingredient.quantity} ${ingredient.unit}s` // pluralize unit if quantity > 1
                    : `${ingredient.quantity} ${ingredient.unit}`}
                </span>
                <span> - €{ingredient.amount.toFixed(2)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default TransferHistorySection;
