// DateRangePicker.tsx
import React, { useEffect } from 'react';
import { DateRangePicker } from 'rsuite';
import 'rsuite/dist/rsuite.css';
import { format, parseISO, subWeeks } from 'date-fns';
import styles from './DateRangePicker.module.scss';

interface DateRangePickerComponentProps {
  value: DateRange;
  setValue: (dates: DateRange) => void;
}

const DateRangePickerComponent: React.FC<DateRangePickerComponentProps> = ({
  value,
  setValue,
}) => {
  useEffect(() => {
    const today = new Date();
    const formattedToday = format(today, 'yyyy-MM-dd');
    const formattedOneWeekAgo = format(subWeeks(new Date(), 1), 'yyyy-MM-dd');
    setValue([parseISO(formattedOneWeekAgo), parseISO(formattedToday)]);
  }, []);

  const CustomToggle = React.forwardRef(({ ...props }: any, ref: any) => (
    <div {...props} ref={ref} className={styles.customToggle}>
      <i className="fa-solid fa-calendar" />
      <div className={styles.dateTexts}>
        <div className={styles.dateRow}>
          <span>From:</span>
          <span>{format(value[0], 'yyyy-MM-dd')}</span>
        </div>
        <div className={styles.dateRow}>
          <span>To:</span>
          <span>{format(value[1], 'yyyy-MM-dd')}</span>
        </div>
      </div>
    </div>
  ));

  return (
    <div className={styles.datePickerWrapper}>
      <DateRangePicker
        value={value}
        onChange={setValue}
        placement="bottomEnd"
        cleanable={false}
        toggleAs={CustomToggle}
      />
    </div>
  );
};

export default DateRangePickerComponent;
