import React, { useEffect, ReactElement, useState } from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { components, OptionProps } from 'react-select';
import CreatableSelect from 'react-select/creatable';
import { useTranslation, Trans } from 'react-i18next';
import classNames from 'classnames';
import { FaPlus } from 'react-icons/fa';
import { MdDelete } from 'react-icons/md';
import { Button, IconButton, LabeledInput, Select, SidePanel } from 'shared-ui';
import {
  Ingredient,
  Recipe,
  RecipeCategory,
  RecipeType,
  inventoryService,
  recipesService,
} from '../../services';
import { Unit } from '../../services/types';
import {
  useRestaurantCurrency,
  useRestaurantStore,
} from '../../store/useRestaurantStore';
import { formatCurrency } from '../../utils/helpers';
import { getRecipeCategorie } from '../../views/Recipes/RecipeNew';
import styles from './RecipeFormPanel.module.scss';

// Form Schema
const RecipeSchema = z
  .object({
    recipeName: z.string().trim().nonempty('required'),
    type: z.enum(['recipe', 'preparation', 'modifier']),
    category: z.custom<RecipeCategory>().refine((val) => !!val, 'required'),
    pricePerPortion: z.coerce.number().optional(),
    portionCount: z.coerce.number().optional(),
    costPerPortion: z.coerce.number().optional(),
    marginPerPortion: z.coerce.number().optional(),
    quantity: z.coerce.number().positive('positive-number').optional(),
    unitName: z.string().optional(),
    unitUUID: z.string().optional(),
    ingredients: z.array(
      z.object({
        itemUUID: z.string().nonempty('required'),
        itemName: z.string().nonempty('required'),
        conversionFactor: z.coerce.number().optional(),
        type: z.string().nonempty('required'),
        quantity: z.coerce
          .number()
          .positive('positive-number')
          .nullable()
          .refine((val) => val !== null, 'required'),
        unitName: z.string().optional(),
        unitUUID: z.string().optional(),
        recipeUnitName: z.string().optional(),
        recipeUnitUUID: z.string().optional(),
      })
    ),
  })
  .refine(
    (val) => {
      if (val.type !== 'preparation') {
        return val.pricePerPortion !== undefined;
      }
      return true;
    },
    { message: 'required' }
  );

type EditRecipeForm = z.infer<typeof RecipeSchema>;

interface Props {
  isOpen: boolean;
  onRequestClose: () => void;
  onSubmitted: (newRecipe: Recipe) => void;
  recipe?: Recipe | null;
  type?: RecipeType;
  action: 'create' | 'edit';
}

interface IngredientRowProps {
  index: number;
  control: any;
  register: any;
  watch: any;
  setValue: any;
  ingredients: Ingredient[];
  preparations: Recipe[];
  unitList: any[];
  errors: any;
  onRemove: (index: number) => void;
  currencyISO: string;
}

