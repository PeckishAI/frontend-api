import { z } from 'zod';
import styles from './EditRecipePanel.module.scss';
import { Button, IconButton, LabeledInput, Select, SidePanel } from 'shared-ui';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { Recipe } from '../../../services';
import { useIngredients } from '../../../services/hooks';
import { FaPlus } from 'react-icons/fa';
import { MdDelete } from 'react-icons/md';
import { useEffect } from 'react';
import { useRestaurantCurrency } from '../../../store/useRestaurantStore';
import { formatCurrency } from '../../../utils/helpers';

const RecipeSchema = z.object({
  name: z.string().nonempty('required'),
  pricePerPortion: z.coerce.number().positive('positive-number'),
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
});

type EditRecipeForm = z.infer<typeof RecipeSchema>;

type Props = {
  isOpen: boolean;
  onClose: () => void;
  recipe: Recipe | null;
};

const EditRecipePanel = (props: Props) => {
  const { ingredients, loading: loadingIngredients } = useIngredients();
  const { currencyISO, currencySymbol } = useRestaurantCurrency();

  const {
    register,
    reset,
    watch,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<EditRecipeForm>({
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
      reset({
        name: props.recipe?.name,
        pricePerPortion: props.recipe?.price,
        portionsPerBatch: 1,
        ingredients: props.recipe?.ingredients.map((ing) => ({
          selectedUUID: ing.uuid,
          quantity: ing.quantity,
        })),
      });
    }
  }, [props.isOpen, props.recipe]);

  return (
    <SidePanel
      className={styles.sidePanel}
      isOpen={props.isOpen}
      onRequestClose={props.onClose}
      loading={false}>
      <h1 className={styles.title}>
        Edit "<span className={styles.titleRecipeName}>{watch('name')}</span>"
        recipe
      </h1>

      <form
        className={styles.inputContainer}
        onSubmit={handleSubmit((data) => {
          console.log(data);
        })}>
        <LabeledInput
          placeholder="Recipe name"
          autoComplete="off"
          {...register('name')}
          lighter
          error={errors.name?.message}
        />

        <div className={styles.rowInputs}>
          <LabeledInput
            type="number"
            placeholder="Price (per portion)"
            {...register('pricePerPortion')}
            lighter
            suffix={currencySymbol}
            error={errors.pricePerPortion?.message}
          />

          <LabeledInput
            type="number"
            placeholder="Portions per batch"
            {...register('portionsPerBatch')}
            lighter
            error={errors.portionsPerBatch?.message}
          />
        </div>

        <p
          style={{
            marginTop: '5px',
            fontSize: '.9rem',
          }}>
          Ingredients :
        </p>

        {/* <p>Cost : 5€ -- Benefits: 10€ </p> */}

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
                    placeholder="Ingredient name"
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
                placeholder="Quantity"
                type="number"
                step="0.01"
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
                tooltipMsg="Supprimer"
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
          <p>Ajouter un ingredient/préparation</p>
        </div>

        <div className={styles.buttonsContainer}>
          <Button
            type="secondary"
            value="Cancel"
            actionType="button"
            onClick={props.onClose}
          />
          <Button type="primary" value="Submit" actionType="submit" />
        </div>
      </form>
    </SidePanel>
  );
};

export default EditRecipePanel;
