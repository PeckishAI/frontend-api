import React, {
  useCallback,
  useEffect,
  useImperativeHandle,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Dropdown, IconButton, Input, DialogBox } from 'shared-ui';
import { Ingredient, inventoryService } from '../../../services';
import {
  useRestaurantCurrency,
  useRestaurantStore,
} from '../../../store/useRestaurantStore';
import Table, { ColumnDefinitionType } from 'shared-ui/components/Table/Table';
import { Tooltip } from 'react-tooltip';
import { DropdownOptionsDefinitionType } from 'shared-ui/components/Dropdown/Dropdown';
import supplierService from '../../../services/supplier.service';
import ImportIngredients from '../Components/ImportIngredients/ImportIngredients';
import Fuse from 'fuse.js';
import { formatCurrency } from '../../../utils/helpers';

export const units: DropdownOptionsDefinitionType[] = [
  { label: 'kg', value: 'kg' },
  { label: 'g', value: 'g' },
  { label: 'tbsp', value: 'tbsp' },
  { label: 'l', value: 'L' },
  { label: 'ml', value: 'ml' },
  { label: 'unit', value: 'unit' },
];

export type IngredientTabRef = {
  renderOptions: () => React.ReactNode;
};

type Props = {
  searchValue: string;
  setLoadingState: (loading: boolean) => void;
  forceOptionsUpdate: () => void;
};

