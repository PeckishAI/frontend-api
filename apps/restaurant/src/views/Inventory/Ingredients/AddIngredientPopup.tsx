import {
  Button,
  Checkbox,
  IconButton,
  LabeledInput,
  Popup,
  Select,
} from 'shared-ui';
import styles from './AddIngredientPopup.module.scss';
import { useEffect, useState } from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';

import { DropdownOptionsDefinitionType } from 'shared-ui/components/Dropdown/Dropdown';
import { FaPlus, FaTrash } from 'react-icons/fa';
import { useRestaurantStore } from '../../../store/useRestaurantStore';
import { useIngredients } from '../../../services/hooks';
import { inventoryService } from '../../../services';
import CreatableSelect from 'react-select/creatable';
import { tagService } from '../../../services/tag.service';
import supplierService from '../../../services/supplier.service';
import toast from 'react-hot-toast';

const AddIngredientSchema = z.object({
  name: z.string().min(1, { message: 'Recipe name is required' }),
  actualStock: z.string().optional(),
  parLevel: z.string().optional(),
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
  const [unitOptions, setUnitOptions] = useState([]);
  const [tagList, setTagList] = useState([]);
  const [suppliers, setSuppliers] = useState([]);

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
    name: 'supplier_details',
  });

  useEffect(() => {
    if (restaurantUUID) {
      tagService.getAll(restaurantUUID).then((tags) => setTagList(tags || []));
      inventoryService
        .getUnits(restaurantUUID)
        .then(setUnitOptions)
        .catch(console.error);
      supplierService.getRestaurantSuppliers(restaurantUUID).then((res) => {
        setSuppliers(
          res.map(({ name, supplier_uuid }) => ({
            label: name,
            value: supplier_uuid,
          }))
        );
      });
    }
  }, [restaurantUUID]);

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
      const newUnitOption = {
        label: newUnit.unit_name,
        value: newUnit.unit_uuid,
      };
      setUnitOptions((prev) => [...prev, newUnitOption]);
      setValue('unit_name', newUnit.unit_name);
      setValue('unit_uuid', newUnit.unit_uuid);

      // Refetch units after successfully creating a new unit
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
        tag_names: (data.tag_details || []).map((tag) => ({
          tag_uuid: tag?.uuid || '',
          tag_name: tag?.name || '',
        })),
        supplier_details: (data.supplier_details || []).map((supplier) => ({
          supplier_uuid: supplier?.supplier_id || '',
          supplier_cost: supplier?.supplier_cost || '',
          conversion_factor: supplier?.conversion_factor || '',
          supplier_unit_uuid: supplier?.supplier_unit_uuid || '',
        })),
      });
      onRequestClose();
      reloadInventoryData();
      reset();
      toast.success('Ingredient Created Successfully');
    } catch (error) {
      console.error('Error adding ingredient:', error);
    }
  });

  return (
    <Popup
      isVisible={isVisible}
      onRequestClose={onRequestClose}
      maxWidth={'70%'}
      title={t('recipes.addIngredient.title')}>
      <form onSubmit={handleSubmitForm}>
        <div className={styles.formContainer}>
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
              {...register('actualStock')}
              minWidth="100px"
            />
            <LabeledInput
              label={t('ingredient:parLevel')}
              placeholder={t('ingredient:parLevel')}
              type="number"
              lighter
              minWidth="100px"
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
                if (actionMeta.action === 'create-option') {
                  handleCreateUnit(selectedOption.label);
                } else {
                  setValue('unit_name', selectedOption?.label || '');
                  setValue('unit_uuid', selectedOption?.value || '');
                }
              }}
            />
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
          </div>

          <h3>Supplier Details</h3>
          {supplierFields.map((field, index) => (
            <div key={field.id} className={styles.SupplierSection}>
              <Select
                size="large"
                isSearchable
                placeholder={t('ingredient:supplier')}
                options={suppliers}
                value={
                  suppliers.find(
                    ({ value }) =>
                      value === watch(`supplier_details.${index}.supplier_id`)
                  ) || null
                }
                onChange={(selectedOption) => {
                  setValue(
                    `supplier_details.${index}.supplier_id`,
                    selectedOption?.value || ''
                  );
                  setValue(
                    `supplier_details.${index}.supplier_name`,
                    selectedOption?.label || ''
                  );
                }}
                menuPosition="fixed" // Use fixed positioning for dropdown
                styles={{
                  menuPortal: (base) => ({ ...base, zIndex: 9999 }), // Ensure it's above other elements
                }}
                isClearable
              />
              <LabeledInput
                label={t('ingredient:supplierCost')}
                placeholder={t('ingredient:supplierCost')}
                type="number"
                minWidth="100px"
                step="any"
                error={
                  errors?.supplier_details?.[index]?.supplier_cost?.message
                }
                lighter
                {...register(`supplier_details.${index}.supplier_cost`)}
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
                      selectedOption?.value || ''
                    );
                    setValue(
                      `supplier_details.${index}.supplier_unit_name`,
                      selectedOption?.label || ''
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
                  <IconButton
                    icon={<i className="fa-solid fa-circle-info"></i>}
                    tooltipMsg={`1 ${watch(`supplier_details.${index}.supplier_unit_name`)} is ${watch(
                      `supplier_details.${index}.conversion_factor`
                    )} ${watch('unit_name')}`}
                    className={styles.info}
                  />
                </div>
                <FaTrash
                  className={styles.deleteButton}
                  onClick={() => removeSupplier(index)}
                />
              </div>
            </div>
          ))}
        </div>
        <div
          className={styles.addIngredientButton}
          onClick={() =>
            addSupplier({
              supplier_name: '',
              supplier_cost: '',
              conversion_factor: '',
              supplier_unit_uuid: '',
              supplier_unit_name: '',
            })
          }>
          <FaPlus />
          <p>Add Supplier</p>
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
