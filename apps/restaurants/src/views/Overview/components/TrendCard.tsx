import React from 'react';
import styles from './TrendCard.module.scss'; // Import css modules stylesheet as styles
import { FiTrendingDown, FiTrendingUp } from 'react-icons/fi';
import { FaEquals } from 'react-icons/fa';
import classnames from 'classnames';

type Props = {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  percentage: number;
  period?: 'last-month';
};

export const TrendCard = ({
  icon,
  title,
  percentage,
  value,
  period = 'last-month',
}: Props) => {
  const periodText = period === 'last-month' ? 'Since last month' : '';

  return (
    <div className={styles.container}>
      <div className={styles.row}>
        <div>
          <h3 className={styles.title}>{title}</h3>
          <p className={styles.value}>{value}</p>
        </div>
        <div className={styles.icon}>{icon}</div>
      </div>
      <p className={styles.trend}>
        <span
          className={classnames(styles.percentage, {
            [styles.equalTrend]: percentage === 0,
            [styles.upTrend]: percentage > 0,
            [styles.downTrend]: percentage < 0,
          })}>
          {percentage === 0 ? (
            <FaEquals className={styles.percentageIcon} />
          ) : percentage > 0 ? (
            <FiTrendingUp className={styles.percentageIcon} />
          ) : (
            <FiTrendingDown className={styles.percentageIcon} />
          )}
          {percentage}%
        </span>
        <span className={styles.periodText}>{periodText}</span>
      </p>
    </div>
  );
};
