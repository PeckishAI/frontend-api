import React from 'react';
import { DateRangePicker } from 'rsuite';
import 'rsuite/dist/rsuite.css';
import { format } from 'date-fns';

interface DateRangePickerComponentProps {
  value: DateRange;
  setValue: (dates: DateRange) => void;
}

const DateRangePickerComponent: React.FC<DateRangePickerComponentProps> = ({
  value,
  setValue,
}) => {
  const today = new Date();
  const formattedToday = format(today, 'yyyy-MM-dd');
  return (
    <div>
      <DateRangePicker
        value={value}
        onChange={setValue}
        placeholder={`${formattedToday} - ${formattedToday}`}
        placement="bottomEnd"
      />
    </div>
  );
};

export default DateRangePickerComponent;
