import { Button, Checkbox, LabeledInput, Popup } from 'shared-ui';
import styles from './AddPreparationPopup.module.scss';
import { useEffect } from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { Recipe, recipesService } from '../../services';
import { useRestaurantStore } from '../../store/useRestaurantStore';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import ListSubheader from '@mui/material/ListSubheader';
import { useIngredients } from '../../services/hooks';
import { FaPlus } from 'react-icons/fa';
import Select from 'react-select';

const AddPreparationSchema = z.object({
  category: z
    .string()
    .optional()
    .or(z.null().transform(() => undefined)),
  cost: z.number().min(0).optional(),
  recipe_name: z
    .string()
    .optional()
    .or(z.null().transform(() => undefined)),
  portionsPerBatch: z.number().min(0).optional(),
  pricePerPortion: z.number().min(0).optional(),
  ingredients: z
    .array(
      z.object({
        ingredient_uuid: z.string().optional(),
        quantity: z.number().min(0, { message: 'must be a positive number' }),
        type: z.string().optional(),
      })
    )
    .min(1, { message: 'At least one ingredient is required' }),
  automaticInvitation: z.boolean(),
});

type PreparationForm = z.infer<typeof AddPreparationSchema>;

type Props = {
  isVisible: boolean;
  onRequestClose: () => void;
  onRecipeChanged: (recipe: Recipe, action: 'deleted' | 'updated') => void;
  onModifierAdded: (supplier: PreparationForm) => void;
  onReload: () => void;
  ingredients: any;
};

const AddPreparationPopup = (props: Props) => {
  const { t } = useTranslation('common');

  const restaurantUUID = useRestaurantStore(
    (state) => state.selectedRestaurantUUID
  );

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
      automaticInvitation: true,
      ingredients: [{ ingredient_uuid: '', quantity: 0, type: '' }],
    },
  });

  const { loading: loadingIngredients } = useIngredients();
  const { fields: ingredientFields, append: addIngredient } = useFieldArray({
    control,
    name: 'ingredients',
  });

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
        setValue(`ingredients.${index}.type`, selectedIngredient.type);
      }
    });
  }, [watch('ingredients'), props.ingredients]);

  const allItems = props.ingredients.map((item) => ({
    ...item,
    groupBy: item.type === 'ingredient' ? 'Ingredients' : 'Preparations',
  }));

  const handleChange = (onChange, setValue, index) => (event, value) => {
    onChange(value?.id ?? null);
    const ingredient = props.ingredients.find((ing) => ing.id === value?.id);
    if (ingredient?.type) {
      setValue(`ingredients.${index}.type`, ingredient.type);
    }
  };

  const handleSubmitForm = handleSubmit(async (data) => {
    if (!restaurantUUID) return;
    const type = 'preparation';

    try {
      const uuid = await recipesService.createRecipe(
        restaurantUUID,
        type,
        data
      );
      props.onRequestClose();
      props.onReload();
      if (!uuid) return;
    } catch (error) {
      console.error('Error creating preparation:', error);
    }
  });

  // const categories = getRecipeCategories(t).map((cat) => ({
  //   icon: cat.icon,
  //   label: cat.label,
  //   value: cat.value,
  // }));

  const categories = [{ value: 'preparations', label: 'Preparation' }];

  return (
    <Popup
      isVisible={props.isVisible}
      onRequestClose={props.onRequestClose}
      title={t('recipes.addPreparation.title')}>
      <form onSubmit={handleSubmitForm}>
        <div className={styles.inputContainer}>
          <Controller
            control={control}
            name="category"
            render={({ field: { onChange, name, onBlur, ref, value } }) => (
              <Select
                size="large"
                isSearchable={false}
                isMulti={false}
                placeholder={t('category')}
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
          <LabeledInput
            lighter
            placeholder={t('recipe_name')}
            type="text"
            error={errors.recipe_name?.message}
            {...register('recipe_name')}
          />
          <LabeledInput
            lighter
            placeholder={t('recipes.editPanel.fields.portionsPerBatch')}
            type="number"
            error={errors.portionsPerBatch?.message}
            {...register('portionsPerBatch', { valueAsNumber: true })}
          />
          <LabeledInput
            lighter
            placeholder={t('recipes.editPanel.fields.pricePerPortion')}
            type="number"
            error={errors.pricePerPortion?.message}
            {...register('pricePerPortion', { valueAsNumber: true })}
          />
          {ingredientFields.map((field, index) => {
            const ingredient_uuid = watch(
              `ingredients.${index}.ingredient_uuid`
            );
            const selectedIngredient = props.ingredients.find(
              (ing) => ing.id === ingredient_uuid
            );

            return (
              <>
                <div key={field.id} className={styles.rowInputs}>
                  <Controller
                    control={control}
                    name={`ingredients.${index}.ingredient_uuid`}
                    render={({ field: { onChange } }) => (
                      <Autocomplete
                        options={allItems.sort(
                          (a, b) => -b.groupBy.localeCompare(a.groupBy)
                        )}
                        groupBy={(option) => option.groupBy}
                        getOptionLabel={(option) => option.name || ''}
                        onChange={handleChange(onChange, setValue, index)}
                        loading={loadingIngredients}
                        value={
                          selectedIngredient
                            ? {
                                name: selectedIngredient.name,
                                id: selectedIngredient.id,
                              }
                            : null
                        }
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label={t(
                              'recipes.editPanel.table.ingredientSelect'
                            )}
                            variant="filled"
                            size="small"
                            sx={{
                              '& .MuiFilledInput-root': {
                                border: '1px solid grey',
                                borderRadius: 1,
                                background: 'white',
                                height: '40px',
                                fontSize: '16px',
                                display: 'flex',
                                alignItems: 'center',
                                borderColor: 'grey.300',
                                borderBottom: 'none',
                              },
                              '& .MuiFilledInput-root:hover': {
                                borderColor: '#337ab7',
                              },
                            }}
                          />
                        )}
                        renderGroup={(params) => (
                          <li key={params.group}>
                            <ListSubheader>{params.group}</ListSubheader>
                            {params.children.map((child, index) => (
                              <div key={`${params.group}-${index}`}>
                                {child}
                              </div>
                            ))}
                          </li>
                        )}
                      />
                    )}
                  />
                </div>
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
              </>
            );
          })}
          <div
            className={styles.addIngredientButton}
            onClick={() =>
              addIngredient({ ingredient_uuid: '', quantity: 0, type: '' })
            }>
            <FaPlus />
            <p>{t('recipes.editPanel.table.addIngredient')}</p>
          </div>
        </div>
        <Checkbox
          label={t('recipes.addPreparation.automaticSendCheckbox')}
          className={styles.autoCheckbox}
          {...register('automaticInvitation')}
        />
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
