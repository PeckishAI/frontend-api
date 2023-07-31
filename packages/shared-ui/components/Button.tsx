import './Button.css';

type Props = {
  onClick: () => void;
  count: number;
};

const Button = (props: Props) => {
  return (
    <button type="button" onClick={props.onClick}>
      Count is {props.count}
    </button>
  );
};

export default Button;
