import classNames from 'classnames';
import './style.scss';

export type DropdownOptionsDefinitionType = {
  label: string;
  value: string;
  color?: string;
  disabled?: boolean;
};

type Props = {
  options: Array<DropdownOptionsDefinitionType>;
  selectedOption?: string;
  onOptionChange: (value: DropdownOptionsDefinitionType['value']) => void;
  className?: string;
  disableOption?: string;
};

const Dropdown = (props: Props) => {
  const selectedOption =
    props.options.filter(
      (option) => option.value === props.selectedOption
    )[0] ?? props.options[0];

  return (
    <div className={classNames('dropdown', props.className)}>
      <select
        value={props.selectedOption}
        onChange={(event) => {
          props.onOptionChange(event.target.value);
        }}
        style={{ backgroundColor: selectedOption?.color }}>
        {props.disableOption && (
          <option disabled selected>
            {props.disableOption}
          </option>
        )}
        {props.options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            disabled={option.disabled}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default Dropdown;
