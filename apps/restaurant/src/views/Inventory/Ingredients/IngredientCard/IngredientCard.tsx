import React, { useEffect, useState } from 'react';
import { Button, LabeledInput, Popup, Select } from 'shared-ui';
import styles from './IngredientCard.module.scss';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { inventoryService } from '../../../../services';
import { useRestaurantStore } from '../../../../store/useRestaurantStore';

const AddIngredientSchema = z.object({
  name: z.string().min(1, { message: 'required' }),
  actual_quantity: z.number().min(0).optional(),
  par_level: z.number().min(0).optional(),
  unit: z.string().optional(),
  tags: z
    .array(z.object({ tag_uuid: z.string(), tag_name: z.string() }))
    .optional(),
  suppliers: z
    .array(
      z.object({
        supplier_uuid: z.string(),
        supplier_name: z.string(),
        unit_cost: z.number().min(0),
        unit: z.string(),
      })
    )
    .optional(),
});

type IngredientForm = z.infer<typeof AddIngredientSchema>;

type Props = {
  isVisible: boolean;
  onRequestClose: () => void;
  onIngrAdded: (ingredient: IngredientForm) => void;
};

const AddIngredientPopup: React.FC<Props> = ({
  isVisible,
  onRequestClose,
  onIngrAdded,
}) => {
  const { t } = useTranslation('common');
  const restaurantUUID = useRestaurantStore(
    (state) => state.selectedRestaurantUUID
  );

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    reset,
    setValue,
  } = useForm<IngredientForm>({
    resolver: zodResolver(AddIngredientSchema),
  });

  const [tags, setTags] = useState([
    { tag_uuid: '1', tag_name: 'Organic' },
    { tag_uuid: '2', tag_name: 'Fresh' },
  ]);
  const [suppliers, setSuppliers] = useState([
    { supplier_uuid: '1', supplier_name: 'Supplier A' },
    { supplier_uuid: '2', supplier_name: 'Supplier B' },
  ]);
  const [selectedSuppliers, setSelectedSuppliers] = useState([]);

  useEffect(() => {
    if (isVisible) {
      reset();
      setSelectedSuppliers([]);
    }
  }, [isVisible]);

  const handleSubmitForm = handleSubmit(async (data) => {
    if (!restaurantUUID) return;

    const mappedIngredient = {
      id: undefined,
      name: data.name,
      tagUUID: data.tags?.map((tag) => tag.tag_uuid) || [],
      parLevel: data.par_level,
      actualStock: data.actual_quantity,
      unit: data.unit,
      supplier_details: selectedSuppliers.map((supplier) => ({
        supplier_id: supplier.supplier_uuid,
        supplier_name: supplier.supplier_name,
        supplier_cost: supplier.unit_cost,
      })),
      unitCost: selectedSuppliers[0]?.unit_cost || 0,
    };

    try {
      const addedIngredient = await inventoryService.addIngredient(
        restaurantUUID,
        mappedIngredient
      );
      onIngrAdded(data);
      onRequestClose();
    } catch (error) {
      console.error('Error adding ingredient:', error);
    }
  });

  const handleAddSupplier = () => {
    setSelectedSuppliers((prev) => [
      ...prev,
      { supplier_uuid: '', supplier_name: '', unit_cost: 0, unit: '' },
    ]);
  };

  const handleRemoveSupplier = (index) => {
    setSelectedSuppliers((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <Popup
      isVisible={isVisible}
      onRequestClose={onRequestClose}
      title={t('Add New Ingredient')}
      subtitle={t('Fill out the details below')}>
      <form onSubmit={handleSubmitForm}>
        <div className={styles.section}>
          <h4 className={styles.popupTitle}>{t('Basic Information')}</h4>
          <LabeledInput
            className={styles.inputWrapper}
            placeholder={t('Ingredient Name')}
            type="text"
            error={errors.name?.message}
            {...register('name')}
          />
          <Controller
            control={control}
            name="category"
            render={({ field: { onChange, name, onBlur, ref, value } }) => (
              <Select
                size="large"
                isSearchable={false}
                isMulti={false}
                // placeholder={t('category')}
                placeholder="Select Tags"
                options={[]}
                innerRef={ref}
                name={name}
                onChange={(val) => {
                  onChange(val?.value ?? null);
                }}
              />
            )}
          />
          {/* 
          <Select
            placeholder={t('Select or Create Tags')}
            options={tags}
            onChange={(selectedOption) => {}}
            value={'ok'}
          /> */}
          {/* <Select
            placeholder={t('Select or Create Tags')}
            options={tags}
            onChange={(
              selectedOption: SingleValue<{
                value: string;
                label: string;
              }>
            ) => field.onChange(selectedOption ? selectedOption.value : '')}
            value={
              props.restaurants
                .map((rest) => ({
                  value: rest.id,
                  label: rest.name,
                }))
                .find((option) => option.value === field.value) || null
            }
          /> */}
        </div>

        <div className={styles.section}>
          <h4 className={styles.popupTitle}>{t('Stock Details')}</h4>
          <div className={styles.stockDetailsInline}>
            <div className="inputWrapper">
              <LabeledInput
                placeholder={t('Actual Stock')}
                type="number"
                error={errors.actual_quantity?.message}
                {...register('actual_quantity')}
              />
            </div>
            <div className="inputWrapper">
              <LabeledInput
                placeholder={t('Par Level')}
                type="number"
                error={errors.par_level?.message}
                {...register('par_level')}
              />
            </div>
            <div className="inputWrapper">
              <LabeledInput
                placeholder={t('Unit')}
                type="text"
                error={errors.unit?.message}
                {...register('unit')}
              />
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <h4 className={styles.popupTitle}>{t('Suppliers')}</h4>
          {selectedSuppliers.map((supplier, index) => (
            <div key={index} className={styles.supplierEntry}>
              <Controller
                control={control}
                name="medium"
                render={({ field: { onChange, name, onBlur, ref, value } }) => (
                  <Select
                    size="large"
                    isSearchable={false}
                    isMulti={false}
                    // placeholder={t('category')}
                    placeholder={t('Select or Create Supplier')}
                    options={[]}
                    innerRef={ref}
                    name={name}
                    onChange={(selectedOption) => {
                      const updatedSuppliers = [...selectedSuppliers];
                      updatedSuppliers[index].supplier_uuid =
                        selectedOption.value;
                      updatedSuppliers[index].supplier_name =
                        selectedOption.label;
                      setSelectedSuppliers(updatedSuppliers);
                    }}
                  />
                )}
              />
              <LabeledInput
                placeholder={t('Unit Cost')}
                type="number"
                value={supplier.unit_cost}
                onChange={(e) => {
                  const updatedSuppliers = [...selectedSuppliers];
                  updatedSuppliers[index].unit_cost = parseFloat(
                    e.target.value
                  );
                  setSelectedSuppliers(updatedSuppliers);
                }}
              />
              <LabeledInput
                placeholder={t('Package Unit')}
                type="text"
                value={supplier.unit}
                onChange={(e) => {
                  const updatedSuppliers = [...selectedSuppliers];
                  updatedSuppliers[index].unit = e.target.value;
                  setSelectedSuppliers(updatedSuppliers);
                }}
              />
              <Button
                type="secondary"
                value={t('Remove')}
                onClick={() => handleRemoveSupplier(index)}
              />
            </div>
          ))}
          <Button
            type="secondary"
            value={t('Add Supplier')}
            onClick={handleAddSupplier}
          />
        </div>

        <div className={styles.buttonsContainer}>
          <Button
            type="secondary"
            value={t('Cancel')}
            onClick={onRequestClose}
          />
          <Button
            type="primary"
            value={t('Save')}
            actionType="submit"
            loading={isSubmitting}
          />
        </div>
      </form>
    </Popup>
  );
};

export default AddIngredientPopup;
