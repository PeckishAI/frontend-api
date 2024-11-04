import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  SidePanel,
  IconButton,
  LabeledInput,
  Select,
  DialogBox,
} from 'shared-ui';
import CreatableSelect from 'react-select/creatable';
import {
  Ingredient,
  Tag,
  Unit,
  SupplierIngredient,
  RecipeIngredient,
  RollingStock,
} from '../../../../services/types';
import { inventoryService } from '../../../../services';
import { useRestaurantStore } from '../../../../store/useRestaurantStore';
import styles from './IngredientPanel.module.scss';

interface IngredientPanelProps {
  ingredient: Ingredient;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  onDelete?: (ingredient: Ingredient) => void;
  suppliers: any[];
  tagList: Tag;
}

const IngredientPanel: React.FC<IngredientPanelProps> = ({
  ingredient,
  isOpen,
  onClose,
  onSave,
  onDelete,
  suppliers,
  tagList,
}) => {
  const { t } = useTranslation(['common', 'ingredient']);
  const selectedRestaurantUUID = useRestaurantStore(
    (state) => state.selectedRestaurantUUID
  );

  // State
  const [editedValues, setEditedValues] = useState<Ingredient>(ingredient);
  const [isIngredientsVisible, setIsIngredientsVisible] = useState(false);
  const [isQuantityVisible, setIsQuantityVisible] = useState(false);
  const [unitList, setUnitList] = useState<Unit[]>([]);
  const [referenceUnits, setReferenceUnits] = useState<Unit[]>([]);
  const [unitError, setUnitError] = useState(false);
  const [popupError, setPopupError] = useState('');

  // Load units
  useEffect(() => {
    const loadUnits = async () => {
      if (!selectedRestaurantUUID) return;
      const units = await inventoryService.getUnits(selectedRestaurantUUID);
      setUnitList(units);
    };

    const loadReferenceUnits = async () => {
      const units = await inventoryService.getReferenceUnits();
      setReferenceUnits(units);
    };

    loadUnits();
    loadReferenceUnits();
  }, [selectedRestaurantUUID]);

  const handleSave = async () => {
    if (!editedValues?.unitUUID) {
      setUnitError(true);
      return;
    }
    setUnitError(false);

    try {
      await inventoryService.updateIngredient(
        selectedRestaurantUUID,
        editedValues
      );
      onSave();
      onClose();
    } catch (error) {
      setPopupError(error.message);
    }
  };

  const handleAddSupplierDetail = () => {
    setEditedValues((prev) => ({
      ...prev,
      supplierDetails: [
        ...(prev.supplierDetails || []),
        {
          supplierUUID: '',
          supplierName: '',
          supplierUnitUUID: '',
          supplierUnitName: '',
          supplierUnitCost: 0,
          conversionFactor: 1,
        },
      ],
    }));
  };

  const handleRemoveSupplierDetail = (index: number) => {
    setEditedValues((prev) => ({
      ...prev,
      supplierDetails: prev.supplierDetails?.filter((_, i) => i !== index),
    }));
  };

  const handleUpdateSupplierDetail = (
    index: number,
    updatedSupplier: Partial<SupplierIngredient>
  ) => {
    setEditedValues((prev) => {
      const updatedSuppliers = [...(prev.supplierDetails || [])];
      updatedSuppliers[index] = {
        ...updatedSuppliers[index],
        ...updatedSupplier,
      };
      return {
        ...prev,
        supplierDetails: updatedSuppliers,
      };
    });
  };

  console.log('edit', editedValues);
  return (
    <>
      <SidePanel
        isOpen={isOpen}
        onRequestClose={onClose}
        width="900px"
        className={styles.sidePanel}>
        <div className={styles.headerContainer}>
          <h1 className={styles.title}>{editedValues.ingredientName}</h1>
          <div className={styles.header}>
            <IconButton
              icon={<i className="fa-solid fa-check" />}
              onClick={handleSave}
              tooltipMsg={t('save')}
              className={styles.headerButton}
            />
            <IconButton
              icon={<i className="fa-solid fa-times" />}
              onClick={onClose}
              tooltipMsg={t('cancel')}
              className={styles.headerButton}
            />
          </div>
        </div>

        <div className={styles.content}>
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>General</h2>
            <div className={styles.grid}>
              <div className={styles.field}>
                <label>{t('ingredient:actualStock')}</label>
                <div className={styles.inputBox}>
                  <LabeledInput
                    type="number"
                    placeholder=""
                    value={editedValues.quantity || null}
                    onChange={(e) =>
                      setEditedValues((prev) => ({
                        ...prev,
                        quantity: parseFloat(e.target.value),
                      }))
                    }
                  />
                </div>
              </div>

              <div className={styles.field}>
                <label>{t('ingredient:parLevel')}</label>
                <div className={styles.inputBox}>
                  <LabeledInput
                    type="number"
                    value={editedValues.parLevel || ''}
                    onChange={(e) =>
                      setEditedValues((prev) => ({
                        ...prev,
                        parLevel: parseFloat(e.target.value),
                      }))
                    }
                  />
                </div>
              </div>

              <div className={styles.field}>
                <label>{t('ingredient:unit')}</label>
                <CreatableSelect
                  value={{
                    label: editedValues.unitName || '',
                    value: editedValues.unitUUID || '',
                  }}
                  options={unitList.map((unit) => ({
                    label: unit.unitName,
                    value: unit.unitUUID,
                  }))}
                  onChange={async (selected) => {
                    if (selected.__isNew__) {
                      try {
                        const newUnit = await inventoryService.createUnit(
                          selectedRestaurantUUID!,
                          selected.label
                        );
                        setEditedValues((prev) => ({
                          ...prev,
                          unitUUID: newUnit.unitUUID,
                          unitName: newUnit.unitName,
                        }));
                      } catch (error) {
                        console.error('Error creating unit:', error);
                      }
                    } else {
                      setEditedValues((prev) => ({
                        ...prev,
                        unitUUID: selected.value,
                        unitName: selected.label,
                      }));
                    }
                    setUnitError(false);
                  }}
                />
                {unitError && (
                  <span className={styles.error}>Unit is required</span>
                )}
              </div>
            </div>

            {editedValues.volumeQuantity !== null && (
              <div className={styles.grid}>
                <div className={styles.field}>
                  <label>Container</label>
                  <span>{editedValues.unitName}</span>
                </div>
                <div className={styles.field}>
                  <label>Volume</label>
                  <LabeledInput
                    type="number"
                    value={editedValues.volumeQuantity || ''}
                    onChange={(e) =>
                      setEditedValues((prev) => ({
                        ...prev,
                        volumeQuantity: parseFloat(e.target.value),
                      }))
                    }
                  />
                </div>
                <div className={styles.field}>
                  <label>Unit</label>
                  <CreatableSelect
                    value={{
                      label: editedValues.volumeUnitName || '',
                      value: editedValues.volumeUnitUUID || '',
                    }}
                    options={referenceUnits.map((unit) => ({
                      label: unit.unitName,
                      value: unit.unitUUID,
                    }))}
                    onChange={(selected) => {
                      setEditedValues((prev) => ({
                        ...prev,
                        volumeUnitName: selected?.label || '',
                        volumeUnitUUID: selected?.value || '',
                      }));
                    }}
                  />
                </div>
              </div>
            )}
          </section>
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Tags</h2>
            <CreatableSelect
              isMulti
              value={editedValues.tagDetails?.map((tag) => ({
                label: tag.tagName,
                value: tag.tagUUID,
              }))}
              options={tagList?.map((tag) => ({
                label: tag.name,
                value: tag.uuid,
              }))}
              onChange={(selected) => {
                setEditedValues((prev) => ({
                  ...prev,
                  tagDetails: selected.map((item) => ({
                    tagUUID: item.value,
                    tagName: item.label,
                  })),
                }));
              }}
            />
          </section>

          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Supplier Details</h2>
              <IconButton
                icon={<i className="fa-solid fa-plus" />}
                onClick={handleAddSupplierDetail}
                className={styles.addButton}
              />
            </div>

            {/* Add column headers */}
            <div className={styles.supplierTableHeader}>
              <div>Supplier Name</div>
              <div>Unit Cost</div>
              <div>Supplier Unit</div>
              <div>Conversion Factor</div>
            </div>

            <div className={styles.supplierDetails}>
              {editedValues.supplierDetails?.map((supplier, index) => (
                <div key={index} className={styles.supplierRow}>
                  {console.log('e-Edits Details:', editedValues)}
                  <CreatableSelect
                    placeholder="Select supplier..."
                    options={suppliers.map((s) => ({
                      label: s.name,
                      value: s.uuid,
                    }))}
                    value={{
                      label: supplier.supplierName,
                      value: supplier.supplierUUID,
                    }}
                    onChange={(selected) => {
                      handleUpdateSupplierDetail(index, {
                        supplierUUID: selected?.value,
                        supplierName: selected?.label,
                      });
                    }}
                  />

                  <div className={styles.unitCostField}>
                    <span className={styles.currencyPrefix}>$</span>
                    <LabeledInput
                      type="number"
                      placeholder="Unit Cost"
                      value={supplier.supplierUnitCost || ''}
                      onChange={(e) => {
                        handleUpdateSupplierDetail(index, {
                          supplierUnitCost: parseFloat(e.target.value),
                        });
                      }}
                    />
                  </div>

                  <CreatableSelect
                    placeholder="Select unit..."
                    options={unitList.map((unit) => ({
                      label: unit.unitName,
                      value: unit.unitUUID,
                    }))}
                    value={{
                      label: supplier.supplierUnitName,
                      value: supplier.supplierUnitUUID,
                    }}
                    onChange={(selected) => {
                      handleUpdateSupplierDetail(index, {
                        supplierUnitUUID: selected?.value,
                        supplierUnitName: selected?.label,
                      });
                    }}
                  />

                  <div className={styles.conversionFactorField}>
                    <LabeledInput
                      type="number"
                      placeholder="Conversion Factor"
                      value={supplier.conversionFactor || ''}
                      onChange={(e) => {
                        handleUpdateSupplierDetail(index, {
                          conversionFactor: parseFloat(e.target.value),
                        });
                      }}
                    />
                    <IconButton
                      icon={<i className="fa-solid fa-circle-info" />}
                      className={styles.infoIcon}
                      tooltipMsg={`from ${supplier.supplierUnitName || 'supplier unit'} to ${editedValues.unitName || 'base unit'}`}
                    />
                  </div>

                  <IconButton
                    icon={<i className="fa-solid fa-trash" />}
                    onClick={() => handleRemoveSupplierDetail(index)}
                    className={styles.deleteButton}
                  />
                </div>
              ))}
            </div>
          </section>
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Recipe Details</h2>
              <button
                className={styles.toggleButton}
                onClick={() => setIsIngredientsVisible(!isIngredientsVisible)}>
                {isIngredientsVisible ? '▼' : '▶'} Show Recipes (
                {editedValues.recipeDetails?.length || 0})
              </button>
            </div>
            {isIngredientsVisible && editedValues.recipeDetails && (
              <div className={styles.recipeList}>
                {/* Recipe details implementation */}
              </div>
            )}
          </section>
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>History</h2>
              <button
                className={styles.toggleButton}
                onClick={() => setIsQuantityVisible(!isQuantityVisible)}>
                {isQuantityVisible ? '▼' : '▶'} Show Quantity
              </button>
            </div>
            {isQuantityVisible && editedValues.stockHistory && (
              <div className={styles.historyList}>
                {/* History implementation */}
              </div>
            )}
          </section>
        </div>
      </SidePanel>

      <DialogBox
        type="error"
        msg={t('error.trigger')}
        subMsg={popupError}
        isOpen={!!popupError}
        onRequestClose={() => setPopupError('')}
      />
    </>
  );
};

export default IngredientPanel;
