import SelectInput, { GroupBase, Props } from 'react-select';
import CreatableSelect, { CreatableProps } from 'react-select/creatable';
import SelectType from 'react-select/dist/declarations/src/Select';

import styles from './Select.module.scss';
import classNames from 'classnames';
import { Ref } from 'react';
import { ErrorMessage } from '../common';
import { useTranslation } from 'react-i18next';

type CustomProps<
  Option,
  IsMulti extends boolean = false,
  Group extends GroupBase<Option> = GroupBase<Option>,
  CreatableT extends boolean = false,
> = {
  size?: 'small' | 'large';
  isCreatable?: CreatableT;
  innerRef?: Ref<SelectType<Option, IsMulti, Group>>;
  error?: string;
};

type ConditionalProps<
  Option,
  IsMulti extends boolean = false,
  Group extends GroupBase<Option> = GroupBase<Option>,
  CreatableT extends boolean = false,
> = CreatableT extends true
  ? CreatableProps<Option, IsMulti, Group>
  : Props<Option, IsMulti, Group>;

const Select = <
  Option,
  IsMulti extends boolean = false,
  Group extends GroupBase<Option> = GroupBase<Option>,
  CreatableT extends boolean = false,
>(
  props: CustomProps<Option, IsMulti, Group, CreatableT> &
    ConditionalProps<Option, IsMulti, Group, CreatableT>
) => {
  const { t } = useTranslation('error');
  const isSmall = !props.size || props.size === 'small';
  const selectHeight = isSmall
    ? 'var(--input-small-height)'
    : 'var(--input-large-height)';

  const Component = props.isCreatable ? CreatableSelect : SelectInput;

  return (
    <div>
      <Component
        {...props}
        ref={props.innerRef}
        className={classNames(styles.selectContainer, props.className)}
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
            borderRadius: isSmall ? '5px' : '5px',
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
            borderRadius: isSmall ? '5px' : '5px',
            overflow: 'hidden',
            zIndex: 100,
          }),
          option: (baseStyle) => ({
            ...baseStyle,
            padding: isSmall ? '8px 12px' : '8px 16px',
          }),
        }}
      />
      {props.error && (
        <ErrorMessage
          text={t(props.error as unknown as TemplateStringsArray)}
        />
      )}
    </div>
  );
};

export default Select;
