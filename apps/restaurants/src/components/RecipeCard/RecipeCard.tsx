import { useState } from 'react';
import { IngredientForRecipe } from '../../_services';
import './style.scss';
import { Button } from 'shared-ui';

type Props = {
  name: string;
  cost: number;
  currency: string;
  ingredientList: IngredientForRecipe[];
  onEditClick?: () => void;
  onAddIngredientClick: () => void;
};

const RecipeCard = (props: Props) => {
  const [unfolding, setUnfolding] = useState(false);
  const [editingRowId, setEditingRowId] = useState<string | null>();
  const [editedValues, setEditedValues] = useState<Ingredient | null>(null);

  const toogleUnfolding = () => {
    setUnfolding(!unfolding);
  };

  // const handleEditClick = (row: Ingredient) => {
  //   setEditingRowId(row.id);
  //   setEditedValues({ ...row });
  // };

  return (
    <div className="recipe-card">
      <div className="banner" onClick={toogleUnfolding}>
        <span id="name">{props.name}</span>
        <span id="cost">
          {props.cost}
          {` `}
          {props.currency}
        </span>
        {unfolding ? (
          <i className="fa-solid fa-chevron-up"></i>
        ) : (
          <i className="fa-solid fa-chevron-down"></i>
        )}
      </div>
      <div className={`ingredients-container${unfolding ? ' unfolding' : ''}`}>
        <div className="ingredients">
          <div className="list">
            <div className="item header">
              <span>Name</span>
              <span>Quantity</span>
              <span>Unit</span>
            </div>
            {props.ingredientList.map((ingredient, index) => (
              <div className="item" key={`row-${index}`}>
                <span key={`name-${index}`}>{ingredient.ingredient_name}</span>
                <span key={`quantity-${index}`}>{ingredient.quantity}</span>
                <span key={`unit-${index}`}>{ingredient.unit}</span>
              </div>
            ))}
          </div>
          <div className="butttons-container">
            {/* {props.ingredientList.length !== 0 && ( */}
            <Button
              type="secondary"
              icon={<i className="fa-solid fa-edit"></i>}
              value="Edit recipe"
              onClick={props.onEditClick}
            />
            {/* )} */}

            <Button
              type="primary"
              icon={<i className="fa-solid fa-plus"></i>}
              value="Add ingredient"
              onClick={props.onAddIngredientClick}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeCard;
