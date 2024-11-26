import { useEffect, ReactElement, useState } from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, IconButton, LabeledInput, Select, SidePanel } from 'shared-ui';
import { FaPlus } from 'react-icons/fa';
import { MdDelete } from 'react-icons/md';
import { useTranslation, Trans } from 'react-i18next';
import classNames from 'classnames';
import { formatCurrency } from '../../utils/helpers';
import { getRecipeCategorie } from '../../views/Recipes/Recipe';
import {
  useRestaurantCurrency,
  useRestaurantStore,
} from '../../store/useRestaurantStore';
import {
  Ingredient,
  Recipe,
  RecipeCategory,
  RecipeIngredient,
  RecipeType,
  inventoryService,
  recipesService,
  Unit,
} from '../../services';
import { components, OptionProps } from 'react-select';
import styles from './RecipeFormPanel.module.scss';
import CreatableSelect from 'react-select/creatable';
import TypeSelector from './components/TypeSelector';
import AddIngredientPopup from '../../views/Inventory/Ingredients/AddIngredientPopup';
import AddPreparationPopup from '../../views/Recipes/Components/AddPreparationPopup';

interface GroupedOptions {
  [key: string]: Array<{ label: string; value: string }>;
}

interface SelectOption {
  label: string;
  value: string;
}

const RecipeSchema = z.object({
  name: z.string().trim().nonempty('required'),
  type: z.enum(['recipe', 'preparation', 'modifier', 'product']),
  category: z.custom<RecipeCategory>().optional(),
  portion_count: z.coerce.number({
    // Add coerce here
    required_error: 'Portion count is required',
    invalid_type_error: 'Portion count is required',
  }),
  portion_price: z.number().optional(),
  unit_name: z.string().nullable().optional(),
  unit_uuid: z.string().optional(),
  ingredients: z.custom<RecipeIngredient[]>().optional(),
});

type EditRecipeForm = z.infer<typeof RecipeSchema>;

type Props = {
  isOpen: boolean;
  onRequestClose: () => void;
  onSubmitted: (newRecipe: Recipe) => void;
  recipe?: Recipe | null;
  type?: RecipeType;
  action: 'create' | 'edit';
};

