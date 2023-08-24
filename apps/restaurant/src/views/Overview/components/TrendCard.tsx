import React from 'react';
import styles from './TrendCard.module.scss'; // Import css modules stylesheet as styles
import { FiTrendingDown, FiTrendingUp } from 'react-icons/fi';
import { FaEquals } from 'react-icons/fa';
import classnames from 'classnames';
import Skeleton from 'react-loading-skeleton';
import { useTranslation } from 'react-i18next';

type Props = {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  percentage?: number;
};

export const TrendCard = ({ icon, title, percentage, value }: Props) => {
  const { t } = useTranslation('overview');

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
            [styles.equalTrend]: percentage && percentage === 0,
            [styles.upTrend]: percentage && percentage > 0,
            [styles.downTrend]: percentage && percentage < 0,
          })}>
          {percentage ? (
            percentage === 0 ? (
              <FaEquals className={styles.percentageIcon} />
            ) : percentage > 0 ? (
              <FiTrendingUp className={styles.percentageIcon} />
            ) : (
              <FiTrendingDown className={styles.percentageIcon} />
            )
          ) : null}
          {percentage ?? '--'}%
        </span>
        <span className={styles.periodText}>{t('mom')}</span>
      </p>
    </div>
  );
};

export const TrendCardSkeleton = () => {
  return (
    <div className={styles.container}>
      <div className={styles.row}>
        <div>
          <h3 className={styles.title}>
            <Skeleton width={150} />
          </h3>
          <p className={styles.value}>
            <Skeleton width={120} />
          </p>
        </div>
        <div className={styles.icon}>
          <Skeleton circle width={24} height={24} />
        </div>
      </div>
      <p className={styles.trend}>
        <Skeleton width={200} />
      </p>
    </div>
  );
};
