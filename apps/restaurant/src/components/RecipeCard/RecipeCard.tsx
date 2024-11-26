import './style.scss';
import { useTranslation } from 'react-i18next';
import { Recipe } from '../../services';
import { PiWarningCircleBold } from 'react-icons/pi';
import { formatCurrency } from '../../utils/helpers';
import { useRestaurantCurrency } from '../../store/useRestaurantStore';

type Props = {
  recipe: Recipe;
  onClick?: () => void;
};

const RecipeCard = (props: Props) => {
  const { t } = useTranslation('common');

  const { currencyISO } = useRestaurantCurrency();

  return (
    <div className="recipe-card" onClick={props.onClick}>
      {/* Display a warning if the recipe is not onboarded */}
      {!props.recipe.isOnboarded && (
        <PiWarningCircleBold
          className="not-onboarded"
          data-tooltip-content="Not onboarded"
          data-tooltip-id="recipeCard-tooltip"
        />
      )}

      {/* Recipe Name */}
      <p className="name">{props.recipe.name}</p>

      {/* Ingredient Count */}
      <p className="ingredient-nb">
        {t('recipes.card.ingredients', {
          count: props.recipe.ingredients.length,
        })}
      </p>

      <div className="metrics">
        {/* Check if the recipe is a preparation and display quantity + unit if available */}
        {props.recipe.type === 'preparation' && props.recipe.portion_count ? (
          <div className="metric">
            <i
              className="fa-solid fa-box-open quantity"
              data-tooltip-content={t('quantity')}
              data-tooltip-id="recipeCard-tooltip"></i>
            {/* Fallback to a default string if unit_name is missing */}
            <p>{`${props.recipe.portion_count} ${props.recipe.unit_name || ''}`}</p>
          </div>
        ) : (
          <>
            {/* For non-preparations, show the portion price */}
            <div className="metric">
              <i
                className="fa-solid fa-tag price"
                data-tooltip-content={t('price')}
                data-tooltip-id="recipeCard-tooltip"></i>
              <p>{formatCurrency(props.recipe.portion_price, currencyISO)}</p>
            </div>
          </>
        )}

        {/* Display cost for all types of recipes */}
        <div className="metric">
          <i
            className="fa-solid fa-hand-holding-dollar cost"
            data-tooltip-content={t('cost')}
            data-tooltip-id="recipeCard-tooltip"></i>
          <p>{formatCurrency(props.recipe.total_cost, currencyISO)}</p>
        </div>

        {props.recipe.type !== 'preparation' && (
          <div className="metric">
            <i
              className="fa-solid fa-arrow-up-right-dots margin"
              data-tooltip-content={t('margin')}
              data-tooltip-id="recipeCard-tooltip"></i>
            <p>{formatCurrency(props.recipe.total_margin, currencyISO)}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecipeCard;
