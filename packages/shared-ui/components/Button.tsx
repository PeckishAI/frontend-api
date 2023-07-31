import './Button.css';

type Props = {
  onClick: () => void;
  count: number;
};

export const Button = (props: Props) => {
  return <button onClick={props.onClick}>Count is {props.count}</button>;
};
