import React, { useCallback, useEffect, useState } from 'react';
import { ActionMeta, MultiValue } from 'react-select';
import { useTranslation } from 'react-i18next';
import { Button, IconButton, LabeledInput, Select, SidePanel } from 'shared-ui';
import CreatableSelect from 'react-select/creatable';
import {
  IngredientTMP,
  TagsTMP,
  inventoryServiceV2,
  unitServiceV2,
} from '../../services';
import { tagService } from '../../services/tag.service';
import { useRestaurantStore } from '../../store/useRestaurantStore';
import styles from './IngredientFormPanel.module.scss';
import { Tooltip } from 'react-tooltip';
import { Unit, TagOption, TagDetails } from '../../services/types';

type Props = {
  isOpen: boolean;
  onRequestClose: () => void;
  onSubmitted: () => void;
  ingredient?: IngredientTMP | null;
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
  const [tagList, setTagList] = useState<TagsTMP[]>();
  const [unitError, setUnitError] = useState(false);
  const [inputValue, setInputValue] = useState<any>('');

  const selectedRestaurantUUID = useRestaurantStore(
    (state) => state.selectedRestaurantUUID
  );

  const reloadReferenceUnits = useCallback(async () => {
    unitServiceV2.getReferenceUnits().then((res) => {
      setReferenceUnitName(res);
    });
  }, []);

  const reloadUnits = useCallback(() => {
    if (!selectedRestaurantUUID) return;
    unitServiceV2
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

      if (ingredient) {
        const isReferenceUnit = reference_units.some(
          (unit) => unit.unit_uuid === ingredient.base_unit?.unit_uuid
        );
        setIsVolumeVisible(!isReferenceUnit);
      }
    }
  }, [isOpen, ingredient, reloadReferenceUnits, reloadUnits, reloadTagList]);

  const handleSave = async () => {
    setIsLoading(true);
    if (!editedValues?.base_unit?.unit_uuid) {
      setUnitError(true);
      setIsLoading(false);
      return;
    }

    setUnitError(false);

    try {
      if (action === 'create') {
        await inventoryServiceV2.createIngredient(
          selectedRestaurantUUID,
          editedValues
        );
      } else {
        await inventoryServiceV2.updateIngredient(
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
      console.log('Button pressed', prevValues);
      if (!prevValues) return prevValues;
      const newDetails = prevValues.suppliers ? [...prevValues.suppliers] : [];
      newDetails.push({
        supplier_uuid: '',
        supplier_name: '',
        unit: {
          unit_uuid: '',
          unit_name: '',
        },
        product_code: '',
        conversion_factor: 1,
      });
      return { ...prevValues, suppliers: newDetails };
    });
  };

  const handleRemoveSupplierDetail = (index: number) => {
    setEditedValues((prevValues) => {
      if (!prevValues || !prevValues.suppliers) return prevValues;
      const updatedSupplierDetails = prevValues.suppliers.filter(
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
      setEditedValues(ingredient);
      const isReferenceUnit = reference_units.some(
        (unit) => unit.unit_uuid === ingredient?.base_unit?.unit_uuid
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
                tooltipMsg={t('save')}
                onClick={handleSave}
                className="iconButton"
                disabled={isLoading}
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
                      value={editedValues?.ingredient_name}
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
                        {editedValues?.ingredient_name}
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
                        value={editedValues?.quantity || ''}
                        onChange={(event) => {
                          if (!editedValues) return;

                          setEditedValues((prevValues) => ({
                            ...prevValues,
                            quantity: Number(event.target.value),
                          }));
                        }}
                      />
                    ) : (
                      <span className={styles.value}>
                        {editedValues?.quantity}
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
                        type="number"
                        lighter
                        value={editedValues?.par_level || ''}
                        onChange={(event) =>
                          setEditedValues((prev) => {
                            if (!prev) return prev;
                            return {
                              ...prev,
                              par_level: Number(event.target.value),
                            };
                          })
                        }
                      />
                    ) : (
                      <span className={styles.value}>
                        {editedValues?.par_level}
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
                            editedValues?.base_unit?.unit_uuid
                              ? t('unit')
                              : t('ingredient:unit')
                          }
                          options={unitname.map((unit) => ({
                            label: unit.unit_name,
                            value: unit.unit_uuid,
                          }))}
                          value={
                            editedValues?.base_unit?.unit_name
                              ? {
                                  label: editedValues.base_unit.unit_name,
                                  value: editedValues.base_unit.unit_uuid,
                                }
                              : null
                          }
                          onChange={(selectedOption: any) => {
                            if (selectedOption) {
                              if (!editedValues) return;

                              const updatedValues = {
                                ...editedValues,
                                base_unit: {
                                  unit_uuid: selectedOption.__isNew__
                                    ? undefined
                                    : selectedOption.value,
                                  unit_name: selectedOption.label,
                                },
                              };
                              setEditedValues(updatedValues as IngredientTMP);

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
                        {editedValues?.base_unit?.unit_name}
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
                        {editedValues?.volume_unit?.unit_name}
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
                            editedValues?.volume_unit?.unit_uuid
                              ? t('unit')
                              : t('selectUnit')
                          }
                          options={reference_units.map((unit) => ({
                            label: unit.unit_name,
                            value: unit.unit_uuid,
                          }))}
                          value={
                            editedValues?.volume_unit?.unit_name
                              ? {
                                  label: editedValues.volume_unit.unit_name,
                                  value: editedValues.volume_unit.unit_uuid,
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
                          {editedValues?.volume_unit?.unit_name}
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
                    options={
                      tagList?.map((tag) => ({
                        label: tag.tag_name || '--',
                        value: tag.tag_uuid || '', // S'assurer qu'une chaîne vide est utilisée si undefined
                      })) || []
                    }
                    value={editedValues?.tags?.map((tag) => ({
                      label: tag.tag_name || 'New Tag',
                      value: tag.tag_uuid || '',
                    }))}
                    onChange={async (
                      newValue: MultiValue<TagOption>,
                      actionMeta: ActionMeta<TagOption>
                    ) => {
                      const updatedTagDetails: TagsTMP[] = [];

                      for (const option of [...newValue]) {
                        if (option.__isNew__) {
                          try {
                            if (selectedRestaurantUUID) {
                              const newTag = await tagService.createTag(
                                option.label,
                                selectedRestaurantUUID
                              );
                              updatedTagDetails.push({
                                tag_name: newTag.tag_name,
                                tag_uuid: newTag.tag_uuid,
                              });
                              setTagList((prevTags) =>
                                prevTags ? [...prevTags, newTag] : [newTag]
                              );
                            }
                          } catch (error) {
                            console.error('Error creating tag:', error);
                            updatedTagDetails.push({
                              tag_name: option.label || 'Unknown',
                              tag_uuid: '',
                            });
                          }
                        } else {
                          const existingTag = tagList?.find(
                            (tag) => tag.tag_uuid === option.value
                          );
                          updatedTagDetails.push({
                            tag_name: existingTag
                              ? existingTag.tag_name
                              : option.label,
                            tag_uuid: existingTag ? option.value : '',
                          });
                        }
                      }

                      setEditedValues((prevValues) => {
                        if (!prevValues) return prevValues;
                        return {
                          ...prevValues,
                          tags: updatedTagDetails,
                        };
                      });
                    }}
                  />
                ) : (
                  <div className={styles.tagList}>
                    {(editedValues?.tags?.length ?? 0) > 0 ? (
                      <div className={styles.tagContainer}>
                        {editedValues?.tags?.map((el) => {
                          const tag = tagList?.find(
                            (tag) => tag.tag_uuid === el.tag_uuid
                          );
                          if (tag) {
                            console.log('Tag', tag);
                            return (
                              <span
                                key={tag.tag_uuid}
                                className={styles.tagItem}>
                                {tag.tag_name}
                              </span>
                            );
                          }
                        })}
                      </div>
                    ) : (
                      ''
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
                    {editedValues?.suppliers?.map((detail, index) => (
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
                              ...(editedValues?.suppliers || []),
                            ];
                            updatedDetails[index] = {
                              ...updatedDetails[index],
                              product_code: event.target.value,
                            };

                            setEditedValues({
                              ...editedValues,
                              suppliers: updatedDetails,
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
                                ...(editedValues?.suppliers || []),
                              ];

                              updatedDetails[index] = {
                                ...updatedDetails[index],
                                supplier_uuid: selectedOption?.value || '',
                                supplier_name: selectedOption?.label || '',
                              };

                              setEditedValues({
                                ...editedValues,
                                suppliers: updatedDetails,
                              });
                            }}
                          />
                        </div>
                        <LabeledInput
                          placeholder={t('ingredient:supplierCost')}
                          type="number"
                          lighter
                          value={detail.unit_cost}
                          onChange={(event) => {
                            const updatedDetails = [
                              ...(editedValues?.suppliers || []),
                            ];
                            updatedDetails[index].unit_cost = Number(
                              event.target.value
                            );

                            setEditedValues({
                              ...editedValues,
                              suppliers: updatedDetails,
                            });
                          }}
                        />
                        <CreatableSelect
                          placeholder={
                            detail.unit?.unit_uuid ? t('unit') : t('selectUnit')
                          }
                          options={unitname.map((unit) => ({
                            label: unit.unit_name,
                            value: unit.unit_uuid,
                          }))}
                          value={
                            detail.unit?.unit_uuid
                              ? {
                                  label: detail.unit?.unit_name,
                                  value: detail.unit?.unit_uuid,
                                }
                              : null
                          }
                          onChange={(selectedOption: any) => {
                            const updatedDetails = [
                              ...(editedValues?.suppliers || []),
                            ];

                            if (selectedOption?.__isNew__) {
                              unitServiceV2
                                .createUnit(
                                  selectedRestaurantUUID,
                                  selectedOption.label
                                )
                                .then((newUnit) => {
                                  updatedDetails[index] = {
                                    ...updatedDetails[index],
                                    unit: {
                                      unit_uuid: newUnit.unit_uuid,
                                      unit_name: selectedOption.label,
                                    },
                                  };

                                  setEditedValues({
                                    ...editedValues,
                                    suppliers: updatedDetails,
                                  });

                                  reloadUnits();
                                })
                                .catch(console.error);
                            } else {
                              updatedDetails[index] = {
                                ...updatedDetails[index],
                                unit: {
                                  unit_uuid: selectedOption?.value,
                                  unit_name: selectedOption.label,
                                },
                              };

                              setEditedValues({
                                ...editedValues,
                                suppliers: updatedDetails,
                              });
                            }
                          }}
                          isClearable
                        />
                        <div className={styles.IconContainer}>
                          <LabeledInput
                            placeholder={`${t('ingredient:size')} (1 ${
                              editedValues?.suppliers?.[index]?.unit
                                ?.unit_name || '_'
                            } → ${
                              editedValues?.suppliers?.[index]
                                ?.conversion_factor || 'x'
                            } ${editedValues?.base_unit?.unit_name || '_'})`}
                            type="number"
                            lighter
                            value={detail.conversion_factor}
                            onChange={(event) => {
                              const updatedConversionFactor =
                                event.target.value;

                              const updatedDetails =
                                editedValues.suppliers?.map(
                                  (supplierDetail) => {
                                    if (
                                      supplierDetail.unit?.unit_uuid ===
                                      detail.unit?.unit_uuid
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
                                suppliers: updatedDetails,
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
                    {editedValues?.suppliers?.map((detail, index) => (
                      <div key={index} className={styles.gridContainer4}>
                        <span className={styles.value}>1234</span>
                        <span
                          className={styles.value}
                          data-tooltip-id="inventory-tooltip"
                          data-tooltip-content={detail.supplier_name}>
                          {detail.supplier_name}
                        </span>
                        <span>{detail.unit_cost}</span>
                        <span>{detail.unit?.unit_name}</span>
                        <span className={styles.flexContainer}>
                          {detail.conversion_factor}
                          <IconButton
                            icon={
                              <i
                                className="fa-solid fa-circle-info"
                                style={{ color: '#5e72e4' }}></i>
                            }
                            tooltipMsg={`from ${detail.unit?.unit_name} to ${editedValues.base_unit?.unit_name}`}
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
