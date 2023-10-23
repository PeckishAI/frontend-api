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
import { useTranslation } from 'react-i18next';
import { Supplier } from '../../../../services';
import supplierService from '../../../../services/supplier.service';
import { useRestaurantStore } from '../../../../store/useRestaurantStore';

const SupplierSchema = z.object({
  supplierSelect: z.string(),
  automaticInvitation: z.boolean(),
});

const AddSupplierSchema = z.object({
  name: z.string().min(1, { message: 'required' }),
  email: z.string().email('valid-email').optional().or(z.literal('')),
  phone: z
    .string()
    .optional()
    .or(z.null().transform(() => undefined)),
  automaticInvitation: z.boolean(),
});

type SupplierForm = z.infer<typeof SupplierSchema & typeof AddSupplierSchema>;

type Props = {
  isVisible: boolean;
  onRequestClose: () => void;
  onSupplierAdded: (supplier: {
    name: string;
    email?: string;
    phone?: string;
  }) => void;
};

const AddSupplierPopup = (props: Props) => {
  const { t } = useTranslation('common');
  const [addingMode, setAddingMode] = useState(false);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);

  const restaurantUUID = useRestaurantStore(
    (state) => state.selectedRestaurantUUID
  );

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
    supplierService.getSuppliers().then((data) => {
      setSuppliers(data);
    });
  }, []);

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

  const handleSubmitForm = handleSubmit(async (data) => {
    console.log('Submit', data);
    if (!restaurantUUID) return;

    let uuid;
    if (addingMode) {
      uuid = await supplierService
        .createSupplier({
          name: data.name,
          email: data.email,
          phone: data.phone,
        })
        .then((res) => res.supplier_uuid)
        .catch(() => null);
    } else {
      uuid = data.supplierSelect;
    }

    if (!uuid) return;

    return supplierService
      .addSupplierToRestaurant(restaurantUUID, uuid)
      .then(() => {
        props.onRequestClose();
        props.onSupplierAdded(
          addingMode
            ? data
            : {
                name:
                  suppliers.find((s) => s.uuid === data.supplierSelect)?.name ||
                  '',
                email:
                  suppliers.find((s) => s.uuid === data.supplierSelect)
                    ?.email || '',
                phone:
                  suppliers.find((s) => s.uuid === data.supplierSelect)
                    ?.phone || '',
              }
        );
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
                  placeholder={t('suppliers.addSupplier.select.placeholder')}
                  onCreateOption={handleCreateNewOption}
                  formatCreateLabel={(inputValue) =>
                    t('suppliers.addSupplier.select.createSupplier', {
                      name: inputValue,
                    })
                  }
                  getNewOptionData={(inputValue) => {
                    return {
                      uuid: 'new',
                      name: t('suppliers.addSupplier.select.createSupplier', {
                        name: inputValue,
                      }),
                    };
                  }}
                  getOptionLabel={(option) => option.name}
                  getOptionValue={(option) => option.uuid}
                  options={suppliers}
                  onChange={(val) => {
                    console.log('okkk', val);

                    onChange(val && val.uuid);
                  }}
                  value={suppliers.filter((c) => value === c.uuid)}
                  name={name}
                  onBlur={onBlur}
                />
              )}
            />
          ) : (
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
          )}
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

export default AddSupplierPopup;
