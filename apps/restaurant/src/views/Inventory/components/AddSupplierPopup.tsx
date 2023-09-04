import {
  Button,
  LabeledInput,
  PhoneNumberInput,
  Popup,
  Select,
} from 'shared-ui';
import styles from './AddSupplierPopup.module.scss';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const SupplierSchema = z.object({
  name: z.string().min(1, { message: 'name-required' }),
  email: z.string().min(1, { message: 'email-required' }).email('valid-email'),
  phone: z.string().min(1, { message: 'phone-required' }),
});

type SupplierForm = z.infer<typeof SupplierSchema>;

type Props = {
  isVisible: boolean;
  onRequestClose: () => void;
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
    resolver: zodResolver(SupplierSchema),
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

  return (
    <Popup
      isVisible={props.isVisible}
      onRequestClose={props.onRequestClose}
      title="Add a new supplier"
      subtitle="Search your supplier here or create a new one if you don't find it">
      <form onSubmit={handleSubmit((data) => console.log(data))}>
        <div className={styles.inputContainer}>
          {!addingMode ? (
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
              options={[
                {
                  label: 'Test',
                  value: 'test',
                },
                {
                  label: 'Test 2',
                  value: 'test2',
                },
              ]}
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
                type="email"
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
