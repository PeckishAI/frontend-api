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
  LabeledInput,
  Select,
} from 'shared-ui';
import {
  Ingredient,
  Tag,
  inventoryService,
  recipesService,
} from '../../../services';
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
import AddIngredientPopup from './AddIngredientPopup';
import AddWastingPopup from '../Components/Wastes/Wastes';

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
    const [isVolumeVisible, setIsVolumeVisible] = useState(false);
    const [isIngredientsVisible, setIsIngredientsVisible] = useState(false);
    const [isQuantityVisible, setIsQuantityVisible] = useState(false);
    const [unitname, setUnitName] = useState([]);
    const [reference_units, setReferenceUnitName] = useState([]);
    const [unitError, setUnitError] = useState(false); // Error state for the unit field
    const [isLoading, setIsLoading] = useState(false);

    const [showAddPopup, setShowAddPopup] = useState(false);

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

    const [inputValue, setInputValue] = useState<any>('');

    const [filters, setFilters] = useState<FiltersType>(defaultFilters);
    const [tagList, setTagList] = useState<Tag>();
    const [editingRowId, setEditingRowId] = useState<string | null>();
    const [deletingRowId, setDeletingRowId] = useState<string | null>();
    const [wastingRowId, setWastingRowId] = useState<Ingredient>();
    const [addingRow, setAddingRow] = useState(false);
    const [editedValues, setEditedValues] = useState<Ingredient | null>(null);
    const [firstTimeSelect, setFirstTimeSelected] = useState<any>(true);
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
    const [recipes, setRecipes] = useState([]);
    const [loadingData, setLoadingData] = useState(false);
    const [page, setPage] = useState(1);
    const handleChange = (NewValue) => {
      setPage(NewValue);
    };

    const [isWastingPopupVisible, setWastingPopupVisible] = useState(false);
    const handleWastingClick = (row: Ingredient) => {
      setWastingRowId(row);
      setWastingPopupVisible(true);
    };

    const ITEMS_PER_PAGE = 25; // Define items per page

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

    const reloadReferenceUnits = useCallback(async () => {
      inventoryService.getReferenceUnits().then((res) => {
        setReferenceUnitName(res);
      });
    });

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

    // Recipe Get function
    function reloadRecipes() {
      if (!selectedRestaurantUUID) return;
      setLoadingData(true);
      recipesService
        .getRecipes(selectedRestaurantUUID)
        .then((res) => {
          setRecipes(res);
        })
        .catch((err) => {
          console.log(err);
        })
        .finally(() => {
          setLoadingData(false);
        });
    }

    //Units get function
    function reloadUnits() {
      if (!selectedRestaurantUUID) return;

      inventoryService
        .getUnits(selectedRestaurantUUID)
        .then((res) => {
          setUnitName(res);
        })
        .catch((err) => {
          console.log(err);
        })
        .finally(() => {
          // setLoadingData(false);
        });
    }

    useEffect(() => {
      reloadRecipes();
      reloadUnits();
    }, [selectedRestaurantUUID]);

    useEffect(() => {
      const applyFilters = () => {
        let filteredList = [...ingredientsList];

        if (props.searchValue) {
          const fuseOptions = {
            keys: ['name'],
            threshold: 0.3, // Lower threshold makes search more strict
            distance: 100, // Maximum distance between the search term and an entry
            minMatchCharLength: 2, // Minimum length of search string
          };
          const fuse = new Fuse(filteredList, fuseOptions);

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
      const defaultSortColumn = 'name'; // default to ingredient_name column
      const columnToSortBy = sortColumn || defaultSortColumn;

      const sorted = [...ingredients].sort((a, b) => {
        const aValue = a[columnToSortBy as keyof Ingredient];
        const bValue = b[columnToSortBy as keyof Ingredient];

        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return aValue.localeCompare(bValue);
        } else if (typeof aValue === 'number' && typeof bValue === 'number') {
          return aValue - bValue;
        }

        return 0;
      });

      return sortDirection === 'desc' ? sorted.reverse() : sorted;
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
      color: '#5e72e4', // Blue on hover
    };

    const activeArrowStyle = {
      color: '#5e72e4', // Dark blue when sorted
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
                    {/* <IconButton
                      icon={<i className="fa-solid fa-file-arrow-down"></i>}
                      onClick={() => setImportIngredientsPopup(true)}
                      tooltipMsg={t('inventory.importData')}
                      tooltipId="inventory-tooltip"
                    /> */}
                    <Button
                      value={t('inventory.addIngredientBtn')}
                      type="primary"
                      className="add"
                      onClick={() => setShowAddPopup(true)} // Open popup when clicked
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
          // togglePopupError(err.message);
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
      reloadReferenceUnits();
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
      if (reference_units.some((unit) => unit.unit_uuid === row.unit_uuid)) {
        setIsVolumeVisible(false);
      } else {
        setIsVolumeVisible(true);
      }
    };

    const handleSaveEdit = () => {
      setFirstTimeSelected(true);

      if (!editedValues?.unit_uuid) {
        setUnitError(true); // Set error if unit is missing
        return; // Prevent form submission
      } else {
        setUnitError(false); // Clear the error if unit is selected
      }

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
        parLevel,
        actualStock,
        unit,
        unitCost,
        deleted_recipe_ingredient_data,
        recipes,
        unit_name,
        unit_uuid,
        volume_unit_uuid,
        volume_unit_name,
        volume_quantity,
      } = editedValues;

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
        deleted_recipe_ingredient_data,
        recipes,
        unit_name,
        unit_uuid,
        supplier_details,
        unitCost,
        volume_unit_uuid,
        volume_unit_name,
        volume_quantity,
        restaurantUUID: selectedRestaurantUUID,
      };

      inventoryService
        .updateIngredient(updatedIngredient)
        .catch((err) => {
          togglePopupError(err.message);
        })
        .then(() => {
          setIsEditMode(false);
          reloadTagList();
          reloadInventoryData();
          props.setLoadingState(false);
          setIsSidePanelOpen(false);

          // Update editedValues to null AFTER the API call and other updates are done
          setEditedValues(null);
          setEditingRowId(null);
          togglePopupPreviewEdit(undefined);
          setIsLoading(false);
        });
    };

    const togglePopupError = (msg: string) => {
      setPopupError(msg);
    };

    const columnHeaderStyle = {
      cursor: 'pointer',
      padding: '10px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
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
              selectedIngredients?.find((i) => i.id === row.id) ? true : false
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
        renderItem: ({ row }) => row.name,
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
                .map((uuid) => tagList?.find((tag) => tag.uuid === uuid))
                .filter(Boolean)
            : [];

          // Use the row-specific tags if available, otherwise fall back to initialSelectedTags
          const autocompleteValue = initialSelectedTags;

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
                const tag = tagList?.find((tag) => tag.uuid === uuid);
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
                const tag = tagList?.find((tag) => tag.uuid === uuid);
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
        renderItem: ({ row }) => row.parLevel,
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
        renderItem: ({ row }) => row.actualStock,
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
        renderItem: ({ row }) => row.unit_name,
      },
      {
        key: 'supplier_name',
        header: t('ingredient:supplierName'), // No sorting
        width: '15%',
        renderItem: ({ row, index }) => {
          return (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                flexDirection: 'column',
                gap: '10px',
                padding: '5px',
              }}>
              {row &&
              Array.isArray(row.supplier_details) &&
              row.supplier_details.length > 0 ? (
                row.supplier_details.map((detail, detailIndex) => (
                  <span key={detailIndex}>
                    {detail.supplier_name || 'Select a supplier'}
                  </span>
                ))
              ) : (
                <span>No supplier details available</span>
              )}
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
                <span key={detailIndex}>
                  {detail?.supplier_unit_cost != null
                    ? // ? detail?.supplier_unit_cost?.toFixed(2)
                      detail?.supplier_unit_cost
                    : detail?.supplier_unit_cost}
                </span>
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
              {/* {editingRowId === row.id ? (
                <i
                  className="fa-solid fa-times"
                  data-tooltip-id="inventory-tooltip"
                  data-tooltip-content={t('cancel')}
                  onClick={handleCancelEdit}></i>
              ) : (
                <i
                  className="fa-solid fa-recycle"
                  data-tooltip-id="inventory-tooltip"
                  data-tooltip-content={t('waste')}
                  onClick={() => handleWastingClick(row)}></i>
              )} */}

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
        <Table
          data={paginatedIngredients}
          columns={columns}
          onRowClick={handleEditClick}
        />
        {isSidePanelOpen && (
          <SidePanel
            isOpen={isSidePanelOpen}
            onRequestClose={handleCancelEdit}
            width={'900px'}
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
                    onClick={() => setIsEditMode(false)}
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
                </>
              )}
            </div>
            {!isLoading && (
              <div className={styles.inputContainer}>
                {/* Name Section */}
                <div className={styles.divider}>
                  <div className={styles.inputContainer}>
                    <div className={styles.divider}>
                      <br></br>
                      {isEditMode ? (
                        <>
                          <LabeledInput
                            label={t('ingredientName')}
                            placeholder={t('ingredientName')}
                            type="text"
                            lighter
                            value={editedValues?.name} // Same value binding
                            onChange={
                              (event) =>
                                setEditedValues({
                                  ...editedValues,
                                  name: event.target.value,
                                }) // Extract event.target.value
                            }
                            sx={{
                              '& .MuiFilledInput-root': {
                                border: '1px solid grey',
                                borderRadius: 1,
                                background: 'lightgrey',
                                height: '40px',
                                fontSize: '16px',
                                display: 'flex',
                                alignItems: 'center',
                                borderColor: 'grey.300',
                                borderBottom: 'none',
                              },
                              '& .MuiFilledInput-root.Mui-disabled': {
                                backgroundColor: 'lightgrey',
                              },
                            }}
                          />
                        </>
                      ) : (
                        <div className={styles.title}>
                          <span className={styles.titleRecipeName}>
                            {' '}
                            {editedValues?.name}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className={styles.inputContainer}>
                    <div className={styles.supplierContainer}>
                      <div className={styles.title}>
                        {' '}
                        <span className={styles.titleRecipeName}>General</span>
                      </div>
                    </div>
                    <div>
                      <div className={styles.gridContainer3}>
                        <div className={styles.inputContainer}>
                          <div>
                            {' '}
                            <span className={styles.values}>Actual Stock</span>
                          </div>
                          {isEditMode ? (
                            <>
                              <LabeledInput
                                label={t('ingredient:actualStock')}
                                placeholder={t('ingredient:actualStock')}
                                type="text"
                                lighter
                                value={editedValues?.actualStock || ''}
                                onChange={(event) =>
                                  setEditedValues({
                                    ...editedValues,
                                    actualStock: event.target.value,
                                  })
                                }
                                sx={{
                                  '& .MuiFilledInput-root': {
                                    border: '1px solid grey',
                                    borderRadius: 1,
                                    background: 'lightgrey',
                                    height: '40px',
                                    fontSize: '16px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    borderColor: 'grey.300',
                                    borderBottom: 'none',
                                  },
                                  '& .MuiFilledInput-root.Mui-disabled': {
                                    backgroundColor: 'lightgrey',
                                  },
                                }}
                              />
                            </>
                          ) : (
                            <span className={styles.value}>
                              {editedValues?.actualStock}
                            </span>
                          )}
                        </div>
                        <div className={styles.inputContainer}>
                          <div>
                            {' '}
                            <span className={styles.values}>Par level</span>
                          </div>
                          {isEditMode ? (
                            <>
                              <LabeledInput
                                label={t('ingredient:parLvel')}
                                placeholder={t('ingredient:parLvel')}
                                type="text"
                                lighter
                                value={editedValues?.parLevel || ''}
                                onChange={(event) =>
                                  setEditedValues({
                                    ...editedValues,
                                    parLevel: event.target.value,
                                  })
                                }
                                sx={{
                                  '& .MuiFilledInput-root': {
                                    border: '1px solid grey',
                                    borderRadius: 1,
                                    background: 'lightgrey',
                                    height: '40px',
                                    fontSize: '16px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    borderColor: 'grey.300',
                                    borderBottom: 'none',
                                  },
                                  '& .MuiFilledInput-root.Mui-disabled': {
                                    backgroundColor: 'lightgrey',
                                  },
                                }}
                              />
                            </>
                          ) : (
                            <span className={styles.value}>
                              {editedValues?.parLevel}
                            </span>
                          )}
                        </div>

                        <div className={styles.inputContainer}>
                          <div>
                            {' '}
                            <span className={styles.values}>Unit</span>
                          </div>

                          {isEditMode ? (
                            <>
                              <CreatableSelect
                                placeholder={
                                  editedValues?.unit_uuid
                                    ? t('unit')
                                    : t('Select a unit') // Show 'Select a unit' if unit_uuid is null
                                }
                                options={unitname.map((unit) => ({
                                  label: unit.unit_name,
                                  value: unit.unit_uuid,
                                }))} // Map options for CreatableSelect
                                styles={{
                                  menu: (provided) => ({
                                    ...provided,
                                    overflowY: 'auto',
                                  }),
                                  control: (provided, state) => ({
                                    ...provided,
                                    minWidth: '200px',
                                    boxShadow: state.isFocused
                                      ? 'none'
                                      : provided.boxShadow,
                                    borderColor: state.isFocused
                                      ? '#ced4da'
                                      : provided.borderColor,
                                    '&:hover': {
                                      borderColor: 'none',
                                    },
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
                                      : state.isFocused
                                      ? '#dbe1df'
                                      : provided.backgroundColor,
                                    color: state.isSelected
                                      ? '#FFFFFF'
                                      : state.isFocused
                                      ? '#000000'
                                      : provided.color,
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
                                value={
                                  editedValues?.unit_name
                                    ? {
                                        label: editedValues.unit_name,
                                        value: editedValues.unit_uuid,
                                      }
                                    : unitname
                                        .map((unit) => ({
                                          label: unit.unit_name,
                                          value: unit.unit_uuid,
                                        }))
                                        .find(
                                          (unit) =>
                                            unit.value ===
                                            editedValues?.unit_uuid
                                        ) || null
                                } // Either display the new unit or find and display the selected unit by unit_uuid
                                onChange={(selectedOption) => {
                                  if (selectedOption) {
                                    if (selectedOption.__isNew__) {
                                      // Do not update the unitname list, just update editedValues with new unit
                                      setEditedValues({
                                        ...editedValues,
                                        unit_uuid: '', // Keep unit_uuid blank
                                        unit_name: selectedOption.label, // Set the new unit_name
                                      });
                                    } else {
                                      // If existing unit is selected
                                      setEditedValues({
                                        ...editedValues,
                                        unit_uuid: selectedOption.value, // Set the selected unit's UUID
                                        unit_name: selectedOption.label, // Set the selected unit's name
                                      });
                                    }
                                    setUnitError(false); // Clear error on valid selection
                                    if (
                                      reference_units.some(
                                        (unit) =>
                                          unit.unit_uuid ===
                                          selectedOption.value
                                      )
                                    ) {
                                      setIsVolumeVisible(false);
                                    } else {
                                      setIsVolumeVisible(true);
                                    }
                                  }
                                }}
                                isCreatable
                              />

                              {unitError && (
                                <div style={{ color: 'red', marginTop: '5px' }}>
                                  Unit is required.
                                </div>
                              )}
                            </>
                          ) : (
                            <span className={styles.value}>
                              {unitname?.find(
                                (unit) => unit.value === editedValues.unit_uuid
                              )?.label || editedValues.unit_name}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Volume Section */}
                    {isVolumeVisible ? (
                      <div className={styles.gridContainer3}>
                        <div className={styles.inputContainer}>
                          <div>
                            {' '}
                            <span className={styles.values}>Container</span>
                          </div>

                          {isEditMode ? (
                            <>
                              <span className={styles.value}>
                                {unitname?.find(
                                  (unit) =>
                                    unit.value === editedValues.unit_uuid
                                )?.label || editedValues.unit_name}
                              </span>
                            </>
                          ) : (
                            <span className={styles.value}>
                              {unitname?.find(
                                (unit) => unit.value === editedValues.unit_uuid
                              )?.label || editedValues.unit_name}
                            </span>
                          )}
                        </div>
                        <div className={styles.inputContainer}>
                          <div>
                            {' '}
                            <span className={styles.values}>Volume</span>
                          </div>
                          {isEditMode ? (
                            <>
                              <LabeledInput
                                label={t('ingredient:volume')}
                                placeholder={t('ingredient:volume')}
                                type="number"
                                lighter
                                value={editedValues?.volume_quantity || ''}
                                onChange={(event) =>
                                  setEditedValues({
                                    ...editedValues,
                                    volume_quantity: event.target.value,
                                  })
                                }
                                sx={{
                                  '& .MuiFilledInput-root': {
                                    border: '1px solid grey',
                                    borderRadius: 1,
                                    background: 'lightgrey',
                                    height: '40px',
                                    fontSize: '16px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    borderColor: 'grey.300',
                                    borderBottom: 'none',
                                  },
                                  '& .MuiFilledInput-root.Mui-disabled': {
                                    backgroundColor: 'lightgrey',
                                  },
                                }}
                              />
                            </>
                          ) : (
                            <span className={styles.value}>
                              {editedValues?.volume_quantity}
                            </span>
                          )}
                        </div>
                        <div className={styles.inputContainer}>
                          <div>
                            {' '}
                            <span className={styles.values}>Unit</span>
                          </div>

                          {isEditMode ? (
                            <>
                              <CreatableSelect
                                placeholder={
                                  editedValues?.volume_unit_uuid
                                    ? t('unit')
                                    : t('selectUnit') // Show 'Select a unit' if unit_uuid is null
                                }
                                options={reference_units.map((unit) => ({
                                  label: unit.unit_name,
                                  value: unit.unit_uuid,
                                }))} // Map options for CreatableSelect
                                styles={{
                                  menu: (provided) => ({
                                    ...provided,
                                    overflowY: 'auto',
                                  }),
                                  control: (provided, state) => ({
                                    ...provided,
                                    minWidth: '200px',
                                    boxShadow: state.isFocused
                                      ? 'none'
                                      : provided.boxShadow,
                                    borderColor: state.isFocused
                                      ? '#ced4da'
                                      : provided.borderColor,
                                    '&:hover': {
                                      borderColor: 'none',
                                    },
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
                                      : state.isFocused
                                      ? '#dbe1df'
                                      : provided.backgroundColor,
                                    color: state.isSelected
                                      ? '#FFFFFF'
                                      : state.isFocused
                                      ? '#000000'
                                      : provided.color,
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
                                value={
                                  editedValues?.volume_unit_name
                                    ? {
                                        label: editedValues.volume_unit_name,
                                        value: editedValues.volume_unit_uuid,
                                      }
                                    : reference_units
                                        .map((unit) => ({
                                          label: unit.unit_name,
                                          value: unit.unit_uuid,
                                        }))
                                        .find(
                                          (unit) =>
                                            unit.value ===
                                            editedValues?.volume_unit_uuid
                                        ) || null
                                } // Either display the new unit or find and display the selected unit by unit_uuid
                                onChange={(selectedOption) => {
                                  if (selectedOption) {
                                    if (selectedOption.__isNew__) {
                                      // Do not update the unitname list, just update editedValues with new unit
                                      setEditedValues({
                                        ...editedValues,
                                        volume_unit_uuid: '', // Keep unit_uuid blank
                                        volume_unit_name: selectedOption.label, // Set the new unit_name
                                      });
                                    } else {
                                      // If existing unit is selected
                                      setEditedValues({
                                        ...editedValues,
                                        volume_unit_uuid: selectedOption.value, // Set the selected unit's UUID
                                        volume_unit_name: selectedOption.label, // Set the selected unit's name
                                      });
                                    }
                                    setUnitError(false); // Clear error on valid selection
                                  }
                                }}
                                isCreatable
                              />

                              {unitError && (
                                <div style={{ color: 'red', marginTop: '5px' }}>
                                  Unit is required.
                                </div>
                              )}
                            </>
                          ) : (
                            <span className={styles.value}>
                              {unitname?.find(
                                (unit) =>
                                  unit.value === editedValues.volume_unit_uuid
                              )?.label || editedValues?.volume_unit_name}
                              {/* {editedValues?.volume_unit_name} */}
                            </span>
                          )}
                        </div>
                        {/* <IconButton
                          icon={<i className="fa-solid fa-circle-info"></i>}
                          tooltipMsg={
                            t('ingredient:volumeInfo') +
                            ' ' +
                            editedValues?.unit_name
                          }
                          className={styles.info}
                        /> */}
                      </div>
                    ) : null}
                  </div>
                </div>
                {/* Tag Section */}
                <div className={styles.inputContainer}>
                  <div className={styles.divider}>
                    <div className={styles.title}>
                      <span className={styles.titleRecipeName}>Tags</span>
                    </div>
                    {isEditMode ? (
                      <CreatableSelect
                        isMulti
                        onInputChange={(newInputValue) => {
                          if (
                            typeof newInputValue === 'string' &&
                            newInputValue !== ''
                          ) {
                            setInputValue(newInputValue);
                          }
                        }}
                        styles={{
                          menu: (provided) => ({
                            ...provided,
                            overflowY: 'auto',
                          }),
                          control: (provided, state) => ({
                            ...provided,
                            minWidth: '200px',
                            boxShadow: state.isFocused
                              ? 'none'
                              : provided.boxShadow,
                            borderColor: state.isFocused
                              ? '#ced4da'
                              : provided.borderColor,
                            '&:hover': {
                              borderColor: 'none',
                            },
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
                              : state.isFocused
                              ? '#dbe1df'
                              : provided.backgroundColor,
                            color: state.isSelected
                              ? '#FFFFFF'
                              : state.isFocused
                              ? '#000000'
                              : provided.color,
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
                        maxMenuHeight={200}
                        isClearable={false}
                        options={tagList.map((tag) => ({
                          label: tag.name || '--',
                          value: tag.uuid,
                        }))}
                        // Ensure existing tags and new tags are preserved
                        value={[
                          ...(editedValues?.tag_details || []).map((tag) => ({
                            label: tag.name || 'New Tag',
                            value: tag.uuid || '',
                          })),
                        ]}
                        onChange={(newValue) => {
                          const updatedTagDetails = newValue.map((option) => {
                            if (!option.value) {
                              // This is a newly created tag
                              return {
                                name: option.label || 'Unknown',
                                uuid: '', // New tags don't have a UUID yet
                              };
                            } else {
                              // This is an existing tag
                              const existingTag = tagList?.find(
                                (tag) => tag.uuid === option.value
                              );
                              return {
                                name: existingTag
                                  ? existingTag.name
                                  : option.label,
                                uuid: existingTag ? option.value : '',
                              };
                            }
                          });

                          setEditedValues((prevValues) => ({
                            ...prevValues,
                            tag_details: updatedTagDetails,
                          }));
                        }}
                      />
                    ) : (
                      <div className={styles.tagList}>
                        {editedValues?.tagUUID?.length > 0 ? (
                          <div className={styles.tagContainer}>
                            {editedValues?.tagUUID?.map((uuid) => {
                              const tag = tagList?.find(
                                (tag) => tag.uuid === uuid
                              );
                              if (tag) {
                                const displayName = tag.name;
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
                          Supplier Details
                        </span>
                      </div>
                      {isEditMode && (
                        <div className={styles.addSupplierTitle}>
                          <span
                            className={styles.addSupplier}
                            onClick={handleAddSupplierDetail}>
                            {' '}
                            <i
                              className="fa-solid fa-plus"
                              data-tooltip-id="inventory-tooltip"
                              data-tooltip-content={t('validate')}></i>{' '}
                          </span>
                        </div>
                      )}
                    </div>
                    {isEditMode ? (
                      <>
                        {editedValues?.supplier_details?.map(
                          (detail, index) => (
                            <div key={index} className={styles.gridContainer5}>
                              {!index && (
                                <>
                                  <div className={styles.values}>
                                    {t('ingredient:supplierName')}
                                  </div>
                                  <div className={styles.values}>
                                    {t('ingredient:supplierCost')}
                                  </div>
                                  <div className={styles.values}>
                                    {t('ingredient:supplierUnit')}
                                  </div>
                                  <div className={styles.values}>
                                    {t('ingredient:conversion_factor')}
                                  </div>
                                  <div className={styles.values}>
                                    {t('ingredient:actions')}
                                  </div>
                                </>
                              )}
                              <div>
                                <Select
                                  size="large"
                                  isSearchable={false}
                                  placeholder={t('ingredient:supplier')}
                                  options={suppliers.map((supplier) => ({
                                    label: supplier.label,
                                    value: supplier.value,
                                  }))}
                                  value={
                                    suppliers
                                      .map((supplier) => ({
                                        label: supplier.label,
                                        value: supplier.value,
                                      }))
                                      .find(
                                        (supplier) =>
                                          supplier.value === detail.supplier_id
                                      ) || null
                                  }
                                  onChange={(selectedOption) => {
                                    const updatedDetails = [
                                      ...editedValues.supplier_details,
                                    ];
                                    const selectedSupplier = suppliers.find(
                                      (s) => s.value === selectedOption?.value
                                    );

                                    updatedDetails[index] = {
                                      ...updatedDetails[index],
                                      supplier_id: selectedOption?.value || '',
                                      supplier_name:
                                        selectedSupplier?.label || '',
                                    };

                                    setEditedValues({
                                      ...editedValues,
                                      supplier_details: updatedDetails,
                                    });
                                  }}
                                />
                              </div>

                              <LabeledInput
                                label={t('ingredient:supplierCost')}
                                placeholder={t('ingredient:supplierCost')}
                                type="number"
                                lighter
                                value={detail.supplier_cost}
                                onChange={(event) => {
                                  const updatedDetails = [
                                    ...editedValues.supplier_details,
                                  ];
                                  updatedDetails[index].supplier_cost =
                                    event.target.value;

                                  setEditedValues({
                                    ...editedValues,
                                    supplier_details: updatedDetails,
                                  });
                                }}
                              />

                              <CreatableSelect
                                placeholder={
                                  detail.supplier_unit
                                    ? t('unit')
                                    : t('selectUnit')
                                }
                                options={unitname.map((unit) => ({
                                  label: unit.unit_name,
                                  value: unit.unit_uuid,
                                }))}
                                styles={{
                                  menu: (provided) => ({
                                    ...provided,
                                    overflowY: 'auto',
                                  }),
                                  control: (provided, state) => ({
                                    ...provided,
                                    minWidth: '200px',
                                    boxShadow: state.isFocused
                                      ? 'none'
                                      : provided.boxShadow,
                                    borderColor: state.isFocused
                                      ? '#ced4da'
                                      : provided.borderColor,
                                    '&:hover': {
                                      borderColor: 'none',
                                    },
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
                                      : state.isFocused
                                      ? '#dbe1df'
                                      : provided.backgroundColor,
                                    color: state.isSelected
                                      ? '#FFFFFF'
                                      : state.isFocused
                                      ? '#000000'
                                      : provided.color,
                                  }),
                                }}
                                value={
                                  detail.supplier_unit
                                    ? {
                                        label: detail.supplier_unit_name,
                                        value: detail.supplier_unit,
                                      }
                                    : {
                                        label: 'Select a unit',
                                        value: null,
                                      }
                                }
                                onChange={(selectedOption) => {
                                  const updatedDetails = [
                                    ...editedValues.supplier_details,
                                  ];

                                  if (selectedOption.__isNew__) {
                                    // Create a new unit for this supplier only
                                    inventoryService
                                      .createUnit(
                                        selectedRestaurantUUID,
                                        selectedOption.label
                                      )
                                      .then((newUnit) => {
                                        const newUnitUUID = newUnit.uuid;

                                        // Update only this specific supplier with the new unit
                                        updatedDetails[index] = {
                                          ...updatedDetails[index],
                                          supplier_unit: newUnitUUID,
                                          supplier_unit_name:
                                            selectedOption.label,
                                        };

                                        setEditedValues({
                                          ...editedValues,
                                          supplier_details: updatedDetails, // Only update this specific supplier
                                        });

                                        reloadUnits(); // Reload units list if needed
                                      })
                                      .catch((error) => {
                                        console.error(
                                          'Failed to create new unit:',
                                          error
                                        );
                                      });
                                  } else {
                                    // Update only the selected supplier with the new unit
                                    updatedDetails[index] = {
                                      ...updatedDetails[index],
                                      supplier_unit: selectedOption.value,
                                      supplier_unit_name: selectedOption.label,
                                    };

                                    // Do not update other suppliers or recipes with the same unit when selecting an existing unit
                                    setEditedValues({
                                      ...editedValues,
                                      supplier_details: updatedDetails, // Only update this specific supplier
                                    });
                                  }
                                }}
                                isCreatable
                              />

                              <div className={styles.IconContainer}>
                                <LabeledInput
                                  label={t('ingredient:conversion_factor')}
                                  placeholder={t(
                                    'ingredient:conversion_factor'
                                  )}
                                  type="number"
                                  lighter
                                  value={detail.conversion_factor}
                                  onChange={(event) => {
                                    const updatedConversionFactor =
                                      event.target.value;

                                    const updatedDetails =
                                      editedValues.supplier_details.map(
                                        (supplierDetail) => {
                                          if (
                                            supplierDetail.supplier_unit ===
                                            detail.supplier_unit
                                          ) {
                                            return {
                                              ...supplierDetail,
                                              conversion_factor:
                                                updatedConversionFactor,
                                            };
                                          }
                                          return supplierDetail;
                                        }
                                      );

                                    // Sync conversion factor with recipes sharing the same unit
                                    const updatedRecipes =
                                      editedValues.recipes.map((recipe) => {
                                        if (
                                          recipe.unit_uuid ===
                                          detail.supplier_unit
                                        ) {
                                          return {
                                            ...recipe,
                                            conversion_factor:
                                              updatedConversionFactor,
                                          };
                                        }
                                        return recipe;
                                      });

                                    setEditedValues({
                                      ...editedValues,
                                      supplier_details: updatedDetails,
                                      recipes: updatedRecipes, // Sync recipes
                                    });
                                  }}
                                />

                                <IconButton
                                  icon={
                                    <i className="fa-solid fa-circle-info"></i>
                                  }
                                  tooltipMsg={`from ${detail.supplier_unit_name} to ${editedValues.unit_name}`}
                                  className={styles.info}
                                />
                              </div>

                              <span className={styles.deleteButton}>
                                <i
                                  className="fa-solid fa-trash"
                                  data-tooltip-id="inventory-tooltip"
                                  data-tooltip-content={t('delete')}
                                  onClick={() =>
                                    handleRemoveSupplierDetail(index)
                                  }></i>
                              </span>
                            </div>
                          )
                        )}
                      </>
                    ) : (
                      <div>
                        <div className={styles.gridContainer4}>
                          <span className={styles.values}>Supplier Name</span>
                          <span className={styles.values}>Supplier Cost</span>
                          <span className={styles.values}>Unit</span>
                          <span className={styles.values}>
                            Conversion Factor{' '}
                          </span>
                        </div>
                        {editedValues?.supplier_details?.map(
                          (detail, index) => (
                            <>
                              <div className={styles.gridContainer4}>
                                <span
                                  key={index}
                                  className={styles.value}
                                  style={{
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    display: 'inline-block',
                                    maxWidth: '150px', // Adjust maxWidth as needed
                                    verticalAlign: 'middle',
                                    cursor: 'pointer', // Add pointer cursor for better UX
                                  }}
                                  data-tooltip-id="inventory-tooltip"
                                  data-tooltip-content={detail.supplier_name}>
                                  {detail.supplier_name}
                                </span>

                                <Tooltip
                                  id="inventory-tooltip"
                                  place="top" // Tooltip will appear above the text
                                  type="dark" // Dark-themed tooltip (can be customized)
                                />
                                <span> {detail.supplier_cost}</span>
                                <span>{detail.supplier_unit_name}</span>
                                <span className={styles.flexContainer}>
                                  {detail.conversion_factor}
                                  <div className={styles.forecastIiconBtn}>
                                    <IconButton
                                      icon={
                                        <i
                                          className="fa-solid fa-circle-info"
                                          style={{ color: '#5e72e4' }}></i>
                                      }
                                      tooltipMsg={`from ${detail.supplier_unit_name} to ${editedValues.unit_name}`}
                                      className={styles.forecastIiconBtn}
                                    />
                                  </div>
                                </span>
                              </div>
                            </>
                          )
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Recipe section */}
                <div className={styles.inputContainer}>
                  <div className={styles.divider}>
                    <div className={styles.supplierContainer}>
                      <div className={styles.title}>
                        {' '}
                        <span className={styles.titleRecipeName}>
                          Recipe Details
                        </span>
                      </div>
                    </div>
                    <div
                      className={styles.ingredientsToggle}
                      onClick={toggleIngredientsVisibility}>
                      <span className={styles.show}>
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
                                  Recipe Name
                                </span>
                              </div>
                              <div>
                                <span className={styles.values}>Quantity</span>
                              </div>
                              <div>
                                <span className={styles.values}>Unit</span>
                              </div>
                              <div>
                                <span className={styles.values}>
                                  Conversion Factor
                                </span>
                              </div>
                            </div>

                            {editedValues?.recipes?.map((recipe, index) => (
                              <div
                                key={index}
                                className={styles.recipeContainer}>
                                <div className={styles.gridContainer4}>
                                  {/* Recipe Name as Select dropdown */}
                                  <div className={styles.inputContainer}>
                                    {isEditMode ? (
                                      <Select
                                        size="large"
                                        isSearchable={false}
                                        placeholder={t(
                                          'ingredient:recipe_name'
                                        )}
                                        options={Object.entries(recipes).map(
                                          ([recipe_uuid, recipeData]) => ({
                                            label: recipeData.name,
                                            value: recipeData.uuid,
                                          })
                                        )}
                                        value={{
                                          label:
                                            recipes[recipe.recipe_uuid]?.name ||
                                            recipe.recipe_name,
                                          value: recipe.recipe_uuid,
                                        }}
                                        onChange={(selectedOption) => {
                                          const updatedRecipes = [
                                            ...editedValues.recipes,
                                          ];

                                          const previousRecipeUUID =
                                            updatedRecipes[index]?.recipe_uuid;

                                          let updatedDeletedRecipeData = [
                                            ...(editedValues.deleted_recipe_ingredient_data ||
                                              []),
                                          ];

                                          if (
                                            updatedDeletedRecipeData.includes(
                                              selectedOption?.value
                                            )
                                          ) {
                                            updatedDeletedRecipeData =
                                              updatedDeletedRecipeData.filter(
                                                (uuid) =>
                                                  uuid !== selectedOption?.value
                                              );
                                          } else {
                                            if (
                                              selectedOption?.value !==
                                              previousRecipeUUID
                                            ) {
                                              if (
                                                previousRecipeUUID &&
                                                !updatedDeletedRecipeData.includes(
                                                  previousRecipeUUID
                                                )
                                              ) {
                                                updatedDeletedRecipeData.push(
                                                  previousRecipeUUID
                                                );
                                              }
                                            }
                                          }

                                          updatedRecipes[index] = {
                                            ...updatedRecipes[index],
                                            recipe_uuid: selectedOption?.value,
                                            recipe_name: selectedOption?.label,
                                          };

                                          setEditedValues({
                                            ...editedValues,
                                            recipes: updatedRecipes,
                                            deleted_recipe_ingredient_data:
                                              updatedDeletedRecipeData,
                                          });

                                          const selectedRecipeUUID =
                                            selectedOption?.value;
                                        }}
                                      />
                                    ) : (
                                      <span className={styles.value}>
                                        {recipe.recipe_name}
                                      </span>
                                    )}
                                  </div>

                                  {/* Quantity */}
                                  <div className={styles.inputContainer}>
                                    {isEditMode ? (
                                      <LabeledInput
                                        label={t('quantity')}
                                        placeholder={t('quantity')}
                                        type="number"
                                        lighter
                                        value={recipe.quantity}
                                        onChange={(event) => {
                                          const updatedRecipes = [
                                            ...editedValues.recipes,
                                          ];
                                          updatedRecipes[index].quantity =
                                            event.target.value;
                                          setEditedValues({
                                            ...editedValues,
                                            recipes: updatedRecipes,
                                          });
                                        }}
                                        sx={{
                                          '& .MuiFilledInput-root': {
                                            border: '1px solid grey',
                                            borderRadius: 1,
                                            background: 'lightgrey',
                                            height: '40px',
                                            fontSize: '16px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            borderColor: 'grey.300',
                                            borderBottom: 'none',
                                          },
                                          '& .MuiFilledInput-root.Mui-disabled':
                                            {
                                              backgroundColor: 'lightgrey',
                                            },
                                        }}
                                        className={styles.inputField}
                                      />
                                    ) : (
                                      <span className={styles.value}>
                                        {recipe.quantity}
                                      </span>
                                    )}
                                  </div>

                                  {/* Unit Dropdown */}
                                  <div className={styles.inputContainer}>
                                    {isEditMode ? (
                                      <CreatableSelect
                                        placeholder={
                                          recipe.unit_uuid
                                            ? t('unit')
                                            : t('selectUnit')
                                        }
                                        options={unitname.map((unit) => ({
                                          label: unit.unit_name,
                                          value: unit.unit_uuid,
                                        }))}
                                        styles={{
                                          menu: (provided) => ({
                                            ...provided,
                                            overflowY: 'auto',
                                          }),
                                          control: (provided, state) => ({
                                            ...provided,
                                            minWidth: '200px',
                                            boxShadow: state.isFocused
                                              ? 'none'
                                              : provided.boxShadow,
                                            borderColor: state.isFocused
                                              ? '#ced4da'
                                              : provided.borderColor,
                                            '&:hover': {
                                              borderColor: 'none',
                                            },
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
                                              : state.isFocused
                                              ? '#dbe1df'
                                              : provided.backgroundColor,
                                            color: state.isSelected
                                              ? '#FFFFFF'
                                              : state.isFocused
                                              ? '#000000'
                                              : provided.color,
                                          }),
                                        }}
                                        value={
                                          recipe.unit_uuid
                                            ? {
                                                label: recipe.unit_name,
                                                value: recipe.unit_uuid,
                                              }
                                            : {
                                                label: 'Select a unit',
                                                value: recipe.unit_uuid,
                                              }
                                        }
                                        onChange={(selectedOption) => {
                                          const updatedRecipes = [
                                            ...editedValues.recipes,
                                          ];

                                          if (selectedOption.__isNew__) {
                                            // Create a new unit for this recipe only
                                            updatedRecipes[index] = {
                                              ...updatedRecipes[index],
                                              unit_uuid: '', // Placeholder until unit is created
                                              unit_name: selectedOption.label,
                                            };

                                            setEditedValues({
                                              ...editedValues,
                                              recipes: updatedRecipes,
                                            });

                                            inventoryService
                                              .createUnit(
                                                selectedRestaurantUUID,
                                                selectedOption.label
                                              )
                                              .then((response) => {
                                                const newUnitUUID =
                                                  response.data.unit_uuid;

                                                // Update only the current recipe with the new unit
                                                updatedRecipes[
                                                  index
                                                ].unit_uuid = newUnitUUID;

                                                setEditedValues({
                                                  ...editedValues,
                                                  recipes: updatedRecipes, // Only update this specific recipe
                                                });

                                                reloadUnits(); // Reload units list if needed
                                              })
                                              .catch((error) => {
                                                console.error(
                                                  'Failed to create new unit:',
                                                  error
                                                );
                                              });
                                          } else {
                                            // Update only the selected recipe with the new unit
                                            updatedRecipes[index] = {
                                              ...updatedRecipes[index],
                                              unit_uuid: selectedOption.value,
                                              unit_name: selectedOption.label,
                                            };

                                            // Do not update other recipes or suppliers with the same unit when selecting an existing unit
                                            setEditedValues({
                                              ...editedValues,
                                              recipes: updatedRecipes, // Only update this specific recipe
                                            });
                                          }
                                        }}
                                        isCreatable
                                      />
                                    ) : (
                                      <span className={styles.value}>
                                        {recipe.unit_name}
                                      </span>
                                    )}
                                  </div>

                                  {/* Conversion Factor */}
                                  <div className={styles.IconContainer}>
                                    {isEditMode ? (
                                      <>
                                        <LabeledInput
                                          label={t(
                                            'ingredient:conversion_factor'
                                          )}
                                          placeholder={t(
                                            'ingredient:conversion_factor'
                                          )}
                                          type="number"
                                          lighter
                                          value={recipe.conversion_factor}
                                          onChange={(event) => {
                                            const updatedConversionFactor =
                                              event.target.value;

                                            // Update the conversion factor for the current recipe
                                            const updatedRecipes =
                                              editedValues.recipes.map(
                                                (recipeDetail) => {
                                                  if (
                                                    recipeDetail.unit_uuid ===
                                                    recipe.unit_uuid
                                                  ) {
                                                    return {
                                                      ...recipeDetail,
                                                      conversion_factor:
                                                        updatedConversionFactor,
                                                    };
                                                  }
                                                  return recipeDetail;
                                                }
                                              );

                                            // Update only the supplier that shares the same unit with the current recipe
                                            const updatedSuppliers =
                                              editedValues.supplier_details.map(
                                                (supplierDetail) => {
                                                  if (
                                                    supplierDetail.supplier_unit ===
                                                    recipe.unit_uuid
                                                  ) {
                                                    return {
                                                      ...supplierDetail,
                                                      conversion_factor:
                                                        updatedConversionFactor,
                                                    };
                                                  }
                                                  return supplierDetail;
                                                }
                                              );

                                            // Set updated values for both suppliers and recipes
                                            setEditedValues({
                                              ...editedValues,
                                              recipes: updatedRecipes, // Update the conversion factor in the recipes
                                              supplier_details:
                                                updatedSuppliers, // Update the conversion factor in the related supplier
                                            });
                                          }}
                                          sx={{
                                            '& .MuiFilledInput-root': {
                                              border: '1px solid grey',
                                              borderRadius: 1,
                                              background: 'lightgrey',
                                              height: '40px',
                                              fontSize: '16px',
                                              display: 'flex',
                                              alignItems: 'center',
                                              borderColor: 'grey.300',
                                              borderBottom: 'none',
                                            },
                                            '& .MuiFilledInput-root.Mui-disabled':
                                              {
                                                backgroundColor: 'lightgrey',
                                              },
                                          }}
                                          className={styles.inputField}
                                        />
                                        <IconButton
                                          icon={
                                            <i className="fa-solid fa-circle-info"></i>
                                          }
                                          tooltipMsg={`from ${recipe.unit_name} to ${editedValues.unit_name}`}
                                          className={styles.info}
                                        />
                                      </>
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
                              <span className={styles.values}>Recipe Name</span>
                              <span className={styles.values}>Quantity</span>
                              <span className={styles.values}>Unit</span>
                              <span className={styles.values}>
                                Conversion Factor
                              </span>
                            </div>
                            {editedValues?.recipes?.map((recipe, index) => (
                              <div
                                key={index}
                                className={styles.recipeContainer}>
                                <div className={styles.gridContainer4}>
                                  <span>{recipe.recipe_name}</span>
                                  <span>{recipe.quantity}</span>
                                  <span>{recipe.unit_name}</span>
                                  <span className={styles.flexContainer}>
                                    {recipe.conversion_factor}
                                    <IconButton
                                      icon={
                                        <i
                                          className="fa-solid fa-circle-info"
                                          style={{ color: '#5e72e4' }}></i>
                                      }
                                      tooltipMsg={`from ${recipe.unit_name} to ${editedValues.unit_name}`}
                                      className={styles.forecastIiconBtn}
                                    />
                                  </span>
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
                        <span className={styles.titleRecipeName}>History</span>
                      </div>
                    </div>

                    <div
                      className={styles.ingredientsToggle}
                      onClick={toggleQuantityVisibility}>
                      <span className={styles.show}>
                        {isQuantityVisible
                          ? '▼ Hide Quantity'
                          : `▶ Show Quantity`}
                      </span>
                    </div>

                    {isQuantityVisible && (
                      <>
                        {isEditMode ? (
                          <div>
                            <div className={styles.gridContainer3}>
                              <div>
                                <span className={styles.values}>
                                  Event Type
                                </span>
                              </div>
                              <div>
                                <span className={styles.values}>Quantity</span>
                              </div>
                              <div>
                                <span className={styles.values}>Unit</span>
                              </div>
                            </div>
                            {editedValues?.stock_history?.map(
                              (stock, index) => (
                                <div
                                  key={index}
                                  className={styles.recipeContainer}>
                                  <div className={styles.gridContainer3}>
                                    {/* Recipe Name */}
                                    <div className={styles.inputContainer}>
                                      {isEditMode ? (
                                        <span className={styles.value}>
                                          {stock.event_type}
                                        </span>
                                      ) : (
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
                                        <span className={styles.value}>
                                          {stock.quantity}
                                        </span>
                                      )}
                                    </div>

                                    {/* Conversion Factor */}
                                    <div className={styles.inputContainer}>
                                      {isEditMode ? (
                                        <span className={styles.value}>
                                          {stock.unit_name}
                                        </span>
                                      ) : (
                                        <span className={styles.value}>
                                          {stock.unit_name}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )
                            )}
                          </div>
                        ) : (
                          <div>
                            <div className={styles.gridContainer3}>
                              <span className={styles.values}>Event Name</span>
                              <span className={styles.values}>Quantity</span>
                              <span className={styles.values}>Unit</span>
                            </div>
                            {/* Display mode when not in edit mode */}
                            {editedValues?.stock_history?.map(
                              (stock, index) => (
                                <div
                                  key={index}
                                  className={styles.recipeContainer}>
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
                              )
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
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

        <AddIngredientPopup
          isVisible={showAddPopup}
          reloadInventoryData={reloadInventoryData}
          onRequestClose={() => setShowAddPopup(false)} // Close popup when requested
        />

        <AddWastingPopup
          onRequestClose={() => setWastingPopupVisible(false)}
          isVisible={isWastingPopupVisible}
          onReload={reloadInventoryData} // Ensure the page reloads after waste is submitted
          ingredient={wastingRowId} // Pass the ingredient to the popup
        />
      </>
    );
  }
);
IngredientTab.displayName = 'IngredientTab';
