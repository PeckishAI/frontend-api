import { Button, LabeledInput, Popup, Select } from 'shared-ui';
import styles from './style.module.scss';
import { useTranslation } from 'react-i18next';
import { Ingredient, Invoice, inventoryService } from '../../../../services';
import { useIngredients } from '../../../../services/hooks';
import { useEffect, useState } from 'react';
import { useRestaurantCurrency } from '../../../../store/useRestaurantStore';
import CreateIngredient from '../../../../components/CreateIngredient/CreateIngredient';
import { useRestaurantStore } from '../../../../store/useRestaurantStore';

type Props = {
  data: Invoice;
  onCancelClick: () => void;
  onValideClick: () => void;
};

// type InvoiceIngredient = Omit<Invoice['items'][number], 'uuid' | 'mappedName'>;
type InvoiceIngredient = {
  mappingUUID?: string;
  mappingName?: string;
  detectedName?: string;
  quantity?: number;
  totalCost?: number;
  unit?: string;
  unitCost?: number;
};

const UploadImgValidation = (props: Props) => {
  const { t } = useTranslation(['common', 'ingredient']);

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

  useEffect(() => {
    setIngredientsValues(
      props.data.ingredients.map((ing) => ({
        mappingUUID: ing.uuid,
        mappingName: ing.mappedName,
        detectedName: ing.detectedName,
        quantity: ing.quantity,
        totalCost: ing.totalPrice,
        unitCost: ing.unitPrice,
        unit: ing.unit,
      }))
    );
  }, [props.data.ingredients]);

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

  const handleValidClick = async () => {
    const finalFormData: Invoice = {
      document_uuid: props.data.document_uuid,
      created_at: props.data.created_at,
      date: props.data.date,
      supplier: props.data.supplier,
      ingredients: ingredientsValues.map((ingVal) => ({
        ingredient_name: ingVal.detectedName,
        mapping_name: ingVal.mappingName,
        mapping_uuid: ingVal.mappingUUID,
        quantity: ingVal.quantity,
        unit: ingVal.unit,
        total_price: ingVal.totalCost,
      })),
      restaurant_uuid: selectedRestaurantUUID,
      path: props.data.path,
      amount: props.data.amount,
    };

    try {
      await inventoryService.submitInvoice(
        selectedRestaurantUUID,
        finalFormData
      );
      console.log('Invoice submitted successfully');
      props.onValideClick(); // Call the onValideClick prop to handle success
    } catch (error) {
      console.error('Failed to submit invoice:', error);
      // Handle error (e.g., show error message to the user)
    }
  };

  const { currencySymbol } = useRestaurantCurrency();

  console.log('mapped ing uuid : ', props.data.ingredients[0].uuid);
  console.log(ingredients.find((i) => i.id === props.data.ingredients[0].uuid));
  console.log(ingredientsValues[0]);

  return (
    <div>
      <Popup
        isVisible={true}
        title={t('inventory.uploadCSV.popup.title')}
        subtitle={t('inventory.uploadCSV.popup.subtitle')}
        onRequestClose={props.onCancelClick}>
        <div className={styles.uploadIlmgValidation}>
          <p className={styles.fixedValue}>
            Document ID: <span>{props.data.date}</span>
          </p>
          <p className={styles.fixedValue}>
            Date: <span>{props.data.date}</span>
          </p>
          <p className={styles.fixedValue}>
            Supplier : <span>{props.data.supplier}</span>
          </p>
          <p className={styles.fixedValue}>
            Amount: <span>{props.data.amount}</span>
          </p>
          <div className={styles.items}>
            {ingredientsValues.length > 0 &&
              props.data.ingredients.map((ing, index) => (
                <div key={index} className={styles.row}>
                  <p className={styles.name}>
                    {ing.detectedName}
                    {ingredientsValues[index] && (
                      <span className={styles.quantities}>
                        ({t('ingredient:actualStock')} :{' '}
                        {/* Use the actual stock value directly */}
                        {ingredientsValues[index].quantity}
                        {ing.unit}
                        <i className="fa-solid fa-arrow-right"></i>
                        <span className={styles.newQuantity}>
                          {/* Calculate new quantity here */}
                          {(
                            ingredientsValues[index].quantity + ing.quantity
                          ).toFixed(2)}
                          {ing.unit}
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
                        value={ingredients.find(
                          (ing) =>
                            ing.id === ingredientsValues[index].mappingUUID
                        )}
                        isSearchable
                        isCreatable
                        isClearable
                        onCreateOption={handleCreateNewOption}
                        getNewOptionData={(inputValue) => ({
                          id: 'new',
                          name: `Create '${inputValue}'`,
                          quantity: 0,
                          supplier: '',
                          unit: '',
                          safetyStock: 0,
                          unitCost: 0,
                        })}
                        maxMenuHeight={110}
                        onChange={(selectedOption) => {
                          handleIngredientsValuesChange(
                            index,
                            'mappingUUID',
                            selectedOption ? selectedOption.id : null
                          );
                          handleIngredientsValuesChange(
                            index,
                            'mappingName',
                            selectedOption ? selectedOption.name : ''
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
