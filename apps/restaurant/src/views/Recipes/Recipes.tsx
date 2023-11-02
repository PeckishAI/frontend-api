import { Lottie, useTitle } from 'shared-ui';
import React, { useEffect, useState } from 'react';
import { recipesService, Recipe } from '../../services';
import { useRestaurantStore } from '../../store/useRestaurantStore';
import { useTranslation } from 'react-i18next';
import RecipeCategory from './Components/RecipeCategory/RecipeCategory';
import { Tooltip } from 'react-tooltip';
import EditRecipePanel from './Components/EditRecipePanel';

export type RecipeCat = {
  label: string;
  value: string;
  icon: React.ReactElement;
};

const Recipes = () => {
  const { t } = useTranslation();
  useTitle(t('pages.recipes'));

  const recipeCategories: RecipeCat[] = [
    {
      label: 'Drinks', // add translation
      value: 'drinks',
      icon: <i className="fa-solid fa-martini-glass"></i>,
    },
    {
      label: 'Starters', // add translation
      value: 'starters',
      icon: <i className="fa-solid fa-bowl-food"></i>,
    },
    {
      label: 'Main Courses', // add translation
      value: 'main_course',
      icon: <i className="fa-solid fa-bell-concierge"></i>,
    },
    {
      label: 'Desserts', // add translation
      value: 'desserts',
      icon: <i className="fa-solid fa-ice-cream"></i>,
    },
    {
      label: 'Snacks', // add translation
      value: 'snacks',
      icon: <i className="fa-solid fa-cookie-bite"></i>,
    },
    {
      label: 'Others', // add translation
      value: 'others',
      icon: <i className="fa-solid fa-bone"></i>,
    },
  ];
  const [recipesByCategory, setRecipesByCategory] = useState<{
    [category: string]: Recipe[];
  }>({});
  const [loadingData, setLoadingData] = useState(false);
  const [editRecipe, setEditRecipe] = useState<Recipe | null>(null);

  const selectedRestaurantUUID = useRestaurantStore(
    (state) => state.selectedRestaurantUUID
  );

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

  return (
    <div className="recipes">
      {Object.keys(recipesByCategory).map((category, i) => (
        <RecipeCategory
          key={i}
          category={recipeCategories.find((c) => c.value === category)}
          recipes={recipesByCategory[category]}
          reloadRecipesRequest={() => reloadRecipes()}
          onClickRecipe={(recipe) => {
            setEditRecipe(recipe);
          }}
        />
      ))}
      {loadingData && (
        <div className="loading-container">
          <Lottie type="loading" width="200px" />
        </div>
      )}
      <Tooltip className="tooltip" id="recipeCard-tooltip" />

      <EditRecipePanel
        isOpen={editRecipe !== null}
        onClose={() => setEditRecipe(null)}
        recipe={editRecipe}
      />
    </div>
  );
};

export default Recipes;
