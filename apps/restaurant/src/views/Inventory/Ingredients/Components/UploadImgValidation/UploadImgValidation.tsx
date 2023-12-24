import { Button, LabeledInput, Popup, Select } from 'shared-ui';
import styles from './style.module.scss';
import { useTranslation } from 'react-i18next';
import { Ingredient, Invoice, inventoryService } from '../../../../services';
import { useIngredients } from '../../../../services/hooks';
import { useEffect, useState } from 'react';
import { useRestaurantCurrency } from '../../../../store/useRestaurantStore';
import CreateIngredient from '../../../../components/CreateIngredient/CreateIngredient';

type Props = {
  data: Invoice;
  base64Image: string | null;
  selectedRestaurantUUID: string;
  onCancelClick: () => void;
  onValideClick: () => void;
};

// type InvoiceIngredient = Omit<Invoice['items'][number], 'uuid' | 'mappedName'>;
type InvoiceIngredient = {
  ingredient?: Ingredient | null;
  quantity?: number;
  totalCost?: number;
  unitCost?: number;
};

const UploadImgValidation = (props: Props) => {
  const { t } = useTranslation(['common', 'ingredient']);

  const { ingredients, loading: ingredientsLoading, reload } = useIngredients();

  // Form values
  const [ingredientsValues, setIngredientsValues] = useState<
    InvoiceIngredient[]
  >([]);
  const [createIngredient, setCreateIngredient] = useState<Ingredient | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIngredientsValues(
      props.data.ingredients.map<InvoiceIngredient>((ing) => ({
        ingredient: ingredients.find((i) => i.id === ing.uuid),
        quantity: ing.quantity,
        totalCost: ing.totalPrice,
        unitCost: ing.unitPrice
          ? ing.unitPrice
          : +((ing.totalPrice ?? 0) / (ing.quantity ?? 0)).toFixed(2),
      }))
    );
  }, [ingredients, props.data.ingredients]);

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
    let requestSucces = 0;
    ingredientsValues.forEach((ing) => {
      if (ing.ingredient?.id) {
        const ingToUpdate: Ingredient = ing.ingredient;
        ingToUpdate.quantity += ing.quantity ?? 0;
        ingToUpdate.unitCost = ing.unitCost ?? 0;
        inventoryService
          .updateIngredient(ingToUpdate)
          .then(() => {
            requestSucces++;
          })
          .catch((err) => console.log(err))
          .finally(() => {
            if (requestSucces === ingredientsValues.length)
              // means all requests perfomed successfully
              props.onValideClick();
          });
      } else {
        setError('Some ingredient not mapped.');
        return;
      }
    });
    if (props.base64Image) {
      inventoryService.submitInvoice(props.selectedRestaurantUUID, {
        ...props.data,
        base64Image: props.base64Image,
      });
    }
  };

  const { currencySymbol } = useRestaurantCurrency();

  return (
    <div>
      <Popup
        isVisible={true}
        title={t('inventory.uploadCSV.popup.title')}
        subtitle={t('inventory.uploadCSV.popup.subtitle')}
        onRequestClose={props.onCancelClick}>
        <div className={styles.uploadIlmgValidation}>
          <p className={styles.fixedValue}>
            Supplier : <span>{props.data.supplier}</span>
          </p>
          <div className={styles.items}>
            {ingredientsValues.length > 0 &&
              props.data.ingredients.map((ing, index) => (
                <div key={index} className={styles.row}>
                  <p className={styles.name}>
                    {ing.detectedName}
                    {ingredientsValues[index] &&
                      ingredientsValues[index].ingredient && (
                        <span className={styles.quantities}>
                          ({t('ingredient:actualStock')} :{' '}
                          {ingredientsValues[index].ingredient?.quantity}
                          {ingredientsValues[index].ingredient?.unit}
                          <i className="fa-solid fa-arrow-right"></i>
                          <span className={styles.newQuantity}>
                            {(
                              ingredientsValues[index].ingredient?.quantity +
                              ingredientsValues[index].quantity
                            ).toFixed(2)}
                            {ingredientsValues[index].ingredient?.unit}
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
                        value={ingredientsValues[index].ingredient}
                        isSearchable
                        isCreatable
                        isClearable
                        onCreateOption={handleCreateNewOption}
                        // formatCreateLabel={(inputValue) => 'create ingredient'}
                        getNewOptionData={(inputValue) => {
                          return {
                            id: 'new',
                            name: `Create '${inputValue}'`,
                            quantity: 0,
                            supplier: '',
                            unit: '',
                            safetyStock: 0,
                            unitCost: 0,
                          };
                        }}
                        maxMenuHeight={110}
                        onChange={(value) => {
                          handleIngredientsValuesChange(
                            index,
                            'ingredient',
                            value
                          );
                        }}
                      />
                    </div>
                    <LabeledInput
                      placeholder="Quantity"
                      type="number"
                      lighter
                      suffix={ingredientsValues[index].ingredient?.unit}
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
                      value={ingredientsValues[index].unitCost?.toString()}
                      onChange={(val) =>
                        handleIngredientsValuesChange(
                          index,
                          'unitCost',
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
                      value={ingredientsValues[index].totalCost?.toString()}
                      onChange={(val) =>
                        handleIngredientsValuesChange(
                          index,
                          'totalCost',
                          +val.target.value
                        )
                      }
                    />
                  </div>
                </div>
              ))}
          </div>
          {error && <span className="text-error">{error}</span>}

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
            />
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
        preFilledSupplier={props.data.supplier}
      />
    </div>
  );
};

export default UploadImgValidation;
