import React, { FC, useEffect } from 'react';
import { DialogBox, Button, Input, Dropdown } from 'shared-ui';
import styles from './AddSupplierModal.module.scss';
import {
  useForm,
  Controller,
  SubmitHandler,
  useFieldArray,
} from 'react-hook-form';
import { toast } from 'react-hot-toast';

interface Ingredient {
  supplier_cost: string;
  supplier_id: number;
}

interface FormData {
  ingredients: Ingredient[];
}

interface AddSupplierModalProps {
  isOpen: boolean;
  onRequestClose: () => void;
  onSave: (data: FormData) => void;
  suppliers: { value: string; label: string }[];
  supplier_details: {
    supplier_id: number;
    supplier_cost: string;
    supplier_name: string;
  }[];
}

const AddSupplierModal: FC<AddSupplierModalProps> = ({
  isOpen,
  onRequestClose,
  onSave,
  suppliers,
  supplier_details,
}) => {
  const defaultValues = supplier_details?.map((detail) => ({
    supplier_cost: detail.supplier_cost?.toString(),
    supplier_id: detail.supplier_id,
    supplier_name: detail.supplier_name,
  }));
  const { control, handleSubmit, reset } = useForm<FormData>({
    defaultValues: { ingredients: defaultValues },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'ingredients',
  });

  useEffect(() => {
    reset({ ingredients: defaultValues });
  }, [supplier_details, reset]);

  const onSubmit: SubmitHandler<FormData> = (data) => {
    if (
      data.ingredients.some(
        (ingredient) => !ingredient.supplier_id || !ingredient.supplier_cost
      )
    ) {
      toast.error('Please fill in all required fields.');
      return;
    }
    onSave(data);
    reset();
    onRequestClose();
  };

  const handleAddIngredient = () => {
    append({ supplier_cost: '', supplier_id: undefined, supplier_name: '' });
  };

  return (
    <DialogBox isOpen={isOpen} onRequestClose={onRequestClose}>
      <form onSubmit={handleSubmit(onSubmit)} className={styles.modalContent}>
        <div>
          {fields.map((field, index) => (
            <div key={field.id} className={styles.formGroup}>
              <div className={styles.formInline}>
                <label>Supplier Name</label>
                <Controller
                  name={`ingredients.${index}.supplier_id`}
                  control={control}
                  render={({ field }) => (
                    <>
                      <Dropdown
                        {...field}
                        options={suppliers}
                        selectedOption={field.value}
                        placeholder="Select Supplier Name"
                        className={styles.detectedNameInput}
                        onOptionChange={(value) => field.onChange(value)}
                        getOptionLabel={(option) =>
                          suppliers.find((s) => s.value === option)?.label ||
                          option
                        }
                      />
                    </>
                  )}
                />
              </div>
              <div className={styles.formInline}>
                <label>Cost</label>
                <Controller
                  name={`ingredients.${index}.supplier_cost`}
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      placeholder="Cost"
                      className={styles.input}
                    />
                  )}
                />
              </div>

              <p className={styles.removeButton} onClick={() => remove(index)}>
                <i className="fa-solid fa-close"></i>
              </p>
            </div>
          ))}
        </div>
        <p className={styles.addIngredient} onClick={handleAddIngredient}>
          <i className="fa-solid fa-plus"></i>Add Supplier
        </p>
        <div className={styles.buttonsContainer}>
          <Button
            type="secondary"
            actionType="button"
            value="Cancel"
            onClick={onRequestClose}
          />
          <Button type="primary" actionType="submit" value="Save" />
        </div>
      </form>
    </DialogBox>
  );
};

export default AddSupplierModal;
