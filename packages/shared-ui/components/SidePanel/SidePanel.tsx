import './style.scss';
import { Lottie } from '../..';
import classNames from 'classnames';
import { useEffect } from 'react';

type Props = {
  isOpen: boolean;
  loading: boolean;
  children: React.ReactNode;
  onRequestClose: () => void;
  className?: string;
};

const SidePanel = (props: Props) => {
  // Block scrolling when side panel is open
  useEffect(() => {
    if (props.isOpen) document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [props.isOpen]);

  return (
    <>
      {props.isOpen && (
        <div
          className="sidePanel-overlay"
          onClick={() => props.onRequestClose()}></div>
      )}
      <div
        className={classNames('sidePanel', props.className, {
          visible: props.isOpen,
        })}>
        <i
          className="fa-solid fa-xmark"
          data-tooltip-id="customer-tooltip"
          data-tooltip-content={'Close'}
          onClick={() => props.onRequestClose()}></i>

        {props.loading ? (
          <div className="loading-panel">
            <Lottie type="loading" width="200px" />
          </div>
        ) : (
          props.children
        )}
      </div>
    </>
  );
};

export default SidePanel;
