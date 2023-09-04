import SelectInput, { GroupBase, Props } from 'react-select';

import styles from './Select.module.scss';
import classNames from 'classnames';

type CustomProps = {
  size?: 'small' | 'large';
};

const Select = <
  Option,
  IsMulti extends boolean = false,
  Group extends GroupBase<Option> = GroupBase<Option>
>(
  props: Props<Option, IsMulti, Group> & CustomProps
) => {
  const isSmall = !props.size || props.size === 'small';

  return (
    <SelectInput
      {...props}
      className={styles.selectContainer}
      classNames={{
        control: (state) =>
          classNames(styles.control, {
            [styles.controlFocused]: state.isFocused,
          }),
        valueContainer: () => styles.controlValueContainer,
        option: (state) =>
          classNames(styles.option, {
            [styles.optionSelected]: state.isSelected,
          }),
      }}
      styles={{
        control: (baseStyle) => ({
          ...baseStyle,
          height: isSmall ? '30px' : '40px',
          minHeight: isSmall ? '30px' : '40px',
          borderRadius: isSmall ? '10px' : '5px',
        }),
        valueContainer: (baseStyle) => ({
          ...baseStyle,
          height: isSmall ? '30px' : '40px',
        }),
        indicatorsContainer: (baseStyle) => ({
          ...baseStyle,
          height: isSmall ? '30px' : '40px',
        }),
        dropdownIndicator: (baseStyle) => ({
          ...baseStyle,
          padding: isSmall ? '0 4px' : '0 8px',
          width: isSmall ? '25px' : '36px',
        }),
        menu: (baseStyle) => ({
          ...baseStyle,
          borderRadius: isSmall ? '10px' : '5px',
          overflow: 'hidden',
        }),
      }}
    />
  );
};
export default Select;
