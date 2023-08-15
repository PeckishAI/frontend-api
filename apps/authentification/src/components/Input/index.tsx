import React from 'react';
import './style.scss';
import { useTranslation } from 'react-i18next';

type Props = Omit<React.HTMLProps<HTMLInputElement>, 'onChange'> & {
  value?: string;
  placeholder: string;
  icon?: React.ReactNode;
  error?: string;
};

export const Input = React.forwardRef<HTMLInputElement, Props>(
  ({ icon, placeholder, value, error, ...props }, ref) => {
    const { t } = useTranslation('error');
    return (
      <div className="Input">
        <div className={`input-container ${error ? 'error' : ''}`}>
          {icon && <div className="icon">{icon}</div>}
          <input
            ref={ref}
            {...props}
            type={props.type ?? 'text'}
            value={value}
            placeholder=" " // To use css property :placeholder-shown
          />
          <label className={value && 'filled'}>{placeholder}</label>
        </div>
        {error && (
          <p className="error-message">
            {t(error as unknown as TemplateStringsArray)}
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';
