import './style.scss';
import { Lottie } from '../..';
import classNames from 'classnames';

type Props = {
  revele: boolean;
  loading: boolean;
  children: React.ReactNode;
  onRequestClose: () => void;
  className?: string;
};

const SidePanel = (props: Props) => {
  return (
    <>
      {props.revele && (
        <div
          className="sidePanel-overlay"
          onClick={() => props.onRequestClose()}></div>
      )}
      <div
        className={classNames('sidePanel', props.className, {
          visible: props.revele,
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
