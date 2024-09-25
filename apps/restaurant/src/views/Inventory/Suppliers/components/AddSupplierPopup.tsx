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
import supplierService, {
  LinkedSupplier,
} from '../../../../services/supplier.service';
import { useRestaurantStore } from '../../../../store/useRestaurantStore';
import toast from 'react-hot-toast';

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
  onSupplierUpdated?: (supplier: LinkedSupplier) => void;
  editSupplier?: LinkedSupplier | null;
  mode: 'add' | 'edit';
  onSupplierAdded: (supplier: {
    name: string;
    email?: string;
    phone?: string;
  }) => void;
  fetchSuppliersAndSync: () => void;
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
    if (props.mode === 'edit' && props.editSupplier) {
      reset({
        name: props.editSupplier.name,
        email: props.editSupplier.email || '',
        phone: props.editSupplier.phone || '',
        // automaticInvitation: true,
      });
    } else {
      reset({
        name: '',
        email: '',
        phone: '',
        // automaticInvitation: true,
      });
    }
  }, [props.mode, props.editSupplier, reset]);

  const handleSubmitForm = handleSubmit(async (data) => {
    if (!restaurantUUID) return;

    if (props.mode === 'add') {
      const uuid = await supplierService
        .createSupplier(
          {
            name: data.name,
            email: data.email,
            phone: data.phone,
          },
          restaurantUUID
        )
        .then((res) => {
          res.supplier_uuid;
          toast.success('Supplier Created Successfully');
          props.onRequestClose();
          props.fetchSuppliersAndSync();
          reset();
        })
        .catch(() => null);

      if (!uuid) return;

      return supplierService
        .addSupplierToRestaurant(restaurantUUID, uuid)
        .then(() => {
          props.onRequestClose();
          props.onSupplierAdded(data);
          props.fetchSuppliersAndSync();
          reset();
        });
    } else if (props.mode === 'edit' && props.editSupplier) {
      return supplierService
        .updateSupplier(props.editSupplier.supplier_uuid, {
          name: data.name,
          email: data.email,
          phone: data.phone,
        })
        .then(() => {
          props.onRequestClose();
          toast.success('Successfully supplier updated');
          props.fetchSuppliersAndSync();
          if (props.onSupplierUpdated) {
            props.onSupplierUpdated({
              ...props.editSupplier,
              ...data,
            });
          }
          props.fetchSuppliersAndSync();
        });
    }
  });

  return (
    <Popup
      isVisible={props.isVisible}
      onRequestClose={props.onRequestClose}
      title={
        props.mode === 'add'
          ? t('suppliers.addSupplier.title')
          : t('suppliers.addSupplier.edit_title')
      }
      subtitle={
        props.mode === 'add'
          ? t('suppliers.addSupplier.subtitle')
          : t('suppliers.addSupplier.edit_subtitle')
      }>
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
