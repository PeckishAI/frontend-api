import React, {
  useCallback,
  useEffect,
  useImperativeHandle,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button,
  Dropdown,
  IconButton,
  Input,
  DialogBox,
  Checkbox,
  Select,
} from 'shared-ui';
import { Ingredient, Tag, inventoryService } from '../../../services';
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
import { tagService } from '../../../services/tag.service';
import toast from 'react-hot-toast';
import Filters, {
  FiltersType,
  defaultFilters,
} from '../Components/Filters/Filters';

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
    const [filteredIngredients, setFilteredIngredients] = useState<
      Ingredient[]
    >([]);
    const [filters, setFilters] = useState<FiltersType>(defaultFilters);
    const [tagList, setTagList] = useState<Tag[]>([]);
    const [loadingTag, setLoadingTag] = useState(false);
    const [editingRowId, setEditingRowId] = useState<string | null>();
    const [deletingRowId, setDeletingRowId] = useState<string | null>();
    const [addingRow, setAddingRow] = useState(false);
    const [editedValues, setEditedValues] = useState<Ingredient | null>(null);
    const [selectedIngredients, setSelectedIngredients] = useState<
      Ingredient[]
    >([]);
    const [importIngredientsPopup, setImportIngredientsPopup] = useState(false);
    const [popupDelete, setPopupDelete] = useState<string[] | undefined>(
      undefined
    );
    const [popupDeleteSelection, setPopupDeleteSelection] = useState(0);
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

    useEffect(() => {
      const applyFilters = () => {
        let filteredList = [...ingredientsList];

        if (props.searchValue) {
          filteredList = new Fuse(filteredList, {
            keys: ['name', 'supplier'],
          })
            .search(props.searchValue)
            .map((r) => r.item);
        }

        if (filters.selectedSupplier) {
          filteredList = filteredList.filter(
            (ingredient) =>
              ingredient.supplier === filters.selectedSupplier!.uuid
          );
        }

        if (filters.selectedTag) {
          filteredList = filteredList.filter(
            (ingredient) => ingredient.tagUUID === filters.selectedTag!.uuid
          );
        }

        setFilteredIngredients(filteredList);
      };

      applyFilters();
    }, [props.searchValue, filters, ingredientsList]);

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
        console.log('imperative handle');

        return {
          renderOptions: () => {
            return (
              <>
                {selectedIngredients.length === 0 ? (
                  <>
                    <Filters
                      suppliers={suppliers.map((s) => ({
                        name: s.label,
                        uuid: s.value,
                      }))}
                      tags={tagList}
                      onApplyFilters={(newFilters) => setFilters(newFilters)}
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
                ) : (
                  <>
                    <Button
                      value={t('cancel')}
                      type="secondary"
                      onClick={handleCancelSelection}
                    />
                    <Button
                      value={t('ingredient:selectedIngredients.delete', {
                        count: selectedIngredients.length,
                      })}
                      type="primary"
                      onClick={() =>
                        setPopupDeleteSelection(selectedIngredients.length)
                      }
                    />
                  </>
                )}
              </>
            );
          },
        };
      },
      [addingRow, ingredientsList, selectedIngredients, handleExportDataClick]
    );

    const reloadInventoryData = useCallback(async () => {
      if (!selectedRestaurantUUID) return;

      props.setLoadingState(true);
      try {
        const ingredients = await inventoryService.getIngredientList(
          selectedRestaurantUUID
        );

        setIngredientsList(ingredients);
        setFilteredIngredients(ingredients);
      } catch (err) {
        if (err instanceof Error) {
          togglePopupError(err.message);
        } else {
          console.error('Unexpected error type:', err);
        }
      }

      props.setLoadingState(false);
    }, [selectedRestaurantUUID, props.setLoadingState]);

    const reloadTagList = useCallback(async () => {
      if (!selectedRestaurantUUID) return;
      return tagService.getAll(selectedRestaurantUUID).then((tags) => {
        setTagList(tags);
      });
    }, [selectedRestaurantUUID]);

    useEffect(() => {
      reloadInventoryData();
      reloadTagList();
    }, [reloadInventoryData, reloadTagList]);

    // Handle for selecting actions in table
    const handleSelectIngredient = (row: Ingredient) => {
      setSelectedIngredients((prev) => {
        const isExistingIndex = prev.findIndex((i) => i.id === row.id);
        if (isExistingIndex !== -1) {
          const updatedSelection = [...prev];
          updatedSelection.splice(isExistingIndex, 1);
          return updatedSelection;
        } else {
          return [...prev, row];
        }
      });
    };

    const handleSelectAll = () => {
      if (selectedIngredients.length === ingredientsList.length)
        setSelectedIngredients([]);
      else setSelectedIngredients(ingredientsList);
    };

    const handleCancelSelection = () => {
      setSelectedIngredients([]);
    };

    // Handle for actions in table
    const handleEditClick = (row: Ingredient) => {
      setEditingRowId(row.id);
      setEditedValues({ ...row });
    };

    const handleSaveEdit = () => {
      if (!selectedRestaurantUUID || !editedValues) return;

      props.setLoadingState(true);
      if (editingRowId && !addingRow) {
        console.log('API request to edit ingredient');
        console.log(editingRowId);
        props.setLoadingState(false);
        inventoryService
          .getIngredientPreview(editingRowId)
          .then((res) => {
            togglePopupPreviewEdit(res.data);
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

    const handleCreateTag = (name: string) => {
      if (!selectedRestaurantUUID) return;
      const isExisting = tagList.findIndex((tag) => tag.name === name);
      if (isExisting !== -1) {
        toast.error('Tag already exists.');
        return;
      }

      setLoadingTag(true);
      tagService
        .create(name, selectedRestaurantUUID)
        .then(() => {
          reloadTagList();
          toast.success(name + ' TAG created');
        })
        .finally(() => setLoadingTag(false));
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

    const handleConfirmPopupDeleteSelection = () => {
      let successCount = 0;
      selectedIngredients.forEach(async (ingredient) => {
        await inventoryService
          .deleteIngredient(ingredient.id)
          .catch((err) => {
            togglePopupError(err.message);
          })
          .then(() => {
            successCount++;
            setPopupDeleteSelection(0);
          });
        if (successCount === selectedIngredients.length) {
          handleCancelSelection();
          reloadInventoryData();
        }
      });
    };

    const togglePopupPreviewEdit = (msg: string[] | undefined) => {
      setPopupPreviewEdit(msg);
    };

    const handleConfirmPopupPreviewEdit = () => {
      if (!editedValues) return;
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
        tagUUID: null,
        parLevel: 0,
        actualStock: 0,
        unit: units[0].value,
        supplier: suppliers.length ? suppliers[0].value : '',
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
        key: 'id',
        header: () => (
          <Checkbox
            onCheck={handleSelectAll}
            checked={
              ingredientsList.length === 0
                ? false
                : selectedIngredients.length === ingredientsList.length
            }
          />
        ),
        width: '20px',
        renderItem: ({ row }) => (
          <Checkbox
            checked={
              selectedIngredients.find((i) => i.id === row.id) ? true : false
            }
            onCheck={() => handleSelectIngredient(row)}
          />
        ),
      },
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
        key: 'tagUUID',
        header: t('ingredient:tag'),
        width: '15%',
        minWidth: '150px',
        renderItem: ({ row }) =>
          editingRowId === row.id ? (
            <Select
              placeholder={t('ingredient:addTag')}
              options={tagList}
              size="small"
              isClearable
              isCreatable
              menuPosition="fixed"
              maxMenuHeight={200}
              isLoading={loadingTag}
              onCreateOption={handleCreateTag}
              getNewOptionData={(inputVal) => ({
                uuid: '',
                name: `Create '${inputVal}'`,
              })}
              getOptionLabel={(option) => option.name}
              getOptionValue={(option) => option.uuid}
              onChange={
                (value) => handleValueChange('tagUUID', value?.uuid ?? '') // transform '' to null value in tagService
              }
              value={tagList.find((tag) => editedValues?.tagUUID === tag.uuid)}
            />
          ) : (
            tagList.find((tag) => tag.uuid === row.tagUUID)?.name ?? '-'
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
      // {
      //   key: 'theoriticalStock',
      //   header: t('ingredient:theoreticalStock'),
      //   width: '15%',
      // },
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
        <Table data={filteredIngredients} columns={columns} />

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
          msg={t('warning.deleteSelection.msg', {
            count: popupDeleteSelection,
          })}
          subMsg={t('warning.deleteSelection.subMsg')}
          onConfirm={handleConfirmPopupDeleteSelection}
          isOpen={popupDeleteSelection > 0}
          onRequestClose={() => setPopupDeleteSelection(0)}
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
