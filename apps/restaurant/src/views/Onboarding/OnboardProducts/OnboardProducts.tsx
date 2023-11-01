import { useEffect, useState } from 'react';
import styles from './OnboardProducts.module.scss';
import { AnimatePresence, motion } from 'framer-motion';
import { LabeledInput, Loading, useDebounceMemo } from 'shared-ui';
import { useRestaurantStore } from '../../../store/useRestaurantStore';
import { ProductPrediction, onboardingService } from '../../../services';
import Fuse from 'fuse.js';
import { FaCheck, FaSearch } from 'react-icons/fa';
import classNames from 'classnames';
import StepButtons from '../components/StepButtons/StepButtons';
import { useNavigate } from 'react-router-dom';

type IRecipe = ProductPrediction & { selected: boolean };

const sortBySelected = (recipes: IRecipe[]) => {
  recipes.sort((a, b) => {
    if (a.selected && !b.selected) return -1;
    if (!a.selected && b.selected) return 1;
    return 0;
  });
};

type Props = {
  goNextStep: () => void;
};

const OnboardProducts = (props: Props) => {
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [recipes, setRecipes] = useState<IRecipe[]>([]);
  const [loading, setLoading] = useState(true);

  const selectedRestaurantUUID = useRestaurantStore(
    (state) => state.selectedRestaurantUUID
  )!;

  useEffect(() => {
    if (!selectedRestaurantUUID) return;
    setLoading(true);

    onboardingService
      .getProductsPrediction(selectedRestaurantUUID)
      .then((res) => {
        const recipes = res.map((recipe) => {
          return {
            ...recipe,
            selected: recipe.is_product,
          };
        });

        //  order alphabetically
        recipes.sort((a, b) => {
          if (a.name < b.name) return -1;
          if (a.name < b.name) return 1;
          return 0;
        });

        sortBySelected(recipes);

        setRecipes(recipes);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [selectedRestaurantUUID]);

  const handleSelectProduct = (recipe: IRecipe) => {
    const newRecipes = [...recipes];
    newRecipes.find((ing) => ing.uuid === recipe.uuid)!.selected =
      !recipe.selected;
    setRecipes(newRecipes);

    // Wait 500ms before reordering
    setTimeout(() => {
      const sortedRecipes = [...newRecipes];
      sortBySelected(sortedRecipes);
      setRecipes(sortedRecipes);

      // Trick to fix scroll position
      const scrollY = window.scrollY;
      const resetInterval = (deep?: number) => {
        if (deep && deep > 50) return;
        setTimeout(() => {
          window.scrollTo(0, scrollY);

          resetInterval((deep ?? 0) + 1);
        }, 0);
      };

      resetInterval();
    }, 500);
  };

  const filteredRecipes = useDebounceMemo(
    () => {
      if (search.length <= 1) return recipes;
      console.log('kk');

      const options: Fuse.IFuseOptions<IRecipe> = {
        threshold: 0.2,
        keys: ['name'],
      };

      const fuse = new Fuse(recipes, options);
      const result = fuse.search(search);
      const filteredRecipes = result.map((recipe) => recipe.item);

      sortBySelected(filteredRecipes);

      return filteredRecipes;
    },
    150,
    [search, recipes]
  );

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
          {search.length > 0 &&
            recipes.length > 0 &&
            filteredRecipes.length === 0 && (
              <motion.p
                className={styles.emptyText}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}>
                Aucune recette ne correspond à votre recherche
              </motion.p>
            )}

          {filteredRecipes.map((recipe) => {
            return (
              <RecipeCard
                key={recipe.uuid}
                onClick={handleSelectProduct}
                recipe={recipe}
              />
            );
          })}
        </AnimatePresence>
      </div>

      <StepButtons
        onContinueLater={() => {
          const productUUIDs = recipes
            .filter((recipe) => recipe.selected)
            .map((recipe) => recipe.uuid);
          onboardingService
            .saveProducts(selectedRestaurantUUID, productUUIDs, false)
            .then(() => {
              navigate('/');
            });
        }}
        onValidate={() => {
          onboardingService
            .saveProducts(
              selectedRestaurantUUID,
              recipes
                .filter((recipe) => recipe.selected)
                .map((recipe) => recipe.uuid),
              true
            )
            .then(() => {
              props.goNextStep();
            });
        }}
      />
    </>
  );
};

type RecipeCardProps = {
  recipe: IRecipe;
  onClick: (recipe: IRecipe) => void;
};

const RecipeCard = (props: RecipeCardProps) => {
  return (
    <motion.div
      key={props.recipe.uuid}
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
