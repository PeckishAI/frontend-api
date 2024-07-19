import React, { useEffect, useState } from 'react';
import { Button, Input, LoadingAbsolute, useTitle, Tabs } from 'shared-ui';
import { useTranslation } from 'react-i18next';
import { useRestaurantStore } from '../../store/useRestaurantStore';
import { recipesService, Recipe } from '../../services';
import RecipeDetail from '../../components/RecipeDetail/RecipeDetail';
import AddPreparationPopup from '../Recipes/AddPreparationPopup';
import { useNavigate, useParams } from 'react-router-dom';
import RecipeCategory from './Components/RecipeCategory/RecipeCategory';
import { TFunction } from 'i18next';
import styles from './styles.module.scss';

type RouteParams = {
  tab: 'recipes' | 'preparations' | 'modifiers';
};

const getTabIndex = (tab?: string) => {
  if (tab === 'recipes') return 0;
  if (tab === 'preparations') return 1;
  if (tab === 'modifiers') return 2;
  return 0;
};

const getTabName = (tabIndex: number) => {
  if (tabIndex === 0) return 'recipe';
  if (tabIndex === 1) return 'preparations';
  if (tabIndex === 2) return 'modifiers';
  return 'recipe';
};

export const getRecipeCategories = (t: TFunction<['common'], undefined>) => [
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
    label: t('recipesCategories.modifiers'),
    value: 'modifiers',
    icon: <i className="fa-solid fa-ice-cream"></i>,
  },
  {
    label: t('recipesCategories.snacks'),
    value: 'snacks',
    icon: <i className="fa-solid fa-cookie-bite"></i>,
  },
  {
    label: t('recipesCategories.preparations'),
    value: 'preparations',
    icon: <i className="fa-solid fa-martini-glass"></i>,
  },
  {
    label: t('recipesCategories.others'),
    value: 'others',
    icon: <i className="fa-solid fa-bone"></i>,
  },
];

export const getRecipeCategorie = (t: TFunction<['common'], undefined>) => [
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
    label: t('recipesCategories.preparations'),
    value: 'preparations',
    icon: <i className="fa-solid fa-martini-glass"></i>,
  },
  {
    label: t('recipesCategories.others'),
    value: 'others',
    icon: <i className="fa-solid fa-bone"></i>,
  },
];

const RecipeNew = () => {
  const { t } = useTranslation();
  useTitle(t('pages.recipes'));

  const { tab } = useParams<RouteParams>();
  const navigate = useNavigate();

  const selectedRestaurantUUID = useRestaurantStore(
    (state) => state.selectedRestaurantUUID
  );

  const TABS = [
    t('pages.recipes'),
    t('pages.preparations'),
    t('pages.modifiers'),
  ];

  const [selectedTab, setSelectedTab] = useState(0);
  const [recipeResearch, setRecipeResearch] = useState('');
  const [loadingData, setLoadingData] = useState(false);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [recipeDetail, setRecipeDetail] = useState<Recipe | null>(null);
  const [showAddPopup, setShowAddPopup] = useState(false);

  const reloadRecipes = (tabName: string) => {
    if (!selectedRestaurantUUID) return;
    setLoadingData(true);
    recipesService
      .getRecipes(selectedRestaurantUUID, tabName)
      .then((res) => {
        setRecipes(res);
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        setLoadingData(false);
      });
  };

  useEffect(() => {
    const tabName = getTabName(selectedTab);
    setSelectedTab(getTabIndex(tab));
    reloadRecipes(tabName);
  }, [selectedRestaurantUUID, tab, selectedTab]);

  const filteredRecipes = recipes.filter((recipe) =>
    recipe.name.toLowerCase().includes(recipeResearch.toLowerCase())
  );

  const handleRecipeClick = (recipe: Recipe) => {
    setRecipeDetail(recipe);
  };

  const handleRecipeUpdated = (recipe: Recipe) => {
    setRecipes(recipes.map((r) => (r.uuid === recipe.uuid ? recipe : r)));
    setRecipeDetail(recipe);
    reloadRecipes(getTabName(selectedTab));
  };

  const handleRecipeDeleted = (recipe: Recipe) => {
    setRecipes(recipes.filter((r) => r.uuid !== recipe.uuid));
    setRecipeDetail(null);
  };

  const renderSelectedTab = () => {
    if (selectedTab === 0) {
      return (
        <>
          {getRecipeCategories(t).map((category, i) => (
            <RecipeCategory
              key={i}
              category={category}
              recipes={filteredRecipes.filter(
                (recipe) =>
                  recipe.category === category.value &&
                  recipe.category !== 'preparations' &&
                  recipe.category !== 'modifiers'
              )}
              onClickRecipe={handleRecipeClick}
              reloadRecipesRequest={() => reloadRecipes('recipes')}
            />
          ))}
        </>
      );
    }
    if (selectedTab === 1) {
      return (
        <>
          {getRecipeCategories(t).map((category, i) => (
            <RecipeCategory
              key={i}
              category={category}
              recipes={filteredRecipes.filter(
                (recipe) =>
                  recipe.category === category.value &&
                  recipe.category === 'preparations'
              )}
              onClickRecipe={handleRecipeClick}
              reloadRecipesRequest={() => reloadRecipes('preparations')}
            />
          ))}
        </>
      );
    }
    if (selectedTab === 2) {
      return (
        <>
          {getRecipeCategories(t).map((category, i) => (
            <RecipeCategory
              key={i}
              category={category}
              recipes={filteredRecipes.filter(
                (recipe) =>
                  recipe.category === category.value &&
                  recipe.category === 'modifiers'
              )}
              onClickRecipe={handleRecipeClick}
              reloadRecipesRequest={() => reloadRecipes('modifiers')}
            />
          ))}
        </>
      );
    }
    return null;
  };

  return (
    <div className={styles.recipes}>
      <div className={styles.search}>
        {selectedTab == 1 && (
          <Button
            value={t('recipes.addPreparation.addPreparationBtn')}
            type="primary"
            className={styles.button}
            onClick={() => setShowAddPopup(true)}
          />
        )}
        <Input
          type="text"
          placeholder={t('search')}
          value={recipeResearch}
          onChange={(value) => setRecipeResearch(value)}
          className={styles.searchRecipe}
        />
      </div>

      <Tabs
        tabs={TABS}
        onClick={(tabIndex) => {
          const tabName = getTabName(tabIndex);
          navigate({
            pathname: `/recipes/${tabName}`,
          });
          setSelectedTab(tabIndex);
        }}
        selectedIndex={selectedTab}
      />

      {renderSelectedTab()}

      {loadingData && (
        <div className="loading-container">
          <LoadingAbsolute />
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
      {selectedTab == 1 && (
        <AddPreparationPopup
          isVisible={showAddPopup}
          onRequestClose={() => setShowAddPopup(false)}
          onRecipeChanged={(recipe, action) => {
            if (action === 'deleted') {
              handleRecipeDeleted(recipe);
            } else if (action === 'updated') {
              handleRecipeUpdated(recipe);
            }
          }}
          onReload={() => reloadRecipes(getTabName(selectedTab))}
        />
      )}
    </div>
  );
};

export default RecipeNew;
