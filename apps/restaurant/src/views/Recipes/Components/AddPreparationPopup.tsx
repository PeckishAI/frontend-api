import {
  Button,
  Checkbox,
  IconButton,
  LabeledInput,
  Popup,
  Select,
} from 'shared-ui';
import styles from './AddPreparationRecipePopup.module.scss';
import { useEffect, useState } from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import {
  inventoryService,
  Recipe,
  recipesService,
  Unit,
  IngredientPreparation,
} from '../../../services';
import { useRestaurantStore } from '../../../store/useRestaurantStore';
import { FaPlus, FaTrash, FaTimes } from 'react-icons/fa';
import CreatableSelect from 'react-select/creatable';

const AddPreparationSchema = z.object({
  preparation_name: z
    .string()
    .min(1, { message: 'Preparation name is required' }),
  quantity: z.number({
    required_error: 'Quantity is required',
    invalid_type_error: 'Quantity is required',
  }),
  unit_name: z.string().min(1, { message: 'Unit name is required' }),
  unit_uuid: z.string().optional(),
  portion_count: z.number({
    required_error: 'Portion count is required',
    invalid_type_error: 'Portion count is required',
  }),
  ingredients: z
    .array(
      z.object({
        item_uuid: z
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
        unit_name: z.string().min(1, { message: 'Unit name is required' }),
        unit_uuid: z.string().optional(),
        base_unit_uuid: z.string().optional(),
        base_unit_name: z.string().optional(),
        type: z.string().optional(),
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
  initialRecipeName?: string;
  onSubmitted?: () => void;
};

interface GroupedItems {
  [key: string]: Array<{ label: string; value: string }>;
}

interface CreatableOption {
  label: string;
  value: string | undefined;
  __isNew__?: boolean;
}

const AddPreparationPopup = (props: Props) => {
  const { t } = useTranslation('common');

  const restaurantUUID = useRestaurantStore(
    (state) => state.selectedRestaurantUUID
  );
  const [unitName, setUnitName] = useState<Unit[]>([]);

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
      ingredients: [
        { item_uuid: '', quantity: 0, type: '', conversion_factor: 1 },
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
    } else {
      setValue('portion_count', 1);
      if (props.initialRecipeName) {
        setValue('preparation_name', props.initialRecipeName);
      }
    }
  }, [
    props.isVisible,
    props.initialRecipeName,
    reset,
    setValue,
    props.selectedTab,
  ]);

  useEffect(() => {
    if (!props.isVisible) {
      reset();
    } else {
      setValue('portion_count', 1);
    }
  }, [props.isVisible, reset, setValue]);

  useEffect(() => {
    ingredientFields.forEach((field, index) => {
      const ingredient_uuid = watch(`ingredients.${index}.item_uuid`);
      const selectedIngredient = props.ingredients.find(
        (ing: any) => ing.id === ingredient_uuid
      );

      if (selectedIngredient) {
        setValue(`ingredients.${index}.type`, selectedIngredient.type || '');
        setValue(
          `ingredients.${index}.base_unit_uuid`,
          selectedIngredient.unit_uuid || ''
        );
        setValue(
          `ingredients.${index}.base_unit_name`,
          selectedIngredient.unit_name || ''
        );
      }
    });
  }, [watch('ingredients'), props.ingredients, setValue]);

  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      console.log('Form validation errors:', errors);
    }
  }, [errors]);

  const groupedOptions = Object.values(
    props.ingredients as any[]
  ).reduce<GroupedItems>((groups, item: any) => {
    const group = item.type === 'ingredient' ? 'Ingredients' : 'Preparations';
    if (!groups[group]) {
      groups[group] = [];
    }
    groups[group].push({
      label: item.name,
      value: item.id,
    });
    return groups;
  }, {});

  const groupedSelectOptions = Object.keys(groupedOptions).map((group) => ({
    label: group,
    options: groupedOptions[group],
  }));

  const handleSubmitForm = handleSubmit(async (data) => {
    const updateData = {
      ...data,
      type: 'preparation', // Add this line to specify the type
      ingredients: data.ingredients.map((ingredient) => ({
        ...ingredient,
        conversion_factor: +ingredient.conversion_factor,
      })),
    };

    if (!restaurantUUID) return;

    try {
      const uuid = await recipesService.createPreparation(
        restaurantUUID,
        updateData
      );
      props.onRequestClose();
      props.onReload();
      props.onSubmitted?.();
      if (!uuid) return;
    } catch (error) {
      console.error('Error creating preparation:', error);
    }
  });

  return (
    <Popup
      isVisible={props.isVisible}
      onRequestClose={props.onRequestClose}
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
                error={errors.preparation_name?.message}
                {...register('preparation_name')}
              />
            </div>
          </div>

          <div className={styles.inputContainer}>
            <LabeledInput
              lighter
              placeholder={t('recipes.editPanel.fields.portionsPerBatch')}
              type="number"
              step=".00000001"
              error={errors.portion_count?.message}
              {...register('portion_count', { valueAsNumber: true })}
            />
            <Controller
              name={`unit_name`}
              control={control}
              render={({ field: { onChange, value } }) => (
                <CreatableSelect
                  placeholder="Unit"
                  options={unitName.map((unit) => ({
                    label: unit.unit_name,
                    value: unit.unit_uuid,
                  }))}
                  isClearable
                  onChange={(selectedOption: CreatableOption | null) => {
                    if (selectedOption?.__isNew__) {
                      setValue(`unit_name`, selectedOption.label);
                      setValue(`unit_uuid`, undefined);
                    } else if (selectedOption) {
                      setValue(`unit_name`, selectedOption.label);
                      setValue(`unit_uuid`, selectedOption.value);
                    } else {
                      setValue(`unit_name`, '');
                      setValue(`unit_uuid`, undefined);
                    }
                    onChange(selectedOption?.label || '');
                  }}
                  value={
                    value
                      ? {
                          label: value,
                          value: watch(`unit_uuid`),
                        }
                      : null
                  }
                  menuPosition="fixed"
                  styles={{
                    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                  }}
                />
              )}
            />
          </div>

          <div className={styles.ingredientContainer}>
            {ingredientFields.map((field, index) => {
              const item_uuid = watch(`ingredients.${index}.item_uuid`);
              const selectedIngredient = props.ingredients.find(
                (ing: IngredientPreparation) => ing.item_uuid === item_uuid
              );

              return (
                <>
                  <div key={field.id}>
                    <div>
                      <Controller
                        control={control}
                        name={`ingredients.${index}.item_uuid`}
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
                                (ing: any) => ing.id === selectedOption?.value
                              );
                              if (selected) {
                                // Update all related fields immediately
                                setValue(
                                  `ingredients.${index}.type`,
                                  selected.type || ''
                                );
                                setValue(
                                  `ingredients.${index}.base_unit_uuid`,
                                  selected.unit_uuid || ''
                                );
                                setValue(
                                  `ingredients.${index}.base_unit_name`,
                                  selected.unit_name || ''
                                );
                                setValue(
                                  `ingredients.${index}.conversion_factor`,
                                  1
                                );

                                // Log for debugging
                                console.log('Selected ingredient:', selected);
                                console.log('Updated fields for index:', index);
                              }
                            }}
                            onBlur={onBlur}
                            value={
                              (props.ingredients as any[])
                                .map((item) => ({
                                  label: item.name,
                                  value: item.id,
                                }))
                                .find((option) => option.value === value) ??
                              null
                            }
                            menuPosition="fixed"
                            styles={{
                              menuPortal: (base) => ({ ...base, zIndex: 9999 }),
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
                      name={`ingredients.${index}.unit_name`}
                      control={control}
                      render={({ field: { onChange, value } }) => (
                        <CreatableSelect
                          placeholder="Unit"
                          options={unitName.map((unit) => ({
                            label: unit.unit_name,
                            value: unit.unit_uuid,
                          }))}
                          isClearable
                          onChange={(
                            selectedOption: CreatableOption | null
                          ) => {
                            if (selectedOption?.__isNew__) {
                              setValue(
                                `ingredients.${index}.unit_name`,
                                selectedOption.label
                              );
                              setValue(
                                `ingredients.${index}.unit_uuid`,
                                undefined
                              );
                            } else if (selectedOption) {
                              setValue(
                                `ingredients.${index}.unit_name`,
                                selectedOption.label
                              );
                              setValue(
                                `ingredients.${index}.unit_uuid`,
                                selectedOption.value
                              );
                            } else {
                              setValue(`ingredients.${index}.unit_name`, '');
                              setValue(
                                `ingredients.${index}.unit_uuid`,
                                undefined
                              );
                            }
                            onChange(selectedOption?.label || '');
                          }}
                          value={
                            value
                              ? {
                                  label: value,
                                  value: watch(
                                    `ingredients.${index}.unit_uuid`
                                  ),
                                }
                              : null
                          }
                          menuPosition="fixed"
                          styles={{
                            menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                          }}
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
                        `ingredients.${index}.unit_name`
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
            addIngredient({
              item_uuid: '',
              quantity: 0,
              type: '',
              unit_name: '',
              conversion_factor: 1,
            })
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
