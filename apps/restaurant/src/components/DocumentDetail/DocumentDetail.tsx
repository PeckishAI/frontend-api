import { useEffect, useMemo, useRef, useState } from 'react';
import { DatePicker } from 'shared-ui';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import Carousel from 'react-multi-carousel';
import 'react-multi-carousel/lib/styles.css';
import {
  Button,
  DialogBox,
  IconButton,
  Input,
  LabeledInput,
  Loading,
  Select,
  SidePanel,
  Table,
  useLockBodyScroll,
} from 'shared-ui';
import {
  FormDocument,
  Invoice,
  InvoiceIngredient,
  Unit,
  inventoryService,
} from '../../services';
import { useIngredients } from '../../services/hooks';
import supplierService, {
  LinkedSupplier,
} from '../../services/supplier.service';
import {
  useRestaurantCurrency,
  useRestaurantStore,
} from '../../store/useRestaurantStore';
import { formatCurrency } from '../../utils/helpers';
import styles from './style.module.scss';
import { FaCalendarAlt } from 'react-icons/fa';
import { DropdownOptionsDefinitionType } from 'shared-ui/components/Dropdown/Dropdown';
import { ColumnDefinitionType } from 'shared-ui/components/Table/Table';
import SupplierNew from '../../views/Inventory/Suppliers/components/SupplierNew';
import classNames from 'classnames';
import { Tooltip } from 'react-tooltip';
import dayjs from 'dayjs';
import UnitSelect from '../UnitSelect/UnitSelect';

type Props = {
  document: Invoice | null;
  isOpen: boolean;
  onRequestClose: () => void;
  onDocumentChanged: (document: Invoice, action: 'deleted' | 'updated') => void;
  onDeleteDocument: () => void;
  reloadDocuments: () => void;
};

