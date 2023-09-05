import React from 'react';
import { FaCheck } from 'react-icons/fa';
import './style.scss';
import { useTranslation } from 'react-i18next';
import { ErrorMessage } from '../common';

type Props = Omit<React.HTMLProps<HTMLInputElement>, 'checked' | 'onCheck'> & {
  checked?: boolean;
  label?: string;
  error?: string;
  onCheck?: (value: boolean) => void;
};

export const Checkbox = React.forwardRef<HTMLInputElement, Props>(
  ({ label, checked, onCheck, error, ...props }: Props, ref) => {
    const { t } = useTranslation('error');
    return (
      <div className="Checkbox">
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
