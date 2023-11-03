import { IconButton, SidePanel, Table } from 'shared-ui';
import style from './style.module.scss';
import { Recipe } from '../../../../services';
import EditRecipePanel from '../EditRecipePanel';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { formatCurrency } from '../../../../utils/helpers';

type Props = {
  recipe: Recipe | null;
  isOpen: boolean;
  onRequestClose: () => void;
};

const RecipeDetail = (props: Props) => {
  const { t } = useTranslation();

  const [editRecipe, setEditRecipe] = useState<Recipe | null>(null);

  const currency = props.recipe?.currency;

  if (!props.recipe) return;

  return (
    <>
      <SidePanel
        isOpen={props.recipe !== null}
        onRequestClose={() => props.onRequestClose()}>
        <div className={style.recipeDetail}>
          <h2 className={style.name}>{props.recipe?.name}</h2>
          <IconButton
            icon={<i className="fa-solid fa-pen-to-square"></i>}
            tooltipMsg={t('edit')}
            onClick={() => setEditRecipe(props.recipe)}
            className={style.edit}
          />
          <p className={style.category}>
            {t('category')} :{' '}
            <span className={style.value}>
              {t(`recipesCategories.${props.recipe.category}`)}
            </span>
          </p>
          <div className={style.metrics}>
            <p className={style.metric}>
              <i className={`fa-solid fa-tag ${style.price}`}></i>
              {t('price')} :{' '}
              <span className={style.value}>
                {formatCurrency(props.recipe?.price, currency)}
              </span>
            </p>
            <p className={style.metric}>
              <i
                className={`fa-solid fa-hand-holding-dollar ${style.cost}`}></i>
              {t('cost')} :{' '}
              <span className={style.value}>
                {formatCurrency(props.recipe?.cost, currency)}
              </span>
            </p>
            <p className={style.metric}>
              <i
                className={`fa-solid fa-arrow-up-right-dots ${style.margin}`}></i>
              {t('margin')} :{' '}
              <span className={style.value}>
                {formatCurrency(props.recipe?.margin, currency)}
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
                header: t('cost'),
                renderItem: ({ row }) => row.cost ?? '-',
              },
            ]}
          />
        </div>
      </SidePanel>
      <EditRecipePanel
        isOpen={editRecipe !== null}
        onClose={() => setEditRecipe(null)}
        recipe={editRecipe}
      />
    </>
  );
};

export default RecipeDetail;