export const IngredientTab = React.forwardRef<IngredientTabRef, Props>(
  (props, forwardedRef) => {
    const { t } = useTranslation(['common', 'ingredient']);
    const { currencyISO } = useRestaurantCurrency();

    const [ingredientsList, setIngredientsList] = useState<Ingredient[]>([]);
    const [editingRowId, setEditingRowId] = useState<string | null>();
    const [deletingRowId, setDeletingRowId] = useState<string | null>();
    const [addingRow, setAddingRow] = useState(false);
    const [editedValues, setEditedValues] = useState<Ingredient | null>(null);
    const [importIngredientsPopup, setImportIngredientsPopup] = useState(false);
    const [popupDelete, setPopupDelete] = useState<string[] | undefined>(
      undefined
    );
    const [popupPreviewEdit, setPopupPreviewEdit] = useState<
      string[] | undefined
    >(undefined);
    const [popupError, setPopupError] = useState('');

    const [suppliers, setSuppliers] = useState<DropdownOptionsDefinitionType[]>(
      []
    );

    const selectedRestaurantUUID = useRestaurantStore(
      (state) => state.selectedRestaurantUUID
    );

    useEffect(() => {
      if (!selectedRestaurantUUID) return;

      supplierService
        .getRestaurantSuppliers(selectedRestaurantUUID)
        .then((res) => {
          const suppliersList: DropdownOptionsDefinitionType[] = [];
          res.forEach((supplier) => {
            suppliersList.push({ label: supplier.name, value: supplier.name });
          });
          setSuppliers(suppliersList);
        });
    }, [selectedRestaurantUUID]);

    const ingredientsFiltered = props.searchValue
      ? new Fuse(ingredientsList, {
          keys: ['name', 'supplier'],
        })
          .search(props.searchValue)
          .map((r) => r.item)
      : ingredientsList;

    const handleExportDataClick = useCallback(() => {
      const rows = ingredientsList;
      if (rows) {
        const header =
          'Ingredient name, Par level, Actual stock, Theoritical stock, Unit, Supplier, Cost per unit\n';
        const csvContent =
          'data:text/csv;charset=utf-8,' +
          header +
          rows
            .map((row) => {
              const values = [];
              values.push(row.name); // Convertir la date en format ISO string
              values.push(row.parLevel || '-');
              values.push(row.actualStock || '-');
              values.push(row.theoriticalStock || '-');
              values.push(row.unit || '-');
              values.push(row.supplier || '-');
              values.push(row.unitCost || '-');
              return values.join(',');
            })
            .join('\n');

        // Créer un lien d'ancrage pour le téléchargement
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', 'inventory.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    }, [ingredientsList]);

    useImperativeHandle(
      forwardedRef,
      () => {
        props.forceOptionsUpdate();

        return {
          renderOptions: () => {
            return (
              <>
                <IconButton
                  icon={<i className="fa-solid fa-filter"></i>}
                  onClick={() => null}
                  tooltipMsg="Filter"
                  tooltipId="inventory-tooltip"
                />
                <IconButton
                  icon={<i className="fa-solid fa-file-export"></i>}
                  onClick={handleExportDataClick}
                  tooltipMsg={t('export')}
                  tooltipId="inventory-tooltip"
                />
                <IconButton
                  icon={<i className="fa-solid fa-file-arrow-down"></i>}
                  onClick={() => setImportIngredientsPopup(true)}
                  tooltipMsg={t('inventory.importData')}
                  tooltipId="inventory-tooltip"
                />
                <Button
                  value={t('inventory.addIngredientBtn')}
                  type="primary"
                  className="add"
                  onClick={!addingRow ? handleAddNewIngredient : undefined}
                />
              </>
            );
          },
        };
      },
      [addingRow, ingredientsList, handleExportDataClick]
    );

    const reloadInventoryData = useCallback(async () => {
      if (!selectedRestaurantUUID) return;

      props.setLoadingState(true);
      try {
        const ingredients = await inventoryService.getIngredientList(
          selectedRestaurantUUID
        );

        setIngredientsList(ingredients);
      } catch (err) {
        if (err instanceof Error) {
          togglePopupError(err.message);
        } else {
          console.error('Unexpected error type:', err);
        }
      }

      props.setLoadingState(false);
    }, [selectedRestaurantUUID, props.setLoadingState]);

    useEffect(() => {
      reloadInventoryData();
    }, [reloadInventoryData]);

    // Handle for actions in table
    const handleEditClick = (row: Ingredient) => {
      setEditingRowId(row.id);
      setEditedValues({ ...row });
    };

    const handleSaveEdit = () => {
      if (!selectedRestaurantUUID) return;

      props.setLoadingState(true);
      if (editingRowId && !addingRow) {
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
        parLevel: 0,
        actualStock: 0,
        unit: '',
        supplier: suppliers[0].value,
        unitCost: 0,
        actions: undefined,
      };

      setIngredientsList((list) => [newIngredient, ...list]);
      setAddingRow(true);
      setEditingRowId(newIngredient.id);
      setEditedValues(newIngredient);
    };

    const columns: ColumnDefinitionType<Ingredient, keyof Ingredient>[] = [
      {
        key: 'name',
        header: t('ingredient:ingredientName'),
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
        key: 'parLevel',
        header: t('ingredient:parLvel'),
        width: '10%',
        // renderItem: () => '-', // temp till real value provided by backend
        renderItem: ({ row }) =>
          editingRowId === row.id ? (
            <Input
              type="number"
              min={0}
              placeholder={t('ingredient:parLvel')}
              onChange={(value) => handleValueChange('parLevel', value)}
              value={editedValues!.parLevel}
            />
          ) : (
            row.parLevel
          ),
      },
      {
        key: 'actualStock',
        header: t('ingredient:actualStock'),
        width: '15%',
        renderItem: ({ row }) =>
          editingRowId === row.id ? (
            <Input
              type="number"
              min={0}
              placeholder={t('ingredient:actualStock')}
              onChange={(value) => handleValueChange('actualStock', value)}
              value={editedValues!.actualStock}
            />
          ) : (
            row.actualStock
          ),
      },
      {
        key: 'theoriticalStock',
        header: t('ingredient:theoreticalStock'),
        width: '15%',
      },
      {
        key: 'unit',
        header: t('ingredient:unit'),
        width: '10%',
        renderItem: ({ row }) =>
          editingRowId === row.id ? (
            <Dropdown
              placeholder={t('inventory.selectUnit')}
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
        header: t('ingredient:supplier'),
        width: '15%',
        renderItem: ({ row }) =>
          editingRowId === row.id ? (
            <Dropdown
              placeholder={t('inventory.selectSupplier')}
              options={suppliers}
              selectedOption={editedValues!.supplier}
              onOptionChange={(value) => handleValueChange('supplier', value)}
            />
          ) : (
            row.supplier
          ),
      },
      {
        key: 'unitCost',
        header: t('ingredient:unitCost'),
        width: '10%',
        classname: 'column-bold',
        renderItem: ({ row }) =>
          editingRowId === row.id ? (
            <Input
              type="number"
              min={0}
              placeholder={t('ingredient:unitCost')}
              onChange={(value) => handleValueChange('unitCost', value)}
              value={editedValues!.unitCost}
            />
          ) : row.unitCost ? (
            formatCurrency(row.unitCost, currencyISO)
          ) : (
            '-'
          ),
      },
      {
        key: 'actions',
        header: t('ingredient:actions'),
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
        <Table data={ingredientsFiltered} columns={columns} />

        <ImportIngredients
          openUploader={importIngredientsPopup}
          onCloseUploader={() => setImportIngredientsPopup(false)}
          onIngredientsImported={() => reloadInventoryData()}
        />

        <Tooltip className="tooltip" id="inventory-tooltip" delayShow={500} />
        <DialogBox
          type="warning"
          msg={t('warning.delete')}
          subMsg={
            popupDelete?.length !== 0 ? t('warning.impactedRecipes') : undefined
          }
          list={popupDelete?.length !== 0 ? popupDelete : undefined}
          onConfirm={handleConfirmPopupDelete}
          isOpen={popupDelete === undefined ? false : true}
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
          isOpen={popupPreviewEdit === undefined ? false : true}
          onRequestClose={() => togglePopupPreviewEdit(undefined)}
        />
        <DialogBox
          type="error"
          msg={t('error.trigger') + '. ' + t('error.tryLater') + '.'}
          subMsg={popupError}
          isOpen={popupError === '' ? false : true}
          onRequestClose={() => togglePopupError('')}
        />
      </>
    );
  }
);
IngredientTab.displayName = 'IngredientTab';
