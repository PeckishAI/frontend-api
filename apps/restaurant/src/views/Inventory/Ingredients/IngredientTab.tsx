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
  SidePanel,
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
import { tagService } from '../../../services/tag.service';
import Filters, {
  FiltersType,
  defaultFilters,
} from '../Components/Filters/Filters';
import CustomPagination from '../../Overview/components/Pagination/CustomPagination';
import CreatableSelect from 'react-select/creatable';
import styles from '../Ingredients/IngredientTab.module.scss';

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
    //New  design state
    const [isSidePanelOpen, setIsSidePanelOpen] = useState(false); // Side panel visibility state
    const [isEditMode, setIsEditMode] = useState(false); // Edit mode toggle state
    const [isIngredientsVisible, setIsIngredientsVisible] = useState(false);
    const [isQuantityVisible, setIsQuantityVisible] = useState(false);

    const toggleIngredientsVisibility = () => {
      setIsIngredientsVisible(!isIngredientsVisible);
    };

    const toggleQuantityVisibility = () => {
      setIsQuantityVisible(!isQuantityVisible);
    };

    const { t } = useTranslation(['common', 'ingredient']);
    const { currencyISO } = useRestaurantCurrency();
    const [ingredientsList, setIngredientsList] = useState<Ingredient[]>([]);
    const [filteredIngredients, setFilteredIngredients] = useState<
      Ingredient[]
    >([]);
    const [ingredientTags, setIngredientTags] = useState<{
      [key: string]: Tag[];
    }>({});
    const [inputValue, setInputValue] = useState<string>('');

    const [filters, setFilters] = useState<FiltersType>(defaultFilters);
    const [tagList, setTagList] = useState<Tag[]>([]);
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

    // Make sure there is no default sorting applied
    const [sortColumn, setSortColumn] = useState<string | null>(null); // No default column
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc' | null>(
      null
    );
    const [hoveredColumn, setHoveredColumn] = useState<string | null>(null);

    const selectedRestaurantUUID = useRestaurantStore(
      (state) => state.selectedRestaurantUUID
    );

    const reloadRestaurantSuppliers = useCallback(async () => {
      if (!selectedRestaurantUUID) return;

      supplierService
        .getRestaurantSuppliers(selectedRestaurantUUID)
        .then((res) => {
          const suppliersList: DropdownOptionsDefinitionType[] = [];
          res.forEach((supplier) => {
            suppliersList.push({
              label: supplier.name,
              value: supplier.supplier_uuid,
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

        if (filters.selectedSupplier && filters.selectedSupplier.length > 0) {
          const selectedSupplierUuids = filters.selectedSupplier.map(
            (supplier) => supplier.uuid
          );
          filteredList = filteredList.filter(
            (ingredient) =>
              ingredient.supplier_details?.some((supplier) =>
                selectedSupplierUuids.includes(supplier.supplier_id)
              )
          );
        }

        if (filters.selectedTag && filters.selectedTag.length > 0) {
          const selectedTagUuids = filters.selectedTag.map((tag) => tag.uuid);
          filteredList = filteredList.filter(
            (ingredient) =>
              ingredient.tagUUID?.some((tagUuid) =>
                selectedTagUuids.includes(tagUuid)
              )
          );
        }

        setFilteredIngredients(filteredList);
      };

      applyFilters();
    }, [props.searchValue, filters, ingredientsList]);

    // Sorting logic
    const sortIngredients = (ingredients: Ingredient[]) => {
      if (!sortColumn) return ingredients;

      const sorted = [...ingredients].sort((a, b) => {
        let aValue = a[sortColumn as keyof Ingredient];
        let bValue = b[sortColumn as keyof Ingredient];

        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return aValue.localeCompare(bValue);
        } else if (typeof aValue === 'number' && typeof bValue === 'number') {
          return aValue - bValue;
        }

        return 0;
      });

      return sortDirection === 'asc' ? sorted : sorted.reverse();
    };

    const handleSort = (columnKey: keyof Ingredient) => {
      if (sortColumn === columnKey) {
        setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
      } else {
        setSortColumn(columnKey);
        setSortDirection('asc');
      }
      setHoveredColumn(null); // Reset hover state on click
    };

    const handleMouseEnter = (columnKey: keyof Ingredient) => {
      setHoveredColumn(columnKey);
    };

    const handleMouseLeave = () => {
      setHoveredColumn(null);
    };

    const arrowStyle = {
      color: '#CCCCCC', // Neutral light color
      fontSize: '22px',
      marginLeft: '5px',
      marginBottom: '0px',
      top: '-1px',
      position: 'relative',
    };

    const hoverArrowStyle = {
      ...arrowStyle,
      color: '#5E72E4',
    };

    const activeArrowStyle = {
      color: '#5E72E4',
      fontSize: '22px',
      marginLeft: '5px',
      marginBottom: '0px',
      top: '-1px',
      position: 'relative',
    };

    const renderSortArrow = (columnKey: keyof Ingredient) => {
      const isActiveColumn = sortColumn === columnKey;
      const isHoveredColumn = hoveredColumn === columnKey;

      if (isActiveColumn) {
        // If the column is the active one being sorted
        return sortDirection === 'asc' ? (
          <span style={activeArrowStyle}>↑</span>
        ) : (
          <span style={activeArrowStyle}>↓</span>
        );
      } else if (isHoveredColumn) {
        // If the column is being hovered over
        return <span style={hoverArrowStyle}>↑</span>;
      } else {
        // Default neutral arrow for other columns
        return <span style={arrowStyle}>↑</span>;
      }
    };

    const sortedIngredients = sortIngredients(filteredIngredients);
    const paginatedIngredients = sortedIngredients.slice(startIndex, endIndex);

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
              values.push(row.name);
              values.push(row.parLevel || '-');
              values.push(row.actualStock || '-');
              values.push(row.theoriticalStock || '-');
              values.push(row.unit || '-');
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
      reloadRestaurantSuppliers();
    }, [reloadInventoryData, reloadTagList, reloadRestaurantSuppliers]);

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
    const handleEditClick = (row) => {
      setEditingRowId(row.id); // Set the row being edited
      setEditedValues({ ...row }); // Clone the row's data into state
      setIsSidePanelOpen(true); // Open the side panel
      setIsEditMode(false); // Start in view mode
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
          .then(() => {
            reloadTagList();
            reloadInventoryData();
          });
        setAddingRow(false);
      }
    };

    // const handleCancelEdit = () => {
    //   setEditingRowId(null);
    //   setEditedValues(null);
    //   if (addingRow) {
    //     const updatedList = ingredientsList.filter(
    //       (ingredient) => ingredient.id !== ''
    //     );
    //     setIngredientsList(updatedList);
    //     setAddingRow(false);
    //   }
    // };

    const handleCancelEdit = () => {
      setEditedValues(null); // Reset changes
      setEditingRowId(null); // Clear editing state
      setIsSidePanelOpen(false); // Close the side panel
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

    const handleSelectedTags = (
      event: React.SyntheticEvent,
      newValue: (Tag | string)[],
      rowId: string
    ) => {
      // Convert the newValue to an array of tag objects
      const tags = newValue.map((item) => {
        if (typeof item === 'string') {
          // If the item is a string, it's a new tag created by the user
          return { name: item, uuid: '' }; // Ensure uuid is empty
        } else if (item.uuid === item.name) {
          // If the uuid matches the name, it's likely a new tag that needs an empty uuid
          return { name: item.name, uuid: '' };
        } else {
          // If the item is an object, it’s an existing tag
          return item;
        }
      });

      // Update the state only for the specific row (ingredient)
      setIngredientTags((prevTags) => ({
        ...prevTags,
        [rowId]: tags,
      }));

      // Update the editedValues with the new tags
      setEditedValues((prevValues) => ({
        ...prevValues,
        tag_details: tags,
      }));
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
      const { id, name, parLevel, actualStock, unit, unitCost } = editedValues;

      // Ensure tag_details and supplier_details are always defined
      const supplier_details = editedValues.supplier_details || [];

      const tag_details = (editedValues?.tag_details || []).map((tag) => {
        if (tag.uuid === tag.name) {
          return { name: tag.name, uuid: '' };
        } else {
          return { name: tag.name, uuid: tag.uuid };
        }
      });

      const updatedIngredient = {
        id,
        name,
        tag_details,
        parLevel,
        actualStock,
        unit,
        supplier_details,
        unitCost,
        restaurantUUID: selectedRestaurantUUID,
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
          setIsSidePanelOpen(false);
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
        tag_details: null,
        tagUUID: null,
        parLevel: 0,
        actualStock: 0,
        unit: null,
        supplier_details: [
          { supplier_id: null, supplier_name: null, supplier_cost: 0 },
        ],
        unitCost: 0,
        actions: undefined,
      };

      setIngredientsList((list) => [newIngredient, ...list]);
      setIngredientTags('');
      setAddingRow(true);
      setEditingRowId(newIngredient.id);
      setEditedValues(newIngredient);
    };

    const columnHeaderStyle = {
      cursor: 'pointer',
      padding: '10px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    };

    useEffect(() => {
      reloadInventoryData();
      reloadTagList();
      reloadRestaurantSuppliers();
    }, [reloadInventoryData, reloadTagList, reloadRestaurantSuppliers]);

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
        header: () => (
          <div
            onClick={() => handleSort('name')}
            onMouseEnter={() => handleMouseEnter('name')}
            onMouseLeave={handleMouseLeave}
            style={columnHeaderStyle}>
            {t('ingredient:ingredientName')} {renderSortArrow('name')}
          </div>
        ),
        width: '15%',
        classname: 'column-bold',
        renderItem: ({ row }) =>
          // editingRowId === row.id ? (
          //   <Input
          //     type="text"
          //     min={0}
          //     placeholder={t('name')}
          //     onChange={(value) => handleValueChange('name', value)}
          //     value={editedValues!.name}
          //   />
          // ) : (
          row.name,
        // ),
      },
      {
        key: 'tagUUID',
        header: t('ingredient:tag'),
        width: '15%',
        minWidth: '150px',
        renderItem: ({ row }) => {
          // Find the initial selected tags based on the tagUUIDs
          const initialSelectedTags = row.tagUUID
            ? row.tagUUID
                .map((uuid) => tagList.find((tag) => tag.uuid === uuid))
                .filter(Boolean)
            : [];

          // Use the row-specific tags if available, otherwise fall back to initialSelectedTags
          const autocompleteValue =
            ingredientTags[row.id] || initialSelectedTags;

          return row.tagUUID &&
            Array.isArray(row.tagUUID) &&
            row.tagUUID.length > 0 ? (
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                maxHeight: '100px',
                padding: '5px',
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
                        backgroundColor: '#5E72E4',
                        color: '#FFFFFF',
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
          );
        },
      },
      {
        key: 'parLevel',
        header: () => (
          <div
            onClick={() => handleSort('parLevel')}
            onMouseEnter={() => handleMouseEnter('parLevel')}
            onMouseLeave={handleMouseLeave}
            style={columnHeaderStyle}>
            {t('ingredient:parLvel')} {renderSortArrow('parLevel')}
          </div>
        ),
        width: '10%',
        renderItem: ({ row }) =>
          // editingRowId === row.id ? (
          //   <Input
          //     type="number"
          //     min={0}
          //     placeholder={t('ingredient:parLvel')}
          //     onChange={(value) => handleValueChange('parLevel', value)}
          //     value={editedValues!.parLevel}
          //   />
          // ) : (
          row.parLevel,
        // ),
      },
      {
        key: 'actualStock',
        header: () => (
          <div
            onClick={() => handleSort('actualStock')}
            onMouseEnter={() => handleMouseEnter('actualStock')}
            onMouseLeave={handleMouseLeave}
            style={columnHeaderStyle}>
            {t('ingredient:actualStock')} {renderSortArrow('actualStock')}
          </div>
        ),
        width: '15%',
        renderItem: ({ row }) =>
          // editingRowId === row.id ? (
          //   <Input
          //     type="number"
          //     min={0}
          //     placeholder={t('ingredient:actualStock')}
          //     onChange={(value) => handleValueChange('actualStock', value)}
          //     value={editedValues!.actualStock}
          //   />
          // ) : (
          row.actualStock,
        // ),
      },
      {
        key: 'unit',
        header: () => (
          <div
            onClick={() => handleSort('unit')}
            onMouseEnter={() => handleMouseEnter('unit')}
            onMouseLeave={handleMouseLeave}
            style={columnHeaderStyle}>
            {t('ingredient:unit')} {renderSortArrow('unit')}
          </div>
        ),
        width: '10%',
        renderItem: ({ row }) =>
          // editingRowId === row.id ? (
          //   <Dropdown
          //     placeholder={t('inventory.selectUnit')}
          //     options={units}
          //     selectedOption={editedValues!.unit}
          //     onOptionChange={(value) => handleValueChange('unit', value)}
          //   />
          // ) : (
          row.unit,
        // ),
      },
      {
        key: 'supplier_name',
        header: t('ingredient:supplierName'), // No sorting
        width: '15%',
        renderItem: ({ row, index }) => {
          // if (editingRowId === row.id) {
          //   return (
          //     <>
          //       <div>
          //         {editedValues?.supplier_details.map((detail, detailIndex) => (
          //           <div
          //             key={detailIndex}
          //             style={{
          //               display: 'flex',
          //               alignItems: 'center',
          //               padding: '5px',
          //               gap: '10px',
          //             }}>
          //             <Dropdown
          //               placeholder={t('Select a supplier')}
          //               options={suppliers}
          //               selectedOption={detail.supplier_id}
          //               onOptionChange={(value) => {
          //                 const selectedSupplier = suppliers.find(
          //                   (supplier) => supplier.value === value
          //                 );
          //                 if (selectedSupplier) {
          //                   setEditedValues((prevValues) => {
          //                     const newDetails = [
          //                       ...prevValues.supplier_details,
          //                     ];
          //                     newDetails[detailIndex] = {
          //                       ...newDetails[detailIndex],
          //                       supplier_id: value,
          //                       supplier_name: selectedSupplier.label,
          //                     };
          //                     return {
          //                       ...prevValues,
          //                       supplier_details: newDetails,
          //                     };
          //                   });
          //                 }
          //               }}
          //             />
          //           </div>
          //         ))}
          //       </div>
          //     </>
          //   );
          // } else {
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
          // }
        },
      },
      {
        key: 'supplier_cost',
        header: t('ingredient:supplierCost'),
        width: '15%',
        renderItem: ({ row, index }) => {
          // if (editingRowId === row.id) {
          //   return (
          //     <>
          //       {editedValues?.supplier_details.map((detail, detailIndex) => (
          //         <div
          //           key={detailIndex}
          //           style={{
          //             display: 'flex',
          //             alignItems: 'center',
          //             padding: '5px',
          //             gap: '10px',
          //           }}>
          //           <Input
          //             type="number"
          //             min={0}
          //             placeholder={t('Cost')}
          //             value={detail.supplier_cost}
          //             onChange={(e) => {
          //               const cost = e;
          //               setEditedValues((prevValues) => {
          //                 const newDetails = [...prevValues.supplier_details];
          //                 newDetails[detailIndex] = {
          //                   ...newDetails[detailIndex],
          //                   supplier_cost: cost,
          //                 };
          //                 return {
          //                   ...prevValues,
          //                   supplier_details: newDetails,
          //                 };
          //               });
          //             }}
          //           />
          //           <div className="actions">
          //             <i
          //               className="fa-solid fa-trash"
          //               data-tooltip-id="inventory-tooltip"
          //               data-tooltip-content={t('delete')}
          //               onClick={() =>
          //                 handleRemoveSupplierDetail(detailIndex)
          //               }></i>
          //           </div>
          //         </div>
          //       ))}
          //     </>
          //   );
          // } else {
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
          // }
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
                  {/* <i
                    className="fa-solid fa-pen-to-square"
                    data-tooltip-id="inventory-tooltip"
                    data-tooltip-content={t('edit')}
                    onClick={() => handleEditClick(row)}></i> */}
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
        {isSidePanelOpen && (
          <SidePanel
            isOpen={isSidePanelOpen}
            onRequestClose={handleCancelEdit}
            className={styles.sidePanel}>
            <div className={styles.optionsButtons}>
              {isEditMode ? (
                <>
                  <IconButton
                    icon={<i className="fa-solid fa-check"></i>}
                    tooltipMsg={t('save')}
                    onClick={handleSaveEdit}
                    className="iconButton"
                  />
                  <IconButton
                    icon={<i className="fa-solid fa-times"></i>}
                    tooltipMsg={t('cancel')}
                    onClick={handleCancelEdit}
                    className="iconButton"
                  />
                </>
              ) : (
                <>
                  <IconButton
                    icon={<i className="fa-solid fa-pen-to-square"></i>}
                    tooltipMsg={t('edit')}
                    onClick={() => setIsEditMode(true)}
                    className="iconButton"
                  />
                  {/* <IconButton
                    icon={<i className="fa-solid fa-trash"></i>}
                    tooltipMsg={t('delete')}
                    onClick={handleDeleteClick}
                    className="iconButton"
                  /> */}
                </>
              )}
            </div>
            <div className={styles.inputContainer}>
              <div className={styles.divider}>
                <div className={styles.inputContainer}>
                  <div className={styles.title}>
                    <span className={styles.titleRecipeName}>
                      Ingredient Name:
                    </span>
                  </div>
                  {isEditMode ? (
                    <Input
                      label={t('ingredientName')}
                      value={editedValues?.name || ''}
                      onChange={(value) =>
                        setEditedValues({ ...editedValues, name: value })
                      }
                      className={styles.inputField}
                    />
                  ) : (
                    <span className={styles.value}> {editedValues?.name}</span>
                  )}
                </div>
                <div className={styles.gridContainer}>
                  <div className={styles.inputContainer}>
                    <div className={styles.title}>
                      {' '}
                      <span className={styles.titleRecipeName}>par Level:</span>
                    </div>
                    {isEditMode ? (
                      <Input
                        type="number"
                        label={t('parLevel')}
                        value={editedValues?.parLevel || ''}
                        onChange={(value) =>
                          setEditedValues({ ...editedValues, parLevel: value })
                        }
                        className={styles.inputField}
                      />
                    ) : (
                      <span className={styles.value}>
                        {editedValues?.parLevel}
                      </span>
                    )}
                  </div>
                  <div className={styles.inputContainer}>
                    <div className={styles.title}>
                      {' '}
                      <span className={styles.titleRecipeName}>
                        Actual Stock:
                      </span>
                    </div>
                    {isEditMode ? (
                      <Input
                        type="number"
                        label={t('actualStock')}
                        value={editedValues?.actualStock || ''}
                        onChange={(value) =>
                          setEditedValues({
                            ...editedValues,
                            actualStock: value,
                          })
                        }
                        className={styles.inputField}
                      />
                    ) : (
                      <span className={styles.value}>
                        {editedValues?.actualStock}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              {/* Tag Section */}
              <div className={styles.inputContainer}>
                <div className={styles.divider}>
                  <div className={styles.title}>
                    <span className={styles.titleRecipeName}>Tags:</span>
                  </div>
                  {isEditMode ? (
                    <CreatableSelect
                      isMulti
                      onInputChange={(newInputValue) => {
                        console.log('newInputValue', newInputValue);
                        if (typeof newInputValue === 'string') {
                          setInputValue(newInputValue);
                        }
                      }}
                      inputValue={inputValue}
                      styles={{
                        control: (provided) => ({
                          ...provided,
                          minHeight: '1px',
                          borderRadius: '12px',
                          maxHeight: '200px',
                          overflowY: 'auto',
                          margin: '5px',
                          marginBottom: '10px',
                        }),
                        menu: (provided) => ({
                          ...provided,
                          zIndex: 9999,
                        }),
                        menuList: (provided) => ({
                          ...provided,
                          maxHeight: '200px',
                          overflowY: 'auto',
                        }),
                        option: (provided, state) => ({
                          ...provided,
                          backgroundColor: state.isSelected
                            ? '#007BFF'
                            : provided.backgroundColor,
                          color: state.isSelected ? '#FFFFFF' : provided.color,
                        }),
                        container: (provided) => ({
                          ...provided,
                          overflow: 'visible',
                        }),
                        multiValue: (provided) => ({
                          ...provided,
                          backgroundColor: '#5E72E4',
                          color: '#FFFFFF',
                          borderRadius: '12px',
                        }),
                        multiValueLabel: (provided) => ({
                          ...provided,
                          color: '#ffffff',
                          borderRadius: '12px',
                        }),
                        multiValueRemove: (provided) => ({
                          ...provided,
                          color: '#ffffff',
                          ':hover': {
                            backgroundColor: '#b5adad',
                            borderRadius: '12px',
                            color: '#ffffff',
                          },
                        }),
                      }}
                      maxMenuHeight={2}
                      isClearable={false}
                      options={tagList.map((tag) => ({
                        label: tag.name || '--',
                        value: tag.uuid,
                      }))}
                      value={[
                        ...(editedValues?.tagUUID || []).map((uuid) => {
                          const tag = tagList.find((tag) => tag.uuid === uuid);
                          return {
                            label: tag?.name || '11111',
                            value: uuid,
                          };
                        }),

                        ...(editedValues?.tag_details || [])
                          .filter((tag) => !tag.uuid)
                          .map((newTag) => ({
                            label: newTag.name || 'New Tag',
                            value: '',
                          })),
                      ]}
                      onChange={(newValue) => {
                        const updatedTagDetails = newValue.map((option) => {
                          if (!option.value) {
                            return {
                              name: option.label || 'Unknown',
                              uuid: '',
                            };
                          } else {
                            const existingTag = tagList.find(
                              (tag) => tag.uuid === option.value
                            );
                            return {
                              name: existingTag
                                ? existingTag.name
                                : option.label,
                              uuid: option.value,
                            };
                          }
                        });

                        setEditedValues((prevValues) => ({
                          ...prevValues,
                          tag_details: updatedTagDetails,
                          tagUUID: updatedTagDetails.map((tag) => tag.uuid),
                        }));
                      }}
                    />
                  ) : (
                    <div className={styles.tagList}>
                      {editedValues?.tagUUID?.length > 0 ? (
                        <div className={styles.tagContainer}>
                          {editedValues?.tagUUID?.map((uuid) => {
                            const tag = tagList.find(
                              (tag) => tag.uuid === uuid
                            );
                            if (tag) {
                              const displayName =
                                tag.name.length > 6
                                  ? `${tag.name.slice(0, 6)}...`
                                  : tag.name;
                              return (
                                <span
                                  key={uuid}
                                  className={styles.tagItem}
                                  style={{
                                    backgroundColor: tag.color || '#5E72E4',
                                    color: '#ffffff',
                                  }}>
                                  {displayName}
                                </span>
                              );
                            } else {
                              return (
                                <span
                                  key={uuid}
                                  className={styles.tagItem}
                                  style={{
                                    backgroundColor: '#d3d3d3',
                                    color: '#333',
                                  }}>
                                  -
                                </span>
                              );
                            }
                          })}
                        </div>
                      ) : (
                        '-'
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Supplier Section */}
              <div className={styles.inputContainer}>
                <div className={styles.divider}>
                  <div className={styles.supplierContainer}>
                    <div className={styles.title}>
                      {' '}
                      <span className={styles.titleRecipeName}>
                        Supplier Details:
                      </span>
                    </div>
                    {isEditMode && (
                      <div className={styles.title}>
                        <span
                          className={styles.titleRecipeName}
                          onClick={handleAddSupplierDetail}>
                          {' '}
                          <i
                            className="fa-solid fa-plus"
                            data-tooltip-id="inventory-tooltip"
                            data-tooltip-content={t('validate')}></i>{' '}
                          Add Supplier
                        </span>
                      </div>
                    )}
                  </div>
                  {/* <div className={styles.gridContainer}>
                    <span className={styles.values}>Name</span>
                    <span className={styles.values}>Cost</span>
                  </div> */}
                  {isEditMode ? (
                    editedValues?.supplier_details?.map((detail, index) => (
                      <div
                        key={index}
                        className={styles.supplierDetailContainer}>
                        <Dropdown
                          options={suppliers}
                          selectedOption={detail.supplier_id}
                          onOptionChange={(value) => {
                            const selectedSupplier = suppliers.find(
                              (s) => s.value === value
                            );
                            const updatedDetails = [
                              ...editedValues.supplier_details,
                            ];
                            updatedDetails[index] = {
                              ...updatedDetails[index],
                              supplier_id: value,
                              supplier_name: selectedSupplier?.label || '',
                            };
                            setEditedValues({
                              ...editedValues,
                              supplier_details: updatedDetails,
                            });
                          }}
                        />
                        <Input
                          type="number"
                          label={t('supplierCost')}
                          value={detail.supplier_cost}
                          onChange={(value) => {
                            const updatedDetails = [
                              ...editedValues.supplier_details,
                            ];
                            updatedDetails[index].supplier_cost = value;
                            setEditedValues({
                              ...editedValues,
                              supplier_details: updatedDetails,
                            });
                          }}
                          className="inputField"
                        />
                        <Input
                          type="number"
                          label={t('conversion_factor')}
                          value={detail.conversion_factor}
                          onChange={(value) => {
                            const updatedDetails = [
                              ...editedValues.supplier_details,
                            ];
                            updatedDetails[index].conversion_factor = value;
                            setEditedValues({
                              ...editedValues,
                              supplier_details: updatedDetails,
                            });
                          }}
                          className="inputField"
                        />{' '}
                        {console.log(
                          'supplier_unit',
                          detail.supplier_unit,
                          units
                        )}
                        <Dropdown
                          placeholder={t('supplier_unit')}
                          options={units}
                          selectedOption={
                            units.find(
                              (unit) => unit.value === detail.supplier_unit
                            ) || null
                          }
                          onOptionChange={(selectedOption) => {
                            const updatedRecipes = [...editedValues.recipes];
                            updatedRecipes[index].supplier_unit =
                              selectedOption.value;
                            setEditedValues({
                              ...editedValues,
                              recipes: updatedRecipes,
                            });
                          }}
                        />
                        <i
                          className="fa-solid fa-trash"
                          data-tooltip-id="inventory-tooltip"
                          data-tooltip-content={t('delete')}
                          onClick={() => handleRemoveSupplierDetail(index)}></i>
                      </div>
                    ))
                  ) : (
                    <div>
                      {editedValues?.supplier_details?.map((detail, index) => (
                        <div className={styles.gridContainer}>
                          <span key={index} className={styles.value}>
                            {detail.supplier_name}
                          </span>
                          <span> {detail.supplier_cost}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {/* {isEditMode && (
                    <div className={styles.inputContainer}>
                      <div
                        className={styles.value}
                        onClick={handleAddSupplierDetail}>
                        {' '}
                        <i
                          className="fa-solid fa-plus"
                          data-tooltip-id="inventory-tooltip"
                          data-tooltip-content={t('validate')}></i>{' '}
                        Add Supplier
                      </div>
                    </div>
                  )} */}
                </div>
              </div>

              {/* Recipe section */}
              <div className={styles.inputContainer}>
                <div className={styles.divider}>
                  <div className={styles.supplierContainer}>
                    <div className={styles.title}>
                      {' '}
                      <span className={styles.titleRecipeName}>
                        Recipe Details:
                      </span>
                    </div>
                  </div>
                  <div
                    className={styles.ingredientsToggle}
                    onClick={toggleIngredientsVisibility}>
                    <span>
                      {isIngredientsVisible
                        ? '▼ Hide Recipes'
                        : `▶ Show Recipes (${editedValues?.recipe_count})`}
                    </span>
                  </div>
                  {isIngredientsVisible && (
                    <>
                      {isEditMode ? (
                        <div>
                          <div className={styles.gridContainer4}>
                            <div>
                              <span className={styles.values}>
                                Recipe Name:
                              </span>
                            </div>
                            <div>
                              <span className={styles.values}>Quantity:</span>
                            </div>
                            <div>
                              <span className={styles.values}>Unit:</span>
                            </div>
                            <div>
                              <span className={styles.values}>
                                Conversion Factor:
                              </span>
                            </div>
                          </div>
                          {editedValues?.recipes?.map((recipe, index) => (
                            <div key={index} className={styles.recipeContainer}>
                              <div className={styles.gridContainer4}>
                                {/* Recipe Name */}
                                <div className={styles.inputContainer}>
                                  {isEditMode ? (
                                    <span className={styles.value}>
                                      {recipe.recipe_name}
                                    </span>
                                  ) : (
                                    // <Input
                                    //   type="text"
                                    //   label={t('recipe_name')}
                                    //   value={recipe.recipe_name}
                                    //   onChange={(e) => {
                                    //     const updatedRecipes = [
                                    //       ...editedValues.recipes,
                                    //     ];
                                    //     updatedRecipes[index].recipe_name = e;
                                    //     setEditedValues({
                                    //       ...editedValues,
                                    //       recipes: updatedRecipes,
                                    //     });
                                    //   }}
                                    //   className={styles.inputField}
                                    // />
                                    <span className={styles.value}>
                                      {recipe.recipe_name}
                                    </span>
                                  )}
                                </div>

                                {/* Quantity */}
                                <div className={styles.inputContainer}>
                                  {isEditMode ? (
                                    <span className={styles.value}>
                                      {recipe.quantity}
                                    </span>
                                  ) : (
                                    // <Input
                                    //   type="number"
                                    //   label={t('quantity')}
                                    //   value={recipe.quantity}
                                    //   onChange={(e) => {
                                    //     const updatedRecipes = [
                                    //       ...editedValues.recipes,
                                    //     ];
                                    //     updatedRecipes[index].quantity = e;
                                    //     setEditedValues({
                                    //       ...editedValues,
                                    //       recipes: updatedRecipes,
                                    //     });
                                    //   }}
                                    //   className={styles.inputField}
                                    // />
                                    <span className={styles.value}>
                                      {recipe.quantity}
                                    </span>
                                  )}
                                </div>

                                {/* Unit Dropdown */}
                                <div className={styles.inputContainer}>
                                  {isEditMode ? (
                                    <span className={styles.value}>
                                      {recipe.unit_name ||
                                        t('No Unit Selected')}
                                    </span>
                                  ) : (
                                    // <Dropdown
                                    //   placeholder={t('inventory.selectUnit')}
                                    //   options={units} // Assuming 'units' is an array of options with { value: 'unit_uuid', label: 'unit_name' }
                                    //   selectedOption={recipe.unit_uuid}
                                    //   onOptionChange={(value) => {
                                    //     const updatedRecipes = [
                                    //       ...editedValues.recipes,
                                    //     ];
                                    //     updatedRecipes[index].unit_uuid = value;
                                    //     setEditedValues({
                                    //       ...editedValues,
                                    //       recipes: updatedRecipes,
                                    //     });
                                    //   }}
                                    // />
                                    <span className={styles.value}>
                                      {recipe.unit_name}
                                    </span>
                                  )}
                                </div>

                                {/* Conversion Factor */}
                                <div className={styles.inputContainer}>
                                  {isEditMode ? (
                                    // <Input
                                    //   type="number"
                                    //   label={t('conversion_factor')}
                                    //   value={recipe.conversion_factor}
                                    //   onChange={(e) => {
                                    //     const updatedRecipes = [
                                    //       ...editedValues.recipes,
                                    //     ];
                                    //     updatedRecipes[index].conversion_factor = e;
                                    //     setEditedValues({
                                    //       ...editedValues,
                                    //       recipes: updatedRecipes,
                                    //     });
                                    //   }}
                                    //   className={styles.inputField}
                                    // />
                                    <span className={styles.value}>
                                      {recipe.conversion_factor}
                                    </span>
                                  ) : (
                                    <span className={styles.value}>
                                      {recipe.conversion_factor}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div>
                          <div className={styles.gridContainer4}>
                            <span className={styles.title}>Recipe Name:</span>
                            <span className={styles.title}>Quantity:</span>
                            <span className={styles.title}>Unit:</span>
                            <span className={styles.title}>
                              Conversion Factor:
                            </span>
                          </div>
                          {/* Display mode when not in edit mode */}
                          {editedValues?.recipes?.map((recipe, index) => (
                            <div key={index} className={styles.recipeContainer}>
                              <div className={styles.gridContainer4}>
                                <div className={styles.inputContainer}>
                                  <span className={styles.value}>
                                    {recipe.recipe_name}
                                  </span>
                                </div>
                                <div className={styles.inputContainer}>
                                  <span className={styles.value}>
                                    {recipe.quantity}
                                  </span>
                                </div>
                                <div className={styles.inputContainer}>
                                  <span className={styles.value}>
                                    {recipe.unit_name}
                                  </span>
                                </div>
                                <div className={styles.inputContainer}>
                                  <span className={styles.value}>
                                    {recipe.conversion_factor}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* History section */}
              <div className={styles.inputContainer}>
                <div className={styles.divider}>
                  <div className={styles.supplierContainer}>
                    <div className={styles.title}>
                      {' '}
                      <span className={styles.titleRecipeName}>History:</span>
                    </div>
                  </div>

                  <div
                    className={styles.ingredientsToggle}
                    onClick={toggleQuantityVisibility}>
                    <span>
                      {isQuantityVisible
                        ? '▼ Hide Quantity'
                        : `▶ Show Quantity (11)`}
                    </span>
                  </div>

                  {isQuantityVisible && (
                    <>
                      {isEditMode ? (
                        <div>
                          <div className={styles.gridContainer3}>
                            <div>
                              <span className={styles.values}>Event Type:</span>
                            </div>
                            <div>
                              <span className={styles.values}>Quantity:</span>
                            </div>
                            <div>
                              <span className={styles.values}>Unit Name:</span>
                            </div>
                          </div>
                          {editedValues?.stock_history?.map((stock, index) => (
                            <div key={index} className={styles.recipeContainer}>
                              <div className={styles.gridContainer3}>
                                {/* Recipe Name */}
                                <div className={styles.inputContainer}>
                                  {isEditMode ? (
                                    <span className={styles.value}>
                                      {stock.event_type}
                                    </span>
                                  ) : (
                                    // <Input
                                    //   type="text"
                                    //   label={t('recipe_name')}
                                    //   value={recipe.recipe_name}
                                    //   onChange={(e) => {
                                    //     const updatedRecipes = [
                                    //       ...editedValues.recipes,
                                    //     ];
                                    //     updatedRecipes[index].recipe_name = e;
                                    //     setEditedValues({
                                    //       ...editedValues,
                                    //       recipes: updatedRecipes,
                                    //     });
                                    //   }}
                                    //   className={styles.inputField}
                                    // />
                                    <span className={styles.value}>
                                      {stock.event_type}
                                    </span>
                                  )}
                                </div>

                                {/* Quantity */}
                                <div className={styles.inputContainer}>
                                  {isEditMode ? (
                                    <span className={styles.value}>
                                      {stock.quantity}
                                    </span>
                                  ) : (
                                    // <Input
                                    //   type="number"
                                    //   label={t('quantity')}
                                    //   value={recipe.quantity}
                                    //   onChange={(e) => {
                                    //     const updatedRecipes = [
                                    //       ...editedValues.recipes,
                                    //     ];
                                    //     updatedRecipes[index].quantity = e;
                                    //     setEditedValues({
                                    //       ...editedValues,
                                    //       recipes: updatedRecipes,
                                    //     });
                                    //   }}
                                    //   className={styles.inputField}
                                    // />
                                    <span className={styles.value}>
                                      {stock.quantity}
                                    </span>
                                  )}
                                </div>

                                {/* Conversion Factor */}
                                <div className={styles.inputContainer}>
                                  {isEditMode ? (
                                    // <Input
                                    //   type="number"
                                    //   label={t('conversion_factor')}
                                    //   value={recipe.conversion_factor}
                                    //   onChange={(e) => {
                                    //     const updatedRecipes = [
                                    //       ...editedValues.recipes,
                                    //     ];
                                    //     updatedRecipes[index].conversion_factor = e;
                                    //     setEditedValues({
                                    //       ...editedValues,
                                    //       recipes: updatedRecipes,
                                    //     });
                                    //   }}
                                    //   className={styles.inputField}
                                    // />
                                    <span className={styles.value}>
                                      {stock.unit_name}
                                    </span>
                                  ) : (
                                    <span className={styles.value}>
                                      {stock.unit_name}
                                    </span>
                                  )}
                                </div>

                                {/* Unit Dropdown
                                <div className={styles.inputContainer}>
                                  <div>
                                    <span>Unit:</span>
                                  </div>
                                  {isEditMode ? (
                                    <span className={styles.value}>
                                      {recipe.unit_name ||
                                        t('No Unit Selected')}
                                    </span>
                                  ) : (
                                    // <Dropdown
                                    //   placeholder={t('inventory.selectUnit')}
                                    //   options={units} // Assuming 'units' is an array of options with { value: 'unit_uuid', label: 'unit_name' }
                                    //   selectedOption={recipe.unit_uuid}
                                    //   onOptionChange={(value) => {
                                    //     const updatedRecipes = [
                                    //       ...editedValues.recipes,
                                    //     ];
                                    //     updatedRecipes[index].unit_uuid = value;
                                    //     setEditedValues({
                                    //       ...editedValues,
                                    //       recipes: updatedRecipes,
                                    //     });
                                    //   }}
                                    // />
                                    <span className={styles.value}>
                                      {recipe.unit_name}
                                    </span>
                                  )}
                                </div> */}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div>
                          <div className={styles.gridContainer3}>
                            <span className={styles.title}>Event Name:</span>
                            <span className={styles.title}>Quantity:</span>
                            <span className={styles.title}>Unit Name:</span>
                          </div>
                          {/* Display mode when not in edit mode */}
                          {editedValues?.stock_history?.map((stock, index) => (
                            <div key={index} className={styles.recipeContainer}>
                              <div className={styles.gridContainer3}>
                                <div className={styles.inputContainer}>
                                  <span className={styles.value}>
                                    {stock.event_type}
                                  </span>
                                </div>
                                <div className={styles.inputContainer}>
                                  <span className={styles.value}>
                                    {stock.quantity}
                                  </span>
                                </div>
                                <div className={styles.inputContainer}>
                                  <span className={styles.value}>
                                    {stock.unit_name}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </SidePanel>
        )}
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
          onIngredientsImported={() => {
            reloadInventoryData();
            reloadRestaurantSuppliers();
          }}
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
