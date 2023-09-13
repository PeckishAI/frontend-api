import { useId } from 'react';
import './style.scss';
import React from 'react';
import { Tooltip } from 'react-tooltip';
import Lottie from '../Lottie/Lottie';

type Props = {
  icon: React.ReactNode;
  tooltipMsg: string;
  tooltipId?: string;
  onClick: () => void;
  loading?: boolean;
  className?: string;
  tooltipClassName?: string;
};

const IconButton = (props: Props) => {
  const tooltipId = useId();
  return (
    <div
      className={`IconButton ${props.className ?? ''}`}
      data-tooltip-id={props.tooltipId ?? tooltipId}
      data-tooltip-content={props.tooltipMsg}
      onClick={!props.loading ? props.onClick : undefined}>
      {
        <div
          style={{
            ...(props.loading ? { opacity: 0 } : undefined),
          }}
          className="icon-wrapper">
          {props.icon}
        </div>
      }
      {props.loading && <Lottie type="loading" width="150%" />}
      {!props.tooltipId && (
        <Tooltip
          className={`tooltip ${props.tooltipClassName ?? ''}`}
          id={props.tooltipId ?? tooltipId}
        />
      )}
    </div>
  );
};

export default IconButton;
