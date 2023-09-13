import React from 'react';
import './style.scss';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import { ErrorMessage } from '../common';

type Props = React.DetailedHTMLProps<
  React.InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
> & {
  value?: string;
  placeholder: string;
  icon?: React.ReactNode;
  error?: string;
  lighter?: boolean;
  suffix?: string;
};

export const LabeledInput = React.forwardRef<HTMLInputElement, Props>(
  ({ icon, placeholder, value, error, lighter, suffix, ...props }, ref) => {
    const { t } = useTranslation('error');
    return (
      <div className="LabeledInput">
        <div
          className={classNames('input-container', {
            error: error,
            lighter: lighter,
          })}>
          {icon && <div className="icon">{icon}</div>}

          <div className="content-wrapper">
            <div className="input-wrapper">
              <input
                ref={ref}
                {...props}
                value={value}
                placeholder=" " // To use css property :placeholder-shown
              />
              <label className={value && 'filled'}>{placeholder}</label>
            </div>

            {suffix && <div className="suffix">{suffix}</div>}
          </div>
        </div>

        {error && (
          <ErrorMessage text={t(error as unknown as TemplateStringsArray)} />
        )}
      </div>
    );
  }
);
LabeledInput.displayName = 'LabeledInput';
