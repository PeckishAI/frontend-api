import {
  IconButton,
  SidePanel,
  Input,
  Select,
  Table,
  Button,
  LabeledInput,
  DialogBox,
  Loading,
} from 'shared-ui';
import styles from './style.module.scss';
import { Invoice, inventoryService } from '../../services';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { formatCurrency } from '../../utils/helpers';
import { useRestaurantCurrency } from '../../store/useRestaurantStore';
import { useForm, Controller } from 'react-hook-form';
import { useIngredients } from '../../services/hooks';
import { useRestaurantStore } from '../../store/useRestaurantStore';
import { toast } from 'react-hot-toast';
import Carousel from 'react-multi-carousel';
import 'react-multi-carousel/lib/styles.css';
import { FaCalendarAlt } from 'react-icons/fa';
import 'react-datepicker/dist/react-datepicker.css'; // Import DatePicker CSS
import DatePicker from 'react-datepicker';

type Props = {
  document: Invoice | null;
  isOpen: boolean;
  onRequestClose: () => void;
  onDocumentChanged: (document: Invoice, action: 'deleted' | 'updated') => void;
  onDeleteDocument: () => void;
  reloadDocuments: () => void;
};

type IngredientDetails = {
  detectedName?: string;
  mappedName?: string;
  mappedUUID?: string;
  quantity?: number;
  unitPrice?: number;
  unit?: string;
  totalPrice?: number;
  received_qty: number;
};

