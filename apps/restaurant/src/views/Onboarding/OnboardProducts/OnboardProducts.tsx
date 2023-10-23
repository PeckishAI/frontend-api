import React, { useEffect, useState } from 'react';
import styles from './OnboardProducts.module.scss';
import { AnimatePresence, motion, useAnimation } from 'framer-motion';
import { LabeledInput, Loading, useDebounceMemo } from 'shared-ui';
import { useRestaurantStore } from '../../../store/useRestaurantStore';
import { Recipe, recipesService } from '../../../services';
import Fuse from 'fuse.js';
import { FaCheck, FaSearch } from 'react-icons/fa';
import classNames from 'classnames';

type IRecipe = Recipe & { selected: boolean };

const spring = {
  type: 'spring',
  stiffness: 200,
  damping: 30,
};

const sortBySelected = (recipes: IRecipe[]) => {
  recipes.sort((a, b) => {
    if (a.selected && !b.selected) return -1;
    if (!a.selected && b.selected) return 1;
    return 0;
  });
};

const OnboardProducts = () => {
  const [search, setSearch] = useState('');
  const [recipes, setRecipes] = useState<IRecipe[]>([]);
  const [loading, setLoading] = useState(true);

  const selectedRestaurantUUID = useRestaurantStore(
    (state) => state.selectedRestaurantUUID
  );

  useEffect(() => {
    if (!selectedRestaurantUUID) return;
    setLoading(true);

    recipesService
      .getRecipes(selectedRestaurantUUID)
      .then((res) => {
        //  order alphabetically
        res.sort((a, b) => {
          if (a.name < b.name) return -1;
          if (a.name < b.name) return 1;
          return 0;
        });

        setRecipes(res);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [selectedRestaurantUUID]);

  const handleSelectProduct = (recipe: IRecipe) => {
    console.log('handleSelectProduct, recipe: ', recipe);

    const newRecipes = [...recipes];
    newRecipes.find((ing) => ing.id === recipe.id)!.selected = !recipe.selected;

    // sortBySelected(newRecipes);
    newRecipes.sort((a, b) => {
      if (a.selected && !b.selected) return -1;
      if (!a.selected && b.selected) return 1;
      return 0;
    });

    setRecipes(newRecipes);
  };

  // const filteredRecipes = useDebounceMemo(
  //   () => {
  //     if (search.length <= 1) return recipes;

  //     const options: Fuse.IFuseOptions<IRecipe> = {
  //       threshold: 0.2,
  //       keys: ['name'],
  //     };

  //     const fuse = new Fuse(recipes, options);
  //     const result = fuse.search(search);
  //     const filteredRecipes = result.map((recipe) => recipe.item);

  //     sortBySelected(filteredRecipes);

  //     return filteredRecipes;
  //   },
  //   150,
  //   [search, recipes]
  // );

  console.log('rerender OnboardProducts');

  if (loading) {
    return <Loading size="large" />;
  }

  return (
    <>
      <LabeledInput
        className={styles.searchInput}
        placeholder="Rechercher une recette"
        lighter
        icon={<FaSearch />}
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
        }}
      />

      <div className={styles.recipeList}>
        <AnimatePresence>
          {/* {recipes.length > 0 && recipes.length === 0 && (
            <motion.p
              className={styles.emptyText}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}>
              Aucune recette ne correspond à votre recherche
            </motion.p>
          )} */}

          {recipes.map((recipe) => {
            return (
              <RecipeCard
                key={recipe.id}
                onClick={handleSelectProduct}
                recipe={recipe}
              />
            );
          })}
        </AnimatePresence>
      </div>
    </>
  );
};

type RecipeCardProps = {
  recipe: IRecipe;
  onClick: (recipe: IRecipe) => void;
};

const RecipeCard = (props: RecipeCardProps) => {
  useAnimation();
  return (
    <motion.div
      // key={props.recipe.id}
      className={classNames(
        styles.recipeCard,
        props.recipe.selected && styles.recipeCardSelected
      )}
      layout // transition={spring}
      exit={{
        opacity: 0,
        scale: 0.6,
      }}
      onClick={() => {
        props.onClick(props.recipe);
      }}>
      {props.recipe.selected && (
        <div className={styles.checkContainer}>
          <FaCheck className={styles.checkIcon} />
        </div>
      )}

      <p className={styles.recipeName}>{props.recipe.name}</p>
    </motion.div>
  );
};

export default OnboardProducts;
