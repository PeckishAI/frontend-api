import React, {
  useCallback,
  useEffect,
  useImperativeHandle,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { Button, IconButton, DialogBox, Checkbox } from 'shared-ui';
import {
  Ingredient,
  Tag,
  Supplier,
  inventoryService,
  recipesService,
} from '../../../services';
import Filters from '../Components/Filters/Filters';
import { useRestaurantStore } from '../../../store/useRestaurantStore';
import Table, { ColumnDefinitionType } from 'shared-ui/components/Table/Table';
import { Tooltip } from 'react-tooltip';
import Fuse from 'fuse.js';
import { tagService } from '../../../services/tag.service';
import CustomPagination from '../../Overview/components/Pagination/CustomPagination';
import styles from './IngredientTab.module.scss';
import AddIngredientPopup from './AddIngredientPopup';
import AddWastingPopup from '../Components/Wastes/Wastes';
import IngredientFormPanel from '../../../components/IngredientFormPanel/IngredientFormPanel';
import supplierService from '../../../services/supplier.service';

export type FiltersType = {
  selectedSupplier: Array<{ uuid: string; name: string }>;
  selectedTag: Array<{ uuid: string; name: string }>;
};

export const defaultFilters: FiltersType = {
  selectedSupplier: [],
  selectedTag: [],
};

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
    const [showFormPanel, setShowFormPanel] = useState(false);
    const [selectedIngredient, setSelectedIngredient] =
      useState<Ingredient | null>(null);
    const [ingredientsList, setIngredientsList] = useState<Ingredient[]>([]);
    const [filteredIngredients, setFilteredIngredients] = useState<
      Ingredient[]
    >([]);

    const [filters, setFilters] = useState<FiltersType>(defaultFilters);
    const [tagList, setTagList] = useState<Tag[]>();
    const [deletingRowId, setDeletingRowId] = useState<string | null>();
    const [wastingRowId, setWastingRowId] = useState<Ingredient>();
    const [selectedIngredients, setSelectedIngredients] = useState<
      Ingredient[]
    >([]);
    const [showAddPopup, setShowAddPopup] = useState(false);
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [page, setPage] = useState(1);
    const [isWastingPopupVisible, setWastingPopupVisible] = useState(false);
    const [popupDelete, setPopupDelete] = useState<string[] | undefined>(
      undefined
    );
    const [popupDeleteSelection, setPopupDeleteSelection] = useState<
      number | undefined
    >(undefined);

    const [editingRowId, setEditingRowId] = useState<string | null>(null);

    const { t } = useTranslation(['common', 'ingredient']);
    const ITEMS_PER_PAGE = 25;
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;

    const [sortColumn, setSortColumn] = useState<string | null>(null);
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc' | null>(
      null
    );
    const [hoveredColumn, setHoveredColumn] = useState<string | null>(null);

    const selectedRestaurantUUID = useRestaurantStore(
      (state) => state.selectedRestaurantUUID
    );

    // Load data functions
    const reloadInventoryData = useCallback(async () => {
      if (!selectedRestaurantUUID) return;
      props.setLoadingState(true);
      try {
        const ingredients = await inventoryService.getIngredientList(
          selectedRestaurantUUID
        );
        console.log('Fetched ingredients:', ingredients);
        setIngredientsList(ingredients);
        setFilteredIngredients(ingredients);
      } catch (err) {
        console.error('Error fetching ingredients:', err);
      }
      props.setLoadingState(false);
    }, [selectedRestaurantUUID]);

    const reloadTagList = useCallback(async () => {
      if (!selectedRestaurantUUID) return;
      return tagService.getAll(selectedRestaurantUUID).then(setTagList);
    }, [selectedRestaurantUUID]);

    const reloadRestaurantSuppliers = useCallback(async () => {
      if (!selectedRestaurantUUID) return;
      const res = await supplierService.getRestaurantSuppliers(
        selectedRestaurantUUID
      );
      setSuppliers(res);
    }, [selectedRestaurantUUID]);

    useEffect(() => {
      const applyFilters = () => {
        // If no search value and no filters, use the full list
        if (
          !props.searchValue &&
          filters.selectedSupplier.length === 0 &&
          filters.selectedTag.length === 0
        ) {
          setFilteredIngredients(ingredientsList);
          return;
        }

        let filteredList = [...ingredientsList];
        console.log('Initial ingredientsList:', ingredientsList);

        // Apply search filter
        if (props.searchValue) {
          console.log('Applying search filter:', props.searchValue);
          const fuseOptions = {
            keys: ['name'],
            threshold: 0.3,
            distance: 100,
            minMatchCharLength: 2,
          };
          const fuse = new Fuse(filteredList, fuseOptions);
          filteredList = fuse.search(props.searchValue).map((r) => r.item);
          console.log('After search filter:', filteredList);
        }

        // Apply supplier filter
        if (filters.selectedSupplier.length > 0) {
          console.log('Applying supplier filter:', filters.selectedSupplier);
          const selectedSupplierUuids = filters.selectedSupplier.map(
            (supplier) => supplier.uuid
          );
          filteredList = filteredList.filter(
            (ingredient) =>
              ingredient.supplier_details?.some((supplier) =>
                selectedSupplierUuids.includes(supplier.supplier_uuid)
              )
          );
          console.log('After supplier filter:', filteredList);
        }

        // Apply tag filter
        if (filters.selectedTag.length > 0) {
          console.log('Applying tag filter:', filters.selectedTag);
          const selectedTagUuids = filters.selectedTag.map((tag) => tag.uuid);
          filteredList = filteredList.filter(
            (ingredient) =>
              ingredient.tagUUID?.some((tagUuid) =>
                selectedTagUuids.includes(tagUuid)
              )
          );
          console.log('After tag filter:', filteredList);
        }
        console.log('Final filtered list length:', filteredList.length);
        setFilteredIngredients(filteredList);
      };

      applyFilters();
    }, [props.searchValue, filters, ingredientsList]);

    const handleSort = (column: string) => {
      if (sortColumn === column) {
        setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
      } else {
        setSortColumn(column);
        setSortDirection('asc');
      }
    };

    const handleMouseEnter = (column: string) => {
      setHoveredColumn(column);
    };

    const handleMouseLeave = () => {
      setHoveredColumn(null);
    };

    const renderSortArrow = (column: string) => {
      if (sortColumn !== column) {
        return hoveredColumn === column ? '↕' : '';
      }
      return sortDirection === 'asc' ? '↑' : '↓';
    };

    const handleSelectAll = () => {
      if (selectedIngredients.length === ingredientsList.length) {
        setSelectedIngredients([]);
      } else {
        setSelectedIngredients([...ingredientsList]);
      }
    };

    const handleSelectIngredient = (ingredient: Ingredient) => {
      const isSelected = selectedIngredients.find(
        (i) => i.id === ingredient.id
      );
      if (isSelected) {
        setSelectedIngredients(
          selectedIngredients.filter((i) => i.id !== ingredient.id)
        );
      } else {
        setSelectedIngredients([...selectedIngredients, ingredient]);
      }
    };

    // end

    // Implement the table columns and other UI logic...
    // (Keep the existing column definitions and sorting logic)

    const handleEditClick = (ingredient: Ingredient) => {
      setSelectedIngredient(ingredient);
      setShowFormPanel(true);
    };

    const handleCloseFormPanel = () => {
      setSelectedIngredient(null);
      setShowFormPanel(false);
    };

    const handleIngredientUpdated = () => {
      reloadInventoryData();
      handleCloseFormPanel();
    };

    const handleDeleteClick = async (ingredient: Ingredient) => {
      try {
        const impactedRecipes = await recipesService.getImpactedRecipes(
          ingredient.id
        );
        setPopupDelete(impactedRecipes);
        setDeletingRowId(ingredient.id);
      } catch (error) {
        console.error('Error checking impacted recipes:', error);
      }
    };

    const handleConfirmPopupDelete = async () => {
      if (!deletingRowId) return;

      try {
        await inventoryService.deleteIngredient(deletingRowId);
        reloadInventoryData();
        setPopupDelete(undefined);
        setDeletingRowId(null);
      } catch (error) {
        console.error('Error deleting ingredient:', error);
      }
    };

    const handleConfirmBulkDelete = async () => {
      try {
        for (const ingredient of selectedIngredients) {
          await inventoryService.deleteIngredient(ingredient.id);
        }
        setSelectedIngredients([]);
        reloadInventoryData();
        setPopupDeleteSelection(undefined);
      } catch (error) {
        console.error('Error deleting ingredients:', error);
      }
    };

    const handleCancelEdit = () => {
      setEditingRowId(null);
    };

    const handleWastingClick = (ingredient: Ingredient) => {
      setWastingRowId(ingredient);
      setWastingPopupVisible(true);
    };

    useEffect(() => {
      reloadInventoryData();
      reloadTagList();
      reloadRestaurantSuppliers();
    }, [reloadInventoryData, reloadTagList, reloadRestaurantSuppliers]);

    // Keep your existing handlers for selection, deletion, etc.
    const paginatedIngredients = filteredIngredients.slice(
      startIndex,
      endIndex
    );

    useEffect(() => {}, [showFormPanel, selectedIngredient]);

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
            className={styles.columnHeader}>
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
          if (
            !row.tagUUID ||
            !Array.isArray(row.tagUUID) ||
            row.tagUUID.length === 0
          ) {
            return '-';
          }

          return (
            <div className={styles.tagContainer}>
              {row.tagUUID.map((uuid) => {
                const tag = tagList?.find((tag) => tag.uuid === uuid);
                const displayName = tag?.name
                  ? tag.name.length > 6
                    ? `${tag.name.slice(0, 6)}...`
                    : tag.name
                  : '-';

                return (
                  <span
                    key={uuid}
                    className={`${styles.tagChip} ${
                      tag ? styles.primary : styles.default
                    }`}>
                    {displayName}
                  </span>
                );
              })}
            </div>
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
            className={styles.columnHeader}>
            {t('ingredient:parLevel')} {renderSortArrow('parLevel')}
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
            className={styles.columnHeader}>
            {t('ingredient:actualStock')} {renderSortArrow('actualStock')}
          </div>
        ),
        width: '15%',
        renderItem: ({ row }) => row.actualStock.quantity,
      },
      {
        key: 'unit_uuid',
        header: () => (
          <div
            onClick={() => handleSort('unit')}
            onMouseEnter={() => handleMouseEnter('unit')}
            onMouseLeave={handleMouseLeave}
            className={styles.columnHeader}>
            {t('ingredient:unit')} {renderSortArrow('unit')}
          </div>
        ),
        width: '10%',
        renderItem: ({ row }) => row.unit_name,
      },
      {
        key: 'supplier_details',
        header: t('ingredient:supplierName'),
        width: '15%',
        renderItem: ({ row }) => (
          <div className={styles.supplierDetails}>
            {row.supplier_details && row.supplier_details.length > 0 ? (
              row.supplier_details.map((detail, index) => (
                <span key={index}>
                  {detail.supplier_name || t('ingredient:selectSupplier')}
                </span>
              ))
            ) : (
              <span className={styles.noSupplier}>
                {t('ingredient:noSupplierDetails')}
              </span>
            )}
          </div>
        ),
      },
      {
        key: 'supplier_details',
        header: t('ingredient:supplierCost'),
        width: '15%',
        renderItem: ({ row }) => (
          <div className={styles.supplierDetails}>
            {row.supplier_details?.map((detail, index) => (
              <span key={index}>
                {detail?.supplier_unit_cost != null
                  ? detail.supplier_unit_cost
                  : '-'}
              </span>
            ))}
          </div>
        ),
      },
      {
        key: 'actions',
        header: t('ingredient:actions'),
        width: '10%',
        renderItem: ({ row }) => (
          <div className={styles.actions}>
            {editingRowId === row.id ? (
              <i
                className="fa-solid fa-times"
                data-tooltip-id="inventory-tooltip"
                data-tooltip-content={t('cancel')}
                onClick={(e) => {
                  e.stopPropagation();
                  handleCancelEdit();
                }}
              />
            ) : (
              <i
                className="fa-solid fa-trash"
                data-tooltip-id="inventory-tooltip"
                data-tooltip-content={t('delete')}
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteClick(row);
                }}
              />
            )}
          </div>
        ),
      },
    ];

    const handleExportDataClick = useCallback(async () => {
      if (!selectedRestaurantUUID) return;

      try {
        // Fetch the data directly when export is clicked
        const ingredients = await inventoryService.getIngredientList(
          selectedRestaurantUUID
        );

        console.log(
          'Export - freshly fetched ingredients:',
          ingredients.length
        );

        if (ingredients && ingredients.length > 0) {
          const header =
            'Ingredient UUID,Ingredient Name,Unit UUID,Unit Name,Par Level,Quantity,Tags\n';
          const csvContent =
            'data:text/csv;charset=utf-8,' +
            header +
            ingredients
              .map((row) => {
                const values = [];
                values.push(row.id || '');
                values.push(row.name || '');
                values.push(row.unit_uuid || '');
                values.push(row.unit_name || '');
                values.push(row.parLevel || '');
                values.push(row.actualStock?.quantity || '');
                const tags = row.tag_details
                  ? row.tag_details.map((tag) => tag.name).join('>')
                  : '';
                values.push(tags);

                return values
                  .map((value) =>
                    value.toString().includes(',') ? `"${value}"` : value
                  )
                  .join(',');
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
      } catch (error) {
        console.error('Error exporting data:', error);
      }
    }, [selectedRestaurantUUID]); // Only depend on the restaurant UUID

    const handleCancelSelection = () => {
      setSelectedIngredients([]);
    };

    useImperativeHandle(
      forwardedRef,
      () => ({
        renderOptions: () => {
          return (
            <>
              {selectedIngredients.length === 0 ? (
                <>
                  <Filters
                    suppliers={suppliers.map((s) => ({
                      name: s.name,
                      uuid: s.uuid,
                    }))}
                    tags={tagList ?? []}
                    onApplyFilters={(newFilters) => setFilters(newFilters)}
                  />

                  <IconButton
                    icon={<i className="fa-solid fa-file-export"></i>}
                    onClick={handleExportDataClick}
                    tooltipMsg={t('export')}
                    tooltipId="inventory-tooltip"
                  />
                  <Button
                    value={t('inventory.addIngredientBtn')}
                    type="primary"
                    className="add"
                    onClick={() => setShowAddPopup(true)}
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
                  <DialogBox
                    type="warning"
                    msg={t('warning.delete')}
                    subMsg={t('warning.multipleDelete', {
                      defaultValue:
                        'Are you sure you want to delete {{count}} items?',
                      count: popupDeleteSelection || 0,
                    })}
                    onConfirm={handleConfirmBulkDelete}
                    isOpen={popupDeleteSelection !== undefined}
                    onRequestClose={() => setPopupDeleteSelection(undefined)}
                  />
                </>
              )}
            </>
          );
        },
      }),
      [
        suppliers,
        tagList,
        selectedIngredients,
        filters,
        handleExportDataClick,
        handleCancelSelection,
        t,
      ]
    );

    return (
      <>
        <Table
          data={paginatedIngredients}
          columns={columns}
          onRowClick={handleEditClick}
        />

        <CustomPagination
          shape="rounded"
          count={Math.ceil((filteredIngredients?.length || 0) / ITEMS_PER_PAGE)}
          value={page}
          onChange={(newValue) => setPage(newValue)}
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

        {/* Form Panel */}
        <IngredientFormPanel
          isOpen={showFormPanel}
          onRequestClose={handleCloseFormPanel}
          onSubmitted={handleIngredientUpdated}
          ingredient={selectedIngredient}
          action={selectedIngredient ? 'edit' : 'create'}
          suppliers={suppliers}
        />

        {/* Other modals and popups */}
        <AddIngredientPopup
          isVisible={showAddPopup}
          reloadInventoryData={reloadInventoryData}
          onRequestClose={() => setShowAddPopup(false)}
        />

        <AddWastingPopup
          onRequestClose={() => setWastingPopupVisible(false)}
          isVisible={isWastingPopupVisible}
          onReload={reloadInventoryData}
          ingredient={wastingRowId}
        />

        {/* Keep your existing dialog boxes */}
        <DialogBox
          type="warning"
          msg={t('warning.delete')}
          subMsg={
            popupDelete?.length !== 0 ? t('warning.impactedRecipes') : undefined
          }
          list={popupDelete?.length !== 0 ? popupDelete : undefined}
          onConfirm={handleConfirmPopupDelete}
          isOpen={popupDelete === undefined ? false : true}
          onRequestClose={() => setPopupDelete(undefined)}
        />

        {/* Other dialog boxes... */}

        <Tooltip className="tooltip" id="inventory-tooltip" delayShow={500} />
      </>
    );
  }
);

IngredientTab.displayName = 'IngredientTab';
