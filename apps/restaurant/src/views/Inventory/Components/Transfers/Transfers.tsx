import { Button, LabeledInput, Popup } from 'shared-ui';
import styles from './styles.module.scss';
import { useEffect, useState } from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Select, { SingleValue } from 'react-select';
import { z } from 'zod';
import { FaPlus } from 'react-icons/fa';
import { transferService, inventoryService } from '../../../../services'; // import inventoryService to fetch ingredients

type RestaurantOption = {
  id: string;
  name: string;
};

type IngredientOption = {
  id: string;
  name: string;
  unit?: string;
};

export const TransferStock = z.object({
  from_restaurant_uuid: z
    .string()
    .nonempty({ message: 'From Restaurant is required' }),
  to_restaurant_uuid: z
    .string()
    .nonempty({ message: 'To Restaurant is required' }),
  ingredients: z
    .array(
      z.object({
        from_ingredient_uuid: z
          .string()
          .nonempty({ message: 'Ingredient A is required' }),
        to_ingredient_uuid: z
          .string()
          .nonempty({ message: 'Ingredient B is required' }),
        quantity: z
          .number()
          .min(0, { message: 'Quantity must be a positive number' }),
        unit: z.string().optional(),
      })
    )
    .min(1, { message: 'At least one ingredient is required' }),
});

export type TransferForm = z.infer<typeof TransferStock>;

type AddTransferPopupProps = {
  isVisible: boolean;
  onRequestClose: () => void;
  onReload: () => void;
  restaurants: RestaurantOption[];
};