const DocumentDetail = (props: Props) => {
  useLockBodyScroll(props.isOpen);

  const { t } = useTranslation(['common', 'ingredient']);
  const selectedRestaurantUUID = useRestaurantStore(
    (state) => state.selectedRestaurantUUID
  );
  const { currencyISO, currencySymbol } = useRestaurantCurrency();
  const [confirmDeletePopup, setConfirmDeletePopup] = useState(false);
  const [editableDocument, setEditableDocument] = useState<Invoice | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const datePickerRef = useRef(null);

  const handleDateChange = (date: Date | null) => {
    setSelectedDate(date);
    if (date) {
      const formattedDate = date.toLocaleDateString('en-CA');
      handleInputChange(formattedDate, 'date');
    } else {
      handleInputChange('', 'date');
    }
  };

  const handleCalendarIconClick = () => {
    setShowDatePicker((prev) => !prev);
  };

  useEffect(() => {
    if (props.document?.date) {
      setSelectedDate(new Date(props.document.date));
    }
  }, [props.document]);

  const toggleEditMode = () => {
    setIsEditMode((prevState) => !prevState);
    if (!isEditMode) {
      setEditableDocument(props.document);
      setShowDatePicker(false);
      setSelectedDate(
        props.document?.date ? new Date(props.document.date) : null
      );
    } else {
      setEditableDocument(null);
      setSelectedDate(null);
    }
  };

  const { ingredients, loading: loadingIngredients } = useIngredients();
  const [units, setUnits] = useState<Unit[]>([]);
  const [showAddPopup, setShowAddPopup] = useState(false);
  const [suppliers, setSuppliers] = useState<LinkedSupplier[]>([]);
  const [newInputAdd, setNewInputAdd] = useState('');

  const loadUnits = () => {
    if (!selectedRestaurantUUID) return;

    inventoryService
      .getUnits(selectedRestaurantUUID)
      .then((res) => {
        setUnits(res);
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        // setLoadingData(false);
      });
  };

  const ingredientOptions = ingredients.map((ingredient) => ({
    value: ingredient.id,
    label: ingredient.name,
  }));

  const handleInputChange = (
    value: string | number,
    field: keyof Invoice = 'supplier'
  ) => {
    console.log('Selected value:', value);

    setEditableDocument((prevDocument) => {
      if (prevDocument === null) return null;

      return {
        ...prevDocument,
        [field]: value,
        ingredients: prevDocument.ingredients || [],
      };
    });
  };

  const handleIngredientChange = (
    index: number,
    field: keyof InvoiceIngredient,
    value?: string | number
  ) => {
    if (!editableDocument || !editableDocument.ingredients) {
      console.error('Editable document or ingredients are undefined');
      return;
    }

    const updatedIngredients: InvoiceIngredient[] =
      editableDocument.ingredients.map((ing, idx) =>
        idx === index ? { ...ing, [field]: value } : ing
      );

    setEditableDocument({
      ...editableDocument,
      ingredients: updatedIngredients,
    });
  };

  const handleMappedNameChange = (
    index: number,
    name?: string,
    uuid?: string
  ) => {
    if (!editableDocument || !editableDocument.ingredients) {
      console.error('Editable document or ingredients are undefined');
      return;
    }

    const updatedIngredients = [...editableDocument.ingredients];
    updatedIngredients[index].mappedName = name || '';
    updatedIngredients[index].mappedUUID = uuid || undefined;

    setEditableDocument({
      ...editableDocument,
      ingredients: updatedIngredients,
    });
  };

  const fetchSuppliers = () => {
    if (!selectedRestaurantUUID) return;

    supplierService
      .getRestaurantSuppliers(selectedRestaurantUUID)
      .then((res) => {
        setSuppliers(res);
      })
      .catch((error) => {
        console.error('Error fetching suppliers:', error);
      });
  };

  useEffect(() => {
    fetchSuppliers();
    loadUnits();
  }, [selectedRestaurantUUID]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (editableDocument) {
      const lastRow =
        editableDocument.ingredients[editableDocument.ingredients.length - 1];

      // Validate the last row before submission
      if (
        !lastRow.detectedName ||
        !lastRow.mappedName ||
        !lastRow.quantity ||
        !lastRow.unit_uuid ||
        !lastRow.unitPrice
      ) {
        toast.error('Please fill in all required fields in the last row.');
        return;
      }

      try {
        // Prepare the data for updating
        const updatedData = {
          date: editableDocument.date,
          supplier: selectedSupplier?.label || editableDocument.supplier,
          supplier_uuid:
            selectedSupplier?.value || editableDocument.supplier_uuid,
          amount: +editableDocument.amount,
          path: editableDocument.path,
          ingredients: editableDocument.ingredients.map((ing) => ({
            detectedName: ing.detectedName,
            mappedName: ing.mappedName,
            mappedUUID: ing.mappedUUID,
            received_qty: ing.received_qty ? +ing.received_qty : null,
            unitPrice: +ing.unitPrice,
            quantity: +ing.quantity,
            unit_uuid: ing.unit_uuid,
            totalPrice: +ing.totalPrice ? +ing.totalPrice : null,
          })),
        } satisfies FormDocument;

        setIsLoading(true);

        // Call the update API with the updated data
        await inventoryService.updateDocument(
          selectedRestaurantUUID,
          editableDocument.documentUUID,
          updatedData
        );

        setIsLoading(false);
        toast.success('Document updated successfully');
        setIsEditMode(false);
        setEditableDocument(null);
        props.reloadDocuments();

        if (props.onDocumentChanged) {
          props.onDocumentChanged(editableDocument, 'updated');
        }
      } catch (error) {
        setIsLoading(false);
        console.error('Failed to update document:', error);
      }
    }
  };

  const handleAddIngredient = () => {
    const newIngredient: InvoiceIngredient = {
      detectedName: '',
      mappedName: '',
      mappedUUID: '',
      quantity: 0,
      unit_uuid: '',
      unitPrice: 0,
      received_qty: 0,
      totalPrice: 0,
    };

    if (editableDocument && editableDocument.ingredients) {
      // Check if there are any existing rows
      if (editableDocument.ingredients.length > 0) {
        const lastRow =
          editableDocument.ingredients[editableDocument.ingredients.length - 1];

        // Ensure the last row is fully filled out before allowing a new row to be added
        if (
          lastRow &&
          lastRow.detectedName &&
          lastRow.mappedName &&
          lastRow.quantity &&
          lastRow.unit_uuid &&
          lastRow.unitPrice
        ) {
          // Add the new row
          const updatedIngredientsList = [
            ...editableDocument.ingredients,
            newIngredient,
          ];
          setEditableDocument((prevDocument) => ({
            ...prevDocument,
            ingredients: updatedIngredientsList,
          }));
        } else {
          toast.error(
            'Please fill in all fields in the current row before adding a new row'
          );
        }
      } else {
        // No rows exist, so add the first row without checking
        const updatedIngredientsList = [newIngredient];
        setEditableDocument((prevDocument) => ({
          ...prevDocument,
          ingredients: updatedIngredientsList,
        }));
      }
    } else {
      console.error('Editable document or ingredients are undefined');
    }
  };

  useEffect(() => {
    setIsEditMode(false); // Reset edit mode
    setEditableDocument(null); // Clear editable document
  }, [props.document]);

  const getUnitLabel = (unitUUID?: string) => {
    if (!unitUUID) return '';
    const unit = units.find((unit) => unit.unit_uuid === unitUUID);
    return unit ? unit.unit_name : '';
  };

  const viewColumns = [
    { key: 'detectedName', header: t('document.detectedName') },
    { key: 'mappedName', header: t('document.givenName') },
    {
      key: 'quantity',
      header: t('quantity'),
      renderItem: ({ row }) => `${row.quantity}`,
    },
    {
      key: 'received_qty',
      header: t('receivedQty'),
      renderItem: ({ row }) => `${row.received_qty}`,
    },
    {
      key: 'unit_uuid',
      header: t('unit'),
      renderItem: ({ row }) => {
        const unit = units.find((unit) => unit.unit_uuid === row.unit_uuid);
        return unit ? unit.unit_name : '-';
      },
    },
    {
      key: 'unitPrice',
      header: t('unit'),
      renderItem: ({ row }) =>
        row.unitPrice ? formatCurrency(row.unitPrice, currencyISO) : '-',
    },
    {
      key: 'totalPrice',
      header: t('totalCost'),
      renderItem: ({ row }) =>
        row.totalPrice ? formatCurrency(row.totalPrice, currencyISO) : '-',
    },
  ] as ColumnDefinitionType<InvoiceIngredient, keyof InvoiceIngredient>[];

  const editColumns = [
    {
      key: 'detectedName',
      header: t('document.detectedName'),
      classname: 'column-bold',
      renderItem: ({ index }) => (
        <Input
          type="text"
          min={0}
          placeholder={t('name')}
          className={styles.mappedNameInput}
          onChange={(value) =>
            handleIngredientChange(index, 'detectedName', value)
          }
          value={editableDocument?.ingredients[index].detectedName || ''}
        />
      ),
    },
    {
      key: 'mappedName',
      header: t('document.givenName'),
      classname: 'column-bold',
      renderItem: ({ index }) => (
        <div className={styles.detectedNameInput}>
          <Select
            options={ingredientOptions}
            className={styles.detectedNameInput}
            isClearable
            isSearchable
            maxMenuHeight={200}
            onChange={(selectedOption) => {
              handleMappedNameChange(
                index,
                selectedOption?.label,
                selectedOption?.value
              );
            }}
            value={ingredientOptions.find(
              (option) =>
                option.value === editableDocument?.ingredients[index].mappedUUID
            )}
          />
        </div>
      ),
    },
    {
      key: 'quantity',
      header: t('quantity'),
      classname: 'column-bold',
      renderItem: ({ index }) => (
        <Input
          type="number"
          min={0}
          step="0.001"
          placeholder={t('quantity')}
          className={styles.quantity}
          onChange={(value) => handleIngredientChange(index, 'quantity', value)}
          value={editableDocument?.ingredients[index].quantity || ''}
          suffix={getUnitLabel(editableDocument?.ingredients[index].unit_uuid)}
        />
      ),
    },
    {
      key: 'received_qty',
      header: t('receivedQty'),
      classname: 'column-bold',
      renderItem: ({ index }) => (
        <Input
          type="number"
          min={0}
          max={editableDocument?.ingredients[index].quantity}
          placeholder={t('receivedQty')}
          className={styles.quantity}
          onChange={(value) =>
            handleIngredientChange(index, 'received_qty', value)
          }
          value={editableDocument?.ingredients[index].received_qty || ''}
          suffix={getUnitLabel(editableDocument?.ingredients[index].unit_uuid)}
        />
      ),
    },
    {
      key: 'unit_uuid',
      header: t('unit'),
      classname: 'column-bold',
      renderItem: ({ index }) => (
        <div className={styles.unitInput}>
          <UnitSelect
            onChange={(unit) => {
              handleIngredientChange(index, 'unit_uuid', unit?.unit_uuid);
            }}
            value={editableDocument?.ingredients[index].unit_uuid}
          />
        </div>
      ),
    },
    {
      key: 'unitPrice',
      header: t('unitCost'),
      classname: 'column-bold',
      renderItem: ({ index }) => (
        <Input
          type="number"
          min={0}
          placeholder={t('unitCost')}
          className={styles.price}
          onChange={(value) =>
            handleIngredientChange(index, 'unitPrice', value)
          }
          value={editableDocument?.ingredients[index].unitPrice || ''}
          suffix={currencySymbol}
        />
      ),
    },
    {
      key: 'totalPrice',
      header: t('totalCost'),
      classname: 'column-bold',
      renderItem: ({ index }) => (
        <Input
          type="number"
          placeholder={t('totalCost')}
          className={styles.price}
          onChange={(value) =>
            handleIngredientChange(index, 'totalPrice', value)
          }
          value={editableDocument?.ingredients[index].totalPrice || ''}
          suffix={currencySymbol}
        />
      ),
    },
  ] satisfies ColumnDefinitionType<
    InvoiceIngredient,
    keyof InvoiceIngredient
  >[];

  const responsive = {
    desktop: {
      breakpoint: { max: 3000, min: 1024 },
      items: 1,
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

  const options = suppliers.map((supplier) => ({
    label: supplier.name || '',
    value: supplier.uuid || '',
  })) satisfies DropdownOptionsDefinitionType[];

  const [selectedSupplier, setSelectedSupplier] =
    useState<DropdownOptionsDefinitionType | null>(null);
  // This useEffect can be used to set the selected supplier from props if needed
  useEffect(() => {
    if (props.document?.supplier) {
      setSelectedSupplier({
        label: props.document.supplier,
        value: props.document.supplier_uuid || props.document.supplier, // assuming supplier_uuid is available
      });
    }
  }, [props.document?.supplier]);

  const calculatedTotalCost = useMemo(() => {
    if (isEditMode) {
      return editableDocument?.ingredients.reduce(
        (acc, ing) => acc + +(ing.totalPrice || 0),
        0
      );
    } else {
      return props.document?.ingredients.reduce(
        (acc, ing) => acc + +(ing.totalPrice || 0),
        0
      );
    }
  }, [editableDocument?.ingredients, props.document?.ingredients, isEditMode]);

  return (
    <>
      <SidePanel
        isOpen={props.document !== null}
        scrollable={true}
        width="100%"
        onRequestClose={() => props.onRequestClose()}>
        <div className={styles.documentDetail}>
          <form onSubmit={handleSubmit} className={styles.form}>
            {isLoading ? (
              <div className={styles.loader}>
                <Loading size="large" />
              </div>
            ) : (
              <>
                <div className={styles.flexContainer}>
                  {props.document?.path && props.document?.path?.length > 0 && (
                    <div className={styles.carouselContainer}>
                      {props.document.path.length === 1 ? (
                        <div className={styles.imageContainer}>
                          <img
                            className={styles.documentImage}
                            src={props.document.path[0]}
                            alt="Document image"
                          />
                        </div>
                      ) : (
                        <Carousel
                          swipeable={true}
                          draggable={false}
                          responsive={responsive}
                          ssr={true}
                          infinite={true}
                          autoPlay={false}
                          keyBoardControl={true}
                          containerClass="carousel-container"
                          dotListClass="custom-dot-list-style"
                          itemClass="carousel-item-padding-40-px">
                          {props.document.path.map((image, index) => (
                            <div key={index} className={styles.imageContainer}>
                              <img
                                className={styles.documentImage}
                                src={image}
                                alt={`Document image ${index + 1}`}
                              />
                            </div>
                          ))}
                        </Carousel>
                      )}
                    </div>
                  )}

                  <div className={styles.rightPart}>
                    <div className={styles.scrollDiv}>
                      <div
                        className={classNames(
                          styles.header,
                          isEditMode && styles.editing
                        )}>
                        {isEditMode ? (
                          <>
                            <Select
                              size="large"
                              isCreatable
                              isClearable
                              options={options}
                              className={styles.input}
                              placeholder="Enter or select a supplier"
                              noOptionsMessage={({ inputValue }) =>
                                inputValue !== ''
                                  ? `Add "${inputValue}" as new supplier`
                                  : 'No options'
                              }
                              value={selectedSupplier}
                              onChange={(selectedOption, actionMeta) => {
                                if (selectedOption === null) {
                                  handleInputChange('', 'supplier');
                                  setSelectedSupplier(null);
                                  return;
                                }

                                if (actionMeta.action === 'create-option') {
                                  setShowAddPopup(true);
                                  handleInputChange(
                                    selectedOption.label,
                                    'supplier'
                                  );
                                  setNewInputAdd(selectedOption.label);
                                  setSelectedSupplier(null);
                                } else if (selectedOption) {
                                  handleInputChange(
                                    selectedOption.value,
                                    'supplier'
                                  );
                                  setSelectedSupplier(selectedOption);
                                } else {
                                  setSelectedSupplier(null);
                                }
                              }}
                            />

                            <LabeledInput
                              lighter
                              type="number"
                              min={0}
                              step={'any'}
                              suffix={currencySymbol}
                              className={styles.input}
                              placeholder={t('document.scannedPrice')}
                              onChange={(e) =>
                                handleInputChange(e.target.value, 'amount')
                              }
                              value={editableDocument?.amount}
                            />

                            {showDatePicker && (
                              <DatePicker
                                ref={datePickerRef}
                                selected={selectedDate}
                                onChange={handleDateChange}
                                dateFormat="yyyy-MM-dd"
                                placeholderText={'Select a Date'}
                                className={styles.datePicker}
                                isClearable
                                showPopperArrow={false}
                                onClickOutside={() => setShowDatePicker(false)}
                              />
                            )}
                            {!showDatePicker && (
                              <FaCalendarAlt
                                className={styles.calendarIcon}
                                onClick={handleCalendarIconClick}
                              />
                            )}
                          </>
                        ) : (
                          <>
                            <div className={styles.informationsWrapper}>
                              <div className={styles.headerFirstRow}>
                                <div>
                                  <div className={styles.supplier}>
                                    <i className="fa-solid fa-truck" />
                                    <p className={styles.value}>
                                      {props.document?.supplier}
                                    </p>
                                  </div>
                                  <p className={styles.date}>
                                    {dayjs(props.document?.date).calendar()}
                                  </p>
                                </div>

                                <div className={styles.flexContainer}>
                                  <IconButton
                                    icon={
                                      <i className="fa-solid fa-pen-to-square"></i>
                                    }
                                    tooltipMsg={t('edit')}
                                    onClick={toggleEditMode}
                                    tooltipId="documents-side-panel"
                                  />
                                  <IconButton
                                    icon={<i className="fa-solid fa-trash"></i>}
                                    tooltipMsg={t('delete')}
                                    onClick={() => setConfirmDeletePopup(true)}
                                    tooltipId="documents-side-panel"
                                  />
                                </div>
                              </div>

                              <div className={styles.informations}>
                                <p className={styles.name}>
                                  {t('document.scannedPrice')}:
                                  <span className={styles.value}>
                                    {' '}
                                    {formatCurrency(
                                      props.document?.amount,
                                      currencyISO
                                    )}
                                  </span>
                                </p>
                                <p className={styles.name}>
                                  {t('document.calculatedPrice')}:
                                  <span className={styles.value}>
                                    {formatCurrency(
                                      calculatedTotalCost,
                                      currencyISO
                                    )}
                                  </span>
                                </p>
                              </div>
                            </div>
                          </>
                        )}
                      </div>

                      <div>
                        <Table
                          data={
                            isEditMode
                              ? editableDocument?.ingredients
                              : props.document?.ingredients
                          }
                          columns={isEditMode ? editColumns : viewColumns}
                          className={styles.table}
                        />
                        {isEditMode && (
                          <p
                            className={styles.addIngredient}
                            onClick={handleAddIngredient}>
                            Add ingredient <i className="fa-solid fa-plus"></i>
                          </p>
                        )}
                      </div>
                    </div>

                    {isEditMode && (
                      <div className={styles.footerContainer}>
                        <p className={styles.total}>
                          <i
                            className={`fa-solid fa-hand-holding-dollar ${styles.cost}`}></i>
                          {t('document.calculatedPrice')}:{' '}
                          <span className={styles.value}>
                            {formatCurrency(calculatedTotalCost, currencyISO)}
                          </span>
                        </p>

                        <div className={styles.buttonsContainer}>
                          <Button
                            type="secondary"
                            actionType="button"
                            value={t('cancel')}
                            onClick={toggleEditMode}
                          />
                          <Button
                            type="primary"
                            actionType="submit"
                            value={t('document.save')}
                            className={styles.button}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </form>
        </div>

        <DialogBox
          type="warning"
          msg="Delete document"
          subMsg="Do you want to delete this document?"
          isOpen={confirmDeletePopup}
          onRequestClose={() => setConfirmDeletePopup(false)}
          onConfirm={() => {
            props.onDeleteDocument();
            setConfirmDeletePopup(false);
          }}
        />

        <SupplierNew
          isVisible={showAddPopup}
          onRequestClose={() => setShowAddPopup(false)}
          onNew={newInputAdd}
          onSupplierNew={() => {}}
          fetchSuppliers={fetchSuppliers}
        />

        <Tooltip className="tooltip" id="documents-side-panel" />
      </SidePanel>
    </>
  );
};

export default DocumentDetail;
