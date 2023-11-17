import { Button, LabeledInput, Loading, Popup, Select } from 'shared-ui';
import styles from './styles.module.scss';
import { useEffect, useState } from 'react';
import { Supplier, inventoryService } from '../../services';

import {
  useRestaurantCurrency,
  useRestaurantStore,
} from '../../store/useRestaurantStore';
import { units } from '../../views/Inventory/Ingredients/IngredientTab';
import { useTranslation } from 'react-i18next';
import { useIngredients } from '../../services/hooks';
import toast from 'react-hot-toast';
import { z } from 'zod';
import supplierService from '../../services/supplier.service';

type Props = {
  isVisible: boolean;
  toggle: () => void;
  onCreate: () => void;
  preFilledName?: string;
  preFilledSupplier?: string;
};

const defaultValue = {
  name: '',
  quantity: 0,
  unit: '',
  supplier: '',
  unitCost: 0,
};

const ingredientSchemas = z.object({
  name: z.string().nonempty('required'),
  quantity: z.number().positive('positive-number'),
  unitCost: z.number().positive('positive-number'),
  unit: z.string().nonempty('required'),
  supplier: z.string().nonempty('required'),
});

type Form = z.infer<typeof ingredientSchemas>;

type Errors = {
  [key in keyof Form]?: string;
};

const CreateIngredient = (props: Props) => {
  const { t } = useTranslation('common');
  const { currencySymbol } = useRestaurantCurrency();

  const selectedRestaurantUUID = useRestaurantStore(
    (state) => state.selectedRestaurantUUID
  )!;
  const { reload } = useIngredients();

  const [loading, setLoading] = useState(false);
  const [ingredient, setIngredient] = useState<Form>(defaultValue);
  const [supplierOptions, setSupplierOptions] = useState<Supplier[]>([]);
  const [errors, setErrors] = useState<Errors | null>(null);

  useEffect(() => {
    if (!props.preFilledSupplier) {
      supplierService
        .getRestaurantSuppliers(selectedRestaurantUUID)
        .then((suppliers) => {
          setSupplierOptions(suppliers);
        });
    }
  }, [selectedRestaurantUUID]);

  const handleIngredientChange = (
    field: keyof Form,
    value: string | number
  ) => {
    setIngredient((prevIngredient) => ({
      ...prevIngredient!,
      [field]: value,
    }));
  };

  const handleAddNewIngredient = () => {
    const formValidation = ingredientSchemas.safeParse(ingredient);
    if (formValidation.success) {
      setLoading(true);
      inventoryService
        .addIngredient(selectedRestaurantUUID, ingredient)
        .then(() => {
          reload();
          toast.success('ingredient added');
          props.onCreate();
        })
        .catch((err) => {
          console.log(err);
        })
        .finally(() => {
          setLoading(false);
          setIngredient(defaultValue);
        });
    } else {
      console.log(formValidation.error);

      const errors = formValidation.error.errors.reduce<Errors>((acc, val) => {
        acc[val.path[0] as keyof Form] = val.message;
        return acc;
      }, {});

      setErrors(errors);
    }
  };
  useEffect(() => {
    if (props.isVisible) {
      setIngredient({
        ...defaultValue,
        name: props.preFilledName ?? '',
        supplier: props.preFilledSupplier ?? '',
      });
    }
  }, [props.isVisible, props.preFilledName, props.preFilledSupplier]);

  const handleCancel = () => {
    props.toggle();
  };

  return (
    <Popup
      isVisible={props.isVisible}
      title={'Create ingredient'}
      subtitle="this ingredient will be added to your inventory."
      onRequestClose={props.toggle}>
      {!loading ? (
        <div className={styles.createIngredientPopup}>
          <div className={styles.inputs}>
            <LabeledInput
              placeholder="Name"
              type="text"
              value={ingredient?.name}
              lighter
              onChange={(val) =>
                handleIngredientChange('name', val.target.value)
              }
              error={errors?.name}
            />
            <Select
              size="large"
              placeholder={t('orders.supplier')}
              getOptionLabel={(o) => o.name}
              getOptionValue={(o) => o.uuid}
              options={supplierOptions}
              value={
                props.preFilledSupplier
                  ? {
                      name: props.preFilledSupplier,
                      uuid: '',
                    }
                  : supplierOptions.find(
                      (u) => u.name === ingredient?.supplier
                    ) ?? null
              }
              isDisabled={!!props.preFilledSupplier}
              onChange={(val) =>
                val && handleIngredientChange('supplier', val.name)
              }
              error={errors?.unit}
            />
            <div className={styles.multiple}>
              <LabeledInput
                placeholder="Quantity"
                type="number"
                suffix={ingredient.unit}
                value={ingredient?.quantity.toString()}
                lighter
                onChange={(val) =>
                  handleIngredientChange('quantity', +val.target.value)
                }
                error={errors?.quantity}
              />
              <Select
                size="large"
                placeholder={t('unit')}
                options={units}
                value={units.find((u) => u.value === ingredient?.unit) ?? null}
                onChange={(val) =>
                  val && handleIngredientChange('unit', val.value)
                }
                error={errors?.unit}
              />
            </div>
            <LabeledInput
              placeholder="Unit cost"
              type="number"
              suffix={currencySymbol}
              value={ingredient?.unitCost.toString()}
              lighter
              onChange={(val) =>
                handleIngredientChange('unitCost', +val.target.value)
              }
              error={errors?.unitCost}
            />
          </div>
          <div className={styles.buttons}>
            <Button
              value={t('cancel')}
              type="secondary"
              onClick={handleCancel}
            />
            <Button
              value={t('add')}
              type="primary"
              onClick={handleAddNewIngredient}
            />
          </div>
        </div>
      ) : (
        <Loading />
      )}
    </Popup>
  );
};

export default CreateIngredient;
