import { useTranslation } from 'react-i18next';
import { Lottie, Popup } from 'shared-ui';
import RecipeCard from '../components/RecipeCard/RecipeCard';
import AddIngredientPopup from '../components/AddIngredientPopup/AddIngredientPopup';
import { useEffect, useState } from 'react';
import { recipesService, Recipe } from '../services';
import EditIngredientPopup from '../components/EditIngredientPopup/EditIngredientPopup';

type Props = {};

const Recipes = (props: Props) => {
  const [recipesList, setRecipesList] = useState<Recipe[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [reveleAddIngredientPopup, setReveleAddIngredientPopup] =
    useState(false);
  const [reveleEditIngredientPopup, setReveleEditIngredientPopup] =
    useState(false);
  const [editingRecipeIndex, setEditingRecipeIndex] = useState<number>(0);
  const [popupDelete, setPopupDelete] = useState(false);

  function reloadRecipes() {
    setLoadingData(true);
    recipesService
      .getRecipes()
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
  }, []);

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

  // const handleDeleteEditRecipeClick = () => {
  //   setPopupDelete(true);
  // };

  // const handleValideEditRecipeClick = () => {
  //   toggleEditIngredientPopup();
  //   reloadRecipes();
  // };

  // // Handle for warning popup
  // const handleOnConfirmDeleteRecipe = () => {
  //   // request api to delete recipe
  //   togglePopupDelete();
  //   toggleEditIngredientPopup();
  //   reloadRecipes();
  // };

  // const togglePopupDelete = () => {
  //   setPopupDelete(!popupDelete);
  // };

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
          // onCancelClick={toggleEditIngredientPopup}
          // onDeleteClick={handleDeleteEditRecipeClick}
          // onValideClick={handleValideEditRecipeClick}
          onClose={handleOnCloseEditIngredientPopup}
        />
      )}
      {/* <Popup
        type="warning"
        msg="Are you sure you want to delete it ?"
        onConfirm={handleOnConfirmDeleteRecipe}
        revele={popupDelete}
        togglePopup={togglePopupDelete}
      /> */}
    </div>
  );
};

export default Recipes;
