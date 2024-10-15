import {
  Button,
  Checkbox,
  IconButton,
  LabeledInput,
  Popup,
  Select,
} from 'shared-ui';
import styles from './AddPreparationPopup.module.scss';
import { useEffect, useState } from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { inventoryService, Recipe, recipesService } from '../../services';
import { useRestaurantStore } from '../../store/useRestaurantStore';
import { FaPlus, FaTrash, FaTimes } from 'react-icons/fa';
import CreatableSelect from 'react-select/creatable';

const AddPreparationSchema = z.object({
  category: z.string({
    required_error: 'Category is required',
    invalid_type_error: 'Category is required',
  }),
  recipe_name: z.string().min(1, { message: 'Recipe name is required' }),
  quantity: z.number({
    required_error: 'Quantity is required',
    invalid_type_error: 'Quantity is required',
  }),
  unit_name: z.string().min(1, { message: 'Unit name is required' }),
  unit_uuid: z.string().optional(),

  ingredients: z
    .array(
      z.object({
        ingredient_uuid: z
          .string()
          .min(1, { message: 'Ingredient selection is required' })
          .refine((val) => val !== '', {
            message: 'Ingredient UUID cannot be empty',
          }),
        quantity: z.number({
          required_error: 'Quantity is required',
          invalid_type_error: 'Quantity is required',
        }),
        conversion_factor: z.number({
          required_error: 'Conversion factor is required',
          invalid_type_error: 'Conversion factor is required',
        }),
        recipe_unit_name: z
          .string()
          .min(1, { message: 'Unit name is required' }),
        recipe_unit_uuid: z.string().optional(),
        type: z.string().optional(),
        ingredient_unit_uuid: z.string().optional(),
      })
    )
    .min(1, { message: 'At least one ingredient is required' }),
});

type PreparationForm = z.infer<typeof AddPreparationSchema>;

type Props = {
  isVisible: boolean;
  onRequestClose: () => void;
  onRecipeChanged: (recipe: Recipe, action: 'deleted' | 'updated') => void;
  onReload: () => void;
  ingredients: any;
  selectedTab: number;
  categories: Array<{ value: string; label: string }>;
};

