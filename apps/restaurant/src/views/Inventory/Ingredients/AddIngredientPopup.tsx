import { Button, Checkbox, LabeledInput, Popup, Select } from 'shared-ui';
import styles from './AddIngredientPopup.module.scss';
import { useEffect, useState } from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';

import { FaPlus, FaTrash } from 'react-icons/fa';
import { useRestaurantStore } from '../../../store/useRestaurantStore';
import { useIngredients } from '../../../services/hooks';
import { inventoryService } from '../../../services';
import CreatableSelect from 'react-select/creatable';
import { tagService } from '../../../services/tag.service';
import supplierService from '../../../services/supplier.service';

const AddIngredientSchema = z.object({
  name: z.string().min(1, { message: 'Recipe name is required' }),
  actualStock: z.string().min(1, { message: 'Actual Stock name is required' }),
  parLevel: z.string().min(1, { message: 'Par Level is required' }),
  tag_details: z
    .array(
      z.object({
        uuid: z.string().optional(), // Allow uuid to be optional if creating a new tag
        name: z.string().min(1, { message: 'Tag name is required' }),
      })
    )
    .min(1, { message: 'At least one tag is required' }),

  // supplier_details as an array of objects
  supplier_details: z
    .array(
      z.object({
        supplier_name: z
          .string()
          .min(1, { message: 'Supplier Name is required' }),
        supplier_id: z
          .string()
          .min(1, { message: 'Supplier uuid is required' }), // If new, uuid might be blank
        supplier_cost: z
          .string()
          .min(1, { message: 'Supplier Cost is required' }),
        conversion_factor: z
          .string()
          .min(1, { message: 'conversion Factor is required' }),
        supplier_unit_uuid: z.string().optional(), // Allow uuid to be optional for new suppliers
        supplier_unit_name: z
          .string()
          .min(1, { message: 'Supplier Unit name is required' }), // Unit name is required
      })
    )
    .min(1, { message: 'At least one supplier is required' }),

  unit_name: z.string().min(1, { message: 'Unit name is required' }),
  unit_uuid: z.string().optional(), // Optional if unit is created new
});

type PreparationForm = z.infer<typeof AddIngredientSchema>;

type Props = {
  isVisible: boolean;
  onRequestClose: () => void;
  reloadInventoryData: any;
};

