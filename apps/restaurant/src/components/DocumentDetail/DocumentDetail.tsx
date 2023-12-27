import { IconButton, SidePanel, Input, Select, Table, Button } from 'shared-ui';
import styles from './style.module.scss';
import { Ingredient, Invoice, inventoryService } from '../../services';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { formatCurrency } from '../../utils/helpers';
import { useRestaurantCurrency } from '../../store/useRestaurantStore';
import { useForm, Controller } from 'react-hook-form';
import { useIngredients } from '../../services/hooks'; // Adjust the path as necessary
import { useRestaurantStore } from '../../store/useRestaurantStore';

type Props = {
  document: Invoice | null;
  isOpen: boolean;
  onRequestClose: () => void;
  onDocumentChanged: (document: Invoice, action: 'deleted' | 'updated') => void;
};

type IngredientDetails = {
  detectedName?: string;
  mappedName?: string;
  mappedUUID?: string;
  quantity?: number;
  unitPrice?: number;
  unit?: string;
  totalPrice?: number;
};

const DocumentDetail = (props: Props) => {
  const { t } = useTranslation();

  //const [editDocument, setEditDocument] = useState<Invoice | null>(null);
  const [deleteDocument, setDeleteDocument] = useState<Invoice | null>(null);
  const [editableDocument, setEditableDocument] = useState<Invoice | null>(
    null
  );
  const [isEditMode, setIsEditMode] = useState(false);
  const { control } = useForm();

  const { ingredients, loading: loadingIngredients } = useIngredients();

  const ingredientOptions = ingredients.map((ingredient) => ({
    value: ingredient.id,
    label: ingredient.name,
  }));

  const selectedRestaurantUUID = useRestaurantStore(
    (state) => state.selectedRestaurantUUID
  );

  const toggleEditMode = () => {
    setIsEditMode(!isEditMode);
    if (!isEditMode) {
      // Enter edit mode
      setEditableDocument(props.document);
    } else {
      // Exit edit mode
      setEditableDocument(null);
    }
  };

  const handleDocumentChange = (field: keyof Invoice, value: any) => {
    setEditableDocument((prevDocument) => {
      if (prevDocument === null) return null;

      return {
        ...prevDocument,
        [field]: value,
        // Ensure that all other properties of Invoice are present here
        // For example, if ingredients is a required property, you should handle it like this:
        ingredients: prevDocument.ingredients || [],
      };
    });
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: keyof Invoice
  ) => {
    const value = e.target.value;
    handleDocumentChange(field, value);
  };

  const handleIngredientChange = (
    index: number,
    field: keyof IngredientDetails,
    value: any
  ) => {
    console.log('Value:', value);

    if (!editableDocument || !editableDocument.ingredients) {
      console.error('Editable document or ingredients are undefined');
      return;
    }

    const updatedIngredients: IngredientDetails[] =
      editableDocument.ingredients.map((ing, idx) =>
        idx === index ? { ...ing, [field]: value } : ing
      );

    setEditableDocument({
      ...editableDocument,
      ingredients: updatedIngredients,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editableDocument) {
      console.log(editableDocument);
      try {
        // Prepare the data for updating
        const updatedData = {
          date: editableDocument.date,
          supplier: editableDocument.supplier,
          path: editableDocument.path,
          ingredients: editableDocument.ingredients.map((ing) => ({
            detectedName: ing.detectedName,
            mappedName: ing.mappedName,
            mappedUUID: ing.mappedUUID,
            unitPrice: ing.unitPrice,
            quantity: ing.quantity,
            unit: ing.unit,
            totalPrice: ing.totalPrice,
          })),
          amount: editableDocument.amount,
        };

        // Call the updateDocument function
        await inventoryService.updateDocument(
          selectedRestaurantUUID,
          editableDocument.documentUUID,
          updatedData
        );

        console.log('Document updated successfully');
        setIsEditMode(false);
        setEditableDocument(null);

        // Optionally, invoke a callback or refresh data
        if (props.onDocumentChanged) {
          props.onDocumentChanged(editableDocument, 'updated');
        }
      } catch (error) {
        console.error('Failed to update document:', error);
      }
    }
  };

  const { currencyISO } = useRestaurantCurrency();

  const handleMappedNameChange = (index, selectedOption) => {
    if (!editableDocument || !editableDocument.ingredients) {
      console.error('Editable document or ingredients are undefined');
      return;
    }

    const updatedIngredients = [...editableDocument.ingredients];
    updatedIngredients[index].mappedName = selectedOption
      ? selectedOption.label
      : '';
    updatedIngredients[index].mappedUUID = selectedOption
      ? selectedOption.value
      : null;

    setEditableDocument({
      ...editableDocument,
      ingredients: updatedIngredients,
    });
  };

  const viewColumns = [
    {
      key: 'detectedName',
      header: t('document.detectedName'),
      classname: 'column-bold',
    },
    {
      key: 'mappedName',
      header: t('document.givenName'),
      classname: 'column-bold',
    },
    {
      key: 'quantity',
      header: t('quantity'),
      classname: 'column-bold',
      renderItem: ({ row }) => `${row.quantity}`,
    },
    {
      key: 'totalPrice',
      header: t('totalCost'),
      classname: 'column-bold',
      renderItem: ({ row }) =>
        row.totalPrice ? formatCurrency(row.totalPrice, currencyISO) : '-',
    },
  ];

  const editColumns = [
    {
      key: 'detectedName',
      header: t('document.detectedName'),
      classname: 'column-bold',
      renderItem: ({ row, index }) => (
        <Input
          type="text"
          min={0}
          placeholder={t('name')}
          className={styles.detectedNameInput}
          onChange={(value) =>
            handleIngredientChange(index, 'detectedName', value)
          }
          value={editableDocument?.ingredients[index].detectedName || ''}
        />
      ),
    },
    {
      key: 'mappedName',
      header: t('document.givenName'),
      classname: 'column-bold',
      renderItem: ({ row, index }) => (
        <Controller
          name={`mappedName-${index}`}
          control={control}
          render={({ field }) => (
            <Select
              {...field}
              options={ingredientOptions}
              className={styles.mappedNameInput}
              isClearable
              isSearchable
              onChange={(selectedOption) => {
                field.onChange(selectedOption);
                handleMappedNameChange(index, selectedOption);
              }}
              value={ingredientOptions.find(
                (option) =>
                  option.value ===
                  (editableDocument?.ingredients[index].mappedUUID ||
                    field.value)
              )}
            />
          )}
        />
      ),
    },
    {
      key: 'quantity',
      header: t('quantity'),
      classname: 'column-bold',
      renderItem: ({ row, index }) => (
        <Input
          type="number"
          min={0}
          step="0.01"
          placeholder={t('name')}
          className={styles.quantity}
          onChange={(value) => handleIngredientChange(index, 'quantity', value)}
          value={editableDocument?.ingredients[index].quantity || ''}
        />
      ),
    },
    {
      key: 'totalPrice',
      header: t('totalCost'),
      classname: 'column-bold',
      renderItem: ({ row, index }) => (
        <Input
          type="number"
          min={0}
          step="0.01"
          placeholder={t('name')}
          className={styles.price}
          onChange={(value) =>
            handleIngredientChange(index, 'totalPrice', value)
          }
          value={editableDocument?.ingredients[index].totalPrice || ''}
        />
      ),
    },
  ];

  console.log(props.document?.ingredients);

  return (
    <>
      <SidePanel
        isOpen={props.document !== null}
        scrollable={true}
        onRequestClose={() => props.onRequestClose()}>
        {/* ... */}
        {isEditMode ? (
          <div className={styles.documentDetail}>
            <form onSubmit={handleSubmit} className={styles.editForm}>
              <div className={styles.headerDataContainer}>
                <Input
                  type="text"
                  min={0}
                  placeholder={t('name')}
                  className={styles.name}
                  onChange={(e) => handleInputChange(e, 'supplier')}
                  value={editableDocument?.supplier || ''}
                />

                <h2 className={styles.name}> - {currencyISO}</h2>
                <Input
                  type="number"
                  min={0}
                  placeholder={t('name')}
                  className={styles.editInput}
                  onChange={(e) => handleInputChange(e, 'amount')}
                  value={editableDocument?.amount || 0}
                />
              </div>
              <div className={styles.optionsButtons}>
                <IconButton
                  icon={<i className="fa-solid fa-trash"></i>}
                  tooltipMsg={t('delete')}
                  onClick={() => setDeleteDocument(props.document)}
                />
              </div>
              <div className={styles.documentContainer}>
                <img
                  className={styles.documentImage}
                  src={props.document?.path}
                  alt={props.document?.path}
                />
              </div>
              {/* {editableDocument?.ingredients.map((ingredient, index) => (
                <div key={index} className={styles.ingredientEditRow}>
                  <input
                    type="text"
                    value={ingredient.detectedName}
                    onChange={(e) =>
                      handleIngredientChange(
                        index,
                        'detectedName',
                        e.target.value
                      )
                    }
                    className={styles.editInput}
                  />
                  <input
                    type="number"
                    value={ingredient.quantity}
                    onChange={(e) =>
                      handleIngredientChange(index, 'quantity', e.target.value)
                    }
                    className={styles.editInput}
                  />
                </div>
              ))} */}
              <Table
                data={editableDocument?.ingredients}
                columns={isEditMode ? editColumns : viewColumns}
              />
              <br></br>
              <Button
                type="primary"
                actionType="submit"
                value={t('document.save')}
                className="button-fixed-bottom"
              />
            </form>
          </div>
        ) : (
          <div className={styles.documentDetail}>
            <h2 className={styles.name}>
              {props.document?.supplier} - {currencyISO}
              {props.document?.amount}
            </h2>
            <div className={styles.optionsButtons}>
              <IconButton
                icon={<i className="fa-solid fa-pen-to-square"></i>}
                tooltipMsg={t('edit')}
                onClick={toggleEditMode}
              />
              <IconButton
                icon={<i className="fa-solid fa-trash"></i>}
                tooltipMsg={t('delete')}
                onClick={() => setDeleteDocument(props.document)}
              />
            </div>

            <div className={styles.documentContainer}>
              <img
                className={styles.documentImage}
                src={props.document?.path}
                alt={props.document?.path}
              />
            </div>

            <Table
              data={props.document?.ingredients}
              columns={[
                { key: 'detectedName', header: t('document.detectedName') },
                { key: 'mappedName', header: t('document.givenName') },
                {
                  key: 'quantity',
                  header: t('quantity'),
                  renderItem: ({ row }) => `${row.quantity}`,
                },
                {
                  key: 'totalPrice',
                  header: t('totalCost'),
                  renderItem: ({ row }) =>
                    row.totalPrice
                      ? formatCurrency(row.totalPrice, currencyISO)
                      : '-',
                },
              ]}
            />
            {props.document?.ingredients.length === 0 && (
              <p className={styles.noIngredients}>
                {t('recipes.card.no-ingredients')}
              </p>
            )}
          </div>
        )}
      </SidePanel>
    </>
  );
};

export default DocumentDetail;
