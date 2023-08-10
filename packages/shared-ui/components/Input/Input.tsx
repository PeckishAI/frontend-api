import './style.scss';

type Props = {
  type: string;
  placeholder?: string;
  min?: number;
  max?: number;
  value: string | number;
  onChange: (value: string) => void;
};

const Input = (props: Props) => {
  return (
    <input
      className="input"
      type={props.type}
      min={props.min}
      max={props.max}
      value={props.value}
      placeholder={props.placeholder}
      onChange={(e) => props.onChange(e.target.value)}
      style={props.type === 'number' ? { width: '100px' } : { width: 'auto' }}
    />
  );
};

export default Input;
