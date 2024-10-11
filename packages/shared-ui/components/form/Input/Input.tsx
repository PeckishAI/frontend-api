import React, { useImperativeHandle, useRef } from 'react';
import styles from './style.module.scss';
import classNames from 'classnames';

type Props = {
  width?: string;
  onChange: (value: string) => void;
  suffix?: string;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'>;

const Input = React.forwardRef<HTMLInputElement, Props>((props, ref) => {
  const { width, suffix, className, ...rest } = props;

  // Internal ref to manage the input element
  const internalRef = useRef<HTMLInputElement>(null);

  // Expose internalRef to parent components when they provide a ref
  useImperativeHandle(ref, () => internalRef.current as HTMLInputElement);

  // Function to focus the input when the suffix is clicked
  const handleSuffixClick = () => {
    if (internalRef.current) {
      internalRef.current.focus();
    }
  };

  return (
    <div
      className={classNames(styles.inputWrapper, suffix && styles.withSuffix)}>
      <input
        ref={internalRef}
        {...rest}
        className={classNames(styles.input, className)}
        onChange={(e) => props.onChange(e.target.value)}
        style={
          width
            ? { width }
            : props.type === 'number'
              ? { minWidth: '40px' }
              : {}
        }
      />
      {suffix && (
        <div className={styles.suffix} onClick={handleSuffixClick}>
          {suffix}
        </div>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
