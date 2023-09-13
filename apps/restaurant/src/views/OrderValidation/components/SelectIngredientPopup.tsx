import { useEffect, useState } from 'react';
import { Button, LabeledInput, Popup, Select } from 'shared-ui';
import { Ingredient, inventoryService } from '../../../services';
import { useRestaurantStore } from '../../../store/useRestaurantStore';
import styles from './SelectIngredientPopup.module.scss';
import { z } from 'zod';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const AddIngredientSchema = z.object({
  ingredientSelect: z
    .custom<Ingredient>()
    .refine((ingredient) => !!ingredient, { message: 'required' }),
  quantity: z.string().min(1, { message: 'required' }),
});

type AddIngredientForm = z.infer<typeof AddIngredientSchema>;

type IngredientOption = {
  label: string;
  options: Ingredient[];
};

type Props = {
  isVisible: boolean;
  onRequestClose: () => void;
  onAddIngredient: (ingredient: Ingredient, quantity: number) => void;
};

export const SelectIngredientPopup = (props: Props) => {
  const selectedRestaurantUUID = useRestaurantStore(
    (state) => state.selectedRestaurantUUID
  );
  const [ingredientsOptions, setIngredientsOptions] = useState<
    IngredientOption[]
  >([]);
  const [isIngredientsLoading, setIngredientsLoading] = useState(false);

  const {
    control,
    register,
    watch,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddIngredientForm>({
    resolver: zodResolver(AddIngredientSchema),
  });

  useEffect(() => {
    if (!props.isVisible) reset();
  }, [props.isVisible, reset]);

  useEffect(() => {
    if (!selectedRestaurantUUID) return;

    setIngredientsLoading(true);
    inventoryService
      .getIngredientList(selectedRestaurantUUID)
      .then((ingredients) => {
        // Group ingredients by supplier
        const ingredientsBySupplier = ingredients.reduce((acc, ingredient) => {
          const supplier = ingredient.supplier ?? 'Unknown';
          const existingSupplier = acc.find((i) => i.label === supplier);

          if (existingSupplier) {
            existingSupplier.options.push(ingredient);
          } else {
            acc.push({
              label: supplier,
              options: [ingredient],
            });
          }

          return acc;
        }, [] as IngredientOption[]);
        setIngredientsOptions(ingredientsBySupplier);
      })
      .finally(() => setIngredientsLoading(false));
  }, [selectedRestaurantUUID]);

  const handleFormSubmit = handleSubmit((data) => {
    console.log('Submit', data);
    props.onAddIngredient(data.ingredientSelect, +data.quantity);
  });

  return (
    <Popup
      isVisible={props.isVisible}
      onRequestClose={props.onRequestClose}
      title="Select an ingredient"
      subtitle="The selected ingredient will be added in the good supplier order">
      <form onSubmit={handleFormSubmit}>
        <div className={styles.inputContainer}>
          <Controller
            control={control}
            name="ingredientSelect"
            render={({ field: { onChange, name, value, onBlur, ref } }) => (
              <Select
                placeholder="Select an ingredient"
                options={ingredientsOptions}
                size="large"
                isClearable
                getOptionLabel={(option) => option.name}
                getOptionValue={(option) => option.id}
                isLoading={isIngredientsLoading}
                innerRef={ref}
                name={name}
                onChange={onChange}
                onBlur={onBlur}
                value={value ?? null}
                error={errors.ingredientSelect?.message}
              />
            )}
          />
          <LabeledInput
            lighter
            placeholder="Quantity"
            type="number"
            suffix={
              watch('ingredientSelect')
                ? watch('ingredientSelect').unit
                : 'unknown'
            }
            {...register('quantity')}
            error={errors.quantity?.message}
          />
        </div>
        <div className={styles.buttonsContainer}>
          <Button type="secondary" value="Cancel" />
          <Button type="primary" value="Add" actionType="submit" />
        </div>
      </form>
    </Popup>
  );
};
