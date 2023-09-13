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
import { useTranslation } from 'react-i18next';

type Props = {
  recipe: Recipe | null;
  togglePopup: () => void;
  onAddIngredient: () => void;
};

const fuseOptions = {
  keys: ['name'],
};

const AddIngredientPopup = (props: Props) => {
  const { t } = useTranslation('common');

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
    inventoryService
      .getIngredientList(selectedRestaurantUUID)
      .then((ingredients) => {
        setIngredients(ingredients);
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
      setFieldError(t('field.error.name'));
      return false;
    }

    if (!selectedIngredient?.id) {
      setFieldError(t('field.error.doesntExist'));
      return false;
    }

    if (quantityValue === undefined || !quantityValue) {
      setFieldError(t('field.error.quantity'));
      return false;
    }

    if (parseFloat(quantityValue) < 0) {
      setFieldError(t('field.error.quantityNegative'));
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
          {t('addIngredientTo')}{' '}
          <span id="recipeName">{props.recipe?.name}</span>
        </span>
        <div className="form">
          <div className="field">
            <span>{t('name')}</span>
            <FuseInput
              itemList={ingredients}
              fuseOptions={fuseOptions}
              placeholder={t('placeholder.ingredientName')}
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
              <span>{t('quantity')}</span>
              <div className="quantity-unit">
                <Input
                  type="number"
                  value={quantityValue}
                  placeholder={t('placeholder.ingredientQuantity')}
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
          <Button
            type="secondary"
            value={t('cancel')}
            onClick={props.togglePopup}
          />
          <Button type="primary" value={t('add')} onClick={handleAdd} />
        </div>
      </div>
    </div>
  );
};

export default AddIngredientPopup;
