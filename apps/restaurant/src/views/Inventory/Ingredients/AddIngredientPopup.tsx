import { Button, IconButton, LabeledInput, Popup, Select } from 'shared-ui';
import styles from './AddIngredientPopup.module.scss';
import { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { FaPlus, FaTrash } from 'react-icons/fa';
import { useRestaurantStore } from '../../../store/useRestaurantStore';
import { inventoryService, Tag, Unit, Supplier } from '../../../services';
import CreatableSelect from 'react-select/creatable';
import { tagService } from '../../../services/tag.service';
import supplierService from '../../../services/supplier.service';
import toast from 'react-hot-toast';

const AddIngredientSchema = z.object({
  name: z.string().min(1, { message: 'Recipe name is required' }),
  actualStock: z.string().optional(), // Will be converted to Stock type when sending to API
  parLevel: z.string().optional(), // Will be converted to number when sending to API
  tag_details: z
    .array(
      z.object({
        uuid: z.string().optional(),
        name: z.string().min(1, { message: 'Tag name is required' }),
      })
    )
    .optional(),
  supplier_details: z
    .array(
      z.object({
        supplier_name: z
          .string()
          .min(1, { message: 'Supplier Name is required' }),
        supplier_id: z
          .string()
          .min(1, { message: 'Supplier uuid is required' }),
        supplier_cost: z
          .string()
          .min(1, { message: 'Supplier Cost is required' }),
        conversion_factor: z
          .string()
          .min(1, { message: 'Conversion Factor is required' }),
        supplier_unit_uuid: z.string().optional(),
        supplier_unit_name: z
          .string()
          .min(1, { message: 'Supplier Unit name is required' }),
        product_code: z.string().optional(),
      })
    )
    .optional(),
  unit_name: z.string().min(1, { message: 'Unit name is required' }),
  unit_uuid: z.string().optional(),
});

type PreparationForm = z.infer<typeof AddIngredientSchema>;

type Props = {
  isVisible: boolean;
  onRequestClose: () => void;
  reloadInventoryData: () => void;
};

const AddIngredientPopup = ({
  isVisible,
  onRequestClose,
  reloadInventoryData,
}: Props) => {
  const { t } = useTranslation(['common', 'ingredient']);
  const restaurantUUID = useRestaurantStore(
    (state) => state.selectedRestaurantUUID
  );
  const [unitOptions, setUnitOptions] = useState<Unit[]>([]);
  const [tagList, setTagList] = useState<Tag[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);

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
      tag_details: [],
      supplier_details: [], // Empty array by default
    },
  });

  const {
    fields: supplierFields,
    append: addSupplier,
    remove: removeSupplier,
  } = useFieldArray({
    control,
    name: 'supplier_details',
  });

  useEffect(() => {
    if (restaurantUUID) {
      tagService
        .getAll(restaurantUUID)
        .then((tags: Tag[]) => setTagList(tags || []));

      inventoryService
        .getUnits(restaurantUUID)
        .then(setUnitOptions)
        .catch(console.error);

      supplierService.getRestaurantSuppliers(restaurantUUID).then((res) => {
        setSuppliers(
          res.map(({ name, uuid }) => ({
            name: name,
            uuid: uuid,
          }))
        );
      });
    }
  }, [restaurantUUID]);

  const mapSuppliersToOptions = (suppliers: Supplier[]) =>
    suppliers.map((supplier) => ({
      ...supplier,
      label: supplier.name,
      value: supplier.uuid,
    }));

  const handleCreateTag = (inputValue: string) => {
    const newTag = { uuid: '', name: inputValue };
    setTagList((prev) => [...prev, newTag]);
    setValue('tag_details', [...(watch('tag_details') || []), newTag]);
  };

  const handleCreateUnit = async (inputValue: string) => {
    try {
      const newUnit = await inventoryService.createUnit(
        restaurantUUID,
        inputValue
      );
      const newUnitOption: Unit = {
        unit_name: newUnit.unit_name,
        unit_uuid: newUnit.unit_uuid,
      };
      setUnitOptions((prev) => [...prev, newUnitOption]);
      setValue('unit_name', newUnit.unit_name);
      setValue('unit_uuid', newUnit.unit_uuid);

      inventoryService
        .getUnits(restaurantUUID)
        .then(setUnitOptions)
        .catch(console.error);
    } catch (error) {
      console.error('Error creating unit:', error);
      toast.error('Failed to create unit');
    }
  };

  const handleSelectChange = (selectedOptions: any) => {
    setValue(
      'tag_details',
      selectedOptions.map((option: any) => ({
        uuid: option.value,
        name: option.label,
      }))
    );
  };

  const handleSubmitForm = handleSubmit(async (data) => {
    try {
      await inventoryService.addIngredient(restaurantUUID, {
        ...data,
        tag_details: (data.tag_details || []).map((tag) => ({
          tag_uuid: tag?.uuid || '',
          tag_name: tag?.name || '',
        })),
        supplier_details: (data.supplier_details || []).map((supplier) => ({
          supplier_uuid: supplier?.supplier_id || '',
          supplier_cost: Number(supplier?.supplier_cost) || 0, // Convert to number
          conversion_factor: Number(supplier?.conversion_factor) || 0, // Convert to number if needed
          supplier_unit_uuid: supplier?.supplier_unit_uuid || '',
          supplier_name: supplier?.supplier_name || '',
          supplier_unit: supplier?.supplier_unit_uuid || '',
          supplier_unit_name: supplier?.supplier_unit_name || '',
        })),
      });
      onRequestClose();
      reloadInventoryData();
      reset();
      toast.success('Ingredient Created Successfully');
    } catch (error) {
      console.error('Error adding ingredient:', error);
      toast.error('Failed to create ingredient');
    }
  });

  return (
    <Popup
      isVisible={isVisible}
      onRequestClose={onRequestClose}
      title={t('recipes.addIngredient.title')}>
      <form onSubmit={handleSubmitForm}>
        <div className={styles.formContainer}>
          <h3>Ingredient</h3>
          <div className={styles.ingredientSection}>
            <LabeledInput
              placeholder={t('ingredientName')}
              type="text"
              lighter
              error={errors.name?.message}
              {...register('name')}
            />
            <LabeledInput
              placeholder={t('ingredient:actualStock')}
              type="number"
              lighter
              {...register('actualStock')}
            />
            <LabeledInput
              placeholder={t('ingredient:parLevel')}
              type="number"
              lighter
              {...register('parLevel')}
            />
            <CreatableSelect
              placeholder="Select a unit"
              options={unitOptions.map(({ unit_name, unit_uuid }) => ({
                label: unit_name,
                value: unit_uuid,
              }))}
              className={styles.unitInput}
              isClearable
              value={
                watch('unit_name')
                  ? { label: watch('unit_name'), value: watch('unit_uuid') }
                  : null
              }
              onChange={(selectedOption, actionMeta) => {
                if (!selectedOption) {
                  // Handle null case by clearing the values
                  setValue('unit_name', '');
                  setValue('unit_uuid', '');
                  return;
                }

                if (actionMeta.action === 'create-option') {
                  handleCreateUnit(selectedOption.label);
                } else {
                  setValue('unit_name', selectedOption.label || '');
                  setValue('unit_uuid', selectedOption.value || '');
                }
              }}
            />
          </div>

          <h3>Tag Details</h3>
          <CreatableSelect
            placeholder="Select Tags"
            options={tagList.map(({ name, uuid }) => ({
              label: name,
              value: uuid,
            }))}
            isMulti
            onCreateOption={handleCreateTag}
            onChange={handleSelectChange}
            className={styles.unitInput}
            value={
              watch('tag_details')?.map(({ name, uuid }) => ({
                label: name,
                value: uuid,
              })) || []
            }
            isClearable
          />

          <h3>Supplier Details</h3>
          {supplierFields.map((field, index) => (
            <div key={field.id} className={styles.SupplierSection}>
              <LabeledInput
                placeholder={t('ingredient:productCode')}
                type="string"
                lighter
                {...register(`supplier_details.${index}.product_code`)}
              />
              <Select
                size="large"
                isSearchable
                placeholder={t('ingredient:supplier')}
                options={suppliers}
                getOptionLabel={(supplier) => supplier.name || ''}
                value={
                  suppliers.find(
                    (supplier) =>
                      supplier.uuid ===
                      watch(`supplier_details.${index}.supplier_id`)
                  ) || null
                }
                onChange={(selectedOption) => {
                  setValue(
                    `supplier_details.${index}.supplier_id`,
                    selectedOption?.uuid || ''
                  );
                  setValue(
                    `supplier_details.${index}.supplier_name`,
                    selectedOption?.name || ''
                  );
                }}
                menuPosition="fixed"
                styles={{
                  menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                }}
                isClearable
              />
              <LabeledInput
                placeholder={t('ingredient:supplierCost')}
                type="number"
                step="any"
                error={
                  errors?.supplier_details?.[index]?.supplier_cost?.message
                }
                lighter
                {...register(`supplier_details.${index}.supplier_cost`)}
              />
              <CreatableSelect
                placeholder="Pack"
                options={unitOptions.map(({ unit_name, unit_uuid }) => ({
                  label: unit_name,
                  value: unit_uuid,
                }))}
                className={styles.unitInput}
                isClearable
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
                  if (!selectedOption) {
                    // Handle null case by clearing the values
                    setValue(
                      `supplier_details.${index}.supplier_unit_uuid`,
                      ''
                    );
                    setValue(
                      `supplier_details.${index}.supplier_unit_name`,
                      ''
                    );
                    return;
                  }

                  if (actionMeta.action === 'create-option') {
                    handleCreateUnit(selectedOption.label);
                    setValue(
                      `supplier_details.${index}.supplier_unit_uuid`,
                      ''
                    );
                    setValue(
                      `supplier_details.${index}.supplier_unit_name`,
                      selectedOption.label
                    );
                  } else {
                    setValue(
                      `supplier_details.${index}.supplier_unit_uuid`,
                      selectedOption.value || ''
                    );
                    setValue(
                      `supplier_details.${index}.supplier_unit_name`,
                      selectedOption.label || ''
                    );
                  }
                }}
                menuPosition="fixed" // Use fixed positioning for dropdown
                styles={{
                  menuPortal: (base) => ({ ...base, zIndex: 9999 }), // Ensure it's above other elements
                }}
              />
              <div className={styles.flexContainer}>
                <div className={styles.IconContainer}>
                  <LabeledInput
                    placeholder={t('ingredient:size')}
                    type="text"
                    error={
                      errors?.supplier_details?.[index]?.conversion_factor
                        ?.message
                    }
                    lighter
                    {...register(`supplier_details.${index}.conversion_factor`)}
                  />
                </div>
                <FaTrash
                  className={styles.deleteButton}
                  onClick={() => removeSupplier(index)}
                />
              </div>
            </div>
          ))}
          <Button
            type="primary"
            value={t('ingredient:addSupplier')}
            onClick={() =>
              addSupplier({
                supplier_name: '',
                supplier_id: '',
                supplier_cost: '',
                conversion_factor: '',
                supplier_unit_uuid: '',
                supplier_unit_name: '',
              })
            }
          />
        </div>
        <div className={styles.buttonsContainer}>
          <Button
            type="secondary"
            value={t('cancel')}
            onClick={onRequestClose}
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
