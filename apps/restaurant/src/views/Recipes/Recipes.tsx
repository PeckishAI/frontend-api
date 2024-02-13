import { LoadingAbsolute, useTitle } from 'shared-ui';
import React, { useEffect, useState } from 'react';
import {
  recipesService,
  Recipe,
  RecipeCategory as RecipeCategoryType,
} from '../../services';
import { useRestaurantStore } from '../../store/useRestaurantStore';
import { useTranslation } from 'react-i18next';
import RecipeCategory from './Components/RecipeCategory/RecipeCategory';
import { Tooltip } from 'react-tooltip';
import RecipeDetail from '../../components/RecipeDetail/RecipeDetail';
import { TFunction } from 'i18next';

export type RecipeCat = {
  label: string;
  value: RecipeCategoryType;
  icon: React.ReactElement;
};

export const getRecipeCategories = (
  t: TFunction<['common'], undefined>
): RecipeCat[] => [
  {
    label: t('recipesCategories.drinks'),
    value: 'drinks',
    icon: <i className="fa-solid fa-martini-glass"></i>,
  },
  {
    label: t('recipesCategories.starters'),
    value: 'starters',
    icon: <i className="fa-solid fa-bowl-food"></i>,
  },
  {
    label: t('recipesCategories.mainCourses'),
    value: 'mainCourses',
    icon: <i className="fa-solid fa-bell-concierge"></i>,
  },
  {
    label: t('recipesCategories.desserts'),
    value: 'desserts',
    icon: <i className="fa-solid fa-ice-cream"></i>,
  },
  {
    label: t('recipesCategories.snacks'),
    value: 'snacks',
    icon: <i className="fa-solid fa-cookie-bite"></i>,
  },
  {
    label: t('recipesCategories.others'),
    value: 'others',
    icon: <i className="fa-solid fa-bone"></i>,
  },
];

const Recipes = () => {
  const { t } = useTranslation();
  useTitle(t('pages.recipes'));

  const selectedRestaurantUUID = useRestaurantStore(
    (state) => state.selectedRestaurantUUID
  );

  const [loadingData, setLoadingData] = useState(false);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [recipeDetail, setRecipeDetail] = useState<Recipe | null>(null);

  function reloadRecipes() {
    if (!selectedRestaurantUUID) return;
    setLoadingData(true);
    recipesService
      .getRecipes(selectedRestaurantUUID)
      .then((res) => {
        setRecipes(res);
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        setLoadingData(false);
      });
  }

  useEffect(() => {
    reloadRecipes();
  }, [selectedRestaurantUUID]);

  const handleRecipeClick = (recipe: Recipe) => {
    setRecipeDetail(recipe);
  };

  const handleRecipeUpdated = (recipe: Recipe) => {
    setRecipes(recipes.map((r) => (r.uuid === recipe.uuid ? recipe : r)));
    setRecipeDetail(recipe);
  };

  const handleRecipeDeleted = (recipe: Recipe) => {
    setRecipes(recipes.filter((r) => r.uuid !== recipe.uuid));
    setRecipeDetail(null);
  };

  return (
    <div className="recipes">
      {getRecipeCategories(t).map((category, i) => (
        <RecipeCategory
          key={i}
          category={category}
          recipes={recipes.filter(
            (recipe) => recipe.category === category.value
          )}
          onClickRecipe={handleRecipeClick}
          reloadRecipesRequest={() => reloadRecipes()}
        />
      ))}

      {loadingData && (
        <div className="loading-container">
          <LoadingAbsolute />
          {/* <Lottie type="loading" width="200px" /> */}
        </div>
      )}

      <RecipeDetail
        recipe={recipeDetail}
        isOpen={recipeDetail !== null}
        onRequestClose={() => setRecipeDetail(null)}
        onRecipeChanged={(recipe, action) => {
          if (action === 'deleted') {
            handleRecipeDeleted(recipe);
          } else if (action === 'updated') {
            handleRecipeUpdated(recipe);
          }
        }}
      />

      <Tooltip className="tooltip" id="recipeCard-tooltip" />
    </div>
  );
};

export default Recipes;