const AddIngredientPopup = (props: Props) => {
  const { t } = useTranslation(['common', 'ingredient']);
  const restaurantUUID = useRestaurantStore(
    (state) => state.selectedRestaurantUUID
  );
  const [unitname, setUnitName] = useState([]);
  const [tagList, setTagList] = useState([]);
  const [suppliers, setSuppliers] = useState<DropdownOptionsDefinitionType[]>(
    []
  );
  console.log('suppliers', suppliers);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting },
    reset,
    watch,
  } = useForm<PreparationForm>({
    resolver: zodResolver(AddIngredientSchema),
    defaultValues: {
      name: '',
      tags: [],
      supplier_details: [
        {
          supplier_name: '',
          supplier_cost: '',
          conversion_factor: '',
          supplier_unit_uuid: '',
          supplier_unit_name: '',
        },
      ],
    },
  });

  const {
    fields: supplierFields,
    append: addSupplier,
    remove: removeSupplier,
  } = useFieldArray({
    control,
    name: 'supplier_details', // Field array name for supplier details
  });

  const handleAddNewSupplier = () => {
    addSupplier({
      supplier_name: '',
      supplier_cost: '',
      conversion_factor: '',
      supplier_unit_uuid: '',
      supplier_unit_name: '',
    });
  };

  // Fetch and reload the tag list
  function reloadTagList() {
    if (!restaurantUUID) return;
    tagService.getAll(restaurantUUID).then((tags) => {
      setTagList(tags || []); // Ensure tags is always an array
    });
  }

  function reloadUnits() {
    if (!restaurantUUID) return;

    inventoryService
      .getUnits(restaurantUUID)
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

  // Create a new tag and add it to the tagList
  const handleCreateTag = (inputValue) => {
    const newTag = { uuid: '', name: inputValue };
    setTagList((prev) => [...prev, newTag]); // Add the new tag to the tagList
    setValue('tag_details', [...(watch('tag_details') || []), newTag]); // Add new tag to form state
  };

  // Handle tag selection changes
  const handleSelectChange = (selectedOptions) => {
    const tag_details = selectedOptions.map((option) => ({
      uuid: option.value,
      name: option.label,
    }));
    setValue('tag_details', tag_details); // Update the form state with selected tags
  };

  const reloadRestaurantSuppliers = async () => {
    if (!restaurantUUID) return;

    supplierService.getRestaurantSuppliers(restaurantUUID).then((res) => {
      const suppliersList = res.map((supplier) => ({
        label: supplier.name,
        value: supplier.supplier_uuid,
        supplier_uuid: supplier.supplier_uuid,
      }));
      setSuppliers(suppliersList); // Set the supplier list to the state
    });
  };

  useEffect(() => {
    reloadUnits();
    reloadTagList();
    reloadRestaurantSuppliers();
  }, [restaurantUUID]);

  const {} = useFieldArray({
    control,
    name: 'ingredients',
  });

  const handleSubmitForm = handleSubmit(async (data) => {
    const formattedData = {
      ...data,
      tag_details: data.tag_details.map((tag) => ({
        uuid: tag.uuid || '', // For new tags without uuid
        name: tag.name,
      })),
      supplier_details: data.supplier_details.map((supplier) => ({
        supplier_id: supplier.supplier_id || '', // Changed from supplier_uuid to supplier_id
        supplier_name: supplier.supplier_name, // Required supplier name
        supplier_cost: supplier.supplier_cost,
        conversion_factor: supplier.conversion_factor,
        supplier_unit_uuid: supplier.supplier_unit_uuid || '',
        supplier_unit_name: supplier.supplier_unit_name,
      })),
    };

    inventoryService
      .addIngredient(restaurantUUID, formattedData)
      .catch((err) => {
        console.log('err', err);
      })
      .then((res) => {
        console.log('res', res);
        props.onRequestClose();
        props.reloadInventoryData();
        reset();
      });
  });

  return (
    <Popup
      isVisible={props.isVisible}
      onRequestClose={props.onRequestClose}
      maxWidth={'70%'}
      title={t('recipes.addIngredient.title')}>
      <form onSubmit={handleSubmitForm}>
        <div className={styles.formContainer}>
          {/* Ingredient Section */}
          <h3>Ingredient</h3>

          <div className={styles.ingredientSection}>
            <LabeledInput
              label={t('ingredientName')}
              placeholder={t('ingredientName')}
              type="text"
              lighter
              error={errors.name?.message}
              {...register('name')}
              minWidth="200px"
            />
            <LabeledInput
              label={t('ingredient:actualStock')}
              placeholder={t('ingredient:actualStock')}
              type="number"
              lighter
              error={errors.actualStock?.message}
              {...register('actualStock')}
              minWidth="100px"
            />
            <LabeledInput
              label={t('ingredient:parLvel')}
              placeholder={t('ingredient:parLvel')}
              type="number"
              error={errors.parLevel?.message}
              lighter
              minWidth="100px"
              {...register('parLevel')}
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

            <CreatableSelect
              placeholder="Select a unit"
              options={unitname.map((unit) => ({
                label: unit.unit_name,
                value: unit.unit_uuid,
              }))}
              className={styles.unitInput}
              isCreatable
              styles={{
                menu: (provided) => ({
                  ...provided,
                  overflowY: 'auto',
                }),
                control: (provided, state) => ({
                  ...provided,
                  minWidth: '200px',
                  boxShadow: state.isFocused ? 'none' : provided.boxShadow,
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
                  color: state.isSelected ? '#FFFFFF' : provided.color,
                }),
              }}
              value={
                watch('unit_name') // Use the unit_name for the select value
                  ? {
                      label: watch('unit_name') || 'Select a unit',
                      value: watch('unit_uuid') || null,
                    }
                  : null
              }
              onChange={(selectedOption, actionMeta) => {
                if (actionMeta.action === 'create-option') {
                  // When a new unit is created, leave unit_uuid blank and only pass unit_name
                  setValue('unit_name', selectedOption.label); // Set unit_name
                  setValue('unit_uuid', ''); // Set unit_uuid as blank for new unit
                } else {
                  // When an existing unit is selected, pass both unit_uuid and unit_name
                  setValue('unit_name', selectedOption?.label || ''); // Set unit_name
                  setValue('unit_uuid', selectedOption?.value || ''); // Set unit_uuid
                }
              }}
              isClearable
            />

            <CreatableSelect
              placeholder="Select..."
              options={tagList.map((tag) => ({
                label: tag.name || 'Unnamed Tag', // Fallback for missing tag_name
                value: tag.uuid || 'no-uuid', // Fallback for missing tag_uuid
              }))}
              isMulti
              onCreateOption={handleCreateTag} // Handle new tag creation
              onChange={handleSelectChange} // Handle tag selection
              className={styles.unitInput}
              value={
                watch('tag_details')?.map((tag) => ({
                  label: tag.name,
                  value: tag.uuid,
                })) || []
              } // Safely map over tags and default to an empty array
              styles={{
                menu: (provided) => ({
                  ...provided,
                  overflowY: 'auto',
                }),
                control: (provided, state) => ({
                  ...provided,
                  minWidth: '200px',
                  boxShadow: state.isFocused ? 'none' : provided.boxShadow,
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
                  color: state.isSelected ? '#FFFFFF' : provided.color,
                }),
              }}
              isClearable
            />
          </div>

          {/* Supplier Details Section */}
          <h3>Supplier Details</h3>

          {supplierFields.map((field, index) => (
            <div key={field.id} className={styles.SupplierSection}>
              <Select
                size="large"
                isSearchable={true}
                placeholder={t('ingredient:supplier')}
                options={suppliers.map((supplier) => ({
                  label: supplier.label, // supplier name
                  value: supplier.value, // supplier UUID
                }))}
                value={
                  suppliers.find(
                    (supplier) =>
                      supplier.value ===
                      watch(`supplier_details.${index}.supplier_id`)
                  ) || null
                }
                onChange={(selectedOption) => {
                  // Update both supplier_id and supplier_name when a supplier is selected
                  setValue(
                    `supplier_details.${index}.supplier_id`,
                    selectedOption?.value || ''
                  );
                  setValue(
                    `supplier_details.${index}.supplier_name`,
                    selectedOption?.label || ''
                  );
                }}
                isClearable
              />

              <LabeledInput
                label={t('ingredient:supplierCost')}
                placeholder={t('ingredient:supplierCost')}
                type="number"
                minWidth="100px"
                error={
                  errors?.supplier_details?.[index]?.supplier_cost?.message
                }
                lighter
                {...register(`supplier_details.${index}.supplier_cost`)}
              />
              <CreatableSelect
                placeholder="Select a unit"
                options={unitname.map((unit) => ({
                  label: unit.unit_name,
                  value: unit.unit_uuid,
                }))}
                isCreatable
                styles={{
                  menu: (provided) => ({
                    ...provided,
                    overflowY: 'auto',
                  }),
                  control: (provided, state) => ({
                    ...provided,
                    minWidth: '200px',
                    boxShadow: state.isFocused ? 'none' : provided.boxShadow,
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
                    color: state.isSelected ? '#FFFFFF' : provided.color,
                  }),
                }}
                value={
                  watch(`supplier_details.${index}.supplier_unit_name`) ||
                  watch(`supplier_details.${index}.supplier_unit_uuid`)
                    ? {
                        label:
                          watch(
                            `supplier_details.${index}.supplier_unit_name`
                          ) || 'Select a supplier unit',
                        value: watch(
                          `supplier_details.${index}.supplier_unit_uuid`
                        ),
                      }
                    : null
                }
                onChange={(selectedOption, actionMeta) => {
                  if (actionMeta.action === 'create-option') {
                    // When creating a new unit, set supplier_unit_uuid as blank and set supplier_unit_name
                    setValue(
                      `supplier_details.${index}.supplier_unit_uuid`,
                      '',
                      { shouldValidate: true }
                    );
                    setValue(
                      `supplier_details.${index}.supplier_unit_name`,
                      selectedOption.label,
                      { shouldValidate: true }
                    );
                  } else {
                    setValue(
                      `supplier_details.${index}.supplier_unit_uuid`,
                      selectedOption?.value || '',
                      { shouldValidate: true }
                    );
                    setValue(
                      `supplier_details.${index}.supplier_unit_name`,
                      selectedOption?.label || '',
                      { shouldValidate: true }
                    );
                  }
                }}
                isClearable
              />

              <div className={styles.flexContainer}>
                <LabeledInput
                  label={t('ingredient:conversion_factor')}
                  placeholder={t('ingredient:conversion_factor')}
                  type="text"
                  minWidth="100px"
                  error={
                    errors?.supplier_details?.[index]?.conversion_factor
                      ?.message
                  }
                  lighter
                  {...register(`supplier_details.${index}.conversion_factor`)}
                />

                {/* Add remove functionality */}
                <span className={styles.deleteButton}>
                  <FaTrash
                    className={styles.deleteButton}
                    onClick={() => removeSupplier(index)}
                  />
                </span>
              </div>
            </div>
          ))}
        </div>

        <div
          className={styles.addIngredientButton}
          onClick={handleAddNewSupplier}>
          <FaPlus />
          <p>add Supplier</p>
        </div>
        <div className={styles.buttonsContainer}>
          <Button
            type="secondary"
            value={t('cancel')}
            onClick={props.onRequestClose}
          />
          <Button
            type="primary"
            value={t('confirm')}
            actionType="submit"
            loading={isSubmitting}
          />
        </div>
      </form>
    </Popup>
  );
};

export default AddIngredientPopup;