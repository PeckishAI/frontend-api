import { useEffect, useState } from 'react';
import { Recipe, recipesService } from '../../../services';
import RecipeCard from '../../Recipes/Components/RecipeCard/RecipeCard';
import styles from './OnboardPreparations.module.scss';
import { Button, LoadingAbsolute } from 'shared-ui';
import { FaPlus } from 'react-icons/fa';
import RecipeFormPanel from '../../Recipes/Components/RecipeFormPanel/RecipeFormPanel';
import { useRestaurantStore } from '../../../store/useRestaurantStore';
import RecipeDetail from '../../Recipes/Components/RecipeDetail/RecipeDetail';

export const OnboardPreparations = () => {
  const [addPreparationModalIsOpen, setAddPreparationModalIsOpen] =
    useState(false);
  const [preparationDetail, setPreparationDetail] = useState<Recipe | null>(
    null
  );
  const [preparations, setPreparations] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);

  const selectedRestaurantUUID = useRestaurantStore(
    (state) => state.selectedRestaurantUUID
  )!;

  useEffect(() => {
    if (!selectedRestaurantUUID) return;
    setLoading(true);
    recipesService
      .getRecipes(selectedRestaurantUUID, 'preparation')
      .then((preparations) => {
        setPreparations(preparations);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [selectedRestaurantUUID]);

  const addPreparation = (preparation: Recipe) => {
    setPreparations([...preparations, preparation]);
  };

  // Handle recipe update or delete locally
  const handleRecipeChanged = (
    recipe: Recipe,
    action: 'deleted' | 'updated'
  ) => {
    if (action === 'deleted') {
      setPreparations(
        preparations.filter((preparation) => preparation.uuid !== recipe.uuid)
      );
      setPreparationDetail(null);
    } else if (action === 'updated') {
      setPreparationDetail(recipe);
      setPreparations(
        preparations.map((preparation) =>
          preparation.uuid === recipe.uuid ? recipe : preparation
        )
      );
    }
  };

  return (
    <div>
      <p className={styles.description}>
        Si vous utilisez des préparations communes à plusieurs recettes, vous
        pouvez les créer ici. Elles pourront ensuite être utilisées dans vos
        recettes afin de simplifier leur création.
      </p>

      {loading && <LoadingAbsolute />}

      <div className={styles.cardGrid}>
        {preparations.map((preparation) => (
          <RecipeCard
            key={preparation.uuid}
            recipe={preparation}
            onClick={() => setPreparationDetail(preparation)}
          />
        ))}

        <div className={styles.addButtonWrapper}>
          <Button
            value="Ajouter une préparation"
            type="primary"
            icon={<FaPlus />}
            onClick={() => setAddPreparationModalIsOpen(true)}
          />
        </div>
      </div>

      <RecipeDetail
        isOpen={!!preparationDetail}
        recipe={preparationDetail}
        onRecipeChanged={handleRecipeChanged}
        onRequestClose={() => setPreparationDetail(null)}
      />

      <RecipeFormPanel
        action="create"
        type="preparation"
        isOpen={addPreparationModalIsOpen}
        onRequestClose={() => setAddPreparationModalIsOpen(false)}
        onSubmitted={(preparation) => {
          setAddPreparationModalIsOpen(false);
          addPreparation(preparation);
        }}
      />
    </div>
  );
};
