import classNames from 'classnames';
import { forwardRef } from 'react';
import ReactDatePicker, { type DatePickerProps } from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './DatePicker.scss';

type Props = DatePickerProps & {
  size?: 'small' | 'large';
};

const CustomDatePicker: React.ForwardRefExoticComponent<
  Props & React.RefAttributes<ReactDatePicker>
> = forwardRef<ReactDatePicker, Props>(({ size, ...props }, ref) => {
  return (
    <ReactDatePicker
      ref={ref}
      placeholderText="Select a Date"
      dateFormat="yyyy-MM-dd"
      {...props}
      className={classNames(
        'DatePicker',
        { small: size === 'small' },
        props.className
      )}
      calendarClassName="DatePicker__calendar"
      clearButtonClassName="DatePicker__clear-button"
    />
  );
});

CustomDatePicker.displayName = 'DatePicker';

export default CustomDatePicker;
