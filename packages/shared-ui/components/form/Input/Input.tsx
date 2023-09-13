import React from 'react';
import './style.scss';

type Props = {
  width?: string;
  onChange: (value: string) => void;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'>;

const Input = React.forwardRef<HTMLInputElement, Props>((props, ref) => {
  return (
    <input
      ref={ref}
      {...props}
      className={`input ${props.className}`}
      onChange={(e) => props.onChange(e.target.value)}
      style={
        props.width
          ? { width: props.width }
          : props.type === 'number'
          ? { width: '70px' }
          : {}
      }
    />
  );
});

Input.displayName = 'Input';

export default Input;
