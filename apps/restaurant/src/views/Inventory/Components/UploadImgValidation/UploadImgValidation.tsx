import { Button, Checkbox, LabeledInput, Popup, Select } from 'shared-ui';
import styles from './style.module.scss';
import { useTranslation } from 'react-i18next';
import {
  Ingredient,
  Invoice,
  InvoiceIngredient,
  inventoryService,
} from '../../../../services';
import { useIngredients } from '../../../../services/hooks';
import { useEffect, useState } from 'react';
import { useRestaurantCurrency } from '../../../../store/useRestaurantStore';
import CreateIngredient from '../../../../components/CreateIngredient/CreateIngredient';
import { useRestaurantStore } from '../../../../store/useRestaurantStore';
import { formatCurrency } from '../../../../utils/helpers';
import toast from 'react-hot-toast';

type Props = {
  invoice: Invoice;
  onCancelClick: () => void;
  onValideClick: () => void;
};

const UploadImgValidation = (props: Props) => {
  const { t } = useTranslation(['common', 'ingredient']);
  const { currencyISO, currencySymbol } = useRestaurantCurrency();

  const selectedRestaurantUUID = useRestaurantStore(
    (state) => state.selectedRestaurantUUID
  );

  const { ingredients, loading: ingredientsLoading, reload } = useIngredients();

  // Form values
  const [ingredientsValues, setIngredientsValues] = useState<
    InvoiceIngredient[]
  >([]);
  const [createIngredient, setCreateIngredient] = useState<Ingredient | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [mustUpdateInventory, setMustUpdateInventory] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setIngredientsValues(
      props.invoice.ingredients.map<InvoiceIngredient>((ing) => ({
        inventoryIngredientRef: ingredients.find(
          (i) => i.id === ing.mappedUUID
        ),
        quantity: ing.quantity,
        totalPrice: ing.totalPrice,
        unitPrice: ing.unitPrice
          ? ing.unitPrice
          : +((ing.totalPrice ?? 0) / (ing.quantity ?? 0)).toFixed(2),
      }))
    );
  }, [ingredients]);
  // setIngredientsValues(props.invoice.ingredients);
  // }, [props.invoice.ingredients]);

  const handleIngredientsValuesChange = <T extends keyof InvoiceIngredient>(
    index: number,
    field: T,
    value: InvoiceIngredient[T]
  ) => {
    const newValues = [...ingredientsValues];
    newValues[index][field] = value;
    setIngredientsValues(newValues);
  };

  const handleCreateNewOption = (val: string) => {
    setCreateIngredient((prevIngredient) => ({
      ...prevIngredient!,
      name: val,
    }));
  };

  const handleValidClick = () => {
    if (!selectedRestaurantUUID) return;
    setLoading(true);

    // In case checkbox to update inventory is checked
    if (mustUpdateInventory) {
      let requestSucces = 0;
      ingredientsValues.forEach((ing) => {
        if (ing.mappedUUID) {
          const ingToUpdate: Ingredient = {
            id: ing.inventoryIngredientRef?.id ?? '',
            name: ing.mappedName ?? '',
            parLevel: ing.inventoryIngredientRef?.parLevel ?? 0,
            supplier: ing.inventoryIngredientRef?.supplier ?? '',
            unit: ing.inventoryIngredientRef?.unit ?? '',
            unitCost: ing.unitPrice ?? 0,
            actualStock:
              (ing.inventoryIngredientRef?.actualStock ?? 0) +
              (ing.quantity ?? 0),
          };
          inventoryService
            .updateIngredient(ingToUpdate)
            .then(() => {
              requestSucces++;
            })
            .catch((err) => console.log(err))
            .finally(() => {
              if (requestSucces !== ingredientsValues.length)
                // means not all requests perfomed successfully
                return;
            });
        } else {
          setError('Some ingredient not mapped.');
          return;
        }
      });
    }

    inventoryService
      .submitInvoice(selectedRestaurantUUID, props.invoice)
      .then(() => {
        console.log('Invoice submitted successfully');
        props.onValideClick();
        toast.success(t('order.validation.submit.success'));
      })
      .catch((err) => {
        console.error('Failed to submit invoice:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <div>
      <Popup
        isVisible={true}
        title={t('inventory.uploadCSV.popup.title')}
        subtitle={t('inventory.uploadCSV.popup.subtitle')}
        onRequestClose={props.onCancelClick}
        scrollable={true}>
        <div className={styles.uploadIlmgValidation}>
          <img
            src={props.invoice.image}
            alt="invoice"
            className={styles.imgPreview}
          />
          <div className={styles.headerDocumentData}>
            <div className={styles.data}>
              <p className={styles.label}>Date:</p>
              <p className={styles.value}>{props.invoice.date}</p>
            </div>
            <div className={styles.data}>
              <p className={styles.label}>Supplier:</p>
              <p className={styles.value}>{props.invoice.supplier}</p>
            </div>
            <div className={styles.data}>
              <p className={styles.label}>Amount:</p>
              <p className={styles.value}>
                {formatCurrency(props.invoice.amount, currencyISO)}
              </p>
            </div>
          </div>
          <div className={styles.items}>
            {ingredientsValues.length > 0 &&
              props.invoice.ingredients.map((ing, index) => (
                <div key={index} className={styles.row}>
                  <p className={styles.name}>
                    {ing.detectedName}
                    {ingredientsValues[index] &&
                      ingredientsValues[index].inventoryIngredientRef &&
                      mustUpdateInventory && (
                        <span className={styles.quantities}>
                          ({t('ingredient:actualStock')} :{' '}
                          {
                            ingredientsValues[index].inventoryIngredientRef
                              ?.actualStock
                          }{' '}
                          {
                            ingredientsValues[index].inventoryIngredientRef
                              ?.unit
                          }
                          <i className="fa-solid fa-arrow-right"></i>
                          <span className={styles.newQuantity}>
                            {(
                              ingredientsValues[index].inventoryIngredientRef
                                ?.actualStock +
                              ingredientsValues[index].quantity
                            ).toFixed(2)}{' '}
                            {
                              ingredientsValues[index].inventoryIngredientRef
                                ?.unit
                            }
                          </span>
                          )
                        </span>
                      )}
                  </p>
                  <div className={styles.inputs}>
                    <div className={styles.select}>
                      <Select
                        size="large"
                        menuPosition="fixed"
                        placeholder={t('inventory.selectIngredient')}
                        options={ingredients}
                        isLoading={ingredientsLoading}
                        getOptionLabel={(opt) => opt.name}
                        getOptionValue={(opt) => opt.id}
                        value={ingredientsValues[index].inventoryIngredientRef}
                        isSearchable
                        isCreatable
                        isClearable
                        onCreateOption={handleCreateNewOption}
                        // formatCreateLabel={(inputValue) => 'create ingredient'}
                        getNewOptionData={(inputValue) => ({
                          id: 'new',
                          name: `Create '${inputValue}'`,
                          actualStock: 0,
                          supplier: '',
                          unit: '',
                          parLevel: 0,
                          unitCost: 0,
                        })}
                        maxMenuHeight={110}
                        onChange={(value) => {
                          handleIngredientsValuesChange(
                            index,
                            'inventoryIngredientRef',
                            value
                          );
                        }}
                      />
                    </div>
                    <LabeledInput
                      placeholder="Quantity"
                      type="number"
                      lighter
                      suffix={
                        ingredientsValues[index].inventoryIngredientRef?.unit
                      }
                      value={ingredientsValues[index].quantity?.toString()}
                      onChange={(val) =>
                        handleIngredientsValuesChange(
                          index,
                          'quantity',
                          +val.target.value
                        )
                      }
                    />
                    <LabeledInput
                      placeholder="Unit cost"
                      type="number"
                      step="0.01"
                      lighter
                      suffix={currencySymbol}
                      value={ingredientsValues[index].unitPrice?.toString()}
                      onChange={(val) =>
                        handleIngredientsValuesChange(
                          index,
                          'unitPrice',
                          +val.target.value
                        )
                      }
                    />
                    <LabeledInput
                      placeholder="Total cost"
                      type="number"
                      step="0.01"
                      lighter
                      suffix={currencySymbol}
                      value={ingredientsValues[index].totalPrice?.toString()}
                      onChange={(val) =>
                        handleIngredientsValuesChange(
                          index,
                          'totalPrice',
                          +val.target.value
                        )
                      }
                    />
                  </div>
                </div>
              ))}
          </div>
          {error && <span className="text-error">{error}</span>}
          <div className={styles.finalActions}>
            <div className={styles.updateInventory}>
              <Checkbox
                label="Update inventory stock with these ingredient quantity values"
                checked={mustUpdateInventory}
                onCheck={setMustUpdateInventory}
              />
            </div>
            <div className={styles.buttons}>
              <Button
                value={t('cancel')}
                type="secondary"
                onClick={props.onCancelClick}
              />
              <Button
                value={t('validate')}
                type="primary"
                onClick={handleValidClick}
                loading={loading}
              />
            </div>
          </div>
        </div>
      </Popup>
      <CreateIngredient
        isVisible={createIngredient !== null}
        toggle={() => setCreateIngredient(null)}
        onCreate={() => {
          setCreateIngredient(null);
          reload();
        }}
        preFilledName={createIngredient?.name}
        preFilledSupplier={props.invoice.supplier}
      />
    </div>
  );
};

export default UploadImgValidation;
