import { Button, LabeledInput, Popup } from 'shared-ui';
import styles from './styles.module.scss';
import { useEffect, useState } from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Select, { SingleValue } from 'react-select';
import CreatableSelect from 'react-select/creatable'; // Import the creatable select for ingredient creation
import { z } from 'zod';
import { FaPlus, FaTrash } from 'react-icons/fa';
import {
  Ingredient,
  transferService,
  inventoryService,
} from '../../../../services'; // import inventoryService to fetch ingredients

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
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, isSubmitting },
    reset,
    setValue,
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

  const {
    fields: ingredientFields,
    append: addIngredient,
    remove,
  } = useFieldArray({
    control,
    name: 'ingredients',
  });

  const selectedFromRestaurant = watch('from_restaurant_uuid');
  const selectedToRestaurant = watch('to_restaurant_uuid');

  useEffect(() => {
    if (selectedFromRestaurant) {
      inventoryService
        .getOnlyIngredientList(selectedFromRestaurant)
        .then((ingredients) => {
          console.log(ingredients);
          setFromIngredients(ingredients);
        });
    } else {
      setFromIngredients([]);
    }
  }, [selectedFromRestaurant]);

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

  const handleCreateIngredient = async (
    inputValue: string,
    restaurantId: string,
    index: number
  ) => {
    setLoading(true);
    try {
      const newIngredient: Ingredient = {
        id: '',
        name: inputValue,
        parLevel: 0,
        actualStock: 0,
        theoriticalStock: 0,
        unit: '',
        unitCost: 0,
        tagUUID: [],
        supplier_details: [],
        amount: 0,
        type: '',
      };

      const response = await inventoryService.addIngredient(
        restaurantId,
        newIngredient
      );

      const { ingredient_uuid, ingredient_name } = response.data;

      const addedIngredient = {
        id: ingredient_uuid,
        name: ingredient_name,
        unit: '',
      };

      if (restaurantId === selectedToRestaurant) {
        setToIngredients((prev) => [...prev, addedIngredient]);
      }
      setValue(`ingredients.${index}.to_ingredient_uuid`, addedIngredient.id);
    } catch (error) {
      console.error('Error creating ingredient:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFromIngredientChange = (ingredientId: string, index: number) => {
    const selectedIngredient = fromIngredients.find(
      (ingredient) => ingredient.id === ingredientId
    );
    const unit = selectedIngredient ? selectedIngredient.unit : '';
    setValue(`ingredients.${index}.unit`, unit || '');
  };

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
          {/* Restaurant Row (From and To Site on the same line) */}
          <div className={styles.row}>
            <div className={styles.restaurantFields}>
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
          </div>

          {/* Ingredient Rows */}
          {ingredientFields.map((field, index) => (
            <div key={field.id} className={styles.row}>
              <div className={styles.ingredientFields}>
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
                      ) => {
                        field.onChange(
                          selectedOption ? selectedOption.value : ''
                        );
                        handleFromIngredientChange(
                          selectedOption ? selectedOption.value : '',
                          index
                        );
                      }}
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

                {/* Quantity and Unit Display */}
                <div className={styles.quantityUnitGroup}>
                  <LabeledInput
                    placeholder="Qty"
                    type="number"
                    {...register(`ingredients.${index}.quantity`, {
                      valueAsNumber: true,
                    })}
                  />

                  <div className={styles.unitDisplay}>
                    {watch(`ingredients.${index}.unit`) || ''}
                  </div>
                </div>

                {/* To Ingredient Select with Creatable */}
                <Controller
                  control={control}
                  name={`ingredients.${index}.to_ingredient_uuid`}
                  render={({ field }) => (
                    <CreatableSelect
                      key={toIngredients.length}
                      placeholder="To Ingredient"
                      options={toIngredients.map((ing) => ({
                        value: ing.id,
                        label: ing.name,
                      }))}
                      isLoading={loading}
                      onCreateOption={(inputValue) =>
                        handleCreateIngredient(
                          inputValue,
                          selectedToRestaurant,
                          index
                        )
                      }
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

              {/* Delete Button */}
              <div className={styles.deleteButtonContainer}>
                <FaTrash onClick={() => remove(index)} />
              </div>
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

        {/* Form Action Buttons */}
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
