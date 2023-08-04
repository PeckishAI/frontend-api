import './style.scss';

export type OptionsDefinitionType = {
  label: string;
  value: string;
  color?: string;
};

type Props = {
  options: Array<OptionsDefinitionType>;
  selectedOption: string;
  onOptionChange: (event) => void;
};

const Dropdown = (props: Props) => {
  const selectedOption =
    props.options.filter(
      (option) => option.value === props.selectedOption
    )[0] ?? props.options[0];

  return (
    <div className="dropdown">
      <select
        value={props.selectedOption}
        onChange={props.onOptionChange}
        style={{ backgroundColor: selectedOption?.color }}>
        {props.options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default Dropdown;
