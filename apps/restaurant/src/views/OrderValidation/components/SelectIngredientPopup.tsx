import { useEffect, useState } from 'react';
import { Button, LabeledInput, Popup, Select } from 'shared-ui';
import { Ingredient, Supplier, inventoryService } from '../../../services';
import { useRestaurantStore } from '../../../store/useRestaurantStore';
import styles from './SelectIngredientPopup.module.scss';
import { z } from 'zod';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import supplierService from '../../../services/supplier.service';

const AddIngredientSchema = z
  .object({
    ingredientSelect: z
      .custom<Ingredient>()
      .refine((ingredient) => !!ingredient, { message: 'required' }),
    quantity: z.string().min(1, { message: 'required' }),

    supplierSelect: z.custom<Supplier>(),
  })
  .refine(
    (data) => {
      if (!data.ingredientSelect.supplier && !data.supplierSelect) return false;
      return true;
    },
    { message: 'required', path: ['supplierSelect'] }
  );

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
  const { t } = useTranslation('common');
  const selectedRestaurantUUID = useRestaurantStore(
    (state) => state.selectedRestaurantUUID
  );
  const [ingredientsOptions, setIngredientsOptions] = useState<
    IngredientOption[]
  >([]);
  const [suppliersOptions, setSuppliersOptions] = useState<Supplier[]>([]);
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

    supplierService
      .getRestaurantSuppliers(selectedRestaurantUUID)
      .then((suppliers) => {
        setSuppliersOptions(suppliers);
      });

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
    if (!data.ingredientSelect.supplier) {
      data.ingredientSelect.supplier = data.supplierSelect.name;
    }

    props.onAddIngredient(data.ingredientSelect, +data.quantity);
  });

  return (
    <Popup
      isVisible={props.isVisible}
      onRequestClose={props.onRequestClose}
      title={t('order.validation.addIngredientPopup.title')}
      subtitle={t('order.validation.addIngredientPopup.subtitle')}>
      <form onSubmit={handleFormSubmit}>
        <div className={styles.inputContainer}>
          <Controller
            control={control}
            name="ingredientSelect"
            render={({ field: { onChange, name, value, onBlur, ref } }) => (
              <Select
                placeholder={t(
                  'order.validation.addIngredientPopup.selectPlaceholder'
                )}
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
            placeholder={t('quantity')}
            type="number"
            suffix={
              watch('ingredientSelect')
                ? watch('ingredientSelect').unit
                : t('unknown')
            }
            {...register('quantity')}
            error={errors.quantity?.message}
          />

          {watch('ingredientSelect') && !watch('ingredientSelect').supplier && (
            <Controller
              control={control}
              name="supplierSelect"
              render={({ field: { onChange, name, value, onBlur, ref } }) => (
                <Select
                  placeholder={t(
                    'order.validation.addIngredientPopup.selectSupplierPlaceholder'
                  )}
                  options={suppliersOptions}
                  size="large"
                  isClearable
                  getOptionLabel={(option) => option.name}
                  getOptionValue={(option) => option.uuid}
                  isLoading={isIngredientsLoading}
                  innerRef={ref}
                  name={name}
                  onChange={onChange}
                  onBlur={onBlur}
                  value={value ?? null}
                  error={errors.supplierSelect?.message}
                />
              )}
            />
          )}
        </div>

        <div className={styles.buttonsContainer}>
          <Button
            type="secondary"
            value={t('cancel')}
            onClick={() => {
              props.onRequestClose();
            }}
          />
          <Button type="primary" value={t('add')} actionType="submit" />
        </div>
      </form>
    </Popup>
  );
};
