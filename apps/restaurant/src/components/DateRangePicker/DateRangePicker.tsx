import React, { useEffect, useState } from 'react';
import { DateRangePicker } from 'rsuite';
import 'rsuite/dist/rsuite.css';
import { format, parseISO, sub, subWeeks } from 'date-fns';

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

  return (
    <div>
      <DateRangePicker
        value={value}
        onChange={setValue}
        placeholder={`${value[0]}~${value[1]}`}
        placement="bottomEnd"
        defaultValue={value}
      />
    </div>
  );
};

export default DateRangePickerComponent;
