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
} from 'shared-ui';
import { Ingredient, Tag, inventoryService } from '../../../services';
import {
  useRestaurantCurrency,
  useRestaurantStore,
} from '../../../store/useRestaurantStore';
import Table, { ColumnDefinitionType } from 'shared-ui/components/Table/Table';
import Autocomplete from '@mui/material/Autocomplete';
import Chip from '@mui/material/Chip';
import { Tooltip } from 'react-tooltip';
import { DropdownOptionsDefinitionType } from 'shared-ui/components/Dropdown/Dropdown';
import supplierService from '../../../services/supplier.service';
import ImportIngredients from '../Components/ImportIngredients/ImportIngredients';
import Fuse from 'fuse.js';
import { tagService } from '../../../services/tag.service';
import Filters, {
  FiltersType,
  defaultFilters,
} from '../Components/Filters/Filters';
import CustomPagination from '../../Overview/components/Pagination/CustomPagination';
import { TextField } from '@mui/material';

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
    const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
    const [inputValue, setInputValue] = useState<string>('');
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
    const [page, setPage] = useState(1);
    const handleChange = (NewValue) => {
      setPage(NewValue);
    };

    const ITEMS_PER_PAGE = 10; // Define items per page

    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const paginatedIngredients = filteredIngredients?.slice(
      startIndex,
      endIndex
    );

    const selectedRestaurantUUID = useRestaurantStore(
      (state) => state.selectedRestaurantUUID
    );

    const ensureTagObjects = (values: (Tag | string)[]): Tag[] => {
      return values.map((value) =>
        typeof value === 'string' ? { uuid: '', name: value } : value
      );
    };

    const handleSelectedTags = (
      event: React.SyntheticEvent,
      newValue: (Tag | string)[]
    ) => {
      const tags = ensureTagObjects(newValue);

      setSelectedTags(tags);

      setEditedValues((prevValues) => {
        return { ...prevValues, tag_details: tags };
      });
    };

    const handleInputChange = (event, newInputValue) => {
      setInputValue(newInputValue);
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Enter' && inputValue) {
        event.preventDefault();

        const data = {
          uuid: '', // Initially no UUID for the new tag
          name: inputValue,
        };

        // Add the new tag if it's not already in options
        if (!tagList.some((tag) => tag.name === inputValue)) {
          setTagList((prevOptions) => [...prevOptions, data]);
        }

        setSelectedTags((prevTags) => [...prevTags, data]);

        setEditedValues((prevValues) => {
          const existingTagDetails = Array.isArray(prevValues?.tag_details)
            ? prevValues.tag_details
            : [];

          return {
            ...prevValues,
            tag_details: [...existingTagDetails, data],
          };
        });

        setInputValue('');
      }
    };

    useEffect(() => {
      if (!selectedRestaurantUUID) return;

      supplierService
        .getRestaurantSuppliers(selectedRestaurantUUID)
        .then((res) => {
          const suppliersList: DropdownOptionsDefinitionType[] = [];
          res.forEach((supplier) => {
            suppliersList.push({
              label: supplier.name,
              value: supplier.supplier_uuid, // Update here to use supplier_uuid
              supplier_uuid: supplier.supplier_uuid,
            });
          });
          setSuppliers(suppliersList);
        });
    }, [selectedRestaurantUUID]);

    useEffect(() => {
      const applyFilters = () => {
        let filteredList = [...ingredientsList];

        if (props.searchValue) {
          const fuse = new Fuse(filteredList, {
            keys: ['name', 'supplier_uuid'],
          });
          filteredList = fuse.search(props.searchValue).map((r) => r.item);
        }

        if (filters.selectedSupplier) {
          filteredList = filteredList.filter(
            (ingredient) =>
              ingredient.supplier_details?.some(
                (supplier) =>
                  supplier.supplier_id === filters?.selectedSupplier!.uuid
              )
          );
        }

        if (filters.selectedTag) {
          filteredList = filteredList.filter((ingredient) => {
            return ingredient.tagUUID?.some(
              (tag) => tag === filters?.selectedTag?.uuid
            );
          });
        }

        setFilteredIngredients(filteredList);
      };

      applyFilters();
    }, [props.searchValue, filters, ingredientsList]);

    const handleExportDataClick = useCallback(() => {
      const rows = filteredIngredients;
      if (rows) {
        const header =
          'Ingredient name, Par level, Actual stock, Theoretical stock, Unit, Suppliers, Cost per unit\n';
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
              // Extract supplier names and costs from supplier_details
              const suppliers =
                row?.supplier_details?.length > 0
                  ? row?.supplier_details
                      .map(
                        (supplier) =>
                          `{${supplier.supplier_name} (${supplier.supplier_cost})}`
                      )
                      .join('; ')
                  : '-';
              values.push(suppliers);
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
    }, [filteredIngredients]);

    useImperativeHandle(
      forwardedRef,
      () => {
        props.forceOptionsUpdate();

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
      inventoryService
        .getIngredientPreview(row.id)
        .then((res) => {
          togglePopupDelete(res.data);
        })
        .catch((err) => {
          console.log(err);
        })
        .finally(() => {
          props.setLoadingState(false);
        });
    };

    const handleAddSupplierDetail = () => {
      setEditedValues((prevValues) => {
        const newDetails = prevValues.supplier_details
          ? [...prevValues.supplier_details]
          : [];
        newDetails.push({ supplier_uuid: '', supplier_cost: 0 });
        return { ...prevValues, supplier_details: newDetails };
      });
    };

    const handleRemoveSupplierDetail = (index) => {
      setEditedValues((prevValues) => {
        if (!prevValues) return prevValues;

        // Filter out the supplier detail at the specific index
        const updatedSupplierDetails = prevValues.supplier_details.filter(
          (_, idx) => idx !== index
        );

        // Return the updated object with the new supplier details array
        return {
          ...prevValues,
          supplier_details: updatedSupplierDetails,
        };
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
      props.setLoadingState(true);
      if (!editedValues) return;
      const {
        id,
        name,
        tag_details,
        parLevel,
        actualStock,
        unit,
        supplier_details,
        unitCost,
      } = editedValues;

      const updatedIngredient = {
        id,
        name,
        tag_details,
        parLevel,
        actualStock,
        unit,
        supplier_details,
        unitCost,
        restaurantUUID: selectedRestaurantUUID, // Add the selectedRestaurantUUID here
      };

      inventoryService
        .updateIngredient(updatedIngredient)
        .catch((err) => {
          togglePopupError(err.message);
        })
        .then(() => {
          reloadTagList();
          reloadInventoryData();
          props.setLoadingState(false);
        });
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
        id: '', // New ingredient will have a temporary empty id
        name: '',
        tagUUID: null,
        parLevel: 0,
        actualStock: 0,
        unit: null,
        // supplier_uuid: suppliers.length ? suppliers[0].value : '',
        // supplier: suppliers.length ? suppliers[0].label : '',
        supplier_details: [
          { supplier_id: null, supplier_name: '', supplier_cost: 0 },
        ],
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
            <Autocomplete
              multiple
              freeSolo
              ListboxProps={{ style: { maxHeight: 150 } }}
              options={tagList}
              value={selectedTags}
              onChange={handleSelectedTags}
              onInputChange={handleInputChange}
              inputValue={inputValue}
              getOptionLabel={(option) => option?.name}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    label={option.name}
                    {...getTagProps({ index })}
                    key={option.uuid}
                  />
                ))
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="outlined"
                  onKeyDown={handleKeyDown}
                />
              )}
              sx={{
                '& .MuiInputBase-root': {
                  padding: '5px',
                },
              }}
            />
          ) : row.tagUUID &&
            Array.isArray(row.tagUUID) &&
            row.tagUUID.length > 0 ? (
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                maxHeight: '100px',
                overflowY: row.tagUUID.length > 6 ? 'scroll' : 'visible',
              }}>
              {row.tagUUID.map((uuid) => {
                const tag = tagList.find((tag) => tag.uuid === uuid);
                if (tag) {
                  const displayName =
                    tag.name.length > 6
                      ? `${tag.name.slice(0, 6)}...`
                      : tag.name;
                  return (
                    <span
                      key={uuid}
                      style={{
                        display: 'inline-block',
                        padding: '5px 10px',
                        marginRight: '5px',
                        marginBottom: '5px',
                        borderRadius: '12px',
                        backgroundColor: tag.color || '#d3d3d3',
                        color: '#333',
                        fontSize: '12px',
                        maxWidth: '100px',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}>
                      {displayName}
                    </span>
                  );
                } else {
                  return (
                    <span
                      key={uuid}
                      style={{
                        display: 'inline-block',
                        padding: '5px 10px',
                        marginRight: '5px',
                        marginBottom: '5px',
                        borderRadius: '12px',
                        backgroundColor: '#d3d3d3',
                        color: '#333',
                        fontSize: '12px',
                        maxWidth: '100px',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}>
                      -
                    </span>
                  );
                }
              })}
            </div>
          ) : (
            '-' // Fallback if there are no tags
          ),
      },
      {
        key: 'parLevel',
        header: t('ingredient:parLvel'),
        width: '10%',
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
        key: 'supplier_name',
        header: t('ingredient:supplierName'),
        width: '15%',
        renderItem: ({ row, index }) => {
          if (editingRowId === row.id) {
            return (
              <>
                <div>
                  {editedValues?.supplier_details.map((detail, detailIndex) => (
                    <div
                      key={detailIndex}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '5px',
                        gap: '10px',
                      }}>
                      <Dropdown
                        placeholder={t('Select a supplier')}
                        options={suppliers}
                        selectedOption={detail.supplier_id}
                        onOptionChange={(value) => {
                          const selectedSupplier = suppliers.find(
                            (supplier) => supplier.value === value
                          );
                          if (selectedSupplier) {
                            setEditedValues((prevValues) => {
                              const newDetails = [
                                ...prevValues.supplier_details,
                              ];
                              newDetails[detailIndex] = {
                                ...newDetails[detailIndex],
                                supplier_id: value,
                                supplier_name: selectedSupplier.label,
                              };
                              return {
                                ...prevValues,
                                supplier_details: newDetails,
                              };
                            });
                          }
                        }}
                      />
                    </div>
                  ))}
                </div>
              </>
            );
          } else {
            return (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  flexDirection: 'column',
                  gap: '10px',
                  padding: '5px',
                }}>
                {row.supplier_details.map((detail, detailIndex) => (
                  <span key={detailIndex}>
                    {detail.supplier_name || 'Select a supplier'}
                  </span>
                ))}
              </div>
            );
          }
        },
      },

      {
        key: 'supplier_cost',
        header: t('ingredient:supplierCost'),
        width: '15%',
        renderItem: ({ row, index }) => {
          if (editingRowId === row.id) {
            return (
              <>
                {editedValues?.supplier_details.map((detail, detailIndex) => (
                  <div
                    key={detailIndex}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '5px',
                      gap: '10px',
                    }}>
                    <Input
                      type="number"
                      min={0}
                      placeholder={t('Cost')}
                      value={detail.supplier_cost}
                      onChange={(e) => {
                        const cost = e;
                        setEditedValues((prevValues) => {
                          const newDetails = [...prevValues.supplier_details];
                          newDetails[detailIndex] = {
                            ...newDetails[detailIndex],
                            supplier_cost: cost,
                          };
                          return {
                            ...prevValues,
                            supplier_details: newDetails,
                          };
                        });
                      }}
                    />
                    {/* <button>Delete</button> */}
                    <div className="actions">
                      <i
                        className="fa-solid fa-trash"
                        data-tooltip-id="inventory-tooltip"
                        data-tooltip-content={t('delete')}
                        onClick={() =>
                          handleRemoveSupplierDetail(detailIndex)
                        }></i>
                    </div>
                  </div>
                ))}
              </>
            );
          } else {
            return (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  flexDirection: 'column',
                  padding: '5px',
                }}>
                {row.supplier_details.map((detail, detailIndex) => (
                  <span key={detailIndex}>{detail.supplier_cost}</span>
                ))}
              </div>
            );
          }
        },
      },
      {
        key: 'actions',
        header: t('ingredient:actions'),
        width: '10%',
        renderItem: ({ row, index }) => {
          return (
            <div className="actions">
              {editingRowId === row.id ? (
                <>
                  {' '}
                  <i
                    className="fa-solid fa-plus"
                    data-tooltip-id="inventory-tooltip"
                    data-tooltip-content={t('validate')}
                    onClick={handleAddSupplierDetail}></i>
                  <i
                    className="fa-solid fa-check"
                    data-tooltip-id="inventory-tooltip"
                    data-tooltip-content={t('validate')}
                    onClick={handleSaveEdit}></i>
                </>
              ) : (
                <>
                  <i
                    className="fa-solid fa-pen-to-square"
                    data-tooltip-id="inventory-tooltip"
                    data-tooltip-content={t('edit')}
                    onClick={() => handleEditClick(row)}></i>
                </>
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
        <Table data={paginatedIngredients} columns={columns} />
        <CustomPagination
          shape="rounded"
          count={Math.ceil((filteredIngredients?.length || 0) / ITEMS_PER_PAGE)}
          value={page}
          onChange={handleChange}
          sx={{
            '& .MuiPaginationItem-root': {
              color: '#5e72e4',
              '&:hover': {
                backgroundColor: 'none',
              },
            },
            '& .MuiPaginationItem-root.Mui-selected': {
              backgroundColor: '#5e72e4',
              color: 'white',
              '&:hover': {
                backgroundColor: '#5e72e4',
              },
            },
          }}
        />

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
