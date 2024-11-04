import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import CreatableSelect from 'react-select/creatable';
import { FaPlus } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { Button, IconButton, LabeledInput, Popup } from 'shared-ui';
import { DropdownOptionsDefinitionType } from 'shared-ui/components/Dropdown/Dropdown';
import { useRestaurantStore } from '../../../store/useRestaurantStore';
import { inventoryService } from '../../../services';
import { tagService } from '../../../services/tag.service';
import supplierService from '../../../services/supplier.service';
import styles from './AddIngredientPopup.module.scss';
import { TagDetails } from '../../../services/types';

const AddIngredientSchema = z.object({
  ingredientName: z.string().min(1, { message: 'Recipe name is required' }),
  quantity: z
    .number()
    .min(0, { message: 'Quantity must be a positive number' })
    .optional(),
  parLevel: z
    .number()
    .min(0, { message: 'Par level must be a positive number' })
    .optional(),
  tagDetails: z
    .array(
      z.object({
        tagUUID: z.string().optional(),
        tagName: z.string().min(1, { message: 'Tag name is required' }),
      })
    )
    .optional(),
  supplierDetails: z
    .array(
      z.object({
        supplierName: z
          .string()
          .min(1, { message: 'Supplier Name is required' }),
        supplierUUID: z
          .string()
          .min(1, { message: 'Supplier uuid is required' })
          .optional(),
        supplierUnitCost: z
          .number()
          .min(0, { message: 'Cost must be a positive number' })
          .optional(),
        conversionFactor: z.number().optional(),
        supplierUnitUUID: z.string().optional(),
        supplierUnitName: z
          .string()
          .min(1, { message: 'Supplier Unit name is required' }),
      })
    )
    .optional(),
  unitName: z.string().min(1, { message: 'Unit name is required' }),
  unitUUID: z.string().optional(),
});

type PreparationForm = z.infer<typeof AddIngredientSchema>;

interface Props {
  isVisible: boolean;
  onRequestClose: () => void;
  reloadInventoryData: () => void;
}

