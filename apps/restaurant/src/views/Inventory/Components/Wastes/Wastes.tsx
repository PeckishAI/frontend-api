import { Button, LabeledInput, Popup } from 'shared-ui';
import styles from './styles.module.scss';
import { useEffect, useState } from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Select, { SingleValue } from 'react-select';
import CreatableSelect from 'react-select/creatable';
import { z } from 'zod';
import { FaPlus, FaTrash } from 'react-icons/fa';
import {
  Ingredient,
  transferService,
  inventoryService,
} from '../../../../services';

export const WastingStock = z.object({
  ingredient_uuid: z.string(),
  name: z.string(),
  quantity: z
    .number()
    .min(0, { message: 'Quantity must be a positive number' }),
  unit: z.string(),
});

export type WastingForm = z.infer<typeof WastingStock>;

type AddWastingPopupProps = {
  isVisible: boolean;
  onRequestClose: () => void;
  onReload: () => void;
  ingredient: Ingredient;
};

const AddWastingPopup: React.FC<AddWastingPopupProps> = (props) => {
  console.log('Popup props:', props);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, isSubmitting },
    reset,
    setValue,
  } = useForm<WastingForm>({
    resolver: zodResolver(WastingStock),
    defaultValues: {
      ingredient_uuid: '',
      name: '',
      quantity: 0,
      unit: '',
    },
  });

  useEffect(() => {
    if (props.isVisible && props.ingredient) {
      console.log('Ingredient data received in popup:', props.ingredient); // Log the ingredient data

      reset({
        ingredient_uuid: props.ingredient.id,
        name: props.ingredient.name,
        quantity: 0, // You can update this to the correct value if needed
        unit: props.ingredient.unit,
      });
    }
  }, [props.isVisible, props.ingredient, reset]);

  const handleSubmitForm = handleSubmit(async (data) => {
    try {
      const uuid = await transferService.createTransfer(data);
      props.onRequestClose();
      if (props.onReload) {
        props.onReload();
      }
    } catch (error) {
      console.error('Error processing waste:', error);
    }
  });

  return (
    <Popup
      isVisible={props.isVisible}
      onRequestClose={props.onRequestClose}
      title="Report Waste">
      <form onSubmit={handleSubmitForm}>
        <div className={styles.inputContainer}>
          <div className={styles.fieldsContainer}>{props.ingredient.name}</div>
          <LabeledInput
            className={styles.quantity}
            label="Quantity"
            type="number"
            value={watch('quantity')}
            {...register('quantity')}
            error={errors.quantity?.message}
          />
          <div className={styles.fieldsContainer}>{props.ingredient.unit}</div>
        </div>

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
