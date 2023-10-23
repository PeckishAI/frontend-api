import { forwardRef, useId } from 'react';
import './style.scss';
import React from 'react';
import { Tooltip } from 'react-tooltip';
import Lottie from '../Lottie/Lottie';

type Props = Omit<React.HTMLProps<HTMLDivElement>, 'onClick' | 'className'> & {
  icon: React.ReactNode;
  tooltipMsg: string;
  tooltipId?: string;
  onClick?: () => void;
  loading?: boolean;
  className?: string;
  tooltipClassName?: string;
};

const IconButton = forwardRef<HTMLDivElement, Props>((props, forwardedRef) => {
  const {
    onClick,
    loading,
    tooltipId,
    tooltipMsg,
    tooltipClassName,
    icon,
    ...restProps
  } = props;
  const tooltipIdGenerated = useId();

  return (
    <div
      ref={forwardedRef}
      {...restProps}
      className={`IconButton ${props.className ?? ''}`}
      data-tooltip-id={tooltipId ?? tooltipIdGenerated}
      data-tooltip-content={tooltipMsg}
      onClick={!loading ? onClick : undefined}>
      {
        <div
          style={{
            ...(loading ? { opacity: 0 } : undefined),
          }}
          className="icon-wrapper">
          {icon}
        </div>
      }
      {loading && <Lottie type="loading" width="150%" />}
      {!tooltipId && (
        <Tooltip
          className={`tooltip ${tooltipClassName ?? ''}`}
          id={tooltipId ?? tooltipIdGenerated}
        />
      )}
    </div>
  );
});
IconButton.displayName = 'IconButton';

export default IconButton;
