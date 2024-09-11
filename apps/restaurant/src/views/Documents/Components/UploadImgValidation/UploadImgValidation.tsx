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
import { useEffect, useState, useMemo } from 'react';
import { useRestaurantCurrency } from '../../../../store/useRestaurantStore';
import CreateIngredient from '../../../../components/CreateIngredient/CreateIngredient';
import { useRestaurantStore } from '../../../../store/useRestaurantStore';
import { formatCurrency } from '../../../../utils/helpers';
import toast from 'react-hot-toast';
import Zoom from 'react-medium-image-zoom';
import 'react-medium-image-zoom/dist/styles.css';
import supplierService from '../../../../services/supplier.service';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css'; // Add this if needed for styling
import Carousel from 'react-multi-carousel'; // Assuming you are using react-multi-carousel
import 'react-multi-carousel/lib/styles.css';

type Props = {
  invoice: Invoice;
  onCancelClick: () => void;
  onValideClick: () => void;
  handleCloseUploader: () => void;
  uploadedFiles: File[];
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
  const [mustUpdateUCInventory, setMustUpdateUCInventory] = useState(false);
  const [loading, setLoading] = useState(false);
  const [supplierOptions, setSupplierOptions] = useState<Supplier[]>([]);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(
    null
  );
  const [invoiceDate, setInvoiceDate] = useState(null); // For the Date field
  const [invoiceAmount, setInvoiceAmount] = useState(null); // For the Amount

  const [loadedImagesCount, setLoadedImagesCount] = useState(0);

  const imageObjectUrls = useMemo(() => {
    return props.uploadedFiles.map((file) => URL.createObjectURL(file));
  }, [props.uploadedFiles]);

  // Clean up the object URLs when the component unmounts or when the files change
  useEffect(() => {
    return () => {
      imageObjectUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [imageObjectUrls]);

  useEffect(() => {
    supplierService
      .getRestaurantSuppliers(selectedRestaurantUUID)
      .then((suppliers) => {
        setSupplierOptions(suppliers);

        const supplierUUIDFromInvoices = props.invoice.invoices.map(
          (invoice) => invoice.supplier_uuid
        );
        const invoiceDates = props.invoice.invoices.map(
          (invoice) => invoice.date
        );
        const invoiceAmounts = props.invoice.invoices.map(
          (invoice) => invoice.amount.total
        );
        const totalAmount = invoiceAmounts.reduce((acc, curr) => acc + curr, 0);
        setInvoiceAmount(totalAmount);

        const matchedSupplier = suppliers.find((supplier) =>
          supplierUUIDFromInvoices.includes(supplier.uuid)
        );
        // Find the first valid date, ensure it's properly formatted
        const firstValidInvoiceDate = invoiceDates.find((date) =>
          date && !isNaN(new Date(date).getTime()) ? date : null
        );
        setInvoiceDate(
          firstValidInvoiceDate ? new Date(firstValidInvoiceDate) : null
        );

        setSelectedSupplier(matchedSupplier || null);
      });
  }, [selectedRestaurantUUID, props.invoice.invoices]);
  const handleImageLoad = () => {
    setLoadedImagesCount((prevCount) => prevCount + 1);
  };
  // useEffect(() => {
  //   if (totalImages) {
  //     setAllImagesLoaded(true);
  //   }
  // }, [totalImages]);

  const handleSupplierChange = (selectedOption: Supplier | null) => {
    setSelectedSupplier(selectedOption);
  };

  useEffect(() => {
    if (!props?.invoice || !props?.invoice?.invoices) {
      console.error('Invoice or invoices are undefined');
      return;
    }

    // Merging all ingredients from all invoices
    const allIngredientsValues = props?.invoice?.invoices.flatMap(
      (invoice) =>
        invoice?.ingredients?.map((ing) => ({
          inventoryIngredientRef: ingredients.find(
            (i) => i.id === ing.ingredient_uuid
          ),
          quantity: ing.quantity,
          totalPrice: ing.total_cost.total,
          unitPrice: ing.unit_cost.total,
          givenName: ing.given_name,
          unit: ing.unit,
        }))
    );

    if (ingredients) {
      setIngredientsValues(allIngredientsValues);
    }
  }, [ingredients, props.invoice]);

  const responsive = {
    desktop: {
      breakpoint: { max: 3000, min: 1024 },
      items: 1,
      slidesToSlide: 1, // Change as needed
    },
    tablet: {
      breakpoint: { max: 1024, min: 464 },
      items: 1,
    },
    mobile: {
      breakpoint: { max: 464, min: 0 },
      items: 1,
    },
  };

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
    // In case one of checkboxes to update inventory is checked
    // if (mustUpdateInventory || mustUpdateUCInventory) {
    //   let requestSucces = 0;
    //   ingredientsValues.forEach((ing) => {
    //     const ingToUpdate: Ingredient = {
    //       id: ing.inventoryIngredientRef?.id ?? '',
    //       name: ing.inventoryIngredientRef?.name ?? '',
    //       parLevel: ing.inventoryIngredientRef?.parLevel ?? 0,
    //       supplier: ing.inventoryIngredientRef?.supplier ?? '',
    //       unit: ing.inventoryIngredientRef?.unit ?? '',
    //       unitCost: ing.inventoryIngredientRef?.unitCost ?? 0,
    //       actualStock: ing.inventoryIngredientRef?.actualStock ?? 0,
    //     };
    //     if (mustUpdateInventory) {
    //       ingToUpdate.actualStock =
    //         (ing.inventoryIngredientRef?.actualStock ?? 0) +
    //         (ing.quantity ?? 0);
    //     }
    //     if (mustUpdateUCInventory) {
    //       ingToUpdate.unitCost =
    //         ing.unitPrice ?? ing.inventoryIngredientRef?.unitCost ?? 0;
    //     }
    //     if (ing.inventoryIngredientRef?.id) {
    //       inventoryService
    //         .updateIngredient(ingToUpdate)
    //         .then(() => {
    //           requestSucces++;
    //           props.handleCloseUploader();
    //         })
    //         .catch((err) => console.log(err))
    //         .finally(() => {
    //           props.handleCloseUploader();
    //           if (requestSucces !== ingredientsValues.length)
    //             // means not all requests perfomed successfully
    //             return;
    //         });
    //     } else {
    //       setError('Some ingredient not mapped.');
    //       return;
    //     }
    //   });
    // }
    const invoiceData = {
      invoice_number: props?.invoice?.invoice_number,
      ingredients: ingredientsValues.map((ing) => ({
        mappedUUID: ing.inventoryIngredientRef?.id ?? '',
        mapped_name: ing.inventoryIngredientRef?.name ?? ing.mappedName,
        given_name: ing.givenName,
        quantity: ing.quantity,
        unit: ing.inventoryIngredientRef?.unit ?? '',
        unitPrice: ing.unitPrice,
        totalPrice: ing.totalPrice,
      })),
      // Pass supplier data, either selected from dropdown or from props if no change
      supplier_name: selectedSupplier?.name || props.invoice.supplier_name,
      supplier_uuid: selectedSupplier?.uuid || props.invoice.supplier_uuid,
    };

    const aggrigateData = Object.values(props.invoice.invoices).flat();

    const invoiceDetails = aggrigateData.map((invoice) => ({
      date: invoice.date,
      supplier_name: invoice.supplier_name,
      supplier_uuid: invoice.supplier_uuid,
      amount: invoice.amount.total,
    }));

    if (invoiceDetails.length > 0) {
      const firstInvoice = invoiceDetails[0];
      invoiceData.date = invoiceDate || firstInvoice.date;
      // Pass the new amount if updated, otherwise use the original amount
      invoiceData.amount = invoiceAmount || firstInvoice.amount;
    }

    inventoryService
      .submitInvoice(selectedRestaurantUUID, invoiceData)
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
      {props?.invoice?.invoices.map((invoice, invoiceIndex) => (
        <div key={invoiceIndex} className={styles.flexContainer}>
          {invoiceIndex === 0 && (
            <div className={styles.imgPreviewContainer}>
              {props.uploadedFiles.length > 1 ? (
                <>
                  {/* {allImagesLoaded && ( */}
                  <>
                    <Carousel
                      swipeable={true}
                      draggable={true}
                      responsive={responsive}
                      ssr={true}
                      infinite={true}
                      autoPlay={false}
                      keyBoardControl={true}
                      containerClass="carousel-container"
                      dotListClass="custom-dot-list-style"
                      itemClass="carousel-item-padding-40-px">
                      {imageObjectUrls.map((objectUrl, index) => {
                        return (
                          <div key={index} className={styles.imageContainer}>
                            <Zoom zoomMargin={45}>
                              <img
                                className={styles.documentImage}
                                src={objectUrl}
                                alt={`Document image ${index + 1}`}
                                onLoad={handleImageLoad} // Handle image load
                              />
                            </Zoom>
                          </div>
                        );
                      })}
                    </Carousel>
                  </>
                  {/* )} */}
                </>
              ) : (
                <>
                  <Zoom zoomMargin={45}>
                    <img
                      src={imageObjectUrls[0]}
                      alt="invoice"
                      className={styles.imgPreview}
                      onLoad={handleImageLoad} // Handle single image load
                    />
                  </Zoom>
                </>
              )}
            </div>
          )}
          {invoiceIndex === 0 && (
            <div className={styles.uploadIlmgValidation}>
              <div className={styles.headerDocumentData}>
                <div className={styles.dataWrap}>
                  <div className={styles.data}>
                    <p className={styles.label}>Date:</p>
                    <span className={styles.value}>
                      {' '}
                      <DatePicker
                        className={styles.datePicker}
                        selected={invoiceDate}
                        onChange={(date) => setInvoiceDate(date)}
                        dateFormat="yyyy-MM-dd"
                        placeholderText="Select Date"
                      />
                    </span>
                  </div>
                  <div className={styles.data}>
                    <p className={styles.label}>Supplier:</p>
                    <span className={styles.value}>
                      <Select
                        size="large"
                        menuPosition="fixed"
                        placeholder={t('inventory.selectSupplier')}
                        options={supplierOptions}
                        isLoading={!supplierOptions.length}
                        getOptionLabel={(opt) => opt.name}
                        getOptionValue={(opt) => opt.uuid}
                        value={selectedSupplier}
                        isSearchable
                        isClearable
                        onChange={handleSupplierChange}
                        maxMenuHeight={110}
                      />
                    </span>
                  </div>
                  <div className={styles.data}>
                    <p className={styles.label}>Amount:</p>
                    <span className={styles.value}>
                      <LabeledInput
                        type="number"
                        value={invoiceAmount} // Use state for the editable amount
                        onChange={(e) => setInvoiceAmount(e.target.value)} // Update state on change
                        placeholder="Enter Amount"
                        step="0.01"
                        lighter
                      />
                    </span>
                  </div>
                </div>
              </div>
              <div className={styles.items}>
                {ingredientsValues.length > 0 &&
                  invoice.ingredients.map((ing, index) => (
                    <div key={index} className={styles.row}>
                      <div className={styles.staticInfo}>
                        <p className={styles.name}>{ing.given_name}</p>

                        {/* {ingredientsValues[index] &&
                        ingredientsValues[index].inventoryIngredientRef && (
                          <span className={styles.actualVal}>
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
                            <span className={styles.newVal}>
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
                        )} */}
                        {/* {ingredientsValues[index] &&
                        ingredientsValues[index].inventoryIngredientRef && (
                          <span className={styles.actualVal}>
                            ({t('ingredient:unitCost')} :{' '}
                            {formatCurrency(
                              ingredientsValues[index].inventoryIngredientRef
                                ?.unitCost,
                              currencyISO
                            )}
                            <i className="fa-solid fa-arrow-right"></i>
                            <span className={styles.newVal}>
                              {formatCurrency(
                                ingredientsValues[index].unitPrice,
                                currencyISO
                              )}
                            </span>
                            )
                          </span>
                        )} */}
                      </div>
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
                            value={
                              ingredientsValues[index].inventoryIngredientRef
                            }
                            isSearchable
                            isCreatable
                            isClearable
                            onCreateOption={handleCreateNewOption}
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
                            ingredientsValues[index].inventoryIngredientRef
                              ?.unit
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
                          value={ingredientsValues[
                            index
                          ].totalPrice?.toString()}
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
              {/* Ingredients Section */}

              {error && <span className="text-error">{error}</span>}
              <div className={styles.finalActions}>
                <div className={styles.updateInventory}>
                  {/* <Checkbox
                  label="Update inventory stock with these ingredient quantity values"
                  checked={mustUpdateInventory}
                  onCheck={setMustUpdateInventory}
                />
                <Checkbox
                  label="Update inventory unit cost with these ingredient unit cost values"
                  checked={mustUpdateUCInventory}
                  onCheck={setMustUpdateUCInventory}
                /> */}
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
          )}
        </div>
      ))}

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
