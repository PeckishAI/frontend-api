import React, {
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button,
  Dropdown,
  IconButton,
  Input,
  DialogBox,
  UploadCsv,
} from 'shared-ui';
import { Ingredient, inventoryService } from '../../services';
import { useRestaurantStore } from '../../store/useRestaurantStore';
import Table, { ColumnDefinitionType } from 'shared-ui/components/Table/Table';
import { Tooltip } from 'react-tooltip';
import { DropdownOptionsDefinitionType } from 'shared-ui/components/Dropdown/Dropdown';

const units: DropdownOptionsDefinitionType[] = [
  { label: 'kg', value: 'kg' },
  { label: 'g', value: 'g' },
  { label: 'tbsp', value: 'tbsp' },
  { label: 'l', value: 'L' },
  { label: 'ml', value: 'ml' },
  { label: 'unit', value: 'unit' },
];

const suppliers: DropdownOptionsDefinitionType[] = [
  { label: 'Supplier 1', value: 'supplier1' },
  { label: 'Supplier 2', value: 'supplier2' },
  { label: 'Supplier 3', value: 'supplier3' },
];

export type IngredientTabRef = {
  renderOptions: () => React.ReactNode;
};

type Props = {
  searchValue: string;
  setLoadingState: (loading: boolean) => void;
};

