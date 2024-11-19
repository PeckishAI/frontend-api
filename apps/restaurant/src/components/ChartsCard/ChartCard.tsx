import React, { useState } from 'react';
import styles from './ChartCard.module.scss';
import classNames from 'classnames';

type ChartCardProps = {
  title?: string;
  className?: string;
  children: React.ReactNode;
};

export const ChartCard = ({ title, className, children }: ChartCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleClick = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div
      className={classNames(
        styles.chartCardWrapper,
        isExpanded && styles.expandedWrapper
      )}>
      <div
        className={classNames(
          styles.chartCard,
          className,
          isExpanded && styles.expanded
        )}
        onClick={handleClick}>
        {title && (
          <h3
            className={classNames(
              styles.chartTitle,
              isExpanded && styles.expandedTitle
            )}>
            {title}
          </h3>
        )}
        <div className={styles.chartContent}>{children}</div>
      </div>
    </div>
  );
};
