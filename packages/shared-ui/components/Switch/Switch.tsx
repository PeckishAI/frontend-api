import classNames from 'classnames';
import './style.scss';

type Props = {
  isActive: boolean;
  toggle: () => void;
  width?: number;
};

const Switch = (props: Props) => {
  return (
    <div
      className={classNames('switch', props.isActive && 'active')}
      onClick={props.toggle}
      style={props.width ? { width: props.width } : undefined}>
      <div className="btn"></div>
    </div>
  );
};

export default Switch;
