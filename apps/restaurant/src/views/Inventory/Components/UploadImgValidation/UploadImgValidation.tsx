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

type InvoiceIngredient = {
  mappingUUID?: string;
  mappingName?: string;
  detectedName?: string;
  quantity?: number;
  totalPrice?: number;
  unit?: string;
  unitPrice?: number;
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
  const [error] = useState<string | null>(null);

  useEffect(() => {
    setIngredientsValues(
      props.data.ingredients.map((ing) => ({
        mappingUUID: ing.mappedUUID,
        mappingName: ing.mappedName,
        detectedName: ing.detectedName,
        quantity: ing.quantity,
        totalPrice: ing.totalPrice,
        unitPrice: ing.unitPrice,
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
    console.log(props.data.image);
    const finalFormData: Invoice = {
      documentUUID: props.data.documentUUID,
      created_at: props.data.created_at,
      date: props.data.date,
      supplier: props.data.supplier,
      image: props.data.image,
      ingredients: ingredientsValues.map((ingVal) => ({
        ingredient_name: ingVal.detectedName,
        mapping_name: ingVal.mappingName,
        mapping_uuid: ingVal.mappingUUID,
        quantity: ingVal.quantity,
        unit: ingVal.unit,
        total_price: ingVal.totalPrice,
      })),
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
            src={props.data.image}
            alt="invoice"
            className={styles.imgPreview}
          />
          <div className={styles.headerDocumentData}>
            <p className={styles.fixedValue}>
              <b>Document ID:</b> <span>{props.data.date}</span>
            </p>
            <p className={styles.fixedValue}>
              <b>Date:</b> <span>{props.data.date}</span>
            </p>
            <p className={styles.fixedValue}>
              <b>Supplier :</b> <span>{props.data.supplier}</span>
            </p>
            <p className={styles.fixedValue}>
              <b>Amount:</b>{' '}
              <span>
                {currencySymbol}
                {props.data.amount}
              </span>
            </p>
          </div>
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
                        // formatCreateLabel={(inputValue) => 'create ingredient'}
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
                            selectedOption ? selectedOption.id : undefined
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
                      suffix={ingredientsValues[index].unit}
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
