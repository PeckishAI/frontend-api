import React, {
  useCallback,
  useEffect,
  useImperativeHandle,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { Button, IconButton, Checkbox, DialogBox } from 'shared-ui';
import Table, { ColumnDefinitionType } from 'shared-ui/components/Table/Table';
import { Tooltip } from 'react-tooltip';
import { Ingredient, TagDetails } from '../../../types';
import { inventoryService } from '../../../services';
import { useRestaurantStore } from '../../../store/useRestaurantStore';
import ImportIngredients from '../Components/ImportIngredients/ImportIngredients';
import Filters, {
  FiltersType,
  defaultFilters,
} from '../Components/Filters/Filters';
import CustomPagination from '../../Overview/components/Pagination/CustomPagination';
import AddIngredientPopup from './AddIngredientPopup';
import AddWastingPopup from '../Components/Wastes/Wastes';
import IngredientPanel from '../Components/IngredientPanel/IngredientPanel';
import styles from './IngredientTab.module.scss';
import Fuse from 'fuse.js';
import { tagService } from '../../../services/tag.service';
import supplierService from '../../../services/supplier.service';

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
    const [ingredientsList, setIngredientsList] = useState<Ingredient[]>([]);
    const [filteredIngredients, setFilteredIngredients] = useState<
      Ingredient[]
    >([]);
    const [filters, setFilters] = useState<FiltersType>(defaultFilters);
    const [tagList, setTagList] = useState<TagDetails>();
    const [selectedIngredients, setSelectedIngredients] = useState<
      Ingredient[]
    >([]);
    const [page, setPage] = useState(1);
    const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
    const [editingIngredient, setEditingIngredient] =
      useState<Ingredient | null>(null);
    const [showAddPopup, setShowAddPopup] = useState(false);
    const [importIngredientsPopup, setImportIngredientsPopup] = useState(false);
    const [popupDelete, setPopupDelete] = useState<string[] | undefined>();
    const [popupDeleteSelection, setPopupDeleteSelection] = useState(0);
    const [popupError, setPopupError] = useState('');
    const [wastingIngredient, setWastingIngredient] = useState<Ingredient>();
    const [isWastingPopupVisible, setWastingPopupVisible] = useState(false);
    const [suppliers, setSuppliers] = useState([]);

    const selectedRestaurantUUID = useRestaurantStore(
      (state) => state.selectedRestaurantUUID
    );
    const ITEMS_PER_PAGE = 25;

    // Sorting states
    const [sortColumn, setSortColumn] = useState<string | null>(null);
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc' | null>(
      null
    );
    const [hoveredColumn, setHoveredColumn] = useState<string | null>(null);

    const handleMouseLeave = () => {
      setHoveredColumn(null);
    };

    const renderSortArrow = (columnKey: keyof Ingredient) => {
      const isActiveColumn = sortColumn === columnKey;
      const isHoveredColumn = hoveredColumn === columnKey;

      const arrowStyle = {
        color: '#CCCCCC',
        fontSize: '22px',
        marginLeft: '5px',
        marginBottom: '0px',
        position: 'relative' as const,
        top: '-1px',
      };

      const hoverArrowStyle = {
        ...arrowStyle,
        color: '#5e72e4',
      };

      const activeArrowStyle = {
        ...arrowStyle,
        color: '#5e72e4',
      };

      if (isActiveColumn) {
        return sortDirection === 'asc' ? (
          <span style={activeArrowStyle}>↑</span>
        ) : (
          <span style={activeArrowStyle}>↓</span>
        );
      } else if (isHoveredColumn) {
        return <span style={hoverArrowStyle}>↑</span>;
      } else {
        return <span style={arrowStyle}>↑</span>;
      }
    };

    useEffect(() => {
      const applyFilters = () => {
        let filteredList = [...ingredientsList];

        if (props.searchValue) {
          const fuseOptions = {
            keys: ['name'],
            threshold: 0.3,
            distance: 100,
            minMatchCharLength: 2,
          };
          const fuse = new Fuse(filteredList, fuseOptions);
          filteredList = fuse.search(props.searchValue).map((r) => r.item);
        }

        if (filters.selectedSupplier && filters.selectedSupplier.length > 0) {
          const selectedSupplierUuids = filters.selectedSupplier.map(
            (supplier) => supplier.uuid
          );
          filteredList = filteredList.filter((ingredient) =>
            ingredient.supplierDetails?.some((supplier) =>
              selectedSupplierUuids.includes(supplier.supplierUUID)
            )
          );
        }

        if (filters.selectedTag && filters.selectedTag.length > 0) {
          const selectedTagUuids = filters.selectedTag.map(
            (tag) => tag.tagUUID
          );
          filteredList = filteredList.filter((ingredient) =>
            ingredient.tagDetails?.some((tag) =>
              selectedTagUuids.includes(tag.tagUUID)
            )
          );
        }

        setFilteredIngredients(filteredList);
      };

      applyFilters();
    }, [props.searchValue, filters, ingredientsList]);

    // Load data functions
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
        console.error('Error loading inventory:', err);
      }
      props.setLoadingState(false);
    }, [selectedRestaurantUUID, props.setLoadingState]);

    const reloadTagList = useCallback(async () => {
      if (!selectedRestaurantUUID) return;
      return tagService.getAll(selectedRestaurantUUID).then((tags) => {
        setTagList(tags);
      });
    }, [selectedRestaurantUUID]);

    const reloadSuppliers = useCallback(async () => {
      if (!selectedRestaurantUUID) return;
      const suppliers = await supplierService.getRestaurantSuppliers(
        selectedRestaurantUUID
      );
      setSuppliers(suppliers);
    }, [selectedRestaurantUUID]);

    useEffect(() => {
      reloadInventoryData();
      reloadTagList();
      reloadSuppliers();
    }, [reloadInventoryData, reloadTagList, reloadSuppliers]);

    // Table handlers
    const handleEditClick = (ingredient: Ingredient) => {
      setEditingIngredient(ingredient);
      setIsSidePanelOpen(true);
    };

    const handleDeleteClick = async (ingredient: Ingredient) => {
      try {
        const preview = await inventoryService.getIngredientPreview(
          ingredient.ingredientUUID
        );
        setPopupDelete(preview.data);
      } catch (err) {
        console.error('Error getting delete preview:', err);
      }
    };

    const handleConfirmDelete = async () => {
      if (!editingIngredient) return;
      try {
        await inventoryService.deleteIngredient(
          editingIngredient.ingredientUUID
        );
        await reloadInventoryData();
        setPopupDelete(undefined);
      } catch (err) {
        setPopupError(err.message);
      }
    };

    const handleSelectIngredient = (ingredient: Ingredient) => {
      setSelectedIngredients((prev) => {
        const isSelected = prev.find(
          (i) => i.ingredientUUID === ingredient.ingredientUUID
        );
        return isSelected
          ? prev.filter((i) => i.ingredientUUID !== ingredient.ingredientUUID)
          : [...prev, ingredient];
      });
    };

    const handleSelectAll = () => {
      setSelectedIngredients((prev) =>
        prev.length === ingredientsList.length ? [] : [...ingredientsList]
      );
    };

    const handleWastingClick = (ingredient: Ingredient) => {
      setWastingIngredient(ingredient);
      setWastingPopupVisible(true);
    };

    // Export handler
    const handleExportData = useCallback(() => {
      if (!filteredIngredients) return;

      const header =
        'Ingredient name,Par level,Actual stock,Theoretical stock,Unit,Suppliers,Cost per unit\n';
      const csvContent =
        'data:text/csv;charset=utf-8,' +
        header +
        filteredIngredients
          .map((row) => {
            const values = [
              row.ingredientName,
              row.parLevel || '-',
              row.quantity || '-',
              '-', // Theoretical stock
              row.unitName || '-',
              row.supplierDetails?.length > 0
                ? row.supplierDetails
                    .map((s) => `{${s.supplierName} (${s.supplierUnitCost})}`)
                    .join('; ')
                : '-',
              '-', // Cost per unit
            ];
            return values.join(',');
          })
          .join('\n');

      const link = document.createElement('a');
      link.setAttribute('href', encodeURI(csvContent));
      link.setAttribute('download', 'inventory.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }, [filteredIngredients]);

    // Sorting handlers
    const handleSort = (column: keyof Ingredient) => {
      if (sortColumn === column) {
        setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
      } else {
        setSortColumn(column);
        setSortDirection('asc');
      }
    };

    const getSortedIngredients = () => {
      if (!sortColumn || !sortDirection) return filteredIngredients;

      return [...filteredIngredients].sort((a, b) => {
        const aValue = a[sortColumn];
        const bValue = b[sortColumn];

        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortDirection === 'asc'
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }

        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
        }

        return 0;
      });
    };

    // Column definitions
    const columns: ColumnDefinitionType<Ingredient, keyof Ingredient>[] = [
      {
        key: 'select',
        header: () => (
          <Checkbox
            checked={selectedIngredients.length === ingredientsList.length}
            onCheck={handleSelectAll}
          />
        ),
        width: '50px',
        renderItem: ({ row }) => (
          <Checkbox
            checked={selectedIngredients.some(
              (i) => i.ingredientUUID === row.ingredientUUID
            )}
            onCheck={() => handleSelectIngredient(row)}
          />
        ),
      },
      {
        key: 'ingredientName',
        header: () => (
          <div
            className={styles.tableHeader}
            onClick={() => handleSort('ingredientName')}
            onMouseEnter={() => setHoveredColumn('ingredientName')}
            onMouseLeave={handleMouseLeave}>
            {t('ingredient:ingredientName')}
            <span
              className={`${styles.sortArrow} ${
                sortColumn === 'ingredientName'
                  ? styles.active
                  : hoveredColumn === 'ingredientName'
                    ? styles.hover
                    : styles.default
              }`}>
              {sortDirection === 'desc' ? '↓' : '↑'}
            </span>
          </div>
        ),
        width: '15%',
        classname: styles.columnBold,
        renderItem: ({ row }) => row.ingredientName,
      },
      {
        key: 'tagDetails',
        header: t('ingredient:tag'),
        width: '15%',
        minWidth: '150px',
        renderItem: ({ row }) => (
          <div className={styles.tagContainer}>
            {row.tagDetails && row.tagDetails.length > 0 ? (
              row.tagDetails.map((tag) => (
                <span key={tag.tagUUID} className={styles.tagItem}>
                  {tag.tagName}
                </span>
              ))
            ) : (
              <span className={styles.emptyValue}>-</span>
            )}
          </div>
        ),
      },
      {
        key: 'parLevel',
        header: () => (
          <div
            className={styles.tableHeader}
            onClick={() => handleSort('parLevel')}
            onMouseEnter={() => setHoveredColumn('parLevel')}
            onMouseLeave={handleMouseLeave}>
            {t('ingredient:parLevel')}
            <span
              className={`${styles.sortArrow} ${
                sortColumn === 'parLevel'
                  ? styles.active
                  : hoveredColumn === 'parLevel'
                    ? styles.hover
                    : styles.default
              }`}>
              {sortDirection === 'desc' ? '↓' : '↑'}
            </span>
          </div>
        ),
        width: '10%',
        classname: styles.textRight,
        renderItem: ({ row }) => (
          <span className={row.parLevel ? '' : styles.emptyValue}>
            {row.parLevel || '-'}
          </span>
        ),
      },
      {
        key: 'quantity',
        header: () => (
          <div
            className={styles.tableHeader}
            onClick={() => handleSort('quantity')}
            onMouseEnter={() => setHoveredColumn('quantity')}
            onMouseLeave={handleMouseLeave}>
            {t('ingredient:actualStock')}
            <span
              className={`${styles.sortArrow} ${
                sortColumn === 'quantity'
                  ? styles.active
                  : hoveredColumn === 'quantity'
                    ? styles.hover
                    : styles.default
              }`}>
              {sortDirection === 'desc' ? '↓' : '↑'}
            </span>
          </div>
        ),
        width: '15%',
        classname: styles.textRight,
        renderItem: ({ row }) => (
          <span className={row.quantity ? '' : styles.emptyValue}>
            {row.quantity || '-'}
          </span>
        ),
      },
      {
        key: 'unit',
        header: () => (
          <div
            className={styles.tableHeader}
            onClick={() => handleSort('unitName')}
            onMouseEnter={() => setHoveredColumn('unitName')}
            onMouseLeave={handleMouseLeave}>
            {t('ingredient:unit')}
            <span
              className={`${styles.sortArrow} ${
                sortColumn === 'unitName'
                  ? styles.active
                  : hoveredColumn === 'unitName'
                    ? styles.hover
                    : styles.default
              }`}>
              {sortDirection === 'desc' ? '↓' : '↑'}
            </span>
          </div>
        ),
        width: '10%',
        renderItem: ({ row }) => (
          <span className={row.unitName ? '' : styles.emptyValue}>
            {row.unitName || '-'}
          </span>
        ),
      },
      // In your columns definition:
      {
        key: 'supplierDetails',
        header: t('ingredient:supplierName'),
        width: '15%',
        renderItem: ({ row }) => (
          <div className={styles.supplierList}>
            {/* Add console.log to debug */}
            {row.supplierDetails && row.supplierDetails.length > 0 ? (
              row.supplierDetails.map((supplier, index) => (
                <div key={index} className={styles.supplierItem}>
                  {/* Make sure we're using the correct property name */}
                  {supplier.supplierName || supplier.supplier_name || '-'}
                </div>
              ))
            ) : (
              <span className={styles.emptyValue}>-</span>
            )}
          </div>
        ),
      },
      {
        key: 'supplierCost',
        header: t('ingredient:supplierCost'),
        width: '15%',
        classname: styles.textRight,
        renderItem: ({ row }) => (
          <div className={styles.supplierList}>
            {row.supplierDetails && row.supplierDetails.length > 0 ? (
              row.supplierDetails.map((supplier, index) => (
                <div key={index} className={styles.supplierItem}>
                  {/* Make sure we're using the correct property name */}
                  {supplier.supplierUnitCost ||
                    supplier.supplier_unit_cost ||
                    '-'}
                </div>
              ))
            ) : (
              <span className={styles.emptyValue}>-</span>
            )}
          </div>
        ),
      },
      {
        key: 'actions',
        header: t('ingredient:actions'),
        width: '10%',
        classname: styles.textCenter,
        renderItem: ({ row }) => (
          <div className={styles.actions}>
            <i
              className="fa-solid fa-trash"
              data-tooltip-id="inventory-tooltip"
              data-tooltip-content={t('delete')}
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteClick(row);
              }}
            />
            <i
              className="fa-solid fa-recycle"
              data-tooltip-id="inventory-tooltip"
              data-tooltip-content={t('waste')}
              onClick={(e) => {
                e.stopPropagation();
                handleWastingClick(row);
              }}
            />
          </div>
        ),
      },
    ];

    useImperativeHandle(
      forwardedRef,
      () => ({
        renderOptions: () => {
          if (selectedIngredients.length === 0) {
            return (
              <>
                <Filters
                  suppliers={suppliers}
                  tags={tagList}
                  onApplyFilters={setFilters}
                />
                <IconButton
                  icon={<i className="fa-solid fa-file-export" />}
                  onClick={handleExportData}
                  tooltipMsg={t('export')}
                />
                <Button
                  value={t('inventory.addIngredientBtn')}
                  type="primary"
                  onClick={() => setShowAddPopup(true)}
                />
              </>
            );
          }

          return (
            <>
              <Button
                value={t('cancel')}
                type="secondary"
                onClick={() => setSelectedIngredients([])}
              />
              <Button
                value={t('delete')}
                type="primary"
                onClick={() =>
                  setPopupDeleteSelection(selectedIngredients.length)
                }
              />
            </>
          );
        },
      }),
      [selectedIngredients, suppliers, tagList, handleExportData]
    );

    return (
      <div className={styles.container}>
        <Table
          data={getSortedIngredients().slice(
            (page - 1) * ITEMS_PER_PAGE,
            page * ITEMS_PER_PAGE
          )}
          columns={columns}
          onRowClick={handleEditClick}
        />

        {isSidePanelOpen && editingIngredient && (
          <IngredientPanel
            ingredient={editingIngredient}
            isOpen={isSidePanelOpen}
            onClose={() => {
              setIsSidePanelOpen(false);
              setEditingIngredient(null);
            }}
            onSave={reloadInventoryData}
            onDelete={handleDeleteClick}
            suppliers={suppliers}
            tagList={tagList}
          />
        )}

        <CustomPagination
          count={Math.ceil(filteredIngredients.length / ITEMS_PER_PAGE)}
          page={page}
          onChange={(_, value) => setPage(value)}
        />

        <ImportIngredients
          openUploader={importIngredientsPopup}
          onCloseUploader={() => setImportIngredientsPopup(false)}
          onIngredientsImported={reloadInventoryData}
        />

        <AddIngredientPopup
          isVisible={showAddPopup}
          onRequestClose={() => setShowAddPopup(false)}
          reloadInventoryData={reloadInventoryData}
        />

        <AddWastingPopup
          isVisible={isWastingPopupVisible}
          onRequestClose={() => setWastingPopupVisible(false)}
          ingredient={wastingIngredient}
          onReload={reloadInventoryData}
        />

        <DialogBox
          type="warning"
          msg={t('warning.delete')}
          subMsg={
            popupDelete?.length ? t('warning.impactedRecipes') : undefined
          }
          list={popupDelete}
          onConfirm={handleConfirmDelete}
          isOpen={!!popupDelete}
          onRequestClose={() => setPopupDelete(undefined)}
        />

        <DialogBox
          type="warning"
          msg={t('warning.deleteSelection.msg', {
            count: popupDeleteSelection,
          })}
          subMsg={t('warning.deleteSelection.subMsg')}
          onConfirm={() => {
            // Handle bulk delete
            setPopupDeleteSelection(0);
          }}
          isOpen={popupDeleteSelection > 0}
          onRequestClose={() => setPopupDeleteSelection(0)}
        />

        <DialogBox
          type="error"
          msg={t('error.trigger')}
          subMsg={popupError}
          isOpen={!!popupError}
          onRequestClose={() => setPopupError('')}
        />

        <Tooltip id="inventory-tooltip" />
      </div>
    );
  }
);

IngredientTab.displayName = 'IngredientTab';