const AddTransferPopup: React.FC<AddTransferPopupProps> = (props) => {
  const [fromIngredients, setFromIngredients] = useState<IngredientOption[]>(
    []
  );
  const [toIngredients, setToIngredients] = useState<IngredientOption[]>([]);

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<TransferForm>({
    resolver: zodResolver(TransferStock),
    defaultValues: {
      from_restaurant_uuid: '',
      to_restaurant_uuid: '',
      ingredients: [
        {
          from_ingredient_uuid: '',
          to_ingredient_uuid: '',
          quantity: 0,
          unit: '',
        },
      ],
    },
  });

  const { fields: ingredientFields, append: addIngredient } = useFieldArray({
    control,
    name: 'ingredients',
  });

  const selectedFromRestaurant = watch('from_restaurant_uuid');
  const selectedToRestaurant = watch('to_restaurant_uuid');

  // Fetch ingredients when the "From Site" restaurant is selected
  useEffect(() => {
    if (selectedFromRestaurant) {
      inventoryService
        .getOnlyIngredientList(selectedFromRestaurant)
        .then((ingredients) => {
          setFromIngredients(ingredients);
        });
    } else {
      setFromIngredients([]); // Clear the ingredients when no restaurant is selected
    }
  }, [selectedFromRestaurant]);

  // Fetch ingredients when the "To Site" restaurant is selected
  useEffect(() => {
    if (selectedToRestaurant) {
      inventoryService
        .getOnlyIngredientList(selectedToRestaurant)
        .then((ingredients) => {
          setToIngredients(ingredients);
        });
    } else {
      setToIngredients([]);
    }
  }, [selectedToRestaurant]);

  useEffect(() => {
    if (!props.isVisible) {
      reset();
    }
  }, [props.isVisible, reset]);

  const handleSubmitForm = handleSubmit(async (data) => {
    try {
      const uuid = await transferService.createTransfer(data);
      props.onRequestClose();
      props.onReload();
    } catch (error) {
      console.error('Error processing transfer:', error);
    }
  });

  return (
    <Popup
      isVisible={props.isVisible}
      onRequestClose={props.onRequestClose}
      title="Transfer Stock">
      <form onSubmit={handleSubmitForm}>
        <div className={styles.inputContainer}>
          <div className={styles.restaurantContainer}>
            {/* From Restaurant Select */}
            <Controller
              control={control}
              name="from_restaurant_uuid"
              render={({ field }) => (
                <Select
                  placeholder="From Site"
                  options={props.restaurants.map((rest) => ({
                    value: rest.id,
                    label: rest.name,
                  }))}
                  onChange={(
                    selectedOption: SingleValue<{
                      value: string;
                      label: string;
                    }>
                  ) =>
                    field.onChange(selectedOption ? selectedOption.value : '')
                  }
                  value={
                    props.restaurants
                      .map((rest) => ({
                        value: rest.id,
                        label: rest.name,
                      }))
                      .find((option) => option.value === field.value) || null
                  }
                />
              )}
            />
            <div className={styles.arrowContainer}>
              <i className="fa-solid fa-arrow-right"></i>
            </div>
            {/* To Restaurant Select */}
            <Controller
              control={control}
              name="to_restaurant_uuid"
              render={({ field }) => (
                <Select
                  placeholder="To Site"
                  options={props.restaurants.map((rest) => ({
                    value: rest.id,
                    label: rest.name,
                  }))}
                  onChange={(
                    selectedOption: SingleValue<{
                      value: string;
                      label: string;
                    }>
                  ) =>
                    field.onChange(selectedOption ? selectedOption.value : '')
                  }
                  value={
                    props.restaurants
                      .map((rest) => ({
                        value: rest.id,
                        label: rest.name,
                      }))
                      .find((option) => option.value === field.value) || null
                  }
                />
              )}
            />
          </div>

          <div className={styles.ingredientContainer}>
            {ingredientFields.map((field, index) => (
              <div key={field.id} className={styles.rowInputs}>
                {/* From Ingredient Select */}
                <Controller
                  control={control}
                  name={`ingredients.${index}.from_ingredient_uuid`}
                  render={({ field }) => (
                    <Select
                      placeholder="From Ingredient"
                      options={fromIngredients.map((ing) => ({
                        value: ing.id,
                        label: ing.name,
                      }))}
                      onChange={(
                        selectedOption: SingleValue<{
                          value: string;
                          label: string;
                        }>
                      ) =>
                        field.onChange(
                          selectedOption ? selectedOption.value : ''
                        )
                      }
                      value={
                        fromIngredients
                          .map((ing) => ({
                            value: ing.id,
                            label: ing.name,
                          }))
                          .find((option) => option.value === field.value) ||
                        null
                      }
                    />
                  )}
                />

                <div className={styles.quantityUnitGroup}>
                  <LabeledInput
                    placeholder="Quantity"
                    type="number"
                    {...register(`ingredients.${index}.quantity`, {
                      valueAsNumber: true,
                    })}
                  />

                  <LabeledInput
                    placeholder="Unit"
                    {...register(`ingredients.${index}.unit`)}
                  />
                </div>

                {/* To Ingredient Select */}
                <Controller
                  control={control}
                  name={`ingredients.${index}.to_ingredient_uuid`}
                  render={({ field }) => (
                    <Select
                      placeholder="To Ingredient"
                      options={toIngredients.map((ing) => ({
                        value: ing.id,
                        label: ing.name,
                      }))}
                      onChange={(
                        selectedOption: SingleValue<{
                          value: string;
                          label: string;
                        }>
                      ) =>
                        field.onChange(
                          selectedOption ? selectedOption.value : ''
                        )
                      }
                      value={
                        toIngredients
                          .map((ing) => ({
                            value: ing.id,
                            label: ing.name,
                          }))
                          .find((option) => option.value === field.value) ||
                        null
                      }
                    />
                  )}
                />
              </div>
            ))}
            <div
              className={styles.addIngredientButton}
              onClick={() =>
                addIngredient({
                  from_ingredient_uuid: '',
                  to_ingredient_uuid: '',
                  quantity: 0,
                  unit: '',
                })
              }>
              <FaPlus />
              <p>Add Ingredient</p>
            </div>
          </div>
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

export default AddTransferPopup;