// Ingredient Row Component
const IngredientRow: React.FC<IngredientRowProps> = ({
  index,
  control,
  register,
  watch,
  setValue,
  ingredients,
  preparations,
  unitList,
  errors,
  onRemove,
  currencyISO,
}) => {
  const { t } = useTranslation(['common']);
  const rowField = watch(`ingredients.${index}`);

  const selectedItem =
    ingredients.find((i) => i.ingredientUUID === rowField.itemUUID) ||
    preparations.find((p) => p.recipeUUID === rowField.itemUUID);

  const isIngredient = (item: Ingredient | Recipe): item is Ingredient => {
    return 'ingredientUUID' in item;
  };

  const fetchConversionFactor = async (selectedOption?: any) => {
    if (!selectedItem) return;
    try {
      const fromUnitUUID = selectedItem.unitUUID;
      const toUnitUUID =
        selectedOption?.value || watch(`ingredients.${index}.recipeUnitUUID`);

      if (!fromUnitUUID || !toUnitUUID) return;

      let itemUUID: string;
      if (isIngredient(selectedItem)) {
        if (!selectedItem.ingredientUUID) return;
        itemUUID = selectedItem.ingredientUUID;
      } else {
        if (!selectedItem.recipeUUID) return;
        itemUUID = selectedItem.recipeUUID;
      }

      const response = await inventoryService.fetchConversionFactor(
        itemUUID,
        fromUnitUUID,
        toUnitUUID,
        selectedItem.type
      );

      if (response?.data?.data) {
        setValue(`ingredients.${index}.conversionFactor`, response.data.data);
      }
    } catch (error) {
      console.error('Error fetching conversion factor:', error);
    }
  };

  const calculateCost = () => {
    if (!selectedItem || !rowField.quantity || !rowField.conversionFactor)
      return 0;

    const baseUnitCost =
      selectedItem.type === 'preparation'
        ? (selectedItem as Recipe).costPerPortion || 0
        : (selectedItem as Ingredient).supplierDetails?.[0]?.supplierUnitCost ||
          0;

    return (baseUnitCost / rowField.conversionFactor) * rowField.quantity;
  };

  return (
    <div className={styles.rowInputs}>
      <Controller
        control={control}
        name={`ingredients.${index}.itemUUID`}
        render={({ field }) => (
          <Select
            size="large"
            options={[
              {
                label: t('ingredient:ingredients'),
                options: ingredients.map((ing) => ({
                  label: ing.ingredientName,
                  value: ing.ingredientUUID,
                  type: 'ingredient',
                })),
              },
              {
                label: t('ingredient:preparations'),
                options: preparations.map((prep) => ({
                  label: prep.recipeName,
                  value: prep.recipeUUID,
                  type: 'preparation',
                })),
              },
            ]}
            placeholder={t('recipes.editPanel.table.ingredientSelect')}
            value={
              field.value
                ? {
                    label: rowField.itemName,
                    value: field.value,
                  }
                : null
            }
            onChange={(selectedOption) => {
              if (!selectedOption) return;

              const item =
                ingredients.find(
                  (i) => i.ingredientUUID === selectedOption.value
                ) ||
                preparations.find((p) => p.recipeUUID === selectedOption.value);

              if (item) {
                setValue(`ingredients.${index}.itemName`, selectedOption.label);
                setValue(`ingredients.${index}.itemUUID`, selectedOption.value);
                setValue(`ingredients.${index}.type`, item.type);
                setValue(`ingredients.${index}.unitName`, item.unitName);
                setValue(`ingredients.${index}.unitUUID`, item.unitUUID);
                setValue(`ingredients.${index}.supplierDetails`, []);
                fetchConversionFactor();
              }
            }}
          />
        )}
      />

      <LabeledInput
        placeholder={t('quantity')}
        type="number"
        step="any"
        lighter
        {...register(`ingredients.${index}.quantity`)}
        error={errors?.ingredients?.[index]?.quantity?.message}
      />

      <Controller
        name={`ingredients.${index}.recipeUnitName`}
        control={control}
        render={({ field }) => (
          <CreatableSelect
            placeholder={t('unit')}
            options={unitList.map((unit) => ({
              label: unit.unitName,
              value: unit.unitUUID,
            }))}
            value={
              field.value
                ? {
                    label: field.value,
                    value: rowField.recipeUnitUUID,
                  }
                : null
            }
            onChange={(selectedOption) => {
              setValue(
                `ingredients.${index}.recipeUnitName`,
                selectedOption?.label || ''
              );
              setValue(
                `ingredients.${index}.recipeUnitUUID`,
                selectedOption?.value || ''
              );
              fetchConversionFactor(selectedOption);
            }}
            isCreatable
            isClearable
          />
        )}
      />

      <div className={styles.conversionFactorContainer}>
        <div className={styles.iconContainer}>
          <LabeledInput
            placeholder={t('conversion_factor')}
            type="number"
            step="any"
            lighter
            {...register(`ingredients.${index}.conversionFactor`)}
            error={errors?.ingredients?.[index]?.conversionFactor?.message}
          />
          <IconButton
            icon={<i className="fa-solid fa-circle-info" />}
            tooltipMsg={`1 ${rowField.recipeUnitName || '(unit)'} = 
              ${rowField.conversionFactor || '0'} ${selectedItem?.unitName || '(base unit)'}`}
            className={styles.info}
          />
        </div>

        <div className={styles.cost}>
          {formatCurrency(calculateCost(), currencyISO)}
        </div>

        <IconButton
          icon={<MdDelete />}
          onClick={() => onRemove(index)}
          tooltipMsg={t('delete')}
          className={styles.deleteButton}
        />
      </div>
    </div>
  );
};

