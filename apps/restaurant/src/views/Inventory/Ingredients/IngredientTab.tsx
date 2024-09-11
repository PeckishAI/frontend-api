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

    // Sorting state
    const [sortColumn, setSortColumn] = useState<'name'>('name'); 
    const [sortDirection, setSortDirection] = useState<'asc'>('asc'); 

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
          const selectedSupplierUuids = filters.selectedSupplier.map(supplier => supplier.uuid);
          filteredList = filteredList.filter(ingredient =>
              ingredient.supplier_details?.some(supplier =>
                  selectedSupplierUuids.includes(supplier.supplier_id)
              )
          );
        }

        if (filters.selectedTag && filters.selectedTag.length > 0) {
          const selectedTagUuids = filters.selectedTag.map(tag => tag.uuid);
          filteredList = filteredList.filter(ingredient =>
              ingredient.tagUUID?.some(tagUuid =>
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

    // Handle sorting (only on Ingredient Name, Par Level, Actual Stock, and Unit)
    const handleSort = (columnKey: keyof Ingredient) => {
      const sortableColumns = ['name', 'parLevel', 'actualStock', 'unit'];
      if (sortableColumns.includes(columnKey)) {
        if (sortColumn === columnKey) {
          setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
          setSortColumn(columnKey);
          setSortDirection('asc');
        }
      }
    };

    // Render sort arrow with increased size
    const arrowStyle = {
      color: '#007BFF',
      fontSize: '16px', // Increased arrow size
      marginLeft: '10px',
      marginBottom:"4px"
    };

    const renderSortArrow = (columnKey: keyof Ingredient) => {
      if (sortColumn !== columnKey) return null;
      return sortDirection === 'asc' ? (
        <span style={arrowStyle}>↑</span>
      ) : (
        <span style={arrowStyle}>↓</span>
      );
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
          .then(() => {
            reloadTagList();
            reloadInventoryData();
          });
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
      const tag_details = editedValues.tag_details || ingredientTags[id] || [];
      const supplier_details = editedValues.supplier_details || [];

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
      backgroundColor: '#f5f5f5',
      transition: 'background-color 0.3s ease',
       display: 'flex', alignItems: 'center', justifyContent: 'center'
    };
    
    const columnHeaderHoverStyle = {
      backgroundColor: '#e0e0e0', // Change background color on hover
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
            style={columnHeaderStyle}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#e0e0e0')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#f5f5f5')}
          >
            {t('ingredient:ingredientName')} {renderSortArrow('name')}
          </div>
        ),
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

          return editingRowId === row.id ? (
            <CreatableSelect
              isMulti
              maxMenuHeight={2}
              isClearable={false}
              options={tagList.map((tag) => ({
                label: tag.name ? String(tag.name) : 'Unknown', // Ensure name is a string
                value: tag.uuid,
              }))}
              onInputChange={(newInputValue) => {
                if (typeof newInputValue === 'string') {
                  setInputValue(newInputValue);
                }
              }}
              value={autocompleteValue.map((tag) => ({
                label: tag.name || 'Unknown',
                value: tag.uuid,
              }))}
              onChange={(newValue) => {
                const formattedValue = newValue.map((option) => {
                  if (!option.value) {
                    // If value (uuid) is empty, this is a new tag
                    return {
                      name: option.label || 'Unknown', // Use the entered name
                      uuid: '', // Set uuid to empty string or some placeholder
                    };
                  } else {
                    return {
                      name: option.label || 'Unknown',
                      uuid: option.value,
                    };
                  }
                });
                handleSelectedTags(null, formattedValue, row.id);
              }}
              inputValue={inputValue}
              styles={{
                control: (provided) => ({
                  ...provided,
                  minHeight: '1px', // Adjust this if
                  borderRadius: '12px',
                  maxHeight: '200px',
                  overflowY: 'auto',
                  margin: '5px',
                }),
                menu: (provided) => ({
                  ...provided,
                  zIndex: 9999, // Ensure dropdown is above other elements
                }),
                menuList: (provided) => ({
                  ...provided,
                  maxHeight: '200px', // Limit the height of the dropdown list
                  overflowY: 'auto', // Enable scrolling if the list is
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
                  overflow: 'visible', // Ensure the dropdown is not clipped
                }),
                multiValue: (provided, state) => ({
                  ...provided,
                  backgroundColor: '#5E72E4', // Background color for existing tags
                  color: '#FFFFFF', // Text color for the tags
                  borderRadius: '12px',
                }),
                multiValueLabel: (provided) => ({
                  ...provided,
                  color: '#ffffff', // Text color inside the tag
                  borderRadius: '12px',
                }),
                multiValueRemove: (provided) => ({
                  ...provided,
                  color: '#ffffff', // Color of the 'X' icon
                  ':hover': {
                    backgroundColor: '#b5adad', // Change background color on hover (optional)
                    borderRadius: '12px',
                    color: '#ffffff',
                  },
                }),
              }}
              formatCreateLabel={(inputValue) => `Create "${inputValue}"`}
            />
          ) : row.tagUUID &&
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
            style={columnHeaderStyle}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#e0e0e0')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#f5f5f5')}
          >
            {t('ingredient:parLvel')} {renderSortArrow('parLevel')}
          </div>
        ),
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
        header: () => (
          <div
            onClick={() => handleSort('actualStock')}
            style={columnHeaderStyle}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#e0e0e0')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#f5f5f5')}
          >
            {t('ingredient:actualStock')} {renderSortArrow('actualStock')}
          </div>
        ),
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
        header: () => (
          <div
            onClick={() => handleSort('unit')}
            style={columnHeaderStyle}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#e0e0e0')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#f5f5f5')}
          >
            {t('ingredient:unit')} {renderSortArrow('unit')}
          </div>
        ),
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
        header: t('ingredient:supplierName'), // No sorting
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