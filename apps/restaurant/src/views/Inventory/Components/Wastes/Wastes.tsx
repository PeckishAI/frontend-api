import { Button, LabeledInput, Popup, Checkbox } from 'shared-ui';
import styles from './styles.module.scss';
import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import Select from 'react-select';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { wasteService, restaurantService } from '../../../../services';
import { useRestaurantStore } from '../../../../store/useRestaurantStore';

// Define validation schema
export const WastingStock = z.object({
  ingredient_uuid: z.string(),
  name: z.string(),
  quantity: z
    .number()
    .min(0, { message: 'Quantity must be a positive number' }),
  unit: z.string(),
  reason: z.string(),
  //   users: z.array(z.string()), // Users will be a string array of user UUIDs
  automaticUpdate: z.boolean(),
});

export type WastingForm = z.infer<typeof WastingStock>;

type AddWastingPopupProps = {
  isVisible: boolean;
  onRequestClose: () => void;
  onReload: () => void;
  ingredient?: any; // Make it optional to avoid errors
};

const AddWastingPopup: React.FC<AddWastingPopupProps> = (props) => {
  const selectedRestaurantUUID = useRestaurantStore(
    (state) => state.selectedRestaurantUUID
  );

  // Local state for users, initialized as an empty array
  //   const [users, setUsers] = useState<{ value: string; label: string }[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
    control,
    reset,
  } = useForm<WastingForm>({
    resolver: zodResolver(WastingStock),
    defaultValues: {
      ingredient_uuid: props.ingredient?.id ?? '',
      name: props.ingredient?.name ?? '',
      quantity: 0,
      unit: props.ingredient?.unit ?? '',
      reason: '',
      //   users: [], // Initialize users as an empty array
      automaticUpdate: true,
    },
  });

  // Fetch users from the restaurant and update state
  useEffect(() => {
    if (props.isVisible && props.ingredient) {
      console.log('Setting ingredient values:', props.ingredient);
      setValue('ingredient_uuid', props.ingredient.id ?? '');
      setValue('name', props.ingredient.name ?? '');
      setValue('unit', props.ingredient.unit_name ?? '');
    } else {
      reset();
    }
  }, [props.isVisible, props.ingredient, reset, setValue]);

  const handleSubmitForm = handleSubmit(async (data) => {
    console.log('Submitting waste:', data);
    try {
      if (!selectedRestaurantUUID) {
        throw new Error('Restaurant UUID is missing');
      }

      // Send the entire form data (including reason and users) to the service
      await wasteService.createWaste(selectedRestaurantUUID, data);

      props.onRequestClose();

      if (props.onReload) {
        props.onReload();
      }
    } catch (error) {
      console.error('Error processing waste:', error);
    }
  });

  if (!props.ingredient) {
    return (
      <Popup
        isVisible={props.isVisible}
        onRequestClose={props.onRequestClose}
        title="Report Waste">
        <p>Loading ingredient data...</p>
      </Popup>
    );
  }

  return (
    <Popup
      isVisible={props.isVisible}
      onRequestClose={props.onRequestClose}
      title="Report Waste">
      <form onSubmit={handleSubmitForm}>
        <div className={styles.inputContainer}>
          {/* Register Ingredient UUID, Name, and Unit */}
          <input type="hidden" {...register('ingredient_uuid')} />
          <input type="hidden" {...register('name')} />
          <input type="hidden" {...register('unit')} />

          {/* Display Ingredient Name */}
          <div className={styles.fieldsContainer}>{props.ingredient.name}</div>

          {/* Quantity Input */}
          <LabeledInput
            className={styles.quantity}
            label="Quantity"
            placeholder={'Quantity'}
            type="number"
            {...register('quantity', {
              setValueAs: (value) =>
                value === '' ? undefined : parseFloat(value), // Convert string to number
            })}
            error={errors.quantity?.message}
          />

          {/* Display Ingredient Unit */}
          <div className={styles.fieldsContainer}>
            {props.ingredient.unit_name}
          </div>

          {/* Reason Selection Dropdown */}
          <Controller
            control={control}
            name="reason"
            render={({ field }) => (
              <Select
                placeholder="Select Reason"
                options={[
                  { value: 'expired', label: 'Expired' },
                  { value: 'broken', label: 'Broken' },
                  { value: 'lost', label: 'Lost' },
                  { value: 'personal', label: 'Personal' },
                  { value: 'other', label: 'Other' },
                ]}
                onChange={(selectedOption: any) =>
                  field.onChange(selectedOption?.value)
                }
                value={
                  field.value
                    ? { value: field.value, label: field.value }
                    : null
                }
              />
            )}
          />

          {/* User Selection Dropdown
          <Controller
            control={control}
            name="users"
            render={({ field }) => (
              <Select
                placeholder="Select User(s)"
                options={users} // Use fetched users as options
                isMulti // Enable multiple user selection
                onChange={
                  (selectedOptions: any) =>
                    field.onChange(
                      selectedOptions?.map((opt: any) => opt.value)
                    ) // Save array of user UUIDs
                }
                value={
                  Array.isArray(field.value) // Ensure `field.value` is an array
                    ? users.filter((user) => field.value.includes(user.value))
                    : [] // Default to empty array if no value selected
                }
              />
            )}
          /> */}
        </div>
        <Checkbox
          label={'Populate inventory with the waste.'}
          className={styles.autoCheckbox}
          {...register('automaticUpdate')}
        />

        <div className={styles.buttonsContainer}>
          <Button
            type="secondary"
            value="Cancel"
            onClick={props.onRequestClose}
          />
          <Button
            type="primary"
            value="Confirm"
            actionType="submit"
            loading={isSubmitting}
          />
        </div>
      </form>
    </Popup>
  );
};

export default AddWastingPopup;
