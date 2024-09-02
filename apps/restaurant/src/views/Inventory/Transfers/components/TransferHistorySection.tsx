import React, { useState } from 'react';
import styles from './TransferHistorySection.module.scss';

type Ingredient = {
  name: string;
  quantity: number;
  unit: string;
};

type TransferEvent = {
  fromSite: string;
  toSite: string;
  transferDate: string;
  transferredBy: string;
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

  return (
    <div className={styles.transferHistorySection}>
      <div className={styles.header}>
        <h3>
          {event.fromSite === 'Site B'
            ? `To ${event.toSite}`
            : event.toSite === 'Site B'
            ? `From ${event.fromSite}`
            : `Transfer from ${event.fromSite} to ${event.toSite}`}
        </h3>
        <p className={styles.date}>{event.transferDate}</p>
      </div>
      <div className={styles.details}>
        <p>
          {event.transferredBy
            ? `Transferred by ${event.transferredBy}`
            : 'Transferred by unknown'}
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
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default TransferHistorySection;
