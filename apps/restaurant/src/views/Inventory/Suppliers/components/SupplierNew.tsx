import {
  Button,
  Checkbox,
  LabeledInput,
  PhoneNumberInput,
  Popup,
} from 'shared-ui';
import styles from './AddSupplierPopup.module.scss';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import supplierService from '../../../../services/supplier.service';
import { useRestaurantStore } from '../../../../store/useRestaurantStore';
import toast from 'react-hot-toast';

const AddSupplierSchema = z.object({
  name: z.string().min(1, { message: 'required' }),
  email: z.string().email('valid-email').optional().or(z.literal('')),
  phone: z
    .string()
    .optional()
    .or(z.null().transform(() => undefined)),
  automaticInvitation: z.boolean(),
});

type SupplierForm = z.infer<typeof AddSupplierSchema>;

type Props = {
  isVisible: boolean;
  onRequestClose: () => void;
  fetchSuppliers: () => void;
  onSupplierNew: (name: string) => void;
  onNew: string;
};

const SupplierNew = (props: Props) => {
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
    setValue, // <-- Add setValue to update form field values programmatically
  } = useForm<SupplierForm>({
    resolver: zodResolver(AddSupplierSchema),
    defaultValues: {
      name: props.onNew || '', // <-- Set the default value for the name field
      automaticInvitation: true,
    },
  });

  useEffect(() => {
    if (props.onNew) {
      setValue('name', props.onNew); // Set the name field to the value of props.onNew
    }
  }, [props.onNew, setValue]); // Run the effect whenever props.onNew changes

  useEffect(() => {
    if (!props.isVisible) {
      reset();
    }
  }, [props.isVisible, reset]);

  const handleSubmitForm = handleSubmit(async (data) => {
    if (!restaurantUUID) return;

    try {
      const uuid = await supplierService
        .createSupplier({
          name: data.name,
          email: data.email,
          phone: data.phone,
        })
        .then((res) => {
          // Call onRequestClose after successful supplier creation
          props.onRequestClose();
          props.fetchSuppliers();
          toast.success('Supplier created Successfully');
          return res.supplier_uuid;
        })
        .catch(() => null);

      if (!uuid) return;

      await supplierService.addSupplierToRestaurant(restaurantUUID, uuid);

      // Pass only the name to the onSupplierNew prop
      props.onSupplierNew(data.name);
    } catch (error) {
      console.error('Error submitting the form:', error);
    }
  });

  return (
    <Popup
      isVisible={props.isVisible}
      onRequestClose={props.onRequestClose}
      title={t('suppliers.addSupplier.title')}
      subtitle={t('suppliers.addSupplier.subtitle')}>
      <form onSubmit={handleSubmitForm}>
        <div className={styles.inputContainer}>
          <>
            <LabeledInput
              lighter
              placeholder={t('name')}
              type="text"
              error={errors.name?.message}
              {...register('name')} // This connects the input to the form state
            />
            <LabeledInput
              lighter
              placeholder={t('email')}
              type="text"
              error={errors.email?.message}
              {...register('email')}
            />
            <PhoneNumberInput
              mode="form"
              control={control}
              name="phone"
              placeholder={t('phone')}
              error={errors.phone?.message}
            />
          </>
        </div>

        <Checkbox
          label={t('suppliers.addSupplier.automaticSendCheckbox')}
          className={styles.autoCheckbox}
          {...register('automaticInvitation')}
        />

        <div className={styles.buttonsContainer}>
          <Button
            type="secondary"
            value={t('cancel')}
            onClick={props.onRequestClose}
          />
          <Button
            type="primary"
            value={t('validate')}
            actionType="submit"
            loading={isSubmitting}
          />
        </div>
      </form>
    </Popup>
  );
};

export default SupplierNew;
