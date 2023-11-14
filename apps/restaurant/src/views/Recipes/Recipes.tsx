import { Lottie, useTitle } from 'shared-ui';
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
import RecipeDetail from './Components/RecipeDetail/RecipeDetail';

export type RecipeCat = {
  label: string;
  value: RecipeCategoryType;
  icon: React.ReactElement;
};

const Recipes = () => {
  const { t } = useTranslation();
  useTitle(t('pages.recipes'));

  const recipeCategories: RecipeCat[] = [
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

  const selectedRestaurantUUID = useRestaurantStore(
    (state) => state.selectedRestaurantUUID
  );

  const [loadingData, setLoadingData] = useState(false);
  const [recipesByCategory, setRecipesByCategory] = useState<{
    [category: string]: Recipe[];
  }>({});
  const [recipeDetail, setRecipeDetail] = useState<Recipe | null>(null);

  function reloadRecipes() {
    if (!selectedRestaurantUUID) return;
    setLoadingData(true);
    recipesService
      .getRecipes(selectedRestaurantUUID)
      .then((res) => {
        // group by category
        const recipesByCategory = res.reduce(
          (acc, recipe) => {
            const { category } = recipe;

            if (!acc[category]) {
              acc[category] = [];
            }
            acc[category].push(recipe);

            return acc;
          },
          {} as { [category: string]: Recipe[] }
        );

        setRecipesByCategory(recipesByCategory);
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

  return (
    <div className="recipes">
      {Object.keys(recipesByCategory).map((category, i) => (
        <RecipeCategory
          key={i}
          category={recipeCategories.find((c) => c.value === category)}
          recipes={recipesByCategory[category]}
          onClickRecipe={handleRecipeClick}
          reloadRecipesRequest={() => reloadRecipes()}
        />
      ))}
      {loadingData && (
        <div className="loading-container">
          <Lottie type="loading" width="200px" />
        </div>
      )}

      <RecipeDetail
        recipe={recipeDetail}
        isOpen={recipeDetail !== null}
        onRequestClose={() => setRecipeDetail(null)}
        onRecipeChanged={(recipe) => {
          // find and update the recipe in the recipesByCategory
          const category = recipe.category;
          const categoryRecipes = recipesByCategory[category];
          const recipeIndex = categoryRecipes.findIndex(
            (r) => r.uuid === recipe.uuid
          );

          setRecipesByCategory({
            ...recipesByCategory,
            [category]: [
              ...categoryRecipes.slice(0, recipeIndex),
              recipe,
              ...categoryRecipes.slice(recipeIndex + 1),
            ],
          });
          setRecipeDetail(recipe);
        }}
      />

      <Tooltip className="tooltip" id="recipeCard-tooltip" />
    </div>
  );
};

export default Recipes;
