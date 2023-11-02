import './style.scss';
import Lottie from '../Lottie/Lottie';
import classNames from 'classnames';

type Props = {
  value: string;
  type: 'primary' | 'secondary';
  actionType?: 'submit' | 'button';
  className?: string;
  loading?: boolean;
  onClick?: () => void;
  icon?: React.ReactNode;
  disabled?: boolean;
};

const Button = (props: Props) => {
  return (
    <button
      type={props.actionType ?? 'button'}
      className={classNames('button', props.type, props.className)}
      onClick={!props.loading ? props.onClick : undefined}
      disabled={props.disabled}>
      <span style={props.loading ? { opacity: 0 } : undefined}>
        {props.value}
      </span>
      {props.icon && <div className="icon">{props.icon}</div>}
      {props.loading && (
        <Lottie
          type={props.type === 'primary' ? 'loading_white' : 'loading'}
          width="45px"
        />
      )}
    </button>
  );
};

export default Button;