export const IngredientTab = React.forwardRef<IngredientTabRef, Props>(
  (props, forwardedRef) => {
    const { t } = useTranslation('common');

    const [ingredientsList, setIngredientsList] = useState<Ingredient[]>([]);
    const [editingRowId, setEditingRowId] = useState<string | null>();
    const [deletingRowId, setDeletingRowId] = useState<string | null>();
    const [addingRow, setAddingRow] = useState(false);
    const [editedValues, setEditedValues] = useState<Ingredient | null>(null);
    const [popupDelete, setPopupDelete] = useState<string[] | undefined>(
      undefined
    );
    const [popupPreviewEdit, setPopupPreviewEdit] = useState<
      string[] | undefined
    >(undefined);
    const [popupError, setPopupError] = useState('');
    const [uploadPopup, setUploadPopup] = useState<any | null>(null);
    const [csvFile, setCsvFile] = useState<File | null>(null);
    const [loadingButton, setLoadingButton] = useState(false);

    const selectedRestaurantUUID = useRestaurantStore(
      (state) => state.selectedRestaurantUUID
    );

    useImperativeHandle(
      forwardedRef,
      () => ({
        renderOptions: () => (
          <>
            <IconButton
              icon={<i className="fa-solid fa-filter"></i>}
              onClick={() => null}
              tooltipMsg="Filter"
              tooltipId="inventory-tooltip"
            />
            <IconButton
              icon={<i className="fa-solid fa-download"></i>}
              onClick={() => null}
              tooltipMsg={t('export')}
              tooltipId="inventory-tooltip"
            />
            <IconButton
              icon={<i className="fa-solid fa-file-arrow-down"></i>}
              onClick={() =>
                fileInputRef.current && fileInputRef.current.click()
              }
              tooltipMsg={`${t('import')} CSV`}
              tooltipId="inventory-tooltip"
              loading={loadingButton}
            />
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              style={{ display: 'none' }} // hide input
              ref={fileInputRef}
            />
            <Button
              value={t('inventory.addIngredientBtn')}
              type="primary"
              className="add"
              onClick={!addingRow ? handleAddNewIngredient : () => null}
            />
          </>
        ),
      }),
      []
    );

    const reloadInventoryData = useCallback(async () => {
      if (!selectedRestaurantUUID) return;

      props.setLoadingState(true);
      try {
        const response = await inventoryService.getIngredientList(
          selectedRestaurantUUID
        );
        const list = response.data; // Accès à la propriété data de la réponse

        const convertedData = Object.keys(list).map((key) => ({
          id: key,
          theoriticalStock: 0, // Tempoprary till API implementation
          ...list[key],
        }));
        setIngredientsList(convertedData);
      } catch (err) {
        if (err instanceof Error) {
          togglePopupError(err.message);
        } else {
          console.error('Unexpected error type:', err);
        }
      }

      props.setLoadingState(false);
    }, [selectedRestaurantUUID]);

    useEffect(() => {
      reloadInventoryData();
    }, [reloadInventoryData]);

    // Handle for actions in tab
    const handleEditClick = (row: Ingredient) => {
      setEditingRowId(row.id);
      setEditedValues({ ...row });
    };

    const handleSaveEdit = () => {
      if (!selectedRestaurantUUID) return;

      props.setLoadingState(true);
      if (editingRowId !== null && !addingRow) {
        console.log('API request to edit ingredient');
        console.log(editingRowId);
        props.setLoadingState(false);
        inventoryService
          .getIngredientPreview(editingRowId)
          .then((res) => {
            togglePopupPreviewEdit(res.data);
            // let recipeList: string = '';
            // res.data.forEach((element) => {
            //   recipeList += element;
            //   recipeList += ', ';
            // });
            // togglePopupPreviewEdit(
            //   recipeList.substring(0, recipeList.length - 2)
            // );
          })
          .catch((err) => {
            console.log(err);
          })
          .finally(() => {
            props.setLoadingState(false);
          });
      } else {
        console.log('API request to Add new ingredient');
        inventoryService
          .addIngredient(selectedRestaurantUUID, editedValues)
          .catch((err) => {
            togglePopupError(err.message);
          })
          .then(() => reloadInventoryData());
        setAddingRow(false);
      }
    };

    const handleCancelEdit = () => {
      setEditingRowId(null);
      setEditedValues(null);
      if (addingRow) {
        const updatedList = ingredientsList.filter(
          (ingredient) => ingredient.id !== ''
        );
        setIngredientsList(updatedList);
        setAddingRow(false);
      }
    };

    const handleDeleteClick = (row: Ingredient) => {
      setDeletingRowId(row.id);
      props.setLoadingState(true);
      inventoryService
        .getIngredientPreview(row.id)
        .then((res) => {
          console.log('preview with id :', row.id, res.data);
          togglePopupDelete(res.data);

          // let recipeList: string = '';
          // res.data.forEach((element) => {
          //   recipeList += element;
          //   recipeList += ', ';
          // });
          // togglePopupDelete(recipeList.substring(0, recipeList.length - 2));
        })
        .catch((err) => {
          console.log(err);
        })
        .finally(() => {
          props.setLoadingState(false);
        });
    };

    // Handle inputs change
    const handleValueChange = (field: keyof Ingredient, value: string) => {
      setEditedValues((prevValues) => ({
        ...prevValues!,
        [field]: value,
      }));
    };

    // Handle for Popups
    const togglePopupDelete = (msg: string[] | undefined) => {
      setPopupDelete(msg);
    };
    const handleConfirmPopupDelete = () => {
      if (!deletingRowId) return;
      inventoryService
        .deleteIngredient(deletingRowId)
        .catch((err) => {
          togglePopupError(err.message);
        })
        .then(() => reloadInventoryData());
      togglePopupDelete(undefined);
    };

    const togglePopupPreviewEdit = (msg: string[] | undefined) => {
      setPopupPreviewEdit(msg);
    };

    const handleConfirmPopupPreviewEdit = () => {
      inventoryService
        .updateIngredient(editedValues)
        .catch((err) => {
          togglePopupError(err.message);
        })
        .then(() => reloadInventoryData());
      setEditingRowId(null);
      setEditedValues(null);
      togglePopupPreviewEdit(undefined);
    };

    const togglePopupError = (msg: string) => {
      setPopupError(msg);
    };

    // Handle for actions above the tab component
    const handleAddNewIngredient = () => {
      const newIngredient: Ingredient = {
        id: '',
        name: '',
        theoreticalStock: 0,
        quantity: 0,
        unit: '',
        supplier: '',
        cost: 0,
        actions: undefined,
      };

      setIngredientsList([newIngredient, ...ingredientsList]);
      setAddingRow(true);
      setEditingRowId(newIngredient.id);
      setEditedValues(newIngredient);
    };

    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!selectedRestaurantUUID) return;

      const file = e.target.files?.[0];
      if (file) {
        setLoadingButton(true);
        inventoryService
          .uploadCsvFile(selectedRestaurantUUID, file)
          .then((res) => {
            setUploadPopup(res.data);
            setCsvFile(file);
          })
          .catch((err) => {
            console.log(err);
          })
          .finally(() => {
            setLoadingButton(false);
          });
      }
    };

    const handleUploadCsvValidate = () => {
      setUploadPopup(null);
      reloadInventoryData();
    };

    const columns: ColumnDefinitionType<Ingredient, keyof Ingredient>[] = [
      {
        key: 'name',
        header: t('ingredientName'),
        width: '15%',
        classname: 'column-bold',
        renderItem: ({ row }) =>
          editingRowId === row.id ? (
            <Input
              type="text"
              min={0}
              placeholder={t('name')}
              onChange={(value) => handleValueChange('name', value)}
              value={editedValues!.name}
            />
          ) : (
            row.name
          ),
      },

      {
        key: 'theoreticalStock',
        header: t('theoreticalStock'),
        width: '15%',
        renderItem: () => '-',
      },
      {
        key: 'quantity',
        header: t('actualStock'),
        width: '15%',
        renderItem: ({ row }) =>
          editingRowId === row.id ? (
            <Input
              type="number"
              min={0}
              placeholder={t('quantity')}
              onChange={(value) => handleValueChange('quantity', value)}
              value={editedValues!.quantity}
            />
          ) : (
            row.quantity
          ),
      },
      {
        key: 'unit',
        header: t('unit'),
        width: '10%',
        renderItem: ({ row }) =>
          editingRowId === row.id ? (
            <Dropdown
              options={units}
              selectedOption={editedValues!.unit}
              onOptionChange={(value) => handleValueChange('unit', value)}
            />
          ) : (
            row.unit
          ),
      },
      {
        key: 'supplier',
        header: t('supplier'),
        width: '15%',
        renderItem: ({ row }) =>
          editingRowId === row.id ? (
            <Dropdown
              options={suppliers}
              selectedOption={editedValues!.supplier}
              onOptionChange={(value) => handleValueChange('supplier', value)}
            />
          ) : (
            row.supplier
          ),
      },
      {
        key: 'cost',
        header: t('cost'),
        width: '10%',
        classname: 'column-bold',
        renderItem: ({ row }) =>
          editingRowId === row.id ? (
            <Input
              type="number"
              min={0}
              placeholder={t('cost')}
              onChange={(value) => handleValueChange('cost', value)}
              value={editedValues!.cost}
            />
          ) : row.cost ? (
            `${row.cost} €`
          ) : (
            '-'
          ),
      },
      {
        key: 'actions',
        header: t('actions'),
        width: '10%',
        renderItem: ({ row }) => {
          return (
            <div className="actions">
              {editingRowId === row.id ? (
                <i
                  className="fa-solid fa-check"
                  data-tooltip-id="inventory-tooltip"
                  data-tooltip-content={t('validate')}
                  onClick={handleSaveEdit}></i>
              ) : (
                <i
                  className="fa-solid fa-pen-to-square"
                  data-tooltip-id="inventory-tooltip"
                  data-tooltip-content={t('edit')}
                  onClick={() => handleEditClick(row)}></i>
              )}

              {editingRowId === row.id ? (
                <i
                  className="fa-solid fa-times"
                  data-tooltip-id="inventory-tooltip"
                  data-tooltip-content={t('cancel')}
                  onClick={handleCancelEdit}></i>
              ) : (
                <i
                  className="fa-solid fa-trash"
                  data-tooltip-id="inventory-tooltip"
                  data-tooltip-content={t('delete')}
                  onClick={() => handleDeleteClick(row)}></i>
              )}
            </div>
          );
        },
      },
    ];

    return (
      <>
        <Table data={ingredientsList} columns={columns} />

        {uploadPopup !== null && (
          <UploadCsv
            fileCsv={csvFile}
            extractedData={uploadPopup}
            onCancelClick={() => {
              setUploadPopup(null);
              if (fileInputRef.current) fileInputRef.current.value = '';
            }}
            onValidateClick={handleUploadCsvValidate}
          />
        )}

        <Tooltip className="tooltip" id="inventory-tooltip" />
        <DialogBox
          type="warning"
          msg={t('warning.delete')}
          subMsg={
            popupDelete?.length !== 0 ? t('warning.impactedRecipes') : undefined
          }
          list={popupDelete?.length !== 0 ? popupDelete : undefined}
          onConfirm={handleConfirmPopupDelete}
          revele={popupDelete === undefined ? false : true}
          onRequestClose={() => togglePopupDelete(undefined)}
        />
        <DialogBox
          type="warning"
          msg={t('warning.edit')}
          subMsg={
            popupPreviewEdit?.length !== 0
              ? t('warning.impactedRecipes')
              : undefined
          }
          list={popupPreviewEdit?.length !== 0 ? popupPreviewEdit : undefined}
          onConfirm={handleConfirmPopupPreviewEdit}
          revele={popupPreviewEdit === undefined ? false : true}
          onRequestClose={() => togglePopupPreviewEdit(undefined)}
        />
        <DialogBox
          type="error"
          msg={t('error.trigger') + '. ' + t('error.tryLater') + '.'}
          subMsg={popupError}
          revele={popupError === '' ? false : true}
          onRequestClose={() => togglePopupError('')}
        />
      </>
    );
  }
);
