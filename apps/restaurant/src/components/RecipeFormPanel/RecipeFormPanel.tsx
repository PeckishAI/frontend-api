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
    pricePerPortion: z.coerce.number().optional(),
    portion_count: z.coerce.number().optional(),
    quantity: z.coerce.number().positive('positive-number').optional(),
    unit_name: z.string().optional(),
    unit_uuid: z.string().optional(),
    ingredients: z.array(
      z.object({
        selectedUUID: z.string().nonempty('required'),
        conversion_factor: z
          .number()
          .or(z.string())
          .pipe(z.coerce.number())
          .optional(),
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
  const [unitNew, setUnitNew] = useState([]);
  const [unitapiData, setUnitApiData] = useState({});
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

  function getUnitNew() {
    if (!selectedRestaurantUUID) return;

    inventoryService
      .getUnitNew(selectedRestaurantUUID)
      .then((res) => {
        setUnitApiData(res.data);
        const genericKeys = Object.keys(res.data.generic);
        const restUnitNames = res.data.rest_units.map((unit) => unit.unit_name);

        // Combine both arrays
        // const combinedArray = [...genericKeys, ...restUnitNames];
        // Combine both into a new array with key-value pairs for select options
        const selectOptions = [
          ...genericKeys.map((key) => ({ label: key, value: key })),
          ...restUnitNames.map((name) => ({ label: name, value: name })),
        ];
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
    getIngredientsAndPreparations();
    reloadUnits();
    getUnitNew();
  }, [selectedRestaurantUUID]);
  console.log('');
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

  const selected_ingredients = watch('ingredients'); // Assuming this is the array you're watching

  // useEffect(() => {
  //   // debugger;
  //   selected_ingredients.map((ingredient, i) => {
  //     const selectedValue = watch(`ingredients.${i}.recipe_unit_name`);
  //     const ingredientUnitName = ingredient.unit_name;

  //     let matchedPair;
  //     if (unitNew.length < 0) {
  //       // Check in 'generic' first
  //       if (unitapiData.generic[selectedValue]) {
  //         matchedPair = {
  //           key: selectedValue,
  //           value: unitNew?.generic[selectedValue],
  //         };
  //       } else {
  //         // Check in 'rest_units'
  //         const foundInRestUnits = unitNew?.rest_units?.find(
  //           (unit) => unit.unit_name === selectedValue
  //         );
  //         if (foundInRestUnits) {
  //           matchedPair = {
  //             key: selectedValue,
  //             value: foundInRestUnits.unit_uuid,
  //           };
  //         }
  //       }
  //     }

  //     // Now, check anotherObject value (e.g., `ingredient.unit_name`)
  //     let foundValue = null;
  //     if (matchedPair && matchedPair.value) {
  //       foundValue = matchedPair.value.find(
  //         (obj) => obj[ingredientUnitName] !== undefined
  //       );
  //     }

  //     if (foundValue) {
  //       setValue(
  //         `ingredients.${i}.conversion_factor`,
  //         foundValue[ingredientUnitName]
  //       );
  //       console.log(
  //         'Set conversion factor for ingredients.${i}:',
  //         foundValue[ingredientUnitName]
  //       );
  //     } else {
  //       console.log('No match found for conversion factor in ingredients.${i}');
  //       setValue(`ingredients.${i}.conversion_factor`, '');
  //     }

  //     // Optionally log or update other fields like `unit_name` and `recipe_unit_uuid`
  //     setValue(`ingredients.${i}.unit_name`, ingredientUnitName);
  //   });
  // }, [
  //   ingredients,
  //   setValue,
  //   getFieldState('ingredients').isDirty,
  //   unitNew,
  //   selected_ingredients,
  // ]);

  // Function to handle conversion factor logic
  const ConversionFactorChange = (i: any) => {
    selected_ingredients.map((ingredient, i) => {
      const selectedValue = watch(`ingredients.${i}.recipe_unit_name`);
      const ingredientUnitName = ingredient.unit_name;

      console.log('selected_ingredients', selected_ingredients, selectedValue);

      let matchedPair;

      if (unitNew.length > 0) {
        if (unitapiData.generic[selectedValue]) {
          matchedPair = {
            key: selectedValue,
            value: unitapiData?.generic[selectedValue],
          };
        } else {
          // Check in 'rest_units'
          const foundInRestUnits = unitNew?.rest_units?.find(
            (unit) => unit.unit_name === selectedValue
          );
          if (foundInRestUnits) {
            matchedPair = {
              key: selectedValue,
              value: foundInRestUnits.unit_uuid,
            };
          }
        }
      }

      console.log('Matched Pair:', matchedPair);

      let foundValue = null;
      if (matchedPair && matchedPair.value) {
        foundValue = matchedPair.value.find(
          (obj) => obj[ingredientUnitName] !== undefined
        );
      }

      if (foundValue) {
        console.log('foundValue', foundValue);
        setValue(
          `ingredients.${i}.conversion_factor`,
          foundValue[ingredientUnitName]
        );
        console.log(
          'Set conversion factor for ingredients.${i}:',
          foundValue[ingredientUnitName]
        );
      } else {
        console.log('No match found data');
      }

      setValue(`ingredients.${i}.unit_name`, ingredientUnitName);
    });
  };

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

                        const selectedIngredient = ingredients.find(
                          (ing) => ing.id === selectedOption.value
                        );

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
                          ConversionFactorChange(i);
                        }

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
                      options={unitNew}
                      isClearable
                      isCreatable
                      onChange={(selectedOption) => {
                        // Set the new selected value first
                        setValue(
                          `ingredients.${i}.recipe_unit_name`,
                          selectedOption?.label ?? ''
                        );

                        // Set the unit UUID
                        setValue(
                          `ingredients.${i}.recipe_unit_uuid`,
                          selectedOption?.value ?? ''
                        );

                        // Call the conversion factor change logic
                        ConversionFactorChange(i);

                        // Optionally, call the original onChange handler
                        onChange(selectedOption?.label ?? '');

                        // if (selectedOption?.__isNew__) {
                        //   // If a new unit is created, set only unit_name
                        //   setValue(
                        //     `ingredients.${i}.recipe_unit_name`,
                        //     selectedOption.label
                        //   );
                        //   setValue(
                        //     `ingredients.${i}.recipe_unit_uuid`,
                        //     undefined
                        //   );
                        // } else if (selectedOption) {
                        //   setValue(
                        //     `ingredients.${i}.recipe_unit_name`,
                        //     selectedOption.label
                        //   );
                        //   setValue(
                        //     `ingredients.${i}.recipe_unit_uuid`,
                        //     selectedOption.value
                        //   );
                        // } else {
                        //   setValue(`ingredients.${i}.recipe_unit_name`, '');
                        //   setValue(
                        //     `ingredients.${i}.recipe_unit_uuid`,
                        //     undefined
                        //   );
                        // }
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
                    step="any"
                    lighter
                    style={{ minWidth: '175px' }}
                    suffix={selectedIngredient?.conversion_factor}
                    {...register(`ingredients.${i}.conversion_factor`)}
                    error={errors?.ingredients?.[i]?.conversion_factor?.message}
                  />
                  <IconButton
                    icon={<i className="fa-solid fa-circle-info"></i>}
                    tooltipMsg={`from ${
                      watch(`ingredients.${i}.recipe_unit_name`) || ''
                    } to ${selectedIngredient?.unit_name || ''} `}
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