const RecipeFormPanel: React.FC<Props> = ({
  isOpen,
  onRequestClose,
  onSubmitted,
  recipe,
  type,
  action,
}) => {
  const { t } = useTranslation(['common']);
  const recipeType = recipe?.type ?? type ?? 'recipe';
  const selectedRestaurantUUID = useRestaurantStore(
    (state) => state.selectedRestaurantUUID
  )!;
  const { currencyISO } = useRestaurantCurrency();

  // State declarations
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [preparations, setPreparations] = useState<Recipe[]>([]);
  const [unitList, setUnitList] = useState([]);

  // Add this categories constant
  const categories = getRecipeCategorie(t).map((cat) => ({
    icon: cat.icon,
    label: cat.label,
    value: cat.value,
  }));

  // Form setup...
  const {
    register,
    reset,
    watch,
    control,
    setValue,
    handleSubmit,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<EditRecipeForm>({
    defaultValues: {
      ingredients: [],
    },
    context: { type: recipeType },
    resolver: zodResolver(RecipeSchema),
  });

  const fetchAndSetConversionFactor = async (
    index: number,
    recipeUnitUUID: string | null,
    type: string
  ) => {
    console.log(recipeUnitUUID);
    try {
      // Get the selected UUID from the dropdown (it could be either ingredient or preparation)
      const selectedUUID = watch(`ingredients.${index}.itemUUID`);
      const fromUnitUUID = watch(`ingredients.${index}.unitUUID`);
      const recipeUnitUUID = watch(`ingredients.${index}.recipeUnitUUID`);
      const type = watch(`ingredients.${index}.type`);

      if (!selectedUUID || !fromUnitUUID) {
        console.warn(
          `UUIDs are missing: selectedUUID=${selectedUUID}, fromUnitUUID=${fromUnitUUID}`
        );
        return;
      }

      // Fetch the conversion factor using the selected ingredient/preparation UUID and unit UUIDs
      console.log(selectedUUID, fromUnitUUID, recipeUnitUUID, type);
      const conversionFactor = await inventoryService.fetchConversionFactor(
        selectedUUID,
        fromUnitUUID,
        recipeUnitUUID || '',
        type
      );

      if (conversionFactor?.data) {
        setValue(
          `ingredients.${index}.conversionFactor`,
          conversionFactor.data.data
        );
      }
    } catch (error) {
      console.error('Error fetching conversion factor:', error);
    }
  };

  const {
    fields: ingredientFields,
    append: addIngredient,
    remove: removeIngredient,
  } = useFieldArray({
    control,
    name: 'ingredients',
  });

  // Data Loading
  useEffect(() => {
    const loadData = async () => {
      if (!selectedRestaurantUUID) return;

      try {
        const [ingredientsData, preparationsData, unitsData] =
          await Promise.all([
            inventoryService.getOnlyIngredientList(selectedRestaurantUUID),
            recipesService.getPreparations(selectedRestaurantUUID),
            inventoryService.getUnits(selectedRestaurantUUID),
          ]);

        console.log('Loaded preparations:', preparationsData); // Debug log

        setIngredients(ingredientsData);
        setPreparations(preparationsData);
        setUnitList(unitsData);
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    loadData();
  }, [selectedRestaurantUUID]);

  // Form Reset on Open
  useEffect(() => {
    if (isOpen) {
      if (action === 'create') {
        reset({
          type: recipeType,
          ingredients: [],
        });
      } else if (recipe) {
        reset({
          recipeName: recipe.recipeName,
          type: recipeType,
          category: recipe.category,
          quantity: recipe.quantity,
          portionCount: recipe.portionCount ?? undefined,
          pricePerPortion: recipe.pricePerPortion ?? undefined,
          costPerPortion: recipe.costPerPortion ?? undefined,
          marginPerPortion: recipe.marginPerPortion ?? undefined,
          unitName: recipe.unitName,
          unitUUID: recipe.unitUUID,
          ingredients: recipe.ingredients.map((ing) => ({
            itemUUID: ing.ingredientUUID,
            itemName: ing.ingredientName,
            quantity: ing.quantity,
            unitName: ing.unitName || '',
            unitUUID: ing.unitUUID || '',
            conversionFactor: ing.conversionFactor || 1,
            recipeUnitName: ing.recipeUnitName,
            recipeUnitUUID: ing.recipeUnitUUID,
            type: ing.type,
          })),
        });
      }
    }
  }, [isOpen, recipe, action, recipeType]);

  // Cost Calculations
  const totalCost = watch('ingredients').reduce((acc, ing) => {
    const item =
      ingredients.find((i) => i.ingredientUUID === ing.itemUUID) ||
      preparations.find((p) => p.recipeUUID === ing.itemUUID);

    if (!item || !ing.quantity || !ing.conversionFactor) return acc;

    const baseUnitCost =
      item.type === 'preparation'
        ? (item as Recipe).costPerPortion || 0
        : (item as Ingredient).supplierDetails?.[0]?.supplierUnitCost || 0;

    return acc + (baseUnitCost / ing.conversionFactor) * ing.quantity;
  }, 0);

  const priceMargin =
    (watch('pricePerPortion') ?? 0) * (watch('portionCount') ?? 1) - totalCost;

  const calculateIngredientCost = (index: number) => {
    console.log('HEYY');
    const ingredient = watch(`ingredients.${index}`);
    const selectedItem =
      ingredients.find((i) => i.ingredientUUID === ingredient?.itemUUID) ||
      preparations.find((p) => p.recipeUUID === ingredient?.itemUUID);

    console.log(selectedItem);
    console.log(ingredient);

    if (!selectedItem || !ingredient?.quantity || !ingredient?.conversionFactor)
      return 0;

    const cost =
      'costPerPortion' in selectedItem
        ? selectedItem.costPerPortion
        : selectedItem.supplierDetails?.[0]?.supplierUnitCost || 0;

    return (cost / ingredient.conversionFactor) * ingredient.quantity;
  };

  // Form Submission
  const handleFormSubmit = handleSubmit(async (data) => {
    const requestData = {
      ...data,
      ingredients: data.ingredients.map((ing) => ({
        ingredient_uuid: ing.itemUUID,
        unit_name: ing.unitName || null,
        unit_uuid: ing.unitUUID || null,
        recipe_unit_uuid: ing.recipeUnitUUID,
        recipe_unit_name: ing.recipeUnitName,
        conversion_factor: ing.conversionFactor,
        quantity: ing.quantity ?? 0,
        type: ing.type,
      })),
    };

    try {
      let recipeUUID;
      if (action === 'create') {
        recipeUUID = await recipesService.createRecipe(
          selectedRestaurantUUID,
          recipeType,
          requestData
        );
      } else if (recipe) {
        await recipesService.updateRecipe(
          selectedRestaurantUUID,
          recipe.recipeUUID,
          requestData
        );
        recipeUUID = recipe.recipeUUID;
      }

      onSubmitted({
        recipeUUID,
        type: recipeType,
        recipeName: data.recipeName,
        category: data.category,
        quantity: data.quantity,
        portionCount: data.portionCount ?? undefined,
        pricePerPortion: data.pricePerPortion ?? undefined,
        unitName: data.unitName,
        unitUUID: data.unitUUID,
        costPerPortion: totalCost / (data.portionCount || 1),
        marginPerPortion: priceMargin / (data.portionCount || 1),
        isOnboarded: recipe?.isOnboarded ?? true,
        ingredients: data.ingredients.map((ing) => {
          const item =
            ingredients.find((i) => i.ingredientUUID === ing.itemUUID) ||
            preparations.find((p) => p.recipeUUID === ing.itemUUID);
          return {
            ingredientUUID: ing.itemUUID,
            ingredientName: ing.itemName,
            quantity: ing.quantity ?? 0,
            unitName: ing.unitName,
            unitUUID: ing.unitUUID,
            recipeUnitName: ing.recipeUnitName,
            recipeUnitUUID: ing.recipeUnitUUID,
            conversionFactor: ing.conversionFactor,
            type: ing.type,
            cost:
              item?.type === 'preparation'
                ? (item as Recipe).costPerPortion
                : (item as Ingredient)?.supplierDetails?.[0]
                    ?.supplierUnitCost || 0,
          };
        }),
      });
    } catch (error) {
      console.error('Error submitting recipe:', error);
    }
  });

  return (
    <SidePanel
      className={styles.sidePanel}
      isOpen={isOpen}
      width="65%"
      onRequestClose={onRequestClose}>
      <h1 className={styles.title}>
        {action === 'create' ? (
          recipeType === 'preparation' ? (
            t('recipes.addPanel.preparation.title')
          ) : (
            t('recipes.addPanel.recipe.title')
          )
        ) : (
          <Trans
            i18nKey={
              recipeType === 'preparation'
                ? 'recipes.editPanel.preparation.title'
                : 'recipes.editPanel.recipe.title'
            }
            values={{ name: watch('recipeName') }}
            components={{
              highlight: <span className={styles.titleRecipeName} />,
            }}
          />
        )}
      </h1>

      <form className={styles.inputContainer} onSubmit={handleFormSubmit}>
        <LabeledInput
          placeholder={t(`recipes.editPanel.${recipeType}.fields.name`)}
          autoComplete="off"
          {...register('recipeName')}
          lighter
          error={errors.name?.message}
        />

        {recipe?.category !== 'modifiers' && ( // Changed from props?.recipe to just recipe
          <Controller
            control={control}
            name="category"
            render={({ field: { onChange, name, onBlur, ref, value } }) => (
              <Select
                size="large"
                isSearchable={false}
                isMulti={false}
                placeholder={t('category')}
                components={{ Option: CategoryOption }}
                options={categories}
                innerRef={ref}
                name={name}
                onChange={(val) => {
                  onChange(val?.value ?? null);
                }}
                onBlur={onBlur}
                value={categories.find((cat) => cat.value === value) ?? null}
                error={errors.category?.message}
              />
            )}
          />
        )}

        <div className={styles.rowInputs}>
          {recipeType === 'recipe' && (
            <>
              <LabeledInput
                type="number"
                step=".00000001"
                placeholder={t('recipes.editPanel.fields.portionsPerBatch')}
                icon={<i className="fa-solid fa-layer-group" />}
                {...register('portionCount')}
                lighter
                error={errors.portionCount?.message}
              />

              <LabeledInput
                type="number"
                step=".00000001"
                placeholder={t('recipes.editPanel.fields.pricePerPortion')}
                icon={<i className="fa-solid fa-dollar-sign" />}
                {...register('pricePerPortion')}
                lighter
                error={errors.pricePerPortion?.message}
              />
            </>
          )}

          {recipeType === 'preparation' && (
            <>
              <LabeledInput
                type="number"
                step=".00000001"
                placeholder={t('recipes.editPanel.table.quantity')}
                {...register('quantity')}
                lighter
                error={errors.quantity?.message}
              />
              <Controller
                control={control}
                name="unitName"
                render={({ field: { onChange, value } }) => (
                  <CreatableSelect
                    placeholder={t('recipes.editPanel.table.unit')}
                    options={unitname.map((unit) => ({
                      label: unit.unitName,
                      value: unit.unitUUID,
                    }))}
                    onChange={(selectedOption) => {
                      onChange(selectedOption?.label || '');
                      setValue('unitUUID', selectedOption?.value || '');
                    }}
                    value={value ? { label: value, value: value } : null}
                    isClearable
                    isCreatable
                  />
                )}
              />
            </>
          )}
        </div>

        <div className={styles.tableTitle}>
          <p>{t('recipes.editPanel.table.title')}</p>
          <div className={styles.metrics}>
            <p className={styles.metricText}>
              <i
                className={classNames(
                  'fa-solid',
                  'fa-hand-holding-dollar',
                  styles.cost
                )}
              />
              {t('cost')}:
              <span className={styles.metricPrice}>
                {formatCurrency(totalCost, currencyISO)}
              </span>
            </p>

            {recipeType !== 'preparation' && (
              <p className={styles.metricText}>
                <i
                  className={classNames(
                    'fa-solid',
                    'fa-arrow-up-right-dots',
                    styles.margin
                  )}
                />
                {t('margin')}:
                <span className={styles.metricPrice}>
                  {formatCurrency(priceMargin, currencyISO)}
                </span>
              </p>
            )}
          </div>
        </div>

        <div>
          {ingredientFields.map((field, index) => {
            const rowField = watch(`ingredients.${index}`);
            const selectedIngredient =
              ingredients.find(
                (ing) => ing.ingredientUUID === rowField.itemUUID
              ) ||
              preparations.find(
                (prep) => prep.recipeUUID === rowField.itemUUID
              );

            return (
              <div key={field.id} className={styles.ingredientInputs}>
                <Controller
                  control={control}
                  name={`ingredients.${index}.itemUUID`}
                  render={({ field }) => (
                    <Select
                      size="large"
                      options={[
                        {
                          label: 'Ingredients',
                          options: ingredients.map((ing) => ({
                            label: ing.ingredientName,
                            value: ing.ingredientUUID,
                          })),
                        },
                        {
                          label: 'Preparations',
                          options: preparations.map((prep) => ({
                            label: prep.recipeName,
                            value: prep.recipeUUID,
                          })),
                        },
                      ]}
                      placeholder={t(
                        'recipes.editPanel.table.ingredientSelect'
                      )}
                      value={
                        field.value
                          ? {
                              label: rowField.itemName,
                              value: field.value,
                            }
                          : null
                      }
                      onChange={async (selectedOption) => {
                        if (!selectedOption?.value) return;

                        const selectedItem =
                          ingredients.find(
                            (i) => i.ingredientUUID === selectedOption.value
                          ) ||
                          preparations.find(
                            (p) => p.recipeUUID === selectedOption.value
                          );

                        if (selectedItem) {
                          setValue(
                            `ingredients.${index}.itemName`,
                            selectedOption.label
                          );
                          setValue(
                            `ingredients.${index}.itemUUID`,
                            selectedOption.value
                          );
                          setValue(
                            `ingredients.${index}.type`,
                            selectedItem.type
                          );
                          setValue(
                            `ingredients.${index}.unitName`,
                            selectedItem.unitName || ''
                          );
                          setValue(
                            `ingredients.${index}.unitUUID`,
                            selectedItem.unitUUID || ''
                          );
                        }
                      }}
                    />
                  )}
                />

                <LabeledInput
                  type="number"
                  step="any"
                  lighter
                  placeholder="Quantity"
                  {...register(`ingredients.${index}.quantity`)}
                  error={errors.ingredients?.[index]?.quantity?.message}
                />

                <Controller
                  name={`ingredients.${index}.recipeUnitName`}
                  control={control}
                  render={({ field }) => (
                    <CreatableSelect
                      placeholder="Unit"
                      options={unitList.map((unit) => ({
                        label: unit.unitName,
                        value: unit.unitUUID,
                      }))}
                      value={
                        field.value
                          ? {
                              label: field.value,
                              value: rowField.recipeUnitUUID,
                            }
                          : null
                      }
                      onChange={(selected) => {
                        setValue(
                          `ingredients.${index}.recipeUnitName`,
                          selected?.label || ''
                        );
                        setValue(
                          `ingredients.${index}.recipeUnitUUID`,
                          selected?.value || ''
                        );

                        const selectedItem =
                          ingredients.find(
                            (i) =>
                              i.ingredientUUID ===
                              watch(`ingredients.${index}.itemUUID`)
                          ) ||
                          preparations.find(
                            (p) =>
                              p.recipeUUID ===
                              watch(`ingredients.${index}.itemUUID`)
                          );

                        if (selectedItem) {
                          inventoryService
                            .fetchConversionFactor(
                              selectedItem.ingredientUUID ||
                                selectedItem.recipeUUID,
                              selectedItem.unitUUID,
                              selected?.value,
                              selectedItem.type
                            )
                            .then((res) => {
                              setValue(
                                `ingredients.${index}.conversionFactor`,
                                res.data.data
                              );
                            });
                        }
                      }}
                      isCreatable
                      isClearable
                    />
                  )}
                />

                <div className={styles.IconContainer}>
                  <LabeledInput
                    type="number"
                    step="any"
                    lighter
                    placeholder="Conversion Factor"
                    {...register(`ingredients.${index}.conversionFactor`)}
                    error={
                      errors.ingredients?.[index]?.conversionFactor?.message
                    }
                  />
                  <IconButton
                    icon={<i className="fa-solid fa-circle-info" />}
                    tooltipMsg={`1 ${watch(`ingredients.${index}.recipeUnitName`) || '(unit)'} = 
                ${watch(`ingredients.${index}.conversionFactor`) || '0'} ${selectedIngredient?.unitName || '(base unit)'}`}
                    className={styles.info}
                  />
                </div>

                <p className={styles.ingredientCost}>
                  {formatCurrency(calculateIngredientCost(index), currencyISO)}
                </p>

                <IconButton
                  icon={<i className="fa-solid fa-trash" />}
                  onClick={() => removeIngredient(index)}
                  tooltipMsg={t('delete')}
                  className={styles.deleteButton}
                />
              </div>
            );
          })}
        </div>

        <div
          className={styles.addIngredientButton}
          onClick={() =>
            addIngredient({
              itemUUID: '',
              quantity: null,
              type: '',
            })
          }>
          <FaPlus />
          <p>{t('recipes.editPanel.table.addIngredient')}</p>
        </div>

        <div className={styles.buttonsContainer}>
          <Button
            type="secondary"
            value={t('cancel')}
            onClick={onRequestClose}
          />
          <Button
            type="primary"
            value={t('validate')}
            actionType="submit"
            loading={isSubmitting}
            disabled={!isDirty}
          />
        </div>
      </form>
    </SidePanel>
  );
};

export default RecipeFormPanel;

// Category Option Component
const Option = components.Option;
const CategoryOption: React.FC<OptionProps<any>> = (props) => (
  <Option {...props}>
    <div
      className={classNames(
        styles.categoryOption,
        props.isSelected && styles.categoryOptionSelected
      )}>
      {props.data.icon}
      {props.data.label}
    </div>
  </Option>
);
