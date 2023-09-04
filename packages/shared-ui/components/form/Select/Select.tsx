import SelectInput, { GroupBase, Props } from 'react-select';
import CreatableSelect, { CreatableProps } from 'react-select/creatable';

import styles from './Select.module.scss';
import classNames from 'classnames';

type CustomProps<CreatableT> = {
  size?: 'small' | 'large';
  isCreatable?: CreatableT;
};

type ConditionalProps<
  Option,
  IsMulti extends boolean = false,
  Group extends GroupBase<Option> = GroupBase<Option>,
  CreatableT extends boolean = false
> = CreatableT extends true
  ? CreatableProps<Option, IsMulti, Group>
  : Props<Option, IsMulti, Group>;

const Select = <
  Option,
  IsMulti extends boolean = false,
  Group extends GroupBase<Option> = GroupBase<Option>,
  CreatableT extends boolean = false
>(
  props: CustomProps<CreatableT> &
    ConditionalProps<Option, IsMulti, Group, CreatableT>
) => {
  const isSmall = !props.size || props.size === 'small';
  const selectHeight = isSmall
    ? 'var(--input-small-height)'
    : 'var(--input-large-height)';

  const Component = props.isCreatable ? CreatableSelect : SelectInput;

  return (
    <Component
      {...props}
      className={styles.selectContainer}
      classNames={{
        control: (state) =>
          classNames(styles.control, {
            [styles.controlFocused]: state.isFocused,
          }),
        valueContainer: () => styles.controlValueContainer,
        placeholder: () => styles.valueText,
        singleValue: (state) =>
          classNames(styles.valueText, {
            [styles.valueTextFilled]: state.hasValue,
          }),
        option: (state) =>
          classNames(styles.option, {
            [styles.optionSelected]: state.isSelected,
          }),
      }}
      styles={{
        control: (baseStyle) => ({
          ...baseStyle,
          height: selectHeight,
          minHeight: selectHeight,
          borderRadius: isSmall ? '10px' : '5px',
          cursor: props.isSearchable ? 'text' : 'pointer',
        }),
        singleValue: (baseStyle) => ({
          ...baseStyle,
          color: 'red',
        }),
        valueContainer: (baseStyle) => ({
          ...baseStyle,
          height: selectHeight,
          padding: isSmall ? '2px 8px' : '2px 13px',
        }),
        indicatorsContainer: (baseStyle) => ({
          ...baseStyle,
          height: selectHeight,
        }),
        dropdownIndicator: (baseStyle) => ({
          ...baseStyle,
          padding: isSmall ? '0 4px' : '0 8px',
          width: isSmall ? '24px' : '36px',
        }),
        menu: (baseStyle) => ({
          ...baseStyle,
          borderRadius: isSmall ? '10px' : '5px',
          overflow: 'hidden',
        }),
        option: (baseStyle) => ({
          ...baseStyle,
          padding: isSmall ? '8px 12px' : '8px 16px',
        }),
      }}
    />
  );
};
export default Select;
