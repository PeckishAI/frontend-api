import React from 'react';
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
  return (
    <div className={styles.transferHistorySection}>
      <div className={styles.header}>
        <h3>{`Transfer from ${event.fromSite} to ${event.toSite}`}</h3>
        <p className={styles.date}>{event.transferDate}</p>
      </div>
      <div className={styles.details}>
        <p>{`Transferred by ${event.transferredBy}`}</p>
        <ul>
          {event.ingredients.map((ingredient, index) => (
            <li key={index} className={styles.ingredient}>
              <span>{ingredient.name}</span>
              <span>{`${ingredient.quantity} ${ingredient.unit}`}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default TransferHistorySection;
