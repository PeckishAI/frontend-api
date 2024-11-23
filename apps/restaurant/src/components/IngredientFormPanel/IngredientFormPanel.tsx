import React, { useCallback, useEffect, useState } from 'react';
import { ActionMeta, MultiValue } from 'react-select';
import { useTranslation } from 'react-i18next';
import { Button, IconButton, LabeledInput, Select, SidePanel } from 'shared-ui';
import CreatableSelect from 'react-select/creatable';
import { Ingredient, Tag, inventoryService } from '../../services';
import { tagService } from '../../services/tag.service';
import { useRestaurantStore } from '../../store/useRestaurantStore';
import styles from './IngredientFormPanel.module.scss';
import { Tooltip } from 'react-tooltip';
import { Unit, TagOption, TagDetails } from '../../services/types';

type Props = {
  isOpen: boolean;
  onRequestClose: () => void;
  onSubmitted: () => void;
  ingredient?: Ingredient | null;
  action: 'create' | 'edit';
  suppliers?: any[];
};

const IngredientFormPanel = ({
  isOpen,
  onRequestClose,
  onSubmitted,
  ingredient,
  action,
  suppliers = [],
}: Props) => {
  const { t } = useTranslation(['common', 'ingredient']);
  const [isEditMode, setIsEditMode] = useState(action === 'create');
  const [isVolumeVisible, setIsVolumeVisible] = useState(false);
  const [isIngredientsVisible, setIsIngredientsVisible] = useState(false);
  const [isQuantityVisible, setIsQuantityVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editedValues, setEditedValues] = useState(ingredient);
  const [unitname, setUnitName] = useState<Unit[]>([]);
  const [reference_units, setReferenceUnitName] = useState<Unit[]>([]);
  const [tagList, setTagList] = useState<Tag[]>();
  const [unitError, setUnitError] = useState(false);
  const [inputValue, setInputValue] = useState<any>('');

  const selectedRestaurantUUID = useRestaurantStore(
    (state) => state.selectedRestaurantUUID
  );

  const toggleIngredientsVisibility = () => {
    setIsIngredientsVisible(!isIngredientsVisible);
  };

  const toggleQuantityVisibility = () => {
    setIsQuantityVisible(!isQuantityVisible);
  };

  // Load initial data
  const reloadReferenceUnits = useCallback(async () => {
    inventoryService.getReferenceUnits().then((res) => {
      setReferenceUnitName(res);
    });
  }, []);

  const reloadUnits = useCallback(() => {
    if (!selectedRestaurantUUID) return;
    inventoryService
      .getUnits(selectedRestaurantUUID)
      .then(setUnitName)
      .catch(console.error);
  }, [selectedRestaurantUUID]);

  const reloadTagList = useCallback(async () => {
    if (!selectedRestaurantUUID) return;
    return tagService.getAll(selectedRestaurantUUID).then(setTagList);
  }, [selectedRestaurantUUID]);

  useEffect(() => {
    if (isOpen) {
      reloadReferenceUnits();
      reloadUnits();
      reloadTagList();

      // Check volume visibility based on unit type
      if (ingredient) {
        const isReferenceUnit = reference_units.some(
          (unit) => unit.unit_uuid === ingredient.unit_uuid
        );
        setIsVolumeVisible(!isReferenceUnit);
      }
    }
  }, [isOpen, ingredient, reloadReferenceUnits, reloadUnits, reloadTagList]);

  const handleSave = async () => {
    setIsLoading(true);
    if (!editedValues?.unit_uuid) {
      setUnitError(true);
      setIsLoading(false);
      return;
    }

    setUnitError(false);

    try {
      if (action === 'create') {
        await inventoryService.addIngredient(
          selectedRestaurantUUID,
          editedValues
        );
      } else {
        await inventoryService.updateIngredient(
          selectedRestaurantUUID,
          editedValues
        );
      }
      onSubmitted();
      onRequestClose();
    } catch (error) {
      console.error('Error saving ingredient:', error);
      setIsLoading(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSupplierDetail = () => {
    setEditedValues((prevValues) => {
      if (!prevValues) return prevValues;
      const newDetails = prevValues.supplier_details
        ? [...prevValues.supplier_details]
        : [];
      newDetails.push({
        supplier_uuid: '',
        supplier_cost: 0,
        supplier_name: '',
        supplier_unit: '',
        supplier_unit_name: '',
        product_code: '',
        conversion_factor: 1,
      });
      return { ...prevValues, supplier_details: newDetails };
    });
  };

  const handleRemoveSupplierDetail = (index: number) => {
    setEditedValues((prevValues) => {
      if (!prevValues || !prevValues.supplier_details) return prevValues;
      const updatedSupplierDetails = prevValues.supplier_details.filter(
        (_, idx) => idx !== index
      );
      return {
        ...prevValues,
        supplier_details: updatedSupplierDetails,
      };
    });
  };

  useEffect(() => {
    if (isOpen) {
      // When panel opens, set the clicked ingredient as the edited values
      setEditedValues(ingredient);

      // Check volume visibility based on unit type
      const isReferenceUnit = reference_units.some(
        (unit) => unit.unit_uuid === ingredient?.unit_uuid
      );
      setIsVolumeVisible(!isReferenceUnit);
    }
  }, [isOpen, ingredient]);

  return (
    <>
      <SidePanel
        isOpen={isOpen}
        onRequestClose={onRequestClose}
        width={'900px'}
        className={styles.sidePanel}>
        <div className={styles.optionsButtons}>
          {isEditMode ? (
            <>
              <IconButton
                // icon={<i className="fa-solid fa-check"></i>}
                tooltipMsg={t('save')}
                onClick={handleSave}
                className="iconButton"
                disabled={isLoading} // Add disabled state
                // You can also add a loading spinner if the button supports it
                icon={
                  isLoading ? (
                    <i className="fa-solid fa-spinner fa-spin"></i>
                  ) : (
                    <i className="fa-solid fa-check"></i>
                  )
                }
              />
              <IconButton
                icon={<i className="fa-solid fa-times"></i>}
                tooltipMsg={t('cancel')}
                onClick={() => setIsEditMode(false)}
                className="iconButton"
              />
            </>
          ) : (
            <IconButton
              icon={<i className="fa-solid fa-pen-to-square"></i>}
              tooltipMsg={t('edit')}
              onClick={() => setIsEditMode(true)}
              className="iconButton"
            />
          )}
        </div>
        <div className={styles.scrollContainer}>
          <div className={styles.inputContainer}>
            {/* Name Section */}
            <div className={styles.divider}>
              <div className={styles.inputContainer}>
                <div className={styles.divider}>
                  <br />
                  {isEditMode ? (
                    <LabeledInput
                      placeholder={t('ingredientName')}
                      type="text"
                      lighter
                      value={editedValues?.name}
                      onChange={(event) =>
                        setEditedValues((prev) => {
                          if (!prev) return prev;
                          return {
                            ...prev,
                            name: event.target.value,
                          };
                        })
                      }
                    />
                  ) : (
                    <div className={styles.title}>
                      <span className={styles.titleRecipeName}>
                        {editedValues?.name}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* General Section */}
              <div className={styles.inputContainer}>
                <div className={styles.title}>
                  <span className={styles.titleRecipeName}>General</span>
                </div>
                <div className={styles.gridContainer3}>
                  {/* Actual Stock */}
                  <div className={styles.inputContainer}>
                    <div>
                      <span className={styles.values}>Actual Stock</span>
                    </div>
                    {isEditMode ? (
                      <LabeledInput
                        placeholder={t('ingredient:actualStock')}
                        type="text"
                        lighter
                        value={editedValues?.actualStock?.quantity || ''}
                        onChange={(event) => {
                          if (!editedValues) return; // Guard clause

                          setEditedValues({
                            ...editedValues,
                            actualStock: {
                              ...editedValues.actualStock,
                              quantity: +event.target.value,
                              event_type:
                                editedValues.actualStock?.event_type || null,
                              unit_name:
                                editedValues.actualStock?.unit_name || null,
                            },
                          } as Ingredient);
                        }}
                      />
                    ) : (
                      <span className={styles.value}>
                        {editedValues?.actualStock?.quantity}
                      </span>
                    )}
                  </div>

                  {/* Par Level */}
                  <div className={styles.inputContainer}>
                    <div>
                      <span className={styles.values}>Par Level</span>
                    </div>
                    {isEditMode ? (
                      <LabeledInput
                        placeholder={t('ingredient:parLevel')}
                        type="text"
                        lighter
                        value={editedValues?.parLevel || ''}
                        onChange={(event) =>
                          setEditedValues((prev) => {
                            if (!prev) return prev;
                            return {
                              ...prev,
                              parLevel: Number(event.target.value),
                            };
                          })
                        }
                      />
                    ) : (
                      <span className={styles.value}>
                        {editedValues?.parLevel}
                      </span>
                    )}
                  </div>

                  {/* Unit */}
                  <div className={styles.inputContainer}>
                    <div>
                      <span className={styles.values}>Unit</span>
                    </div>
                    {isEditMode ? (
                      <>
                        <CreatableSelect
                          placeholder={
                            editedValues?.unit_uuid
                              ? t('unit')
                              : t('ingredient:unit')
                          }
                          options={unitname.map((unit) => ({
                            label: unit.unit_name,
                            value: unit.unit_uuid,
                          }))}
                          value={
                            editedValues?.unit_name
                              ? {
                                  label: editedValues.unit_name,
                                  value: editedValues.unit_uuid,
                                }
                              : null
                          }
                          onChange={(selectedOption: any) => {
                            if (selectedOption) {
                              if (!editedValues) return; // Guard clause for null/undefined

                              const updatedValues = {
                                ...editedValues,
                                unit_uuid: selectedOption.__isNew__
                                  ? undefined
                                  : selectedOption.value,
                                unit_name: selectedOption.label,
                              };

                              // Type assertion to ensure it matches the Ingredient type
                              setEditedValues(updatedValues as Ingredient);

                              setUnitError(false);
                              setIsVolumeVisible(
                                !reference_units.some(
                                  (unit) =>
                                    unit.unit_uuid === selectedOption.value
                                )
                              );
                            }
                          }}
                        />

                        {unitError && (
                          <div style={{ color: 'red', marginTop: '5px' }}>
                            Unit is required.
                          </div>
                        )}
                      </>
                    ) : (
                      <span className={styles.value}>
                        {editedValues?.unit_name}
                      </span>
                    )}
                  </div>
                </div>

                {/* Volume Section */}
                {isVolumeVisible && (
                  <div className={styles.gridContainer3}>
                    {/* Container */}
                    <div className={styles.inputContainer}>
                      <div>
                        <span className={styles.values}>Container</span>
                      </div>
                      <span className={styles.value}>
                        {editedValues?.unit_name}
                      </span>
                    </div>

                    {/* Volume */}
                    <div className={styles.inputContainer}>
                      <div>
                        <span className={styles.values}>Volume</span>
                      </div>
                      {isEditMode ? (
                        <LabeledInput
                          placeholder={t('ingredient:volume')}
                          type="number"
                          lighter
                          value={editedValues?.volume_quantity || ''}
                          onChange={(event) =>
                            setEditedValues((prev) => {
                              if (!prev) return prev;
                              return {
                                ...prev,
                                volume_quantity: Number(event.target.value),
                              };
                            })
                          }
                        />
                      ) : (
                        <span className={styles.value}>
                          {editedValues?.volume_quantity}
                        </span>
                      )}
                    </div>

                    {/* Volume Unit */}
                    <div className={styles.inputContainer}>
                      <div>
                        <span className={styles.values}>Unit</span>
                      </div>
                      {isEditMode ? (
                        <Select
                          placeholder={
                            editedValues?.volume_unit_uuid
                              ? t('unit')
                              : t('selectUnit')
                          }
                          options={reference_units.map((unit) => ({
                            label: unit.unit_name,
                            value: unit.unit_uuid,
                          }))}
                          value={
                            editedValues?.volume_unit_name
                              ? {
                                  label: editedValues.volume_unit_name,
                                  value: editedValues.volume_unit_uuid,
                                }
                              : null
                          }
                          onChange={(selectedOption) => {
                            if (selectedOption && editedValues) {
                              setEditedValues((prev) => {
                                if (!prev) return prev;
                                return {
                                  ...prev,
                                  volume_unit_uuid: selectedOption.value,
                                  volume_unit_name: selectedOption.label,
                                };
                              });
                            }
                          }}
                          isClearable
                        />
                      ) : (
                        <span className={styles.value}>
                          {editedValues?.volume_unit_name}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Tags Section */}
            <div className={styles.inputContainer}>
              <div className={styles.divider}>
                <div className={styles.title}>
                  <span className={styles.titleRecipeName}>Tags</span>
                </div>
                {isEditMode ? (
                  <CreatableSelect<TagOption, true>
                    isMulti
                    onInputChange={(newInputValue: string) => {
                      if (newInputValue !== '') {
                        setInputValue(newInputValue);
                      }
                    }}
                    options={tagList?.map((tag) => ({
                      label: tag.name || '--',
                      value: tag.uuid,
                    }))}
                    value={editedValues?.tag_details?.map((tag) => ({
                      label: tag.name || 'New Tag',
                      value: tag.uuid || '',
                    }))}
                    onChange={async (
                      newValue: MultiValue<TagOption>,
                      actionMeta: ActionMeta<TagOption>
                    ) => {
                      const updatedTagDetails: TagDetails[] = [];

                      for (const option of [...newValue]) {
                        if (option.__isNew__) {
                          try {
                            if (selectedRestaurantUUID) {
                              const newTag = await tagService.createTag(
                                option.label,
                                selectedRestaurantUUID
                              );
                              updatedTagDetails.push({
                                name: newTag.name,
                                uuid: newTag.uuid,
                              });
                              setTagList((prevTags) =>
                                prevTags ? [...prevTags, newTag] : [newTag]
                              );
                            }
                          } catch (error) {
                            console.error('Error creating tag:', error);
                            updatedTagDetails.push({
                              name: option.label || 'Unknown',
                              uuid: '',
                            });
                          }
                        } else {
                          const existingTag = tagList?.find(
                            (tag) => tag.uuid === option.value
                          );
                          updatedTagDetails.push({
                            name: existingTag ? existingTag.name : option.label,
                            uuid: existingTag ? option.value : '',
                          });
                        }
                      }

                      setEditedValues((prevValues) => {
                        if (!prevValues) return prevValues;
                        return {
                          ...prevValues,
                          tag_details: updatedTagDetails,
                        };
                      });
                    }}
                  />
                ) : (
                  <div className={styles.tagList}>
                    {(editedValues?.tagUUID?.length ?? 0) > 0 ? (
                      <div className={styles.tagContainer}>
                        {editedValues?.tagUUID?.map((uuid) => {
                          const tag = tagList?.find((tag) => tag.uuid === uuid);
                          if (tag) {
                            return (
                              <span key={uuid} className={styles.tagItem}>
                                {tag.name}
                              </span>
                            );
                          }
                          return (
                            <span key={uuid} className={styles.tagItem}>
                              -
                            </span>
                          );
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
                    <span className={styles.titleRecipeName}>
                      Supplier Details
                    </span>
                  </div>
                </div>
                {isEditMode ? (
                  <>
                    {editedValues?.supplier_details?.map((detail, index) => (
                      <div key={index} className={styles.gridContainer6}>
                        {!index && (
                          <>
                            <div className={styles.values}>Product Code</div>
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
                              {t('ingredient:size')}
                            </div>
                            <div className={styles.values}></div>
                          </>
                        )}
                        <LabeledInput
                          placeholder={t('ingredient:code')}
                          type="string"
                          lighter
                          value={detail.product_code}
                          onChange={(event) => {
                            const updatedDetails = [
                              ...(editedValues?.supplier_details || []),
                            ];
                            updatedDetails[index] = {
                              ...updatedDetails[index],
                              product_code: event.target.value,
                            };

                            setEditedValues({
                              ...editedValues,
                              supplier_details: updatedDetails,
                            });
                          }}
                        />
                        <div>
                          <Select
                            size="large"
                            isSearchable={false}
                            placeholder={t('ingredient:supplier')}
                            options={
                              suppliers?.map((supplier) => ({
                                label: supplier.name || supplier.supplier_name,
                                value: supplier.uuid || supplier.supplier_uuid,
                              })) || []
                            }
                            value={
                              detail.supplier_uuid
                                ? {
                                    label: detail.supplier_name,
                                    value: detail.supplier_uuid,
                                  }
                                : null
                            }
                            onChange={(selectedOption) => {
                              const updatedDetails = [
                                ...(editedValues?.supplier_details || []),
                              ];

                              updatedDetails[index] = {
                                ...updatedDetails[index],
                                supplier_uuid: selectedOption?.value || '',
                                supplier_name: selectedOption?.label || '',
                              };

                              setEditedValues({
                                ...editedValues,
                                supplier_details: updatedDetails,
                              });
                            }}
                          />
                        </div>
                        <LabeledInput
                          placeholder={t('ingredient:supplierCost')}
                          type="number"
                          lighter
                          value={detail.supplier_cost}
                          onChange={(event) => {
                            const updatedDetails = [
                              ...(editedValues?.supplier_details || []),
                            ];
                            updatedDetails[index].supplier_cost = Number(
                              event.target.value
                            );

                            setEditedValues({
                              ...editedValues,
                              supplier_details: updatedDetails,
                            });
                          }}
                        />
                        <CreatableSelect
                          placeholder={
                            detail.supplier_unit ? t('unit') : t('selectUnit')
                          }
                          options={unitname.map((unit) => ({
                            label: unit.unit_name,
                            value: unit.unit_uuid,
                          }))}
                          value={
                            detail.supplier_unit
                              ? {
                                  label: detail.supplier_unit_name,
                                  value: detail.supplier_unit,
                                }
                              : null
                          }
                          onChange={(selectedOption: any) => {
                            const updatedDetails = [
                              ...(editedValues?.supplier_details || []),
                            ];

                            if (selectedOption?.__isNew__) {
                              inventoryService
                                .createUnit(
                                  selectedRestaurantUUID,
                                  selectedOption.label
                                )
                                .then((newUnit) => {
                                  updatedDetails[index] = {
                                    ...updatedDetails[index],
                                    supplier_unit: newUnit.unit_uuid,
                                    supplier_unit_name: selectedOption.label,
                                  };

                                  setEditedValues({
                                    ...editedValues,
                                    supplier_details: updatedDetails,
                                  });

                                  reloadUnits();
                                })
                                .catch(console.error);
                            } else {
                              updatedDetails[index] = {
                                ...updatedDetails[index],
                                supplier_unit: selectedOption?.value,
                                supplier_unit_name: selectedOption?.label,
                              };

                              setEditedValues({
                                ...editedValues,
                                supplier_details: updatedDetails,
                              });
                            }
                          }}
                          isClearable
                        />
                        <div className={styles.IconContainer}>
                          <LabeledInput
                            placeholder={`${t('ingredient:size')} (1 ${editedValues?.supplier_details?.[index]?.supplier_unit_name || '_'} → ${editedValues?.supplier_details?.[index]?.conversion_factor || 'x'} ${editedValues?.unit_name || '_'})`}
                            type="number"
                            lighter
                            value={detail.conversion_factor}
                            onChange={(event) => {
                              const updatedConversionFactor =
                                event.target.value;

                              const updatedDetails =
                                editedValues.supplier_details?.map(
                                  (supplierDetail) => {
                                    if (
                                      supplierDetail.supplier_unit ===
                                      detail.supplier_unit
                                    ) {
                                      return {
                                        ...supplierDetail,
                                        conversion_factor:
                                          +updatedConversionFactor || 1,
                                      };
                                    }
                                    return supplierDetail;
                                  }
                                );

                              setEditedValues({
                                ...editedValues,
                                supplier_details: updatedDetails,
                              });
                            }}
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
                    ))}
                    {isEditMode && (
                      <Button
                        className={styles.addSupplier}
                        type="primary"
                        value={t('ingredient:addSupplier')}
                        onClick={handleAddSupplierDetail}
                      />
                    )}
                  </>
                ) : (
                  <div>
                    <div className={styles.gridContainer5}>
                      <span className={styles.values}>Product Code</span>
                      <span className={styles.values}>Supplier Name</span>
                      <span className={styles.values}>Supplier Cost</span>
                      <span className={styles.values}>Unit</span>
                      <span className={styles.values}>Size</span>
                    </div>
                    {editedValues?.supplier_details?.map((detail, index) => (
                      <div key={index} className={styles.gridContainer4}>
                        <span className={styles.value}>1234</span>
                        <span
                          className={styles.value}
                          data-tooltip-id="inventory-tooltip"
                          data-tooltip-content={detail.supplier_name}>
                          {detail.supplier_name}
                        </span>
                        <span>{detail.supplier_cost}</span>
                        <span>{detail.supplier_unit_name}</span>
                        <span className={styles.flexContainer}>
                          {detail.conversion_factor}
                          <IconButton
                            icon={
                              <i
                                className="fa-solid fa-circle-info"
                                style={{ color: '#5e72e4' }}></i>
                            }
                            tooltipMsg={`from ${detail.supplier_unit_name} to ${editedValues.unit_name}`}
                            className={styles.forecastIiconBtn}
                          />
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        <Tooltip id="inventory-tooltip" />
      </SidePanel>
    </>
  );
};

export default IngredientFormPanel;
