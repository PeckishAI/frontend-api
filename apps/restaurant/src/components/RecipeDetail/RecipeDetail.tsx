import { DialogBox, IconButton, SidePanel, Table } from 'shared-ui';
import styles from './style.module.scss';
import { Recipe, recipesService } from '../../services';
import RecipeFormPanel from '../RecipeFormPanel/RecipeFormPanel';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { formatCurrency } from '../../utils/helpers';
import { useRestaurantCurrency } from '../../store/useRestaurantStore';

type Props = {
  recipe: Recipe | null;
  isOpen: boolean;
  onRequestClose: () => void;
  onRecipeChanged: (recipe: Recipe, action: 'deleted' | 'updated') => void;
};

const RecipeDetail = (props: Props) => {
  const { t } = useTranslation();
  const [editRecipe, setEditRecipe] = useState<Recipe | null>(null);
  const [deleteRecipe, setDeleteRecipe] = useState<Recipe | null>(null);
  const { currencyISO } = useRestaurantCurrency();

  return (
    <>
      <SidePanel
        isOpen={props.recipe !== null}
        width="65%"
        onRequestClose={() => props.onRequestClose()}>
        <div className={styles.recipeDetail}>
          <h2 className={styles.name}>{props.recipe?.recipeName}</h2>
          <div className={styles.optionsButtons}>
            <IconButton
              icon={<i className="fa-solid fa-pen-to-square"></i>}
              tooltipMsg={t('edit')}
              onClick={() => setEditRecipe(props.recipe)}
            />
            <IconButton
              icon={<i className="fa-solid fa-trash"></i>}
              tooltipMsg={t('delete')}
              onClick={() => setDeleteRecipe(props.recipe)}
            />
          </div>
          <p className={styles.category}>
            {t('category')} :{' '}
            <span className={styles.value}>
              {t(`recipesCategories.${props.recipe?.category ?? 'others'}`)}
            </span>
          </p>

          <div className={styles.metrics}>
            {props.recipe?.type === 'preparation' ? (
              <p className={styles.metric}>
                <i className={`fa-solid fa-box-open ${styles.quantity}`}></i>
                {t('quantity')} :{' '}
                <span className={styles.value}>
                  {`${props.recipe?.quantity} ${props.recipe?.unitName}`}
                </span>
              </p>
            ) : (
              <>
                <p className={styles.metric}>
                  <i className={`fa-solid fa-tag ${styles.price}`}></i>
                  {t('price')} :{' '}
                  <span className={styles.value}>
                    {formatCurrency(props.recipe?.pricePerPortion, currencyISO)}
                  </span>
                </p>

                <p className={styles.metric}>
                  <i
                    className={`fa-solid fa-arrow-up-right-dots ${styles.margin}`}></i>
                  {t('margin')} :{' '}
                  <span className={styles.value}>
                    {formatCurrency(
                      props.recipe?.marginPerPortion,
                      currencyISO
                    )}
                  </span>
                </p>
              </>
            )}

            <p className={styles.metric}>
              <i
                className={`fa-solid fa-hand-holding-dollar ${styles.cost}`}></i>
              {t('cost')} :{' '}
              <span className={styles.value}>
                {formatCurrency(props.recipe?.costPerPortion, currencyISO)}
              </span>
            </p>
          </div>

          <div className={styles.scrollDiv}>
            <Table
              data={props.recipe?.ingredients}
              columns={[
                { key: 'ingredientName', header: t('name') },
                {
                  key: 'quantity',
                  header: t('quantity'),
                  renderItem: ({ row }) =>
                    `${row.quantity} ${row.recipeUnitName || ''}`,
                },
                // {
                //   key: 'recipeUnitName',
                //   header: t('units'),
                //   renderItem: ({ row }) => `${row.recipeUnitName || ''}`,
                // },
                // {
                //   key: 'conversion_factor',
                //   header: t('conversion_factor'),
                //   renderItem: ({ row }) => (
                //     <div className={styles.conversionFactorCell}>
                //       <span style={{ margin: '0 auto' }}>
                //         {row.conversion_factor || ''}
                //       </span>
                //       <IconButton
                //         icon={<i className="fa-solid fa-circle-info"></i>}
                //         tooltipMsg={`from ${row.recipe_unit_name} to ${row.unit_name}`}
                //         className={styles.info}
                //       />
                //     </div>
                //   ),
                // },
                {
                  key: 'cost',
                  header: t('totalCost'),
                  renderItem: ({ row }) =>
                    row.cost && row.conversionFactor && row.quantity
                      ? formatCurrency(
                          (row.cost / (row.conversionFactor || 1)) *
                            row.quantity,
                          currencyISO
                        )
                      : '-',
                },
              ]}
            />
          </div>

          {props.recipe?.ingredients.length === 0 && (
            <p className={styles.noIngredients}>
              {t('recipes.card.no-ingredients')}
            </p>
          )}
        </div>
      </SidePanel>

      <DialogBox
        msg={t(`recipes.delete.${deleteRecipe?.type ?? 'recipe'}`)}
        subMsg={t('recipes.delete.subtitle')}
        type="warning"
        isOpen={deleteRecipe !== null}
        onRequestClose={() => setDeleteRecipe(null)}
        onConfirm={() =>
          recipesService
            .deleteRecipe(
              deleteRecipe?.recipeUUID,
              deleteRecipe?.category ?? ''
            )
            .then(() => {
              props.onRecipeChanged(deleteRecipe!, 'deleted');
              setDeleteRecipe(null);
            })
        }
      />

      {editRecipe && (
        <RecipeFormPanel
          type={props.recipe?.type}
          action="edit"
          isOpen={editRecipe !== null}
          onRequestClose={() => setEditRecipe(null)}
          onSubmitted={(recipe) => {
            props.onRecipeChanged(recipe, 'updated');
            setEditRecipe(null);
            props.onRequestClose();
          }}
          recipe={editRecipe}
        />
      )}
    </>
  );
};

export default RecipeDetail;
