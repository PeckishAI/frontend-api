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
import { useIngredients } from '../../services/hooks';
import { getRecipeCategorie } from '../../views/Recipes/RecipeNew';
import {
  useRestaurantCurrency,
  useRestaurantStore,
} from '../../store/useRestaurantStore';
import {
  Ingredient,
  Recipe,
  RecipeCategory,
  RecipeType,
  inventoryService,
  recipesService,
} from '../../services';
import { components, OptionProps } from 'react-select';
import styles from './RecipeFormPanel.module.scss';
import CreatableSelect from 'react-select/creatable';

const RecipeSchema = z
  .object({
    name: z.string().trim().nonempty('required'),
    type: z.enum(['recipe', 'preparation', 'modifier']),
    category: z.custom<RecipeCategory>().refine((val) => !!val, 'required'),
    pricePerPortion: z.coerce
      .number()
      .positive('positive-number')
      .or(z.undefined()),
    portion_count: z.coerce.number().positive('positive-number').optional(),
    quantity: z.coerce.number().positive('positive-number').optional(),
    unit_name: z.string().optional(),
    unit_uuid: z.string().optional(),
    ingredients: z.array(
      z.object({
        selectedUUID: z.string().nonempty('required'),
        conversion_factor: z.number().positive('positive-number').nullable(),
        type: z.string().nonempty('required'),
        quantity: z.coerce
          .number()
          .positive('positive-number')
          .nullable()
          .refine((val) => val !== null, 'required'),
        unit_name: z.string().optional(),
        unit_uuid: z.string().optional(),
        recipe_unit_name: z.string().optional(),
        recipe_unit_uuid: z.string().optional(),
      })
    ),
  })
  .refine((val) => {
    if (val.type !== 'preparation') {
      return val.pricePerPortion !== undefined;
    }
    return true;
  }, 'required');

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
  const [unitname, setUnitName] = useState([]);

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
          quantity: props.recipe?.quantity,
          portion_count: props.recipe?.portion_count ?? undefined,
          pricePerPortion: props.recipe?.portion_price ?? undefined,
          unit_name: props.recipe?.unit_name,
          ingredients: (props.recipe?.ingredients ?? []).map((ing) => ({
            selectedUUID: ing.uuid,
            quantity: ing.quantity,
            unit_name: ing.unit_name || '',
            unit_uuid: ing.unit_uuid || '',
            conversion_factor: ing.conversion_factor || null,
            recipe_unit_name: ing.recipe_unit_name,
            recipe_unit_uuid: ing.recipe_unit_uuid,
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

  function reloadUnits() {
    if (!selectedRestaurantUUID) return;
    inventoryService
      .getUnits(selectedRestaurantUUID)
      .then(setUnitName)
      .catch(console.error);
  }

  useEffect(() => {
    getIngredientsAndPreparations();
    reloadUnits();
  }, [selectedRestaurantUUID]);

  useEffect(() => {
    ingredientFields.forEach((field, index) => {
      const selectedItem =
        ingredients.find(
          (ing) => ing.id === watch(`ingredients.${index}.selectedUUID`)
        ) ||
        preparations.find(
          (prep) => prep.uuid === watch(`ingredients.${index}.selectedUUID`)
        );

      if (selectedItem) {
        setValue(`ingredients.${index}.type`, selectedItem.type);
        setValue(
          `ingredients.${index}.unit_name`,
          selectedItem.unit_name || ''
        );
        setValue(
          `ingredients.${index}.unit_uuid`,
          selectedItem.unit_uuid || ''
        );
      }
    });
  }, [watch('ingredients'), ingredients, preparations]);

  const fetchAndSetConversionFactor = async (
    index: number,
    recipeUnitUUID: string | null,
    type: string
  ) => {
    console.log(recipeUnitUUID);
    try {
      // Get the selected UUID from the dropdown (it could be either ingredient or preparation)
      const selectedUUID = watch(`ingredients.${index}.selectedUUID`);
      const fromUnitUUID = watch(`ingredients.${index}.unit_uuid`);
      const recipeUnitUUID = watch(`ingredients.${index}.recipe_unit_uuid`);
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
          `ingredients.${index}.conversion_factor`,
          conversionFactor.data.data
        );
      }
    } catch (error) {
      console.error('Error fetching conversion factor:', error);
    }
  };

  const categories = getRecipeCategorie(t).map((cat) => ({
    icon: cat.icon,
    label: cat.label,
    value: cat.value,
  }));

  const totalCost = watch('ingredients').reduce((acc, ing) => {
    const ingredient = ingredients.find((i) => i.id === ing.selectedUUID);
    if (ingredient && ing.quantity && ing.conversion_factor) {
      acc += (ingredient.cost / ing.conversion_factor) * ing.quantity;
    }
    return acc;
  }, 0);

  const priceMargin =
    (watch('pricePerPortion') ?? 0) * (watch('portion_count') ?? 1) - totalCost;

  const handleFormSubmit = handleSubmit((data) => {
    const requestData = {
      ...data,
      ingredients: data.ingredients.map((ing) => ({
        ingredient_uuid: ing.selectedUUID,
        unit_name: ing.unit_name || null,
        unit_uuid: ing.unit_uuid || null,
        recipe_unit_uuid: ing.recipe_unit_uuid,
        recipe_unit_name: ing.recipe_unit_name,
        conversion_factor: ing.conversion_factor,
        quantity: ing.quantity ?? 0,
        type: ing.type,
      })),
    };

    console.log('Submitting');

    const service =
      props.action === 'create'
        ? recipesService.createRecipe(
            selectedRestaurantUUID,
            recipeType,
            requestData
          )
        : recipesService.updateRecipe(
            selectedRestaurantUUID,
            props.recipe!.uuid,
            requestData
          );

    console.log('hi', data);
    return service.then((res) => {
      props.onSubmitted({
        ...props.recipe,
        uuid:
          props.recipe?.uuid ??
          (props.action === 'create' ? (res as string) : ''),
        type: recipeType,
        isOnboarded: props.recipe?.isOnboarded ?? true,
        name: data.name,
        category: data.category,
        quantity: data.quantity,
        portion_count: data.portion_count ?? undefined,
        pricePerPortion: data.pricePerPortion ?? undefined,
        unit_name: data.unit_name,
        unit_uuid: data.unit_uuid,
        cost: totalCost,
        margin: priceMargin,
        ingredients: data.ingredients.map((ing) => {
          const ingredient = ingredients.find(
            (i) => i.id === ing.selectedUUID
          )!;
          return {
            ...ingredient,
            uuid: ing.selectedUUID,
            quantity: ing.quantity ?? 0,
            type: ing.type,
          };
        }),
      });
    });
  });

  const allItems = [
    ...ingredients.map((item) => ({
      ...item,
      groupBy: 'Ingredients',
    })),
    ...preparations.map((prep) => ({
      ...prep,
      id: prep.uuid,
      name: prep.name,
      groupBy: 'Preparations',
    })),
  ];

  const groupedOptions = allItems.reduce((groups, item) => {
    const group = item.groupBy || 'Other';
    if (!groups[group]) {
      groups[group] = [];
    }
    groups[group].push({
      label: item.name,
      value: item.id,
    });
    return groups;
  }, {});

  const selectOptions = Object.keys(groupedOptions).map((group) => ({
    label: group,
    options: groupedOptions[group],
  }));

  return (
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

      <form className={styles.inputContainer} onSubmit={handleFormSubmit}>
        <LabeledInput
          placeholder={t(`recipes.editPanel.${recipeType}.fields.name`)}
          autoComplete="off"
          {...register('name')}
          lighter
          error={errors.name?.message}
        />

        {props?.recipe?.category !== 'modifiers' && (
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
                {...register('portion_count')}
                lighter
                error={errors.portion_count?.message}
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
                name="unit_name"
                render={({ field: { onChange, value } }) => (
                  <CreatableSelect
                    placeholder={t('recipes.editPanel.table.unit')}
                    options={unitname.map((unit) => ({
                      label: unit.unit_name,
                      value: unit.unit_uuid, // Correctly handle unit_uuid here
                    }))}
                    onChange={(selectedOption) => {
                      // Set both unit_name and unit_uuid here
                      onChange(selectedOption?.label || ''); // Update unit_name in form
                      setValue('unit_uuid', selectedOption?.value || ''); // Update unit_uuid in form
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

        {/* Ingredient Fields */}
        <div>
          {ingredientFields.map(({ id }, i) => {
            const rowField = watch(`ingredients.${i}`);

            const selectedIngredient =
              ingredients.find((ing) => ing.id === rowField.selectedUUID) ||
              preparations.find(
                (prep) => prep.uuid === rowField.selectedUUID
              ) ||
              null;

            return (
              <div key={id} className={styles.rowInputs}>
                <Controller
                  control={control}
                  name={`ingredients.${i}.selectedUUID`}
                  render={({ field: { onChange, value } }) => (
                    <Select
                      size="large"
                      options={selectOptions}
                      placeholder={t(
                        'recipes.editPanel.table.ingredientSelect'
                      )}
                      isSearchable={true}
                      onChange={async (selectedOption) => {
                        if (!selectedOption?.value) return;

                        // Find the selected item (ingredient or preparation)
                        const selectedItem =
                          ingredients.find(
                            (ing) => ing.id === selectedOption.value
                          ) ||
                          preparations.find(
                            (prep) => prep.uuid === selectedOption.value
                          );

                        if (selectedItem) {
                          console.log(selectedItem);
                          // Set the necessary values for the selected ingredient or preparation
                          setValue(`ingredients.${i}.type`, selectedItem.type);
                          setValue(
                            `ingredients.${i}.unit_uuid`,
                            selectedItem.unit_uuid
                          );
                          setValue(
                            `ingredients.${i}.unit_name`,
                            selectedItem.unit_name
                          );

                          // Fetch the current recipe unit UUID if available
                          const recipeUnitUUID = watch(
                            `ingredients.${i}.recipe_unit_uuid`
                          );

                          // Call the fetchAndSetConversionFactor function
                          await fetchAndSetConversionFactor(
                            i,
                            recipeUnitUUID, // Recipe unit UUID
                            selectedItem.type // Ingredient/preparation type
                          );
                        }

                        // Trigger the onChange event to update the selectedUUID
                        onChange(selectedOption?.value ?? null);
                      }}
                      value={
                        selectOptions
                          .flatMap((group) => group.options)
                          .find((option) => option.value === value) ?? null
                      }
                    />
                  )}
                />

                <LabeledInput
                  placeholder={t('quantity')}
                  type="number"
                  step=".00000001"
                  lighter
                  suffix={selectedIngredient?.unit_name || ''}
                  {...register(`ingredients.${i}.quantity`)}
                  error={errors.ingredients?.[i]?.quantity?.message}
                />

                <Controller
                  name={`ingredients.${i}.recipe_unit_name`}
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <CreatableSelect
                      placeholder="Unit"
                      options={unitname.map((unit) => ({
                        label: unit.unit_name,
                        value: unit.unit_uuid,
                      }))}
                      isClearable
                      isCreatable
                      onChange={async (selectedOption) => {
                        setValue(
                          `ingredients.${i}.recipe_unit_name`,
                          selectedOption?.label || ''
                        );
                        setValue(
                          `ingredients.${i}.recipe_unit_uuid`,
                          selectedOption?.value || ''
                        );

                        const selectedItem =
                          ingredients.find(
                            (ing) =>
                              ing.id === watch(`ingredients.${i}.selectedUUID`)
                          ) ||
                          preparations.find(
                            (prep) =>
                              prep.uuid ===
                              watch(`ingredients.${i}.selectedUUID`)
                          );

                        if (selectedItem) {
                          const recipeUnitUUID = selectedOption?.value || null;
                          await fetchAndSetConversionFactor(
                            i,
                            selectedItem.id,
                            recipeUnitUUID,
                            selectedItem.type
                          );
                        }
                      }}
                      value={
                        value
                          ? {
                              label: value,
                              value: watch(`ingredients.${i}.recipe_unit_uuid`),
                            }
                          : null
                      }
                    />
                  )}
                />

                <div className={styles.IconContainer}>
                  <LabeledInput
                    placeholder={t('conversion_factor')}
                    type="number"
                    lighter
                    style={{ minWidth: '175px' }}
                    value={watch(`ingredients.${i}.conversion_factor`)}
                    onChange={(e) => {
                      const newConversionFactor = parseFloat(e.target.value);
                      if (!isNaN(newConversionFactor)) {
                        setValue(
                          `ingredients.${i}.conversion_factor`,
                          newConversionFactor
                        );
                      }
                    }}
                    error={errors?.ingredients?.[i]?.conversion_factor?.message}
                  />
                  <IconButton
                    icon={<i className="fa-solid fa-circle-info"></i>}
                    tooltipMsg={`from ${
                      selectedIngredient?.unit_name || ''
                    } to ${watch(`ingredients.${i}.recipe_unit_name`) || ''}`}
                    className={styles.info}
                  />
                </div>

                <p className={styles.ingredientCost}>
                  {formatCurrency(
                    ((selectedIngredient?.cost ?? 0) /
                      (rowField?.conversion_factor ?? 1)) *
                      rowField.quantity,
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
              selectedUUID: '',
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
          />
        </div>
      </form>
    </SidePanel>
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
