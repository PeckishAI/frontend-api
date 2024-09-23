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
import { getRecipeCategorie } from '../../views/Recipes/RecipeNew';
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
    portionsPerBatch: z.coerce.number().positive('positive-number'),
    ingredients: z.array(
      z.object({
        selectedUUID: z.string().nonempty('required'),
        conversion_factor: z.string().optional(),
        type: z.string().nonempty('required'),
        quantity: z.coerce
          .number()
          .positive('positive-number')
          .nullable()
          .refine((val) => val !== null, 'required'),
        unit_name: z.string().optional(),
        unit_uuid: z.string().optional(),
        recipe_unit_name: z
          .string()
          .min(1, { message: 'recipe Unit name is required' }),
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
  const { currencyISO, currencySymbol } = useRestaurantCurrency();
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
        reset();
        reset({
          type: recipeType,
          ingredients: [],
        });
      } else {
        reset({
          name: props.recipe?.name,
          type: recipeType,
          category: props.recipe?.category,
          pricePerPortion: props.recipe?.portion_price,
          portionsPerBatch: props.recipe?.portion_count,
          ingredients: (props.recipe?.ingredients ?? []).map((ing) => ({
            selectedUUID: ing.uuid,
            quantity: ing.quantity,
            unit_name: ing.unit_name || '',
            unit_uuid: ing.unit_uuid || '',
            conversion_factor: ing.conversion_factor || '',
            recipe_unit_name: ing.recipe_unit_name,
            recipe_unit_uuid: ing.recipe_unit_uuid,
            type: ing.type,
          })),
        });
      }
    }
  }, [props.isOpen, props.recipe]);

  const getOnlyIngredient = () => {
    if (!selectedRestaurantUUID) return;
    inventoryService
      .getOnlyIngredientList(selectedRestaurantUUID)
      .then(setIngredients)
      .catch((e) => {
        console.error('useIngredients error', e);
      })
      .finally(() => {});
  };

  function reloadUnits() {
    if (!selectedRestaurantUUID) return;

    inventoryService
      .getUnits(selectedRestaurantUUID)
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
    getOnlyIngredient();
    reloadUnits();
  }, [selectedRestaurantUUID]);

  useEffect(() => {
    ingredientFields.forEach((field, index) => {
      const selectedIngredient = ingredients.find(
        (ing) => ing.id === watch(`ingredients.${index}.selectedUUID`)
      );
      if (selectedIngredient) {
        setValue(`ingredients.${index}.type`, selectedIngredient.type);
      }
    });
  }, [watch('ingredients'), ingredients]);

  const totalCost = watch('ingredients').reduce((acc, ing) => {
    const ingredient = ingredients.find((i) => i.id === ing.selectedUUID);
    if (ingredient) {
      acc += ingredient.unitCost * (ing.quantity ?? 0);
    }
    return acc;
  }, 0);

  // Benefit per batch
  const priceMargin =
    (watch('pricePerPortion') ?? 0) * watch('portionsPerBatch') - totalCost;

  // handle form submission
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
        portion_price: data.pricePerPortion,
        portion_count: data.portionsPerBatch,
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

  // Categories options
  const categories = getRecipeCategorie(t).map((cat) => ({
    icon: cat.icon,
    label: cat.label,
    value: cat.value,
  }));

  // Flatten data and add a type field
  const allItems = ingredients.map((item) => ({
    ...item,
    groupBy: item.type === 'ingredient' ? 'Ingredients' : 'Preparations',
  }));

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
          placeholder={t(
            `recipes.editPanel.${
              recipeType as 'recipe' | 'preparation' | 'modifier'
            }.fields.name`
          )}
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
          {recipeType !== 'preparation' && (
            <LabeledInput
              type="number"
              step=".00000001"
              placeholder={t('recipes.editPanel.fields.pricePerPortion')}
              icon={<i className="fa-solid fa-tag" />}
              {...register('pricePerPortion')}
              lighter
              suffix={currencySymbol}
              error={errors.pricePerPortion?.message}
            />
          )}

          <LabeledInput
            type="number"
            step=".00000001"
            placeholder={t('recipes.editPanel.fields.portionsPerBatch')}
            {...register('portionsPerBatch')}
            lighter
            error={errors.portionsPerBatch?.message}
          />
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
          {ingredientFields.map(({ id }, i) => {
            const rowField = watch(`ingredients.${i}`);

            const selectedIngredient =
              ingredients.find((ing) => ing.id === rowField.selectedUUID) ??
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
                      onChange={(selectedOption) => {
                        if (!selectedOption?.value) return;
                        console.log('selectedOption', selectedOption);
                        const selectedIngredient = ingredients.find(
                          (ing) => ing.id === selectedOption.value
                        );

                        if (selectedIngredient && selectedIngredient.type) {
                          setValue(
                            `ingredients.${i}.type`,
                            selectedIngredient.type
                          );
                          setValue(
                            `ingredients.${i}.unit_uuid`,
                            selectedIngredient.unit_uuid
                          );
                          setValue(
                            `ingredients.${i}.unit_name`,
                            selectedIngredient.unit_name
                          );
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
                  suffix={selectedIngredient?.unit}
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
                      onChange={(selectedOption) => {
                        if (selectedOption?.__isNew__) {
                          // If a new unit is created, set only unit_name
                          setValue(
                            `ingredients.${i}.recipe_unit_name`,
                            selectedOption.label
                          );
                          setValue(
                            `ingredients.${i}.recipe_unit_uuid`,
                            undefined
                          );
                        } else if (selectedOption) {
                          setValue(
                            `ingredients.${i}.recipe_unit_name`,
                            selectedOption.label
                          );
                          setValue(
                            `ingredients.${i}.recipe_unit_uuid`,
                            selectedOption.value
                          );
                        } else {
                          setValue(`ingredients.${i}.recipe_unit_name`, '');
                          setValue(
                            `ingredients.${i}.recipe_unit_uuid`,
                            undefined
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
                    suffix={selectedIngredient?.conversion_factor}
                    {...register(`ingredients.${i}.conversion_factor`)}
                    error={errors?.ingredients?.conversion_factor?.message}
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
                      (rowField?.conversion_factor ?? 0)) *
                      rowField.quantity,
                    currencyISO
                  )}
                </p>
                <IconButton
                  className={styles.deleteBtn}
                  icon={<MdDelete />}
                  tooltipMsg={t('delete')}
                  onClick={() => {
                    removeIngredient(i);
                  }}
                />
              </div>
            );
          })}
        </div>

        <div
          className={styles.addIngredientButton}
          onClick={() => {
            addIngredient({
              selectedUUID: '',
              quantity: 0,
              type: '',
            });
          }}>
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
