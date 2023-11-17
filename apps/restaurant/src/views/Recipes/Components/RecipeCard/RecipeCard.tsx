import './style.scss';
import { useTranslation } from 'react-i18next';
import { Recipe } from '../../../../services';
import { PiWarningCircleBold } from 'react-icons/pi';
import { formatCurrency } from '../../../../utils/helpers';
import { useRestaurantCurrency } from '../../../../store/useRestaurantStore';

type Props = {
  recipe: Recipe;
  onClick?: () => void;
};

const RecipeCard = (props: Props) => {
  const { t } = useTranslation('common');

  const { currencyISO } = useRestaurantCurrency();

  return (
    <div className="recipe-card" onClick={props.onClick}>
      {!props.recipe.isOnboarded && (
        <PiWarningCircleBold
          className="not-onboarded"
          data-tooltip-content="Not onboarded"
          data-tooltip-id="recipeCard-tooltip"
        />
      )}
      <p className="name">{props.recipe.name}</p>
      <p className="ingredient-nb">
        {props.recipe.ingredients.length} ingredients
      </p>

      <div className="metrics">
        <div className="metric">
          <i
            className="fa-solid fa-tag price"
            data-tooltip-content={t('price')}
            data-tooltip-id="recipeCard-tooltip"></i>
          <p>{formatCurrency(props.recipe.portion_price, currencyISO)}</p>
        </div>

        <div className="metric">
          <i
            className="fa-solid fa-hand-holding-dollar cost"
            data-tooltip-content={t('cost')}
            data-tooltip-id="recipeCard-tooltip"></i>
          <p>{formatCurrency(props.recipe.cost, currencyISO)}</p>
        </div>

        <div className="metric">
          <i
            className="fa-solid fa-arrow-up-right-dots margin"
            data-tooltip-content={t('margin')}
            data-tooltip-id="recipeCard-tooltip"></i>
          <p>{formatCurrency(props.recipe.margin, currencyISO)}</p>
        </div>
      </div>
    </div>
  );
};

export default RecipeCard;
