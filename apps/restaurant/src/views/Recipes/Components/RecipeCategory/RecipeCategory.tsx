import { useEffect, useState } from 'react';
import { Recipe } from '../../../../services';
import RecipeCard from '../RecipeCard/RecipeCard';
import style from './style.module.scss';
import { RecipeCat } from '../../Recipes';
import { IconButton } from 'shared-ui';

type Props = {
  category?: RecipeCat;
  recipes?: Recipe[];
  reloadRecipesRequest: () => void;
};

const RecipeCategory = (props: Props) => {
  const [folded, setFolded] = useState(true);
  const [recipesToDisplay, setRecipesToDisplay] = useState<Recipe[]>([]);

  useEffect(() => {
    let recipesToDisplay: Recipe[];
    if (props.recipes) {
      if (folded) recipesToDisplay = props.recipes.slice(0, 3);
      else recipesToDisplay = props.recipes;
    } else {
      recipesToDisplay = [];
    }

    setRecipesToDisplay(recipesToDisplay);
  }, [folded, props.recipes]);

  return (
    <div className={style.recipeCategory}>
      <div className={style.category}>
        <div className={style.iconWrap}>{props.category?.icon}</div>
        <h2 className={style.name}>{props.category?.label}</h2>
        <span className={style.number}>{`(${props.recipes?.length})`}</span>
        <IconButton
          icon={
            folded ? (
              <i className="fa-solid fa-chevron-down"></i>
            ) : (
              <i className="fa-solid fa-chevron-up"></i>
            )
          }
          tooltipMsg={folded ? 'Show more' : 'Show less'}
          onClick={() => setFolded((state) => !state)}
        />
      </div>
      <div className={style.recipes}>
        {recipesToDisplay.length !== 0 &&
          recipesToDisplay.map((recipe, i) => (
            <RecipeCard key={i} recipe={recipe} onClick={() => null} />
          ))}
      </div>
    </div>
  );
};

export default RecipeCategory;
