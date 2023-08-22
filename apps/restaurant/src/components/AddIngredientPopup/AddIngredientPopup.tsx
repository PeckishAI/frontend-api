import { Button, Input } from 'shared-ui';
import './style.scss';
import { useEffect, useState } from 'react';
import {
  Ingredient,
  Recipe,
  inventoryService,
  recipesService,
} from '../../services';

import FuseInput from '../FuseInput/FuseInput';
import { useRestaurantStore } from '../../store/useRestaurantStore';

type Props = {
  recipe: Recipe | null;
  togglePopup: () => void;
  onAddIngredient: () => void;
};

const fuseOptions = {
  keys: ['name'],
};

const AddIngredientPopup = (props: Props) => {
  const [nameValue, setNameValue] = useState<string>('');
  const [quantityValue, setQuantityValue] = useState<string>('');
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [selectedIngredient, setSelectedIngredient] = useState<
    Ingredient | undefined
  >();
  const selectedRestaurantUUID = useRestaurantStore(
    (state) => state.selectedRestaurantUUID
  );

  useEffect(() => {
    if (!selectedRestaurantUUID) return;
    inventoryService.getIngredientList(selectedRestaurantUUID).then((res) => {
      const convertedData = Object.keys(res.data).map((key) => ({
        id: key,
        theoriticalStock: 0, // Tempoprary till API implementation
        ...res.data[key],
      }));
      setIngredients(convertedData);
    });
  }, []);

  const handleNameChange = (value: string) => {
    setNameValue(value);
  };
  const handleQuantityChange = (value: string) => {
    setQuantityValue(value);
  };

  const validateFields = () => {
    if (!nameValue) {
      setFieldError('Name field is required.');
      return false;
    }

    if (!selectedIngredient?.id) {
      setFieldError('Select existing ingredient.');
      return false;
    }

    if (quantityValue === undefined || !quantityValue) {
      setFieldError('Quantity field is required.');
      return false;
    }

    if (parseFloat(quantityValue) < 0) {
      setFieldError('Quantity must be greater than or equal to 0.');
      return false;
    }

    setFieldError('');
    return true;
  };

  const handleAdd = () => {
    if (!selectedRestaurantUUID) return;
    const valid = validateFields();
    if (valid && selectedIngredient?.id) {
      const ingredient = {
        ingredient_name: nameValue,
        quantity: quantityValue,
        ingredient_uuid: '',
        unit: '',
      };
      ingredient.ingredient_uuid = selectedIngredient.id;
      ingredient.unit = selectedIngredient.unit;

      recipesService
        .addIngredient(selectedRestaurantUUID, props.recipe?.id, ingredient)
        .catch((err) => {
          console.log(err);
        })
        .finally(() => {
          props.onAddIngredient();
        });
    }
  };

  return (
    <div className="add-ingredient-popup">
      <div className="overlay" onClick={props.togglePopup}></div>
      <div className="popup">
        <span className="title">
          Add ingredient to <span id="recipeName">{props.recipe?.name}</span>
        </span>
        <div className="form">
          <div className="field">
            <span>Name</span>
            <FuseInput
              itemList={ingredients}
              fuseOptions={fuseOptions}
              placeholder="Ex : Salad"
              width="100%"
              extractKey="name"
              value={nameValue}
              onSelectItem={(item) => setSelectedIngredient(item)}
              onChange={(value) => {
                setSelectedIngredient(undefined);
                handleNameChange(value);
              }}
            />
          </div>
          <div className="grouped-filed">
            <div className="field">
              <span>Quantity</span>
              <div className="quantity-unit">
                <Input
                  type="number"
                  value={quantityValue}
                  placeholder="Ex : 180"
                  min={0}
                  width="100%"
                  onChange={(value) => handleQuantityChange(value)}
                />
                <span id="unit">
                  {selectedIngredient ? selectedIngredient.unit : ''}
                </span>
              </div>
            </div>
          </div>
          <span
            className="text-error"
            style={fieldError ? { opacity: 1 } : { opacity: 0 }}>
            {fieldError}
          </span>
        </div>
        <div className="buttons-container">
          <Button type="secondary" value="Cancel" onClick={props.togglePopup} />
          <Button type="primary" value="Add" onClick={handleAdd} />
        </div>
      </div>
    </div>
  );
};

export default AddIngredientPopup;
