import './style.scss';

type Props = {
  children: React.ReactNode;
  isEmpty: boolean;
  isReduce: boolean;
  toggle: () => void;
};

const POIWindow = (props: Props) => {
  return (
    <div className={`poi-window${props.isReduce ? ' reduced' : ''}`}>
      <div className="toggle" onClick={props.toggle}>
        <i className="fa-solid fa-chevron-right"></i>
      </div>
      {props.isEmpty ? (
        <div className="empty">
          <span style={{ color: 'var(--primaryColor)' }}>
            Nothing to inspect.
          </span>
          <p style={{ textAlign: 'center', marginTop: '10px' }}>
            Click items on the map to see information about.
          </p>
        </div>
      ) : (
        <div className="children">{props.children}</div>
      )}
    </div>
  );
};

export default POIWindow;