const AddPreparationPopup = (props: Props) => {
  const { t } = useTranslation('common');

  const restaurantUUID = useRestaurantStore(
    (state) => state.selectedRestaurantUUID
  );
  const [unitname, setUnitName] = useState([]);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<PreparationForm>({
    resolver: zodResolver(AddPreparationSchema),
    defaultValues: {
      quantity: 1,
      unit_name: 'each',
      unit_uuid: 'each',
      category: 'preparations',
      ingredients: [
        { ingredient_uuid: '', quantity: 0, type: '', conversion_factor: 0 },
      ],
    },
  });

  const {
    fields: ingredientFields,
    append: addIngredient,
    remove: removeIngredient,
  } = useFieldArray({
    control,
    name: 'ingredients',
  });

  function reloadUnits() {
    if (!restaurantUUID) return;

    inventoryService
      .getUnits(restaurantUUID)
      .then((res) => {
        setUnitName(res);
      })
      .catch((err) => {
        console.log(err);
      });
  }
  useEffect(() => {
    reloadUnits();
  }, [restaurantUUID]);

  useEffect(() => {
    if (!props.isVisible) {
      reset();
    }
  }, [props.isVisible, reset]);

  useEffect(() => {
    if (!props.isVisible) {
      reset();
    } else {
      if (props.selectedTab === 1) {
        setValue('quantity', 1);
        setValue('unit_name', 'each');
        setValue('category', 'preparations');
      } else {
        setValue('portion_count', 1);
        setValue('portion_price', 0);
        setValue('category', 'recipe');
      }
    }
  }, [props.isVisible, reset, setValue]);

  useEffect(() => {
    ingredientFields.forEach((field, index) => {
      const ingredient_uuid = watch(`ingredients.${index}.ingredient_uuid`);
      const selectedIngredient = props.ingredients.find(
        (ing) => ing.id === ingredient_uuid
      );

      if (selectedIngredient) {
        setValue(`ingredients.${index}.type`, selectedIngredient.type || '');
        setValue(
          `ingredients.${index}.ingredient_unit_uuid`,
          selectedIngredient.unit_uuid || ''
        );
        setValue(
          `ingredients.${index}.ingredient_unit_name`,
          selectedIngredient.unit_name || ''
        );
      }
    });
  }, [watch('ingredients'), props.ingredients, setValue]);

  const groupedOptions = Object.values(props.ingredients).reduce(
    (groups, item) => {
      const group = item.type === 'ingredient' ? 'Ingredients' : 'Preparations';
      if (!groups[group]) {
        groups[group] = [];
      }
      groups[group].push({
        label: item.name,
        value: item.id,
      });
      return groups;
    },
    {}
  );

  const groupedSelectOptions = Object.keys(groupedOptions).map((group) => ({
    label: group,
    options: groupedOptions[group],
  }));

  const handleSubmitForm = handleSubmit(async (data) => {
    const requestData = {
      ...data,
      ingredients: data.ingredients.map((ing) => ({
        ingredient_uuid: ing.selectedUUID,
        unit_name: ing.unit_name || null, // Set fallback value if undefined
        unit_uuid: ing.unit_uuid || null,
        recipe_unit_uuid: ing.recipe_unit_uuid || null,
        recipe_unit_name: ing.recipe_unit_name || '', // Fallback for undefined
        conversion_factor: ing.conversion_factor || 1.0,
        quantity: ing.quantity ?? 0,
        type: ing.type,
      })),
    };

    const updateData = {
      ...data,
      ingredients: data.ingredients.map((ingredient) => ({
        ...ingredient,
        conversion_factor: +ingredient.conversion_factor,
      })),
    };

    if (!restaurantUUID) return;

    try {
      const uuid = await recipesService.createRecipe(
        restaurantUUID,
        props.selectedTab === 1 ? 'preparation' : 'recipe',
        updateData
      );
      props.onRequestClose();
      props.onReload();
      if (!uuid) return;
    } catch (error) {
      console.error('Error creating preparation:', error);
    }
  });

  return (
    <Popup
      isVisible={props.isVisible}
      onRequestClose={props.onRequestClose}
      maxWidth={'70%'}
      title={
        props.selectedTab === 1
          ? t('recipes.addPreparation.title')
          : t('recipes.addPreparation.recipe_title')
      }>
      <form onSubmit={handleSubmitForm}>
        <div className={styles.form}>
          <div className={styles.inputContainer}>
            {console.log('errors', errors)}
            <div>
              <LabeledInput
                lighter
                placeholder={t('recipes.editPanel.fields.recipeName')}
                type="text"
                error={errors.recipe_name?.message}
                {...register('recipe_name')}
              />
            </div>
            <div>
              <Controller
                control={control}
                name="category"
                render={({
                  field: { onChange, name, onBlur, ref, value },
                  fieldState: { error },
                }) => (
                  <>
                    <Select
                      size="large"
                      isSearchable={false}
                      isMulti={false}
                      placeholder={t('category')}
                      options={props.categories}
                      innerRef={ref}
                      name={name}
                      onChange={(val) => {
                        onChange(val?.value ?? null);
                      }}
                      onBlur={onBlur}
                      value={
                        props.categories.find((cat) => cat.value === value) ??
                        null
                      }
                      styles={{
                        menu: (provided) => ({
                          ...provided,
                          zIndex: 10,
                        }),
                      }}
                    />
                    {error && (
                      <div className={styles.errorMessage}>
                        {errors.category?.message}
                      </div>
                    )}
                  </>
                )}
              />
            </div>
          </div>
          {/* Conditional fields for Preparation vs Recipe */}
          {props.selectedTab === 1 ? (
            <div className={styles.inputContainer}>
              <LabeledInput
                lighter
                placeholder={t('recipes.editPanel.table.quantity')}
                type="number"
                step="any"
                error={errors.quantity?.message}
                {...register('quantity', { valueAsNumber: true })}
              />
              <Controller
                control={control}
                name="unit_name"
                render={({ field: { onChange, value } }) => (
                  <CreatableSelect
                    placeholder={t('recipes.editPanel.table.unit')}
                    options={unitname.map((unit) => ({
                      label: unit.unit_name,
                      value: unit.unit_uuid,
                    }))}
                    value={value ? { label: value, value: value } : null}
                    onChange={(selectedOption) =>
                      onChange(selectedOption?.label || '')
                    }
                    isClearable
                  />
                )}
              />
            </div>
          ) : (
            <div className={styles.inputContainer}>
              <LabeledInput
                lighter
                placeholder={t('recipes.editPanel.fields.portionsPerBatch')}
                type="number"
                step=".00000001"
                error={errors.portion_count?.message}
                {...register('portion_count', { valueAsNumber: true })}
              />
              <LabeledInput
                lighter
                placeholder={t('recipes.editPanel.fields.pricePerPortion')}
                type="number"
                step=".00000001"
                error={errors.portion_price?.message}
                {...register('portion_price', { valueAsNumber: true })}
              />
            </div>
          )}

          <div className={styles.ingredientContainer}>
            {ingredientFields.map((field, index) => {
              const ingredient_uuid = watch(
                `ingredients.${index}.ingredient_uuid`
              );
              const selectedIngredient = props.ingredients.find(
                (ing) => ing.id === ingredient_uuid
              );

              return (
                <>
                  <div key={field.id}>
                    <div>
                      <Controller
                        control={control}
                        name={`ingredients.${index}.ingredient_uuid`}
                        render={({
                          field: { onChange, onBlur, ref, value },
                        }) => (
                          <Select
                            size="large"
                            isSearchable={true}
                            placeholder={t(
                              'recipes.editPanel.table.ingredientSelect'
                            )}
                            options={groupedSelectOptions}
                            onChange={(selectedOption) => {
                              onChange(selectedOption?.value ?? '');
                              const selected = props.ingredients.find(
                                (ing) => ing.id === selectedOption?.value
                              );
                              if (selected) {
                                setValue(
                                  `ingredients.${index}.type`,
                                  selected.type || ''
                                );
                                setValue(
                                  `ingredients.${index}.ingredient_unit_uuid`,
                                  selected.unit_uuid || ''
                                );
                                setValue(
                                  `ingredients.${index}.ingredient_unit_name`,
                                  selected.unit_name || ''
                                );
                              }
                            }}
                            onBlur={onBlur}
                            value={
                              Object.values(props.ingredients)
                                .map((item) => ({
                                  label: item.name,
                                  value: item.id,
                                }))
                                .find((option) => option.value === value) ??
                              null
                            }
                            styles={{
                              menu: (provided) => ({
                                ...provided,
                                overflowY: 'auto',
                              }),
                              control: (provided) => ({
                                ...provided,
                                minWidth: '200px',
                              }),
                            }}
                          />
                        )}
                      />
                    </div>
                  </div>

                  <div className={styles.quantityCss}>
                    <LabeledInput
                      placeholder={t('quantity')}
                      type="number"
                      step=".00000001"
                      lighter
                      suffix={selectedIngredient?.unit_name || ''}
                      {...register(`ingredients.${index}.quantity`, {
                        valueAsNumber: true,
                      })}
                      error={errors.ingredients?.[index]?.quantity?.message}
                    />
                  </div>
                  <div>
                    <Controller
                      name={`ingredients.${index}.recipe_unit_name`}
                      control={control}
                      render={({ field: { onChange, value } }) => (
                        <CreatableSelect
                          placeholder="Unit"
                          options={unitname.map((unit) => ({
                            label: unit.unit_name,
                            value: unit.unit_uuid,
                          }))}
                          isClearable
                          onChange={(selectedOption) => {
                            if (selectedOption?.__isNew__) {
                              // If a new unit is created, set only unit_name
                              setValue(
                                `ingredients.${index}.recipe_unit_name`,
                                selectedOption.label
                              );
                              setValue(
                                `ingredients.${index}.recipe_unit_uuid`,
                                undefined
                              );
                            } else if (selectedOption) {
                              setValue(
                                `ingredients.${index}.recipe_unit_name`,
                                selectedOption.label
                              );
                              setValue(
                                `ingredients.${index}.recipe_unit_uuid`,
                                selectedOption.value
                              );
                            } else {
                              setValue(
                                `ingredients.${index}.recipe_unit_name`,
                                ''
                              );
                              setValue(
                                `ingredients.${index}.recipe_unit_uuid`,
                                undefined
                              );
                            }
                            onChange(selectedOption?.label || ''); // Ensure the value is updated here
                          }}
                          value={
                            value
                              ? {
                                  label: value,
                                  value: watch(
                                    `ingredients.${index}.recipe_unit_uuid`
                                  ),
                                }
                              : null
                          }
                        />
                      )}
                    />
                  </div>
                  <div className={styles.IconContainer}>
                    <LabeledInput
                      placeholder={t('conversion_factor')}
                      type="number"
                      step=".00000001"
                      lighter
                      {...register(`ingredients.${index}.conversion_factor`, {
                        valueAsNumber: true,
                      })}
                      error={
                        errors.ingredients?.[index]?.conversion_factor?.message
                      }
                    />
                    <IconButton
                      icon={<i className="fa-solid fa-circle-info"></i>}
                      tooltipMsg={`1 ${watch(
                        `ingredients.${index}.recipe_unit_name`
                      )} is  ${watch(`ingredients.${index}.conversion_factor`)}
                        ${watch('unit_name')}
                      `}
                      className={styles.info}
                    />
                  </div>
                  <div>
                    {index >= 0 && (
                      <FaTimes
                        className={styles.deleteButton}
                        onClick={() => removeIngredient(index)}
                      />
                    )}
                  </div>
                </>
              );
            })}
          </div>
        </div>

        <div
          className={styles.addIngredientButton}
          onClick={() =>
            addIngredient({ ingredient_uuid: '', quantity: 0, type: '' })
          }>
          <FaPlus />
          <p>{t('recipes.editPanel.table.addIngredient')}</p>
        </div>

        <div className={styles.buttonsContainer}>
          <Button
            type="secondary"
            value={t('cancel')}
            onClick={props.onRequestClose}
          />
          <Button
            type="primary"
            value={t('confirm')}
            actionType="submit"
            loading={isSubmitting}
          />
        </div>
      </form>
    </Popup>
  );
};

export default AddPreparationPopup;
