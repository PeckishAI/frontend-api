import classNames from 'classnames';
import './style.scss';

type Props = {
  isActive: boolean;
  toggle: () => void;
};

const Switch = (props: Props) => {
  return (
    <div className="switch">
      <input type="checkbox" id="switch" />
      <label
        htmlFor="switch"
        className={classNames('handler', props.isActive && 'active')}
        onClick={props.toggle}>
        <div className="btn"></div>
      </label>
    </div>
  );
};

export default Switch;
