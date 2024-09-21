import { Button, Checkbox, LabeledInput, Popup, Select } from 'shared-ui';
import styles from './AddPreparationPopup.module.scss';
import { useEffect, useState } from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { inventoryService, Recipe, recipesService } from '../../services';
import { useRestaurantStore } from '../../store/useRestaurantStore';
import { useIngredients } from '../../services/hooks';
import { FaPlus, FaTrash } from 'react-icons/fa';
import CreatableSelect from 'react-select/creatable';

const AddPreparationSchema = z.object({
  category: z.string({
    required_error: 'Category is required',
    invalid_type_error: 'Category is required',
  }),
  recipe_name: z.string().min(1, { message: 'Recipe name is required' }),
  portionsPerBatch: z.number({
    required_error: 'Portions per batch is required',
    invalid_type_error: 'Portions per batch is required',
  }),
  pricePerPortion: z.number({
    required_error: 'Price per portion is required',
    invalid_type_error: 'Price per portion is required',
  }),

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
        conversion_factor: z.number().optional(),
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
      ingredients: [
        { ingredient_uuid: '', quantity: 0, type: '', conversion_factor: 0 },
      ],
    },
  });

  const { loading: loadingIngredients } = useIngredients();
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
      })
      .finally(() => {
        // setLoadingData(false);
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
    if (!restaurantUUID) return;

    try {
      const uuid = await recipesService.createRecipe(
        restaurantUUID,
        props.selectedTab === 1 ? 'preparation' : 'recipe',
        data
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
            <div>
              <LabeledInput
                lighter
                placeholder={t('recipes.editPanel.fields.recipeName')}
                type="text"
                error={errors.recipe_name?.message}
                {...register('recipe_name')}
              />
            </div>
            <Controller
              control={control}
              name="category"
              render={({
                field: { onChange, name, onBlur, ref, value },
                fieldState: { error },
              }) => (
                <>
                  {' '}
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
            <LabeledInput
              lighter
              placeholder={t('recipes.editPanel.fields.portionsPerBatch')}
              type="number"
              step="any"
              error={errors.portionsPerBatch?.message}
              {...register('portionsPerBatch', { valueAsNumber: true })}
            />
            <LabeledInput
              lighter
              placeholder={t('recipes.editPanel.fields.pricePerPortion')}
              type="number"
              step="any"
              error={errors.pricePerPortion?.message}
              {...register('pricePerPortion', { valueAsNumber: true })}
            />
          </div>
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
                                ); // Set unit_uuid here
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
                  <Controller
                    control={control}
                    name={`ingredients.${index}.recipe_unit_uuid`}
                    styles={{
                      menu: (provided) => ({
                        ...provided,
                        overflowY: 'auto',
                      }),
                      control: (provided) => ({
                        ...provided,
                        minWidth: '200px',
                      }),
                      multiValue: (provided) => ({
                        ...provided,
                        backgroundColor: '#5E72E4',
                        color: '#FFFFFF',
                        borderRadius: '12px',
                      }),
                      multiValueLabel: (provided) => ({
                        ...provided,
                        color: '#ffffff',
                        borderRadius: '12px',
                      }),
                      multiValueRemove: (provided) => ({
                        ...provided,
                        color: '#ffffff',
                        ':hover': {
                          backgroundColor: '#b5adad',
                          borderRadius: '20px',
                          color: '#ffffff',
                        },
                      }),
                    }}
                    render={({ field: { onChange } }) => (
                      <CreatableSelect
                        placeholder={t('Select a unit')}
                        options={unitname.map((unit) => ({
                          label: unit.unit_name,
                          value: unit.unit_uuid,
                        }))}
                        styles={{
                          menuList: (provided) => ({
                            ...provided,
                            maxHeight: '200px',
                            overflowY: 'auto',
                          }),
                          option: (provided, state) => ({
                            ...provided,
                            backgroundColor: state.isSelected
                              ? '#007BFF'
                              : state.isFocused
                              ? '#dbe1df'
                              : provided.backgroundColor,
                            color: state.isSelected
                              ? '#FFFFFF'
                              : state.isFocused
                              ? '#000000'
                              : provided.color,
                          }),
                          container: (provided) => ({
                            ...provided,
                            overflow: 'visible',
                          }),
                        }}
                        className={styles.unitInput}
                        isCreatable
                        value={
                          watch(`ingredients.${index}.recipe_unit_name`)
                            ? {
                                label:
                                  watch(
                                    `ingredients.${index}.recipe_unit_name`
                                  ) || 'Select a unit',
                                value:
                                  watch(
                                    `ingredients.${index}.recipe_unit_uuid`
                                  ) || null,
                              }
                            : null
                        }
                        onChange={(selectedOption, actionMeta) => {
                          if (actionMeta.action === 'create-option') {
                            setValue(
                              `ingredients.${index}.recipe_unit_name`,
                              selectedOption.label
                            );
                            setValue(
                              `ingredients.${index}.recipe_unit_uuid`,
                              ''
                            );
                          } else {
                            setValue(
                              `ingredients.${index}.recipe_unit_name`,
                              selectedOption?.label || ''
                            );
                            setValue(
                              `ingredients.${index}.recipe_unit_uuid`,
                              selectedOption?.value || ''
                            );
                          }
                        }}
                        isClearable
                      />
                    )}
                  />
                  <LabeledInput
                    placeholder={t('conversion_factor')}
                    type="number"
                    lighter
                    {...register(`ingredients.${index}.conversion_factor`)}
                    error={
                      errors.ingredients?.[index]?.conversion_factor?.message
                    }
                  />
                  <div className={styles.quantityCss}>
                    <LabeledInput
                      placeholder={t('quantity')}
                      type="number"
                      step=".00000001"
                      lighter
                      {...register(`ingredients.${index}.quantity`, {
                        valueAsNumber: true,
                      })}
                      error={errors.ingredients?.[index]?.quantity?.message}
                    />

                    {index > 0 && (
                      <FaTrash
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
