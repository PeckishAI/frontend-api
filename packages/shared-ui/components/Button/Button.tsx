import './style.scss';
import { Lottie } from 'shared-ui';

type Props = {
  value: string;
  type: 'primary' | 'secondary';
  className?: string;
  loading?: boolean;
  onClick?: () => void;
};

const Button = (props: Props) => {
  return (
    <button
      className={`button ${props.type} ${props.className ?? ''}`}
      onClick={props.onClick}>
      <span style={props.loading ? { opacity: 0 } : undefined}>
        {props.value}
      </span>
      {props.loading && <Lottie type="loading" width="45px" />}
    </button>
  );
};

export default Button;
