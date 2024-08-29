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
import { useIngredients } from '../../services/hooks';
import { FaPlus, FaTrash } from 'react-icons/fa';
import Select from 'react-select';

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
      ingredients: [{ ingredient_uuid: '', quantity: 0, type: '' }],
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
    const selectedValue = value?.id ?? '';
    onChange(selectedValue);
    const ingredient = props.ingredients.find(
      (ing) => ing.id === selectedValue
    );
    if (ingredient?.type) {
      setValue(`ingredients.${index}.type`, ingredient.type);
    }
  };

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
      title={
        props.selectedTab === 1
          ? t('recipes.addPreparation.title')
          : t('recipes.addPreparation.recipe_title')
      }>
      <form onSubmit={handleSubmitForm}>
        <div className={styles.inputContainer}>
          <Controller
            control={control}
            name="category"
            render={({
              field: { onChange, name, onBlur, ref, value },
              fieldState: { error },
            }) => (
              <>
                {' '}
                <div className={styles.selectContainer}>
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
                </div>
              </>
            )}
          />
          <LabeledInput
            lighter
            placeholder={t('recipes.editPanel.fields.recipeName')}
            type="text"
            error={errors.recipe_name?.message}
            {...register('recipe_name')}
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
                              error={Boolean(
                                errors.ingredients?.[index]?.ingredient_uuid
                              )}
                            />
                          )}
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
                    {...register(`ingredients.${index}.quantity`, {
                      valueAsNumber: true,
                    })}
                    error={errors.ingredients?.[index]?.quantity?.message}
                  />

                  <TextField
                    label={t('unit')}
                    variant="filled"
                    size="small"
                    value={selectedIngredient?.unit || ''}
                    InputProps={{
                      readOnly: true,
                    }}
                    sx={{
                      '& .MuiFilledInput-root': {
                        border: '1px solid grey',
                        borderRadius: 1,
                        background: 'lightgrey',
                        height: '40px',
                        fontSize: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        borderColor: 'grey.300',
                        borderBottom: 'none',
                      },
                      '& .MuiFilledInput-root.Mui-disabled': {
                        backgroundColor: 'lightgrey',
                      },
                    }}
                  />

                  <FaTrash
                    className={styles.deleteButton}
                    onClick={() => removeIngredient(index)}
                  />
                </div>
              </>
            );
          })}
          <div
            className={styles.addIngredientButton}
            onClick={() =>
              addIngredient({ ingredient_uuid: '', quantity: 0, type: '' })
            }>
            <FaPlus />
            {console.log('object')}
            <p>{t('recipes.editPanel.table.addIngredient')}</p>
          </div>
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
