import React from 'react';
import styles from './BarChart.module.scss';
import classNames from 'classnames';

export type BarChartData = {
  label: string;
  value: number;
};

type BarChartProps = {
  data: BarChartData[];
  className?: string;
  height?: number; // Allow customizable height
};

export const BarChart = ({ data, className, height = 300 }: BarChartProps) => {
  const maxValue = Math.max(...data.map((item) => item.value));

  return (
    <div className={classNames(styles.chart, className)} style={{ height }}>
      <div className={styles.barsContainer}>
        {data.map((item, index) => (
          <div key={index} className={styles.barContainer}>
            <div className={styles.barWrapper}>
              <div
                className={styles.bar}
                style={{
                  height: `${(item.value / maxValue) * 100}%`,
                }}>
                <span className={styles.value}>{item.value}</span>
              </div>
            </div>
            <div className={styles.labelContainer}>
              <span className={styles.label}>{item.label}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
