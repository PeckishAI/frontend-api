import './style.scss';
import { Lottie } from '../..';

type Props = {
  revele: boolean;
  loading: boolean;
  children: React.ReactNode;
  togglePanel: () => void;
};

const SidePanel = (props: Props) => {
  return (
    <>
      {props.revele && (
        <div
          className="sidePanel-overlay"
          onClick={() => props.togglePanel()}></div>
      )}
      <div className={`sidePanel ${props.revele ? 'visible' : ''}`}>
        <i
          className="fa-solid fa-xmark"
          data-tooltip-id="customer-tooltip"
          data-tooltip-content={'Close'}
          onClick={() => props.togglePanel()}></i>

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
