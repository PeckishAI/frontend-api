import './style.scss';
import { IngredientForRecipe, Recipe, recipesService } from '../../services';
import { Button, Input, DialogBox, Table } from 'shared-ui';
import { ColumnDefinitionType } from 'shared-ui/components/Table/Table';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { Tooltip } from 'react-tooltip';
import { useRestaurantStore } from '../../store/useRestaurantStore';

type Props = {
  recipe: Recipe | null;
  togglePopup: () => void;
  onClose: () => void;
};

const EditIngredientPopup = (props: Props) => {
  const { t } = useTranslation('common');

  const [ingredients, setIngredients] = useState<IngredientForRecipe[]>([]);
  const [selectedIngredients, setSelectedIngredients] = useState<
    IngredientForRecipe[]
  >([]);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [popupDeleteRecipe, setPopupDeleteRecipe] = useState(false);
  const [popupDeleteIngredients, setPopupDeleteIngredients] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [valideLoading, setValideLoading] = useState(false);

  const selectedRestaurantUUID = useRestaurantStore(
    (state) => state.selectedRestaurantUUID
  );

  useEffect(() => {
    if (props.recipe) {
      setIngredients(props.recipe.ingredients);
    }
  }, [props.recipe]);

  const handleCheckbox = (ingredient: IngredientForRecipe) => {
    if (
      selectedIngredients.find(
        (item) => item.ingredient_uuid === ingredient.ingredient_uuid
      )
    ) {
      setSelectedIngredients(
        selectedIngredients.filter(
          (item) => item.ingredient_uuid !== ingredient.ingredient_uuid
        )
      );
    } else {
      setSelectedIngredients([...selectedIngredients, ingredient]);
    }
  };

  const handleQuantityChange = (value: any, index: number) => {
    setIngredients((prevList) => {
      const newList = [...prevList];
      newList[index] = { ...newList[index], quantity: value };
      return newList;
    });
  };

  const handleDeleteSelectedIngredients = async () => {
    const updatedIngredients = ingredients.filter(
      (ingredient) =>
        !selectedIngredients.find(
          (item) => item.ingredient_uuid === ingredient.ingredient_uuid
        )
    );
    setIngredients(updatedIngredients);

    try {
      for (const ingredient of selectedIngredients) {
        await recipesService.deleteIngredient(
          props.recipe?.id,
          ingredient.ingredient_uuid
        );
      }
      setSelectedIngredients([]);
    } catch (error) {
      console.error('Erreur lors de la suppression des ingrédients : ', error);
    }
  };

  const handleDeleteRecipe = () => {
    setDeleteLoading(true);
    recipesService
      .deleteRecipe(props.recipe?.id)
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        setDeleteLoading(false);
        props.onClose();
      });
  };

  const handleValidate = () => {
    if (!selectedRestaurantUUID) return;
    const fieldsValid = validateFields();
    if (fieldsValid && ingredients.length !== 0) {
      setValideLoading(true);
      recipesService
        .updateRecipe(selectedRestaurantUUID, ingredients, props.recipe?.id)
        .catch((err) => {
          console.log(err);
        })
        .finally(() => {
          setValideLoading(false);
          props.onClose();
        });
    }
  };

  const validateFields = () => {
    let isValid = true;
    ingredients.forEach((ingredient) => {
      if (ingredient.quantity === undefined || !ingredient.quantity) {
        setFieldError(t('field.error.quantity'));
        isValid = false;
      }

      if (ingredient.quantity < 0) {
        setFieldError(t('field.error.quantityNegative'));

        isValid = false;
      }
    });

    if (isValid) {
      setFieldError('');
    }

    return isValid;
  };

  // Handle for warning popup on delete recipe
  const togglePopupDeleteRecipe = () => {
    setPopupDeleteRecipe(!popupDeleteRecipe);
  };
  const handleOnConfirmDeleteRecipe = () => {
    handleDeleteRecipe();
  };

  // Handle for warning popup on delete ingredients
  const togglePopupDeleteIngredients = () => {
    setPopupDeleteIngredients(!popupDeleteIngredients);
  };
  const handleOnConfirmDeleteIngredients = () => {
    handleDeleteSelectedIngredients();
    togglePopupDeleteIngredients();
  };

  const columns: ColumnDefinitionType<
    IngredientForRecipe,
    keyof IngredientForRecipe
  >[] = [
    {
      key: 'ingredient_uuid',
      header: '',
      classname: 'delete',
      width: '5%',
      renderItem: ({ row, index }) => (
        <Input
          type="checkbox"
          onChange={() => handleCheckbox(row)}
          checked={
            selectedIngredients.find(
              (item) =>
                item.ingredient_uuid === ingredients[index].ingredient_uuid
            )
              ? true
              : false
          }
        />
      ),
    },
    {
      key: 'ingredient_name',
      header: t('name'),
      width: '50%',
      classname: 'column-bold',
    },
    {
      key: 'quantity',
      header: t('quantity'),
      width: '25%',
      classname: 'column-bold',
      renderItem: ({ index }) => (
        <Input
          type="number"
          placeholder={t('quantity')}
          onChange={(value) => handleQuantityChange(value, index)}
          value={ingredients ? ingredients[index].quantity : 0}
        />
      ),
    },
    {
      key: 'unit',
      header: t('unit'),
      width: '25%',
    },
  ];
  return (
    <>
      <div className="edit-ingredient-popup">
        <div className="overlay" onClick={props.togglePopup}></div>
        <div className="popup">
          <span id="title">
            {t('editIngredientsOf')}{' '}
            <span id="recipe-name">{props.recipe?.name}</span>
            {' :'}
          </span>
          <div className="tab-container">
            <i
              className={`fa-solid fa-trash ${
                selectedIngredients.length === 0 ? 'disable' : 'active'
              }`}
              data-tooltip-id="actions-tooltip"
              data-tooltip-content={t('delete')}
              onClick={() => {
                selectedIngredients.length > 0
                  ? togglePopupDeleteIngredients()
                  : null;
              }}></i>
            <Table columns={columns} data={ingredients} />
          </div>
          <span
            className="text-error"
            style={fieldError ? { opacity: 1 } : { opacity: 0 }}>
            {fieldError}
          </span>
          <div className="buttons-container">
            <Button
              type="secondary"
              value={t('cancel')}
              onClick={props.togglePopup}
            />
            <Button
              type="secondary"
              value={t('deleteRecipe')}
              className="delete"
              onClick={togglePopupDeleteRecipe}
              loading={deleteLoading}
            />
            <Button
              type="primary"
              value={t('validate')}
              onClick={handleValidate}
              loading={valideLoading}
            />
          </div>
        </div>
      </div>
      <DialogBox
        type="warning"
        msg={t('warningDeleteRecipe')}
        onConfirm={handleOnConfirmDeleteRecipe}
        revele={popupDeleteRecipe}
        onRequestClose={togglePopupDeleteRecipe}
      />
      <DialogBox
        type="warning"
        msg={t('warningDeleteIngredients')}
        onConfirm={handleOnConfirmDeleteIngredients}
        revele={popupDeleteIngredients}
        onRequestClose={togglePopupDeleteIngredients}
      />
      <Tooltip className="tooltip" id="actions-tooltip" />
    </>
  );
};

export default EditIngredientPopup;
