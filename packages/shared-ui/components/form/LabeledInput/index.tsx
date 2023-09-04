import React from 'react';
import './style.scss';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import { ErrorMessage } from '../common';

type Props = Omit<React.HTMLProps<HTMLInputElement>, 'onChange'> & {
  value?: string;
  placeholder: string;
  icon?: React.ReactNode;
  error?: string;
  lighter?: boolean;
};

export const LabeledInput = React.forwardRef<HTMLInputElement, Props>(
  ({ icon, placeholder, value, error, lighter, ...props }, ref) => {
    const { t } = useTranslation('error');
    return (
      <div className="LabeledInput">
        <div
          className={classNames('input-container', {
            error: error,
            lighter: lighter,
          })}>
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
          <ErrorMessage text={t(error as unknown as TemplateStringsArray)} />
        )}
      </div>
    );
  }
);
LabeledInput.displayName = 'LabeledInput';
