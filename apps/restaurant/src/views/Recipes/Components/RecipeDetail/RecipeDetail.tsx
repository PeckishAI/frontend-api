import { DialogBox, IconButton, SidePanel, Table } from 'shared-ui';
import style from './style.module.scss';
import { Recipe, recipesService } from '../../../../services';
import RecipeFormPanel from '../RecipeFormPanel/RecipeFormPanel';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { formatCurrency } from '../../../../utils/helpers';
import { useRestaurantCurrency } from '../../../../store/useRestaurantStore';

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
        onRequestClose={() => props.onRequestClose()}>
        <div className={style.recipeDetail}>
          <h2 className={style.name}>{props.recipe?.name}</h2>
          <div className={style.optionsButtons}>
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
          <p className={style.category}>
            {t('category')} :{' '}
            <span className={style.value}>
              {t(`recipesCategories.${props.recipe?.category ?? 'others'}`)}
            </span>
          </p>
          <div className={style.metrics}>
            <p className={style.metric}>
              <i className={`fa-solid fa-tag ${style.price}`}></i>
              {t('price')} :{' '}
              <span className={style.value}>
                {formatCurrency(props.recipe?.portion_price, currencyISO)}
              </span>
            </p>
            <p className={style.metric}>
              <i
                className={`fa-solid fa-hand-holding-dollar ${style.cost}`}></i>
              {t('cost')} :{' '}
              <span className={style.value}>
                {formatCurrency(props.recipe?.cost, currencyISO)}
              </span>
            </p>
            <p className={style.metric}>
              <i
                className={`fa-solid fa-arrow-up-right-dots ${style.margin}`}></i>
              {t('margin')} :{' '}
              <span className={style.value}>
                {formatCurrency(props.recipe?.margin, currencyISO)}
              </span>
            </p>
          </div>
          <Table
            data={props.recipe?.ingredients}
            columns={[
              { key: 'name', header: t('name') },
              {
                key: 'quantity',
                header: t('quantity'),
                renderItem: ({ row }) => `${row.quantity} ${row.unit}`,
              },
              {
                key: 'cost',
                header: t('totalCost'),
                renderItem: ({ row }) =>
                  row.cost
                    ? formatCurrency(row.cost * row.quantity, currencyISO)
                    : '-',
              },
            ]}
          />
        </div>
      </SidePanel>

      <DialogBox
        msg={t(`recipes.delete.${deleteRecipe?.type ?? 'recipe'}`)}
        subMsg={t('recipes.delete.subtitle')}
        type="warning"
        isOpen={deleteRecipe !== null}
        onRequestClose={() => setDeleteRecipe(null)}
        onConfirm={() =>
          recipesService.deleteRecipe(deleteRecipe?.uuid ?? '').then(() => {
            props.onRecipeChanged(deleteRecipe!, 'deleted');
            setDeleteRecipe(null);
          })
        }
      />

      <RecipeFormPanel
        type={props.recipe?.type}
        action="edit"
        isOpen={editRecipe !== null}
        onRequestClose={() => setEditRecipe(null)}
        onSubmitted={(recipe) => {
          props.onRecipeChanged(recipe, 'updated');
          setEditRecipe(null);
        }}
        recipe={editRecipe}
      />
    </>
  );
};

export default RecipeDetail;
