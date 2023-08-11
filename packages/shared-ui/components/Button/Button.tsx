import './style.scss';

type Props = {
  value: string;
  type: 'primary' | 'secondary';
  className?: string;
  onClick: () => void;
};

const Button = (props: Props) => {
  return (
    <button
      className={`button ${props.type} ${props.className}`}
      onClick={props.onClick}>
      {props.value}
    </button>
  );
};

export default Button;