const DocumentDetail = (props: Props) => {
  const { t } = useTranslation(['common', 'ingredient']);
  const { currencyISO } = useRestaurantCurrency();
  const [confirmDeletePopup, setConfirmDeletePopup] = useState(false);
  const [editableDocument, setEditableDocument] = useState<Invoice | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const { control } = useForm();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const datePickerRef = useRef(null);

  const { ingredients, loading: loadingIngredients } = useIngredients();

  const ingredientOptions = ingredients.map((ingredient) => ({
    value: ingredient.id,
    label: ingredient.name,
  }));

  const selectedRestaurantUUID = useRestaurantStore(
    (state) => state.selectedRestaurantUUID
  );

  const handleDateChange = (date: Date | null) => {
    setSelectedDate(date);
    if (date) {
      const formattedDate = date.toLocaleDateString('en-CA');
      handleInputChange({ target: { value: formattedDate } }, 'date');
    } else {
      handleInputChange({ target: { value: '' } }, 'date');
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
    setIsEditMode((prevState) => !prevState); // Toggle edit mode state
    if (!isEditMode) {
      // Enter edit mode
      setEditableDocument(props.document);
      setShowDatePicker(false);
      setSelectedDate(
        props.document?.date ? new Date(props.document.date) : null
      );
    } else {
      // Exit edit mode
      setEditableDocument(null);
    }
  };

  const handleDocumentChange = (field: keyof Invoice, value: any) => {
    setEditableDocument((prevDocument) => {
      if (prevDocument === null) return null;

      return {
        ...prevDocument,
        [field]: value,
        ingredients: prevDocument.ingredients || [],
      };
    });
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: keyof Invoice
  ) => {
    const value = e.target.value;
    handleDocumentChange(field, value);
  };

  const handleIngredientChange = (
    index: number,
    field: keyof IngredientDetails,
    value: any
  ) => {
    if (!editableDocument || !editableDocument.ingredients) {
      console.error('Editable document or ingredients are undefined');
      return;
    }

    const updatedIngredients: IngredientDetails[] =
      editableDocument.ingredients.map((ing, idx) =>
        idx === index ? { ...ing, [field]: value } : ing
      );

    setEditableDocument({
      ...editableDocument,
      ingredients: updatedIngredients,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editableDocument) {
      const lastRow =
        editableDocument.ingredients[editableDocument.ingredients.length - 1];
      if (
        !lastRow.detectedName ||
        !lastRow.mappedName ||
        !lastRow.quantity ||
        !lastRow.unit ||
        !lastRow.unitPrice
      ) {
        toast.error('Please fill in all required fields in the last row.');
        return;
      }
      try {
        // Prepare the data for updating
        const updatedData = {
          date: editableDocument.date,
          supplier: editableDocument.supplier,
          amount: +editableDocument.amount,
          path: editableDocument.path,
          ingredients: editableDocument.ingredients.map((ing) => ({
            detectedName: ing.detectedName,
            mappedName: ing.mappedName,
            mappedUUID: ing.mappedUUID,
            received_qty: ing.received_qty ? +ing.received_qty : null,
            unitPrice: +ing.unitPrice,
            quantity: +ing.quantity,
            unit: ing.unit,
            totalPrice: +ing.totalPrice ? +ing.totalPrice : null,
          })),
        };
        setIsLoading(true);
        await inventoryService.updateDocument(
          selectedRestaurantUUID,
          editableDocument.documentUUID,
          editableDocument.supplier_uuid,
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

  const handleMappedNameChange = (index, selectedOption) => {
    if (!editableDocument || !editableDocument.ingredients) {
      console.error('Editable document or ingredients are undefined');
      return;
    }

    const updatedIngredients = [...editableDocument.ingredients];
    updatedIngredients[index].mappedName = selectedOption
      ? selectedOption.label
      : '';
    updatedIngredients[index].mappedUUID = selectedOption
      ? selectedOption.value
      : null;

    setEditableDocument({
      ...editableDocument,
      ingredients: updatedIngredients,
    });
  };

  const handleAddIngredient = () => {
    const newIngredient: IngredientDetails = {
      detectedName: '',
      mappedName: '',
      mappedUUID: '',
      quantity: 0,
      unit: '',
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
          lastRow.unit &&
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

  const viewColumns = [
    {
      key: 'detectedName',
      header: t('document.detectedName'),
      classname: 'column-bold',
    },
    {
      key: 'mappedName',
      header: t('document.givenName'),
      classname: 'column-bold',
    },
    {
      key: 'quantity',
      header: t('quantity'),
      classname: 'column-bold',
      renderItem: ({ row }) => `${row.quantity}`,
    },
    {
      key: 'received_qty',
      header: t('receivedQty'),
      classname: 'column-bold',
      renderItem: ({ row }) => `${row.received_qty}`,
    },
    {
      key: 'unit',
      header: t('unit'),
      classname: 'column-bold',
      renderItem: ({ row }) => `${row.unit}`,
    },
    {
      key: 'unitPrice',
      header: t('unitCost'),
      classname: 'column-bold',
      renderItem: ({ row }) => `${row.unitPrice}`,
    },
    {
      key: 'totalPrice',
      header: t('totalCost'),
      classname: 'column-bold',
      renderItem: ({ row }) =>
        row.totalPrice ? formatCurrency(row.totalPrice, currencyISO) : '-',
    },
  ];

  const editColumns = [
    {
      key: 'detectedName',
      header: t('document.detectedName'),
      classname: 'column-bold',
      renderItem: ({ row, index }) => (
        <Input
          type="text"
          min={0}
          placeholder={t('name')}
          className={styles.detectedNameInput}
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
      renderItem: ({ row, index }) => (
        <div style={{ width: 180 }}>
          <Controller
            name={`mappedName-${index}`}
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                options={ingredientOptions}
                className={styles.detectedNameInput}
                isClearable
                isSearchable
                maxMenuHeight={200}
                onChange={(selectedOption) => {
                  field.onChange(selectedOption);
                  handleMappedNameChange(index, selectedOption);
                }}
                value={ingredientOptions.find(
                  (option) =>
                    option.value ===
                    (editableDocument?.ingredients[index].mappedUUID ||
                      field.value)
                )}
              />
            )}
          />
        </div>
      ),
    },
    {
      key: 'quantity',
      header: t('quantity'),
      classname: 'column-bold',
      renderItem: ({ row, index }) => (
        <Input
          type="number"
          min={0}
          step="0.001"
          placeholder={t('quantity')}
          className={styles.quantity}
          onChange={(value) => handleIngredientChange(index, 'quantity', value)}
          value={editableDocument?.ingredients[index].quantity || ''}
        />
      ),
    },
    {
      key: 'received_qty',
      header: t('receivedQty'),
      classname: 'column-bold',
      renderItem: ({ row, index }) => (
        <Input
          type="number"
          min={0}
          placeholder={t('receivedQty')}
          className={styles.quantity}
          onChange={(value) =>
            handleIngredientChange(index, 'received_qty', value)
          }
          value={editableDocument?.ingredients[index].received_qty || ''}
        />
      ),
    },
    {
      key: 'unit',
      header: t('unit'),
      classname: 'column-bold',
      renderItem: ({ row, index }) => (
        <Input
          type="text"
          placeholder={t('unit')}
          className={styles.quantity}
          onChange={(value) => handleIngredientChange(index, 'unit', value)}
          value={editableDocument?.ingredients[index].unit || ''}
        />
      ),
    },
    {
      key: 'unitPrice',
      header: t('unitCost'),
      classname: 'column-bold',
      renderItem: ({ row, index }) => (
        <Input
          type="number"
          min={0}
          step="any"
          placeholder={t('unitCost')}
          className={styles.price}
          onChange={(value) =>
            handleIngredientChange(index, 'unitPrice', value)
          }
          value={editableDocument?.ingredients[index].unitPrice || ''}
        />
      ),
    },
    {
      key: 'totalPrice',
      header: t('totalCost'),
      classname: 'column-bold',
      renderItem: ({ row, index }) => (
        <Input
          type="number"
          step="any"
          placeholder={t('totalCost')}
          className={styles.price}
          onChange={(value) =>
            handleIngredientChange(index, 'totalPrice', value)
          }
          value={editableDocument?.ingredients[index].totalPrice || ''}
        />
      ),
    },
  ];

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

  return (
    <>
      <SidePanel
        isOpen={props.document !== null}
        scrollable={true}
        width="100%"
        onRequestClose={() => props.onRequestClose()}>
        {isEditMode ? (
          <div className={styles.documentDetail}>
            <form onSubmit={handleSubmit} className={styles.editForm}>
              {isLoading ? (
                <div className={styles.loader}>
                  <Loading size="large" />
                </div>
              ) : (
                <>
                  <div className={styles.flexContainer}>
                    {props?.document?.path?.length > 0 && (
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
                              <div
                                key={index}
                                className={styles.imageContainer}>
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

                    <div className={styles.scrollDiv}>
                      <div className={styles.headerData}>
                        <LabeledInput
                          type="text"
                          placeholder={t('ingredient:supplier')}
                          className={styles.input}
                          onChange={(e) => handleInputChange(e, 'supplier')}
                          value={editableDocument?.supplier || ''}
                        />
                        <LabeledInput
                          type="number"
                          min={0}
                          step={'any'}
                          suffix={currencyISO}
                          className={styles.input}
                          placeholder={t('price')}
                          onChange={(e) => handleInputChange(e, 'amount')}
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
                      </div>
                      <div>
                        <Table
                          data={editableDocument?.ingredients}
                          columns={isEditMode ? editColumns : viewColumns}
                          className={styles.table}
                        />
                        <p
                          className={styles.addIngredient}
                          onClick={handleAddIngredient}>
                          Add ingredient <i className="fa-solid fa-plus"></i>
                        </p>
                      </div>
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
                  </div>
                </>
              )}
            </form>
          </div>
        ) : (
          <div className={styles.documentDetail}>
            <div className={styles.flexContainer}>
              {props.document?.path?.length > 0 && (
                <div className={styles.carouselContainer}>
                  {props?.document?.path.length === 1 ? (
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
                      showDots={true}
                      responsive={responsive}
                      ssr={true}
                      infinite={true}
                      autoPlay={false}
                      keyBoardControl={true}
                      containerClass="carousel-container"
                      removeArrowOnDeviceType={['tablet', 'mobile']}
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

              <div className={styles.scrollDiv}>
                <div>
                  <div className={styles.editButton}>
                    <div className={styles.supplier}>
                      <p className={styles.name}>
                        {t('ingredient:supplier')}:
                        <span className={styles.value}>
                          {' '}
                          {props.document?.supplier}
                        </span>
                      </p>
                      <p className={styles.name}>
                        {t('price')}:
                        <span className={styles.value}>
                          {' '}
                          {formatCurrency(props.document?.amount, currencyISO)}
                        </span>
                      </p>
                      <p className={styles.name}>
                        {t('date')}:
                        <span className={styles.value}>
                          {' '}
                          {props.document?.date}
                        </span>
                      </p>
                    </div>
                    <div className={styles.flexContainer}>
                      <IconButton
                        icon={<i className="fa-solid fa-pen-to-square"></i>}
                        tooltipMsg={t('edit')}
                        onClick={toggleEditMode}
                      />
                      <IconButton
                        icon={<i className="fa-solid fa-trash"></i>}
                        tooltipMsg={t('delete')}
                        onClick={() => setConfirmDeletePopup(true)}
                      />
                    </div>
                  </div>
                </div>
                <Table
                  data={props.document?.ingredients}
                  columns={[
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
                    { key: 'unit', header: t('unit') },

                    {
                      key: 'unitPrice',
                      header: t('unitCost'),
                      renderItem: ({ row }) =>
                        row.unitPrice
                          ? formatCurrency(row.unitPrice, currencyISO)
                          : '-',
                    },
                    {
                      key: 'totalPrice',
                      header: t('totalCost'),
                      renderItem: ({ row }) =>
                        row.totalPrice
                          ? formatCurrency(row.totalPrice, currencyISO)
                          : '-',
                    },
                  ]}
                />
              </div>
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
          </div>
        )}
      </SidePanel>
    </>
  );
};

export default DocumentDetail;