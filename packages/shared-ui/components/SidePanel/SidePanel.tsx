import './style.scss';
import { Lottie } from '../../index';
import classNames from 'classnames';
import { useEffect } from 'react';

type Props = {
  isOpen: boolean;
  loading?: boolean;
  children: React.ReactNode;
  onRequestClose: () => void;
  className?: string;
  scrollable?: boolean; // New prop to control scrollability
};

const SidePanel = (props: Props) => {
  // Block scrolling when side panel is open and not scrollable
  useEffect(() => {
    if (props.isOpen && !props.scrollable) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      if (!props.scrollable) {
        document.body.style.overflow = 'unset';
      }
    };
  }, [props.isOpen, props.scrollable]);

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
          'sidePanel-scrollable': props.scrollable, // Use a class to handle scrollable styling
        })}>
        <i
          className="fa-solid fa-xmark close-icon"
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
