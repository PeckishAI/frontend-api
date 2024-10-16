import { useEffect, useState } from 'react';
import { type ActionMeta, type SingleValue } from 'react-select';
import { Select } from 'shared-ui';
import { Unit, useCreateUnit, useUnits } from '../../services';

type SelectOption = { value: string; label: string };

type Props = {
  onChange: (unit: Unit | null) => void;
  value?: Unit | string | null;
};

const UnitSelect = (props: Props) => {
  const [selectedUnit, setSelectedUnit] = useState<SingleValue<SelectOption>>();
  const { data: units, isLoading } = useUnits();
  const createUnit = useCreateUnit();

  const updateSelectedUnit = (option?: SingleValue<SelectOption>) => {
    setSelectedUnit(option);
    props.onChange(
      option ? { unit_uuid: option.value, unit_name: option.label } : null
    );
  };

  const handleChange = (
    selectedOption: SingleValue<SelectOption>,
    actionMeta: ActionMeta<SelectOption>
  ) => {
    if (!selectedOption) {
      updateSelectedUnit(null);
      return;
    }

    if (actionMeta.action === 'create-option') {
      createUnit.mutate(selectedOption.label, {
        onSuccess: (newUnit) => {
          console.log('New unit created:', newUnit);

          updateSelectedUnit({
            value: newUnit.unit_uuid,
            label: newUnit.unit_name,
          });
        },
      });
    } else {
      updateSelectedUnit(selectedOption);
    }
  };

  // Replicate the external value change in the internal state
  useEffect(() => {
    if (!props.value) {
      setSelectedUnit(null);
      return;
    }

    if (typeof props.value === 'string') {
      const unit = units.find((unit) => unit.unit_uuid === props.value);
      if (unit) {
        setSelectedUnit({
          value: unit.unit_uuid,
          label: unit.unit_name,
        });
      }
    } else {
      setSelectedUnit({
        value: props.value.unit_uuid,
        label: props.value.unit_name,
      });
    }
  }, [props.value, units]);

  const unitsOptions = units.map((unit) => ({
    value: unit.unit_uuid,
    label: unit.unit_name,
  }));

  return (
    <Select
      options={unitsOptions}
      isCreatable
      isClearable
      isSearchable
      maxMenuHeight={200}
      onChange={handleChange}
      value={selectedUnit}
      isLoading={isLoading || createUnit.isPending}
    />
  );
};

export default UnitSelect;
