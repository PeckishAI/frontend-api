import {
  Button,
  Checkbox,
  LabeledInput,
  PhoneNumberInput,
  Popup,
  Select,
} from 'shared-ui';
import styles from './AddSupplierPopup.module.scss';
import { useState, useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const SupplierSchema = z.object({
  supplierSelect: z.string(),
  automaticInvitation: z.boolean(),
});

const AddSupplierSchema = z.object({
  name: z.string().min(1, { message: 'required' }),
  email: z.string().min(1, { message: 'required' }).email('valid-email'),
  phone: z.string().min(1, { message: 'required' }),
  automaticInvitation: z.boolean(),
});

type SupplierForm = z.infer<typeof SupplierSchema & typeof AddSupplierSchema>;

const SUPPLIERS = [
  {
    label: 'Metro',
    value: 'metro',
    phone: '+31 7 52 15 45',
    email: 'metro@metro.com',
  },
  {
    label: 'Rekki',
    value: 'rekki',
    phone: '+31 7 52 15 45',
    email: 'supply@rekki.com',
  },
  {
    label: 'REKKI FRANCE',
    value: 'rekki-fr',
    phone: '+31 7 52 15 45',
    email: 'supply@rekki.fr',
  },
];

type Props = {
  isVisible: boolean;
  onRequestClose: () => void;
  onSupplierAdded: (supplier: {
    name: string;
    email: string;
    phone: string;
  }) => void;
};

const AddSupplierPopup = (props: Props) => {
  const [addingMode, setAddingMode] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    setValue,
    reset,
  } = useForm<SupplierForm>({
    resolver: zodResolver(addingMode ? AddSupplierSchema : SupplierSchema),
    defaultValues: {
      automaticInvitation: true,
    },
  });

  useEffect(() => {
    if (!props.isVisible) {
      reset();
      setAddingMode(false);
    }
  }, [props.isVisible, reset]);

  const handleCreateNewOption = (value: string) => {
    setAddingMode(true);
    setValue('name', value);
  };

  const handleSubmitForm = handleSubmit((data) => {
    console.log('Submit', data);
    return new Promise((resolve) => {
      setTimeout(() => {
        props.onRequestClose();
        props.onSupplierAdded(
          addingMode
            ? data
            : {
                name:
                  SUPPLIERS.find((s) => s.value === data.supplierSelect)
                    ?.label || '',
                email:
                  SUPPLIERS.find((s) => s.value === data.supplierSelect)
                    ?.email || '',
                phone:
                  SUPPLIERS.find((s) => s.value === data.supplierSelect)
                    ?.phone || '',
              }
        );
        resolve(true);
      }, 1000);
    });
  });

  return (
    <Popup
      isVisible={props.isVisible}
      onRequestClose={props.onRequestClose}
      title="Add a new supplier"
      subtitle="Search your supplier here or create a new one if you don't find it">
      <form onSubmit={handleSubmitForm}>
        <div className={styles.inputContainer}>
          {!addingMode ? (
            <Controller
              control={control}
              name="supplierSelect"
              render={({ field: { onChange, name, value, onBlur } }) => (
                <Select
                  isCreatable
                  size="large"
                  isSearchable
                  isClearable
                  placeholder="Search a supplier"
                  onCreateOption={handleCreateNewOption}
                  formatCreateLabel={(inputValue) =>
                    `Create supplier "${inputValue}"`
                  }
                  options={SUPPLIERS}
                  onChange={(val) => onChange(val && val.value)}
                  value={SUPPLIERS.filter((c) => value === c.value)}
                  name={name}
                  onBlur={onBlur}
                />
              )}
            />
          ) : (
            <>
              <LabeledInput
                lighter
                placeholder="Name"
                type="text"
                error={errors.name?.message}
                {...register('name')}
              />
              <LabeledInput
                lighter
                placeholder="Email"
                type="text"
                error={errors.email?.message}
                {...register('email')}
              />
              <PhoneNumberInput
                mode="form"
                control={control}
                name="phone"
                error={errors.phone?.message}
              />
            </>
          )}
        </div>

        <Checkbox
          label="Send an automatic invitation to the supplier"
          className={styles.autoCheckbox}
          {...register('automaticInvitation')}
        />

        <div className={styles.buttonsContainer}>
          <Button
            type="secondary"
            value="Cancel"
            onClick={props.onRequestClose}
          />
          <Button
            type="primary"
            value="Validate"
            actionType="submit"
            loading={isSubmitting}
          />
        </div>
      </form>
    </Popup>
  );
};

export default AddSupplierPopup;
