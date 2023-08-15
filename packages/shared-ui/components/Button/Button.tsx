import './style.scss';
import { Lottie } from 'shared-ui';

type Props = {
  value: string;
  type: 'primary' | 'secondary';
  className?: string;
  loading?: boolean;
  onClick?: () => void;
  icon?: React.ReactNode;
};

const Button = (props: Props) => {
  return (
    <button
      className={`button ${props.type} ${props.className ?? ''}`}
      onClick={!props.loading ? props.onClick : undefined}>
      <span style={props.loading ? { opacity: 0 } : undefined}>
        {props.value}
        {props.icon}
      </span>
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