const RecipeFormPanel = (props: Props) => {
  const recipeType = props.recipe?.type ?? props.type ?? 'recipe';
  const { t } = useTranslation(['common']);
  const selectedRestaurantUUID = useRestaurantStore(
    (state) => state.selectedRestaurantUUID
  )!;
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [preparations, setPreparations] = useState<Recipe[]>([]);
  const { currencyISO } = useRestaurantCurrency();
  const [showTypeSelector, setShowTypeSelector] = useState(false);
  const [pendingItemName, setPendingItemName] = useState('');
  const [showAddIngredientPopup, setShowAddIngredientPopup] = useState(false);
  const [showAddPreparationPopup, setShowAddPreparationPopup] = useState(false);

  const [editingIngredientIndex, setEditingIngredientIndex] = useState<
    number | null
  >(null);

  const [unitname, setUnitName] = useState<Unit[]>([]);
  const [unitApiData, setUnitApiData] = useState<Unit[]>([]);
  const [unitNew, setUnitNew] = useState<SelectOption[]>([]);
  const {
    register,
    reset,
    watch,
    control,
    setValue,
    handleSubmit,
    getFieldState,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<EditRecipeForm>({
    defaultValues: {
      ingredients: [],
    },
    context: { type: recipeType },
    resolver: zodResolver(RecipeSchema),
  });

  const {
    fields: ingredientFields,
    append: addIngredient,
    remove: removeIngredient,
  } = useFieldArray({
    control,
    name: 'ingredients',
  });

  useEffect(() => {
    if (props.isOpen) {
      if (props.action === 'create') {
        reset({
          type: recipeType,
          ingredients: [],
        });
      } else {
        reset({
          name: props.recipe?.name,
          type: recipeType,
          category: props.recipe?.category,
          portion_count: props.recipe?.portion_count ?? 1,
          portion_price: props.recipe?.portion_price ?? undefined,
          unit_name: props.recipe?.unit_name,
          ingredients: (props.recipe?.ingredients ?? []).map((ing) => ({
            item_uuid: ing.item_uuid,
            quantity: ing.quantity,
            unit_name: ing.unit_name || undefined,
            unit_uuid: ing.unit_uuid || undefined,
            conversion_factor: ing.conversion_factor || 1,
            base_unit_uuid: ing.base_unit_uuid,
            base_unit_name: ing.base_unit_name,
            type: ing.type,
          })),
        });
      }
    }
  }, [props.isOpen, props.recipe]);

  const getIngredientsAndPreparations = () => {
    if (!selectedRestaurantUUID) return;
    inventoryService
      .getOnlyIngredientList(selectedRestaurantUUID)
      .then(setIngredients)
      .catch(console.error);

    recipesService
      .getPreparations(selectedRestaurantUUID)
      .then(setPreparations)
      .catch(console.error);
  };

  useEffect(() => {
    getIngredientsAndPreparations();
    reloadUnits();
  }, [selectedRestaurantUUID]);

  function reloadUnits() {
    if (!selectedRestaurantUUID) return;
    inventoryService
      .getUnits(selectedRestaurantUUID)
      .then(setUnitName)
      .catch(console.error);
  }

  function getUnitNew() {
    if (!selectedRestaurantUUID) return;

    inventoryService
      .getUnits(selectedRestaurantUUID)
      .then((units: Unit[]) => {
        setUnitApiData(units);

        const selectOptions: SelectOption[] = units.map(
          (unit): SelectOption => ({
            label: unit.unit_name,
            value: unit.unit_uuid,
          })
        );

        setUnitNew(selectOptions);
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        // setLoadingData(false);
      });
  }

  useEffect(() => {
    ingredientFields.forEach((field, index) => {
      const itemUUID = watch(`ingredients.${index}.item_uuid`);
      let selectedItem: RecipeIngredient | null = null;

      const foundIngredient = ingredients.find((ing) => ing.id === itemUUID);
      const foundPreparation = preparations.find(
        (prep) => prep.recipe_uuid === itemUUID
      );

      if (foundIngredient) {
        selectedItem = {
          item_uuid: foundIngredient.id,
          item_name: foundIngredient.name,
          type: foundIngredient.type || 'ingredient',
          unit_name: foundIngredient.unit_name || '',
          unit_uuid: foundIngredient.unit_uuid || '',
          quantity: 0,
          conversion_factor: 1,
        };
      } else if (foundPreparation) {
        selectedItem = {
          item_uuid: foundPreparation.recipe_uuid,
          item_name: foundPreparation.name,
          type: foundPreparation.type || 'preparation',
          unit_name: foundPreparation.unit_name || '',
          unit_uuid: foundPreparation.unit_uuid || '',
          quantity: 0,
          conversion_factor: 1,
        };
      }

      if (selectedItem) {
        setValue(`ingredients.${index}.type`, selectedItem.type);
        setValue(`ingredients.${index}.unit_name`, selectedItem.unit_name);
        setValue(`ingredients.${index}.unit_uuid`, selectedItem.unit_uuid);
      }
    });
  }, [watch('ingredients'), ingredients, preparations]);

  const fetchAndSetConversionFactor = async (
    index: number,
    recipeUnitUUID: string | null,
    type: string
  ) => {
    const selectedUUID = watch(`ingredients.${index}.item_uuid`);
    const fromUnitUUID = watch(`ingredients.${index}.base_unit_uuid`);
    const toUnitUUID = watch(`ingredients.${index}.unit_uuid`);
    const itemType = watch(`ingredients.${index}.type`);

    if (!selectedUUID || !fromUnitUUID || !toUnitUUID) {
      setValue(`ingredients.${index}.conversion_factor`, 1);
      return;
    }

    try {
      const conversionFactor = await inventoryService.fetchConversionFactor(
        selectedUUID,
        fromUnitUUID,
        toUnitUUID,
        itemType || 'ingredient'
      );

      if (conversionFactor?.data) {
        setValue(
          `ingredients.${index}.conversion_factor`,
          conversionFactor.data.data
        );
      }
    } catch (error) {
      console.error('Error fetching conversion factor:', error);
      // Clear the conversion factor on error
      setValue(`ingredients.${index}.conversion_factor`, 1);
    }
  };

  const categories: Array<{
    icon: ReactElement;
    label: string;
    value: RecipeCategory;
  }> = getRecipeCategorie(t).map((cat) => ({
    icon: cat.icon,
    label: cat.label,
    value: cat.value as RecipeCategory,
  }));

  const totalCost = (watch('ingredients') ?? []).reduce((acc, ing) => {
    const ingredient = ingredients.find((i) => i.id === ing.item_uuid);
    const quantity = ing?.quantity ?? 0;
    const conversionFactor = ing?.conversion_factor ?? 1;

    if (ingredient?.cost) {
      acc += (ingredient.cost / conversionFactor) * quantity;
    }
    return acc;
  }, 0);

  const priceMargin =
    (watch('portion_price') ?? 0) * (watch('portion_count') ?? 1) - totalCost;

  const handleFormSubmit = handleSubmit(
    (data) => {
      if (!props.recipe?.recipe_uuid) {
        return;
      }

      if (!selectedRestaurantUUID) {
        return;
      }

      const requestData = {
        recipe_name: data.name,
        type: data.type,
        category: data.category,
        portion_count: data.portion_count,
        portion_price: data.portion_price,
        unit_name: data.unit_name,
        unit_uuid: data.unit_uuid,
        ingredients: data.ingredients?.map((ing) => ({
          item_uuid: ing.item_uuid,
          quantity: ing.quantity ?? 0,
          type: ing.type ?? 'ingredient',
          conversion_factor: ing.conversion_factor ?? 1,
          unit_uuid: ing.unit_uuid ?? undefined,
          unit_name: ing.unit_name ?? undefined,
          base_unit_uuid: ing.base_unit_uuid ?? undefined,
          base_unit_name: ing.base_unit_name ?? undefined,
        })),
      };

      return recipesService
        .updateRecipe(
          selectedRestaurantUUID,
          props.recipe.recipe_uuid,
          requestData
        )
        .then((response) => {
          props.onSubmitted({
            ...props.recipe,
            ...requestData,
            total_cost: totalCost,
            total_margin: priceMargin,
          });
        })
        .catch((error) => {
          console.error('Update failed:', error);
        });
    },
    (errors) => {
      console.log('Form validation errors:', errors);
      return false;
    }
  );

  const allItems = [
    ...ingredients.map((item) => ({
      ...item,
      groupBy: 'Ingredients',
    })),
    ...preparations.map((prep) => ({
      ...prep,
      id: prep.recipe_uuid,
      name: prep.name,
      groupBy: 'Preparations',
    })),
  ];

  const selectOptions = [
    {
      label: 'Ingredients',
      options: ingredients.map((ing) => ({
        label: ing.name,
        value: ing.id,
      })),
    },
    {
      label: 'Preparations',
      options: preparations.map((prep) => ({
        label: prep.name || prep.name,
        value: prep.recipe_uuid,
      })),
    },
  ].filter((group) => group.options.length > 0);

  const handleNewItemCreated =
    (index: number) => (newItem: Recipe | Ingredient) => {
      getIngredientsAndPreparations();
      const itemId = 'uuid' in newItem ? newItem.uuid : newItem.id;
      setValue(`ingredients.${index}.item_uuid`, itemId);
      setValue(`ingredients.${index}.type`, newItem.type || '');
      setValue(`ingredients.${index}.unit_uuid`, newItem.unit_uuid || '');
      setValue(`ingredients.${index}.unit_name`, newItem.unit_name || '');

      setShowAddIngredientPopup(false);
      setShowAddPreparationPopup(false);
      setPendingItemName('');
    };

  return (
    <>
      <SidePanel
        className={styles.sidePanel}
        isOpen={props.isOpen}
        width="65%"
        onRequestClose={props.onRequestClose}>
        <h1 className={styles.title}>
          {props.action === 'create' ? (
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
              values={{ name: watch('name') }}
              components={{
                highlight: <span className={styles.titleRecipeName} />,
              }}
            />
          )}
        </h1>

        <form
          className={styles.inputContainer}
          onSubmit={(e) => {
            e.preventDefault();
            console.log('Form submission triggered');
            return handleFormSubmit(e);
          }}
          noValidate>
          <LabeledInput
            placeholder={t(`recipes.editPanel.${recipeType}.fields.name`)}
            autoComplete="off"
            {...register('name')}
            lighter
            error={errors.name?.message}
          />

          {props?.recipe?.category !== 'modifiers' &&
            props?.recipe?.type !== 'preparation' && (
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
                    value={
                      categories.find((cat) => cat.value === value) ?? null
                    }
                    error={errors.category?.message}
                  />
                )}
              />
            )}
          <div className={styles.rowInputs}>
            <>
              <LabeledInput
                type="number"
                step=".00000001"
                placeholder={t('recipes.editPanel.fields.portionsPerBatch')}
                icon={<i className="fa-solid fa-layer-group" />}
                {...register('portion_count')}
                lighter
                error={errors.portion_count?.message}
              />
              {recipeType === 'recipe' && (
                <LabeledInput
                  type="number"
                  step=".00000001"
                  placeholder={t('recipes.editPanel.fields.pricePerPortion')}
                  icon={<i className="fa-solid fa-dollar-sign" />}
                  {...register('portion_price')}
                  lighter
                  error={errors.portion_price?.message}
                />
              )}
              {props?.recipe?.type === 'preparation' && (
                <Controller
                  name={`unit_name`}
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <CreatableSelect
                      placeholder="Unit"
                      options={unitname.map((unit) => ({
                        label: unit.unit_name,
                        value: unit.unit_uuid,
                      }))}
                      isClearable
                      onChange={async (selectedOption) => {
                        setValue(`unit_name`, selectedOption?.label || '');
                        setValue(`unit_uuid`, selectedOption?.value || '');
                      }}
                      value={
                        value
                          ? {
                              label: value,
                              value: watch(`unit_uuid`),
                            }
                          : null
                      }
                    />
                  )}
                />
              )}
            </>
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

          {/* Ingredient Fields */}
          <div>
            {ingredientFields.map(({ id }, i) => {
              const rowField = watch(`ingredients.${i}`);

              const selectedIngredient: RecipeIngredient | null =
                (ingredients.find((ing) => ing.id === rowField.item_uuid) && {
                  item_uuid: ingredients.find(
                    (ing) => ing.id === rowField.item_uuid
                  )!.id,
                  item_name: ingredients.find(
                    (ing) => ing.id === rowField.item_uuid
                  )!.name,
                  type:
                    ingredients.find((ing) => ing.id === rowField.item_uuid)!
                      .type || 'ingredient',
                  unit_name:
                    ingredients.find((ing) => ing.id === rowField.item_uuid)!
                      .unit_name || '',
                  unit_uuid:
                    ingredients.find((ing) => ing.id === rowField.item_uuid)!
                      .unit_uuid || '',
                  unit_cost:
                    ingredients.find((ing) => ing.id === rowField.item_uuid)!
                      .cost || 0,
                  quantity: 0,
                  conversion_factor: 1,
                }) ||
                (preparations.find(
                  (prep) => prep.recipe_uuid === rowField.item_uuid
                ) && {
                  item_uuid: preparations.find(
                    (prep) => prep.recipe_uuid === rowField.item_uuid
                  )!.recipe_uuid,
                  item_name: preparations.find(
                    (prep) => prep.recipe_uuid === rowField.item_uuid
                  )!.name,
                  type:
                    preparations.find(
                      (prep) => prep.recipe_uuid === rowField.item_uuid
                    )!.type || 'preparation',
                  unit_name:
                    preparations.find(
                      (prep) => prep.recipe_uuid === rowField.item_uuid
                    )!.unit_name || '',
                  unit_uuid:
                    preparations.find(
                      (prep) => prep.recipe_uuid === rowField.item_uuid
                    )!.unit_uuid || '',
                  unit_cost:
                    ingredients.find((ing) => ing.id === rowField.item_uuid)!
                      .cost || 0,
                  quantity: 0,
                  conversion_factor: 1,
                }) ||
                null;

              return (
                <div key={id} className={styles.rowInputs}>
                  <Controller
                    name={`ingredients.${i}.item_uuid`}
                    control={control}
                    render={({ field }) => (
                      <CreatableSelect
                        options={selectOptions}
                        placeholder={t(
                          'recipes.editPanel.table.ingredientSelect'
                        )}
                        formatCreateLabel={(inputValue) =>
                          `Create "${inputValue}"`
                        }
                        onChange={(selectedOption) => {
                          if (!selectedOption?.value) return;
                          field.onChange(selectedOption.value);

                          const selectedItem =
                            ingredients.find(
                              (ing) => ing.id === selectedOption.value
                            ) ||
                            preparations.find(
                              (prep) =>
                                prep.recipe_uuid === selectedOption.value
                            );

                          if (selectedItem) {
                            setValue(
                              `ingredients.${i}.type`,
                              selectedItem.type || 'ingredient'
                            );
                            setValue(
                              `ingredients.${i}.base_unit_uuid`,
                              selectedItem.unit_uuid || ''
                            );
                            setValue(
                              `ingredients.${i}.base_unit_name`,
                              selectedItem.unit_name || ''
                            );

                            const recipeUnitUUID = watch(
                              `ingredients.${i}.unit_uuid`
                            );
                            fetchAndSetConversionFactor(
                              i,
                              recipeUnitUUID || null,
                              selectedItem.type || 'ingredient'
                            );
                          }
                        }}
                        onCreateOption={(inputValue) => {
                          setPendingItemName(inputValue);
                          setShowTypeSelector(true);
                        }}
                        value={
                          selectOptions
                            .flatMap((group) => group.options)
                            .find((option) => option.value === field.value) ??
                          null
                        }
                        isLoading={
                          ingredients.length === 0 && preparations.length === 0
                        }
                        isClearable
                        styles={{
                          menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                          menu: (base) => ({ ...base, zIndex: 9999 }),
                          control: (base) => ({ ...base, minHeight: '42px' }),
                        }}
                      />
                    )}
                  />

                  <LabeledInput
                    placeholder={t('quantity')}
                    type="number"
                    step=".00000001"
                    lighter
                    {...register(`ingredients.${i}.quantity`)}
                    error={errors.ingredients?.[i]?.quantity?.message}
                  />

                  <Controller
                    name={`ingredients.${i}.unit_name`}
                    control={control}
                    render={({ field: { onChange, value } }) => (
                      <CreatableSelect
                        placeholder="Unit"
                        options={unitname.map((unit) => ({
                          label: unit.unit_name,
                          value: unit.unit_uuid,
                        }))}
                        isClearable
                        onChange={async (selectedOption) => {
                          setValue(
                            `ingredients.${i}.unit_name`,
                            selectedOption?.label || ''
                          );
                          setValue(
                            `ingredients.${i}.unit_uuid`,
                            selectedOption?.value || ''
                          );

                          const selectedItemUUID = watch(
                            `ingredients.${i}.item_uuid`
                          );
                          if (!selectedItemUUID) return;

                          const selectedItem =
                            ingredients.find(
                              (ing) => ing.id === selectedItemUUID
                            ) ||
                            preparations.find(
                              (prep) => prep.recipe_uuid === selectedItemUUID
                            );

                          if (selectedItem) {
                            const recipeUnitUUID =
                              selectedOption?.value || null;
                            const itemType = selectedItem.type || 'ingredient';

                            await fetchAndSetConversionFactor(
                              i,
                              recipeUnitUUID,
                              itemType
                            );
                          }
                        }}
                        value={
                          value
                            ? {
                                label: value,
                                value: watch(`ingredients.${i}.unit_uuid`),
                              }
                            : null
                        }
                      />
                    )}
                  />
                  <div className={styles.IconContainer}>
                    <LabeledInput
                      placeholder={`${selectedIngredient?.unit_name || 'unit'} → ${watch(`ingredients.${i}.unit_name`) || 'unit'} `}
                      type="number"
                      step="any"
                      lighter
                      style={{ minWidth: '175px' }}
                      suffix={selectedIngredient?.conversion_factor?.toString()}
                      {...register(`ingredients.${i}.conversion_factor`)}
                      error={
                        errors?.ingredients?.[i]?.conversion_factor?.message
                      }
                    />

                    <IconButton
                      icon={<i className="fa-solid fa-circle-info"></i>}
                      tooltipMsg={`How much ${
                        watch(`ingredients.${i}.unit_name`) || ''
                      } is 1 ${selectedIngredient?.unit_name || ''} `}
                      className={styles.info}
                    />
                  </div>

                  <p className={styles.ingredientCost}>
                    {formatCurrency(
                      (() => {
                        if (!selectedIngredient) return 0;
                        const quantity =
                          watch(`ingredients.${i}.quantity`) || 0;
                        const conversionFactor =
                          watch(`ingredients.${i}.conversion_factor`) || 1;
                        const unit_cost = selectedIngredient?.unit_cost || 0;
                        return (unit_cost / conversionFactor) * quantity;
                      })(),
                      currencyISO
                    )}
                  </p>

                  <IconButton
                    className={styles.deleteBtn}
                    icon={<MdDelete />}
                    tooltipMsg={t('delete')}
                    onClick={() => removeIngredient(i)}
                  />
                </div>
              );
            })}
          </div>

          <div
            className={styles.addIngredientButton}
            onClick={() =>
              addIngredient({
                item_uuid: '',
                item_name: '',
                unit_name: '',
                unit_uuid: '',
                conversion_factor: 1,
                quantity: 0,
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
              actionType="button"
              onClick={props.onRequestClose}
            />
            <Button
              type="primary"
              value={t('validate')}
              actionType="submit"
              loading={isSubmitting}
              disabled={!isDirty}
              onClick={() => console.log('Submit button clicked')}
            />
          </div>
        </form>
      </SidePanel>
      <TypeSelector
        isVisible={showTypeSelector}
        itemName={pendingItemName}
        onRequestClose={() => {
          setShowTypeSelector(false);
          setPendingItemName('');
        }}
        onSelectType={(type) => {
          setShowTypeSelector(false);
          if (type === 'ingredient') {
            setShowAddIngredientPopup(true);
          } else {
            setShowAddPreparationPopup(true);
          }
        }}
      />

      {/* Add Ingredient Popup */}
      {showAddIngredientPopup && (
        <AddIngredientPopup
          isVisible={showAddIngredientPopup}
          onRequestClose={() => {
            setShowAddIngredientPopup(false);
            setPendingItemName('');
            setEditingIngredientIndex(null);
          }}
          reloadInventoryData={getIngredientsAndPreparations}
          onSubmitted={
            editingIngredientIndex !== null
              ? handleNewItemCreated(editingIngredientIndex)
              : undefined
          }
        />
      )}

      {/* Add Preparation Popup */}
      {showAddPreparationPopup && (
        <AddPreparationPopup
          isVisible={showAddPreparationPopup}
          onRequestClose={() => {
            setShowAddPreparationPopup(false);
            setPendingItemName('');
          }}
          onRecipeChanged={() => {}}
          onReload={getIngredientsAndPreparations}
          ingredients={ingredients}
          selectedTab={1}
          categories={categories}
          initialRecipeName={pendingItemName}
          onSubmitted={handleNewItemCreated(editingIngredientIndex ?? 0)}
        />
      )}
    </>
  );
};

export default RecipeFormPanel;

const Option = components.Option;
const CategoryOption = (
  props: OptionProps<{
    icon: ReactElement;
    label: string;
    value: RecipeCategory;
  }>
) => (
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
