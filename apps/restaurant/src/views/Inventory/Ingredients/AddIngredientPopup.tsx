import { Button, IconButton, LabeledInput, Popup, Select } from 'shared-ui';
import styles from './AddIngredientPopup.module.scss';
import { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { FaPlus, FaTrash } from 'react-icons/fa';
import { useRestaurantStore } from '../../../store/useRestaurantStore';
import {
  inventoryServiceV2,
  unitServiceV2,
  TagsTMP,
  IngredientTMP,
  Unit,
  Supplier,
} from '../../../services';
import CreatableSelect from 'react-select/creatable';
import { tagService } from '../../../services/tag.service';
import supplierService from '../../../services/supplier.service';
import toast from 'react-hot-toast';

const AddIngredientSchema = z.object({
  ingredient_name: z
    .string()
    .min(1, { message: 'Ingredient name is required' }),
  quantity: z.string().optional(),
  par_level: z.string().optional(),
  tags: z
    .array(
      z.object({
        tag_uuid: z.string().optional(),
        tag_name: z.string().min(1, { message: 'Tag name is required' }),
      })
    )
    .optional(),
  suppliers: z
    .array(
      z.object({
        supplier_name: z
          .string()
          .min(1, { message: 'Supplier Name is required' }),
        supplier_uuid: z
          .string()
          .min(1, { message: 'Supplier uuid is required' }),
        unit_cost: z.string().min(1, { message: 'Supplier Cost is required' }),
        conversion_factor: z
          .string()
          .min(1, { message: 'Conversion Factor is required' }),
        unit: z.object({
          unit_uuid: z.string().optional(),
          unit_name: z.string().min(1, { message: 'Unit name is required' }),
        }),
        product_code: z.string().optional(),
      })
    )
    .optional(),
  base_unit: z.object({
    unit_uuid: z.string().optional(),
    unit_name: z.string().min(1, { message: 'Unit name is required' }),
  }),
  volume_unit: z
    .object({
      unit_uuid: z.string().optional(),
      unit_name: z.string().min(1, { message: 'Unit name is required' }),
    })
    .optional(),
  volume_quantity: z.string().optional(),
});

type IngredientForm = z.infer<typeof AddIngredientSchema>;

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
  const [tagList, setTagList] = useState<TagsTMP[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting },
    reset,
    watch,
  } = useForm<IngredientForm>({
    resolver: zodResolver(AddIngredientSchema),
    defaultValues: {
      ingredient_name: '',
      tags: [],
      suppliers: [],
    },
  });

  const {
    fields: supplierFields,
    append: addSupplier,
    remove: removeSupplier,
  } = useFieldArray({
    control,
    name: 'suppliers',
  });

  useEffect(() => {
    if (restaurantUUID) {
      tagService
        .getAll(restaurantUUID)
        .then((tags: TagsTMP[]) => setTagList(tags || []));

      unitServiceV2
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

  const handleCreateTag = (inputValue: string) => {
    const newTag = { tag_uuid: '', tag_name: inputValue };
    setTagList((prev) => [...prev, newTag]);
    setValue('tags', [...(watch('tags') || []), newTag]);
  };

  const handleCreateUnit = async (inputValue: string) => {
    try {
      const newUnit = await unitServiceV2.createUnit(
        restaurantUUID,
        inputValue
      );
      const newUnitOption: Unit = {
        unit_name: newUnit.unit_name,
        unit_uuid: newUnit.unit_uuid,
      };
      setUnitOptions((prev) => [...prev, newUnitOption]);
      setValue('base_unit', {
        unit_uuid: newUnit.unit_uuid,
        unit_name: newUnit.unit_name,
      });

      unitServiceV2
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
      'tags',
      selectedOptions.map((option: any) => ({
        tag_uuid: option.value,
        tag_name: option.label,
      }))
    );
  };

  const handleSubmitForm = handleSubmit(async (data) => {
    try {
      const formattedData: IngredientTMP = {
        ingredient_name: data.ingredient_name,
        base_unit: {
          unit_uuid: data.base_unit.unit_uuid || '',
          unit_name: data.base_unit.unit_name,
        },
        quantity: data.quantity ? Number(data.quantity) : undefined,
        par_level: data.par_level ? Number(data.par_level) : undefined,
        tags: data.tags?.map((tag) => ({
          tag_uuid: tag.tag_uuid || '',
          tag_name: tag.tag_name,
        })),
        suppliers: data.suppliers?.map((supplier) => ({
          supplier_uuid: supplier.supplier_uuid,
          supplier_name: supplier.supplier_name,
          unit_cost: Number(supplier.unit_cost),
          conversion_factor: Number(supplier.conversion_factor),
          unit: {
            unit_uuid: supplier.unit.unit_uuid || '',
            unit_name: supplier.unit.unit_name,
          },
          product_code: supplier.product_code,
        })),
        volume_unit: data.volume_unit
          ? {
              unit_uuid: data.volume_unit.unit_uuid || '',
              unit_name: data.volume_unit.unit_name,
            }
          : undefined,
        volume_quantity: data.volume_quantity
          ? Number(data.volume_quantity)
          : undefined,
      };

      await inventoryServiceV2.createIngredient(restaurantUUID, formattedData);
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
              error={errors.ingredient_name?.message}
              {...register('ingredient_name')}
            />
            <LabeledInput
              placeholder={t('ingredient:actualStock')}
              type="number"
              lighter
              {...register('quantity')}
            />
            <LabeledInput
              placeholder={t('ingredient:parLevel')}
              type="number"
              lighter
              {...register('par_level')}
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
                watch('base_unit.unit_name')
                  ? {
                      label: watch('base_unit.unit_name'),
                      value: watch('base_unit.unit_uuid'),
                    }
                  : null
              }
              onChange={(selectedOption, actionMeta) => {
                if (!selectedOption) {
                  setValue('base_unit.unit_name', '');
                  setValue('base_unit.unit_uuid', '');
                  return;
                }

                if (actionMeta.action === 'create-option') {
                  handleCreateUnit(selectedOption.label);
                } else {
                  setValue('base_unit.unit_name', selectedOption.label || '');
                  setValue('base_unit.unit_uuid', selectedOption.value || '');
                }
              }}
            />
          </div>

          <h3>Tag Details</h3>
          <CreatableSelect
            placeholder="Select Tags"
            options={
              tagList?.map(({ tag_name, tag_uuid }) => ({
                label: tag_name || '',
                value: tag_uuid || '',
              })) || []
            }
            isMulti
            onCreateOption={handleCreateTag}
            onChange={handleSelectChange}
            className={styles.unitInput}
            value={
              watch('tags')?.map(({ tag_name, tag_uuid }) => ({
                label: tag_name || '',
                value: tag_uuid || '',
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
                {...register(`suppliers.${index}.product_code`)}
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
                      watch(`suppliers.${index}.supplier_uuid`)
                  ) || null
                }
                onChange={(selectedOption) => {
                  setValue(
                    `suppliers.${index}.supplier_uuid`,
                    selectedOption?.uuid || ''
                  );
                  setValue(
                    `suppliers.${index}.supplier_name`,
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
                error={errors?.suppliers?.[index]?.unit_cost?.message}
                lighter
                {...register(`suppliers.${index}.unit_cost`)}
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
                  watch(`suppliers.${index}.unit.unit_name`) ||
                  watch(`suppliers.${index}.unit.unit_uuid`)
                    ? {
                        label:
                          watch(`suppliers.${index}.unit.unit_name`) ||
                          'Select a supplier unit',
                        value: watch(`suppliers.${index}.unit.unit_uuid`),
                      }
                    : null
                }
                onChange={(selectedOption, actionMeta) => {
                  if (!selectedOption) {
                    setValue(`suppliers.${index}.unit.unit_uuid`, '');
                    setValue(`suppliers.${index}.unit.unit_name`, '');
                    return;
                  }

                  if (actionMeta.action === 'create-option') {
                    handleCreateUnit(selectedOption.label);
                    setValue(`suppliers.${index}.unit.unit_uuid`, '');
                    setValue(
                      `suppliers.${index}.unit.unit_name`,
                      selectedOption.label
                    );
                  } else {
                    setValue(
                      `suppliers.${index}.unit.unit_uuid`,
                      selectedOption.value || ''
                    );
                    setValue(
                      `suppliers.${index}.unit.unit_name`,
                      selectedOption.label || ''
                    );
                  }
                }}
                menuPosition="fixed"
                styles={{
                  menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                }}
              />
              <div className={styles.flexContainer}>
                <div className={styles.IconContainer}>
                  <LabeledInput
                    placeholder={t('ingredient:size')}
                    type="text"
                    error={
                      errors?.suppliers?.[index]?.conversion_factor?.message
                    }
                    lighter
                    {...register(`suppliers.${index}.conversion_factor`)}
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
                supplier_uuid: '',
                unit_cost: '',
                conversion_factor: '',
                unit: {
                  unit_uuid: '',
                  unit_name: '',
                },
                product_code: '',
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
