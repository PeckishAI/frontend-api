import { z } from 'zod';
import styles from './RecipeFormPanel.module.scss';
import { Button, IconButton, LabeledInput, Select, SidePanel } from 'shared-ui';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import {
  Recipe,
  RecipeCategory,
  RecipeType,
  recipesService,
} from '../../services';
import { useIngredients } from '../../services/hooks';
import { FaPlus } from 'react-icons/fa';
import { MdDelete } from 'react-icons/md';
import { ReactElement, useEffect } from 'react';
import {
  useRestaurantCurrency,
  useRestaurantStore,
} from '../../store/useRestaurantStore';
import { formatCurrency } from '../../utils/helpers';
import classNames from 'classnames';
import { Trans, useTranslation } from 'react-i18next';
import { components, OptionProps } from 'react-select';
import { getRecipeCategories } from '../../views/Recipes/Recipes';

const RecipeSchema = z
  .object({
    name: z.string().trim().nonempty('required'),
    type: z.enum(['recipe', 'preparation', 'product']),
    category: z.custom<RecipeCategory>().refine((val) => !!val, 'required'),
    pricePerPortion: z.coerce
      .number()
      .positive('positive-number')
      .or(z.undefined()),
    portionsPerBatch: z.coerce.number().positive('positive-number'),
    ingredients: z.array(
      z.object({
        selectedUUID: z.string().nonempty('required'),
        // Allow null for quantity to initialize empty field, but make it required in the form submission
        quantity: z.coerce
          .number()
          .positive('positive-number')
          .nullable()
          .refine((val) => val !== null, 'required'),
      })
    ),
  })
  .refine((val) => {
    console.log('ici', val);

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
  const { ingredients, loading: loadingIngredients } = useIngredients();
  const { currencyISO, currencySymbol } = useRestaurantCurrency();

  const {
    register,
    reset,
    watch,
    control,
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
          })),
        });
      }
    }
  }, [props.isOpen, props.recipe]);

  // Batch cost
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
    console.log(data);
    const requestData = {
      ...data,
      ingredients: data.ingredients.map((ing) => ({
        ingredient_uuid: ing.selectedUUID,
        quantity: ing.quantity ?? 0,
      })),
    };

    // Use the correct service depending on the action
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
      // set the new recipe
      props.onSubmitted({
        ...props.recipe,
        uuid:
          props.recipe?.uuid ?? props.action === 'create'
            ? (res as string)
            : '',
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
          };
        }),
      });
    });
  });

  // Categories options
  const categories = getRecipeCategories(t).map((cat) => ({
    icon: cat.icon,
    label: cat.label,
    value: cat.value,
  }));

  console.log(errors);

  return (
    <SidePanel
      className={styles.sidePanel}
      isOpen={props.isOpen}
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
              recipeType as 'recipe' | 'preparation'
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

        {ingredientFields.map(({ id }, i) => {
          const rowField = watch(`ingredients.${i}`);

          const selectedIngredient =
            ingredients.find((ing) => ing.id === rowField.selectedUUID) ?? null;

          return (
            <div key={id} className={styles.rowInputs}>
              <Controller
                control={control}
                name={`ingredients.${i}.selectedUUID`}
                render={({ field: { onChange, name, onBlur, ref } }) => (
                  <Select
                    size="large"
                    placeholder={t('recipes.editPanel.table.ingredientSelect')}
                    options={ingredients}
                    getOptionLabel={(option) => option.name}
                    getOptionValue={(option) => option.id}
                    isLoading={loadingIngredients}
                    innerRef={ref}
                    name={name}
                    onChange={(val) => {
                      onChange(val?.id ?? null);
                    }}
                    onBlur={onBlur}
                    value={selectedIngredient}
                    error={errors.ingredients?.[i]?.selectedUUID?.message}
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
              <p className={styles.ingredientCost}>
                {formatCurrency(
                  (selectedIngredient?.cost ?? 0) * (rowField.quantity ?? 0),
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

        <div
          className={styles.addIngredientButton}
          onClick={() => {
            addIngredient({
              selectedUUID: '',
              quantity: null,
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
