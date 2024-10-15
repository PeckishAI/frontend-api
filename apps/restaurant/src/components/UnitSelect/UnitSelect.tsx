import { useEffect, useState } from 'react';
import { type SingleValue, type ActionMeta } from 'react-select';
import { Select } from 'shared-ui';
import { inventoryService, Unit } from '../../services';
import { useRestaurantStore } from '../../store/useRestaurantStore';
import toast from 'react-hot-toast';

type SelectOption = { value: string; label: string };

type Props = {
  onChange: (unit: Unit | null) => void;
  value?: Unit | string | null;
};

const UnitSelect = (props: Props) => {
  const selectedRestaurantUUID = useRestaurantStore(
    (state) => state.selectedRestaurantUUID
  );

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>();
  const [units, setUnits] = useState<Unit[]>([]);
  const [selectedUnit, setSelectedUnit] = useState<SingleValue<SelectOption>>();

  useEffect(() => {
    const loadUnits = () => {
      if (!selectedRestaurantUUID) return;

      inventoryService
        .getUnits(selectedRestaurantUUID)
        .then((res) => {
          setUnits(res);
        })
        .catch((err) => {
          console.log(err);
          setError('Failed to load units');
        })
        .finally(() => {
          setIsLoading(false);
        });
    };

    loadUnits();
  }, [selectedRestaurantUUID]);

  const unitsOptions = units.map((unit) => ({
    value: unit.unit_uuid,
    label: unit.unit_name,
  }));

  const updateSelectedUnit = (option?: SingleValue<SelectOption>) => {
    setSelectedUnit(option);
    props.onChange(
      option ? { unit_uuid: option.value, unit_name: option.label } : null
    );
  };

  const createUnit = (unitName: string) => {
    if (!selectedRestaurantUUID) return;
    setIsLoading(true);
    inventoryService
      .createUnit(selectedRestaurantUUID, unitName)
      .then((newUnit) => {
        const newUnitUUID = newUnit.unit_uuid;

        // Add the new unit locally
        setUnits([
          ...units,
          {
            unit_uuid: newUnit.unit_uuid,
            unit_name: unitName,
          },
        ]);

        updateSelectedUnit({
          value: newUnitUUID,
          label: unitName,
        });
      })
      .catch(() => {
        toast.error('Failed to create unit');
      })
      .finally(() => {
        setIsLoading(false);
      });
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
      createUnit(selectedOption.label);
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

  return (
    <Select
      options={unitsOptions}
      isCreatable
      isClearable
      isSearchable
      maxMenuHeight={200}
      onChange={handleChange}
      value={selectedUnit}
      isLoading={isLoading}
      error={error}
    />
  );
};

export default UnitSelect;