const AddIngredientPopup: React.FC<Props> = ({
  isVisible,
  onRequestClose,
  reloadInventoryData,
}) => {
  const { t } = useTranslation(['common', 'ingredient']);
  const restaurantUUID = useRestaurantStore(
    (state) => state.selectedRestaurantUUID
  );

  const [unitname, setUnitName] = useState([]);
  const [tagList, setTagList] = useState<TagDetails[]>([]);
  const [suppliers, setSuppliers] = useState<DropdownOptionsDefinitionType[]>(
    []
  );

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
      ingredientName: '',
      tagDetails: [],
      supplierDetails: [
        {
          supplierName: '',
          supplierUnitCost: 0,
          conversionFactor: 1,
          supplierUnitUUID: '',
          supplierUnitName: '',
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
    name: 'supplierDetails',
  });

  const handleAddNewSupplier = () => {
    addSupplier({
      supplierName: '',
      supplierUnitCost: 0,
      conversionFactor: 1,
      supplierUnitUUID: '',
      supplierUnitName: '',
    });
  };

  const reloadTagList = () => {
    if (!restaurantUUID) return;
    tagService.getAll(restaurantUUID).then((tags) => {
      setTagList(tags || []);
    });
  };

  const reloadUnits = () => {
    if (!restaurantUUID) return;
    inventoryService
      .getUnits(restaurantUUID)
      .then((res) => {
        setUnitName(res);
      })
      .catch(console.error);
  };

  const handleCreateTag = (inputValue: string) => {
    const newTag: TagDetails = {
      tagUUID: '', // Empty for new tags
      tagName: inputValue,
    };
    setTagList((prev) => [...prev, newTag]);
    setValue('tagDetails', [...(watch('tagDetails') || []), newTag]);
  };

  const handleSelectChange = (selectedOptions: any[]) => {
    const tagDetails: TagDetails[] = selectedOptions.map((option) => ({
      tagUUID: option.value,
      tagName: option.label,
    }));
    setValue('tagDetails', tagDetails);
  };

  const reloadRestaurantSuppliers = async () => {
    if (!restaurantUUID) return;
    const res = await supplierService.getRestaurantSuppliers(restaurantUUID);
    console.log(res);
    const suppliersList = res.map((supplier) => ({
      label: supplier.supplierName,
      value: supplier.supplierUUID,
      supplierUUID: supplier.supplierUUID,
    }));
    setSuppliers(suppliersList);
    console.log('Suppliers', suppliersList);
  };

  useEffect(() => {
    reloadUnits();
    reloadTagList();
    reloadRestaurantSuppliers();
  }, [restaurantUUID]);

  const handleSubmitForm = handleSubmit(async (data) => {
    const formattedData = {
      ...data,
      tagDetails: (data.tagDetails || []).map((tag: TagDetails) => ({
        tagUUID: tag.tagUUID || '',
        tagName: tag.tagName,
      })),
      supplierDetails: (data.supplierDetails || []).map((supplier) => ({
        supplierUUID: supplier?.supplierUUID || '',
        supplierName: supplier?.supplierName || '',
        supplierUnitCost: supplier?.supplierUnitCost || 0,
        conversionFactor: supplier?.conversionFactor || 1,
        supplierUnitUUID: supplier?.supplierUnitUUID || '',
        supplierUnitName: supplier?.supplierUnitName || '',
      })),
    };

    try {
      await inventoryService.addIngredient(restaurantUUID, formattedData);
      onRequestClose();
      reloadTagList();
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
      maxWidth="70%"
      title={t('recipes.addIngredient.title')}>
      <form onSubmit={handleSubmitForm} className={styles.formContainer}>
        <h3>{t('ingredient:ingredientDetails')}</h3>
        <div className={styles.ingredientSection}>
          <LabeledInput
            label={t('ingredientName')}
            placeholder={t('ingredientName')}
            type="text"
            lighter
            error={errors.ingredientName?.message}
            {...register('ingredientName')}
            className={styles.inputField}
          />

          <LabeledInput
            label={t('ingredient:actualStock')}
            placeholder={t('ingredient:actualStock')}
            type="number"
            lighter
            {...register('quantity')}
            className={styles.inputField}
          />

          <LabeledInput
            label={t('ingredient:parLevel')}
            placeholder={t('ingredient:parLevel')}
            type="number"
            lighter
            {...register('parLevel')}
            className={styles.inputField}
          />

          <CreatableSelect
            placeholder={t('ingredient:selectUnit')}
            options={unitname.map((unit) => ({
              label: unit.unitName,
              value: unit.unitUUID,
            }))}
            className={styles.selectControl}
            isCreatable
            value={
              watch('unitName')
                ? {
                    label: watch('unitName'),
                    value: watch('unitUUID'),
                  }
                : null
            }
            onChange={(selectedOption, actionMeta) => {
              if (actionMeta.action === 'create-option') {
                setValue('unitName', selectedOption.label);
                setValue('unitUUID', '');
              } else {
                setValue('unitName', selectedOption?.label || '');
                setValue('unitUUID', selectedOption?.value || '');
              }
            }}
          />
        </div>
        <h3>{t('ingredient:tagtDetails')}</h3>
        <div className={styles.tagSection}>
          <CreatableSelect
            placeholder={t('ingredient:selectTags')}
            options={tagList.map((tag: TagDetails) => ({
              label: tag.tagName,
              value: tag.tagUUID,
            }))}
            isMulti
            className={styles.selectControl}
            value={
              watch('tagDetails')?.map((tag: TagDetails) => ({
                label: tag.tagName,
                value: tag.tagUUID,
              })) || []
            }
            onCreateOption={handleCreateTag}
            onChange={handleSelectChange}
          />
        </div>

        <h3>{t('ingredient:supplierDetails')}</h3>
        {supplierFields.map((field, index) => (
          <div key={field.id} className={styles.supplierSection}>
            <CreatableSelect
              placeholder={t('ingredient:selectSupplier')}
              options={suppliers.map((supplier) => ({
                label: supplier.label,
                value: supplier.value,
              }))}
              className={styles.selectControl}
              value={suppliers.find(
                (supplier) =>
                  supplier.value ===
                  watch(`supplierDetails.${index}.supplierUUID`)
              )}
              onChange={(selectedOption) => {
                setValue(
                  `supplierDetails.${index}.supplierUUID`,
                  selectedOption?.value || ''
                );
                setValue(
                  `supplierDetails.${index}.supplierName`,
                  selectedOption?.label || ''
                );
              }}
              isCreatable
            />

            <LabeledInput
              label={t('ingredient:supplierCost')}
              placeholder={t('ingredient:supplierCost')}
              type="number"
              step="0.00001"
              lighter
              error={
                errors?.supplierDetails?.[index]?.supplierUnitCost?.message
              }
              {...register(`supplierDetails.${index}.supplierUnitCost`)}
              className={styles.inputField}
            />

            <CreatableSelect
              placeholder={t('ingredient:selectUnit')}
              options={unitname.map((unit) => ({
                label: unit.unitName,
                value: unit.unitUUID,
              }))}
              className={styles.selectControl}
              value={
                watch(`supplierDetails.${index}.supplierUnitName`)
                  ? {
                      label: watch(`supplierDetails.${index}.supplierUnitName`),
                      value: watch(`supplierDetails.${index}.supplierUnitUUID`),
                    }
                  : null
              }
              onChange={(selectedOption, actionMeta) => {
                if (actionMeta.action === 'create-option') {
                  setValue(`supplierDetails.${index}.supplierUnitUUID`, '');
                  setValue(
                    `supplierDetails.${index}.supplierUnitName`,
                    selectedOption.label
                  );
                } else {
                  setValue(
                    `supplierDetails.${index}.supplierUnitUUID`,
                    selectedOption?.value || ''
                  );
                  setValue(
                    `supplierDetails.${index}.supplierUnitName`,
                    selectedOption?.label || ''
                  );
                }
              }}
              isCreatable
            />

            <div className={styles.conversionFactorContainer}>
              <div className={styles.iconContainer}>
                <LabeledInput
                  label={t('ingredient:conversionFactor')}
                  placeholder={t('ingredient:conversionFactor')}
                  type="number"
                  lighter
                  error={
                    errors?.supplierDetails?.[index]?.conversionFactor?.message
                  }
                  {...register(`supplierDetails.${index}.conversionFactor`)}
                  className={styles.inputField}
                />
                <IconButton
                  icon={<i className="fa-solid fa-circle-info" />}
                  tooltipMsg={`1 ${watch(`supplierDetails.${index}.supplierUnitName`) || '(unit)'} = 
      ${watch(`supplierDetails.${index}.conversionFactor`) || 0} ${watch('unitName') || '(base unit)'}`}
                  className={styles.info}
                />
              </div>
            </div>
            <div>
              <IconButton
                icon={<i className="fa-solid fa-trash" />}
                onClick={() => removeSupplier(index)}
                className={styles.deleteButton}
              />
            </div>
          </div>
        ))}

        <div
          className={styles.addIngredientButton}
          onClick={handleAddNewSupplier}>
          <FaPlus />
          <span>{t('ingredient:addSupplier')}</span>
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
