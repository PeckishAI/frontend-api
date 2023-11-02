import React from 'react';
import { FaCheck } from 'react-icons/fa';
import './style.scss';
import { useTranslation } from 'react-i18next';
import { ErrorMessage } from '../common';
import classNames from 'classnames';

type Props = Omit<
  React.HTMLProps<HTMLInputElement>,
  'checked' | 'onCheck' | 'label'
> & {
  checked?: boolean;
  label?: string | React.ReactNode;
  error?: string;
  onCheck?: (value: boolean) => void;
};

export const Checkbox = React.forwardRef<HTMLInputElement, Props>(
  (
    { label, checked, onCheck, error, className, style, ...props }: Props,
    ref
  ) => {
    const { t } = useTranslation('error');
    return (
      <div
        className={classNames('Checkbox', className)}
        style={style}
        onClick={(e) => e.stopPropagation()}>
        <label>
          <input
            {...props}
            ref={ref}
            type="checkbox"
            checked={checked}
            onChange={() => onCheck && onCheck(!checked)}
          />
          <FaCheck className="icon" />
          {label && <span>{label}</span>}
        </label>
        {error && (
          <ErrorMessage text={t(error as unknown as TemplateStringsArray)} />
        )}
      </div>
    );
  }
);
Checkbox.displayName = 'Checkbox';
