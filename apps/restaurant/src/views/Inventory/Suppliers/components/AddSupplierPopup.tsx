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

const AddSupplierSchema = z.object({
  name: z.string().min(1, { message: 'required' }),
  email: z.string().email('valid-email').optional().or(z.literal('')),
  phone: z
    .string()
    .optional()
    .or(z.null().transform(() => undefined)),
  // automaticInvitation: z.boolean(),
});

type SupplierForm = z.infer<typeof AddSupplierSchema>;

type Props = {
  isVisible: boolean;
  onRequestClose: () => void;
  fetchSuppliersAndSync: () => void;
  onSupplierAdded: (supplier: {
    name: string;
    email?: string;
    phone?: string;
  }) => void;
};

const AddSupplierPopup = (props: Props) => {
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
  } = useForm<SupplierForm>({
    resolver: zodResolver(AddSupplierSchema),
    // defaultValues: {
    //   automaticInvitation: true,
    // },
  });

  useEffect(() => {
    if (!props.isVisible) {
      reset();
    }
  }, [props.isVisible, reset]);

  const handleSubmitForm = handleSubmit(async (data) => {
    if (!restaurantUUID) return;

    const uuid = await supplierService
      .createSupplier({
        name: data.name,
        email: data.email,
        phone: data.phone,
      })
      .then((res) => res.supplier_uuid)
      .catch(() => null);

    if (!uuid) return;

    return supplierService
      .addSupplierToRestaurant(restaurantUUID, uuid)
      .then(() => {
        props.onRequestClose();
        props.onSupplierAdded(data);
        props.fetchSuppliersAndSync();
      });
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
              {...register('name')}
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

        {/* <Checkbox
          label={t('suppliers.addSupplier.automaticSendCheckbox')}
          className={styles.autoCheckbox}
          {...register('automaticInvitation')}
        /> */}

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

export default AddSupplierPopup;
