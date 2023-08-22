import { Lottie } from 'shared-ui';
import RecipeCard from '../components/RecipeCard/RecipeCard';
import AddIngredientPopup from '../components/AddIngredientPopup/AddIngredientPopup';
import { useEffect, useState } from 'react';
import { recipesService, Recipe } from '../services';
import EditIngredientPopup from '../components/EditIngredientPopup/EditIngredientPopup';
import { useRestaurantStore } from '../store/useRestaurantStore';

type Props = {};

const Recipes = (props: Props) => {
  const [recipesList, setRecipesList] = useState<Recipe[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [reveleAddIngredientPopup, setReveleAddIngredientPopup] =
    useState(false);
  const [reveleEditIngredientPopup, setReveleEditIngredientPopup] =
    useState(false);
  const [editingRecipeIndex, setEditingRecipeIndex] = useState<number>(0);

  const selectedRestaurantUUID = useRestaurantStore(
    (state) => state.selectedRestaurantUUID
  );

  function reloadRecipes() {
    if (!selectedRestaurantUUID) return;
    setLoadingData(true);
    recipesService
      .getRecipes(selectedRestaurantUUID)
      .then((res) => {
        setRecipesList(res);
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

  // Handle for Add ingredient popup
  const toggleAddIngredientPopup = () => {
    setReveleAddIngredientPopup(!reveleAddIngredientPopup);
  };

  const handleAddIngredientClick = (index: number) => {
    setEditingRecipeIndex(index);
    setReveleAddIngredientPopup(true);
  };

  const handleValideAddIngredientClick = () => {
    toggleAddIngredientPopup();
    reloadRecipes();
  };

  // Handle for Edit ingredient popup

  const toggleEditIngredientPopup = () => {
    setReveleEditIngredientPopup(!reveleEditIngredientPopup);
  };

  const handleEditRecipeClick = (index: number) => {
    setEditingRecipeIndex(index);
    setReveleEditIngredientPopup(true);
  };

  const handleOnCloseEditIngredientPopup = () => {
    toggleEditIngredientPopup();
    reloadRecipes();
  };

  return (
    <div className="recipes">
      {recipesList.map((recipe, i) => (
        <RecipeCard
          key={recipe.id}
          name={recipe.name}
          cost={recipe.price}
          currency={recipe.currency}
          ingredientList={recipe.ingredients}
          onAddIngredientClick={() => handleAddIngredientClick(i)}
          onEditClick={() => handleEditRecipeClick(i)}
        />
      ))}
      {loadingData && (
        <div className="loading-middle-page-overlay">
          <div className="loading-container">
            <Lottie type="loading" width="200px" />
          </div>
        </div>
      )}
      {reveleAddIngredientPopup && (
        <AddIngredientPopup
          togglePopup={toggleAddIngredientPopup}
          onAddIngredient={handleValideAddIngredientClick}
          recipe={recipesList[editingRecipeIndex]}
        />
      )}
      {reveleEditIngredientPopup && (
        <EditIngredientPopup
          recipe={recipesList[editingRecipeIndex]}
          togglePopup={toggleEditIngredientPopup}
          onClose={handleOnCloseEditIngredientPopup}
        />
      )}
    </div>
  );
};

export default Recipes;
