import './style.scss';
import { useTranslation } from 'react-i18next';
import { Button, Popup, Select } from 'shared-ui';
import { useEffect, useState } from 'react';
import { ColumnsNameMapping } from '../../../../../apps/restaurant/src/services';
import { useRestaurantStore } from '../../../../../apps/restaurant/src/store/useRestaurantStore';
import { toast } from 'react-hot-toast';
import supplierService, { LinkedSupplier, Supplier } from '../../../../../apps/restaurant/src/services/supplier.service';
import AddSupplierPopup from '../../../../../apps/restaurant/src/views/Inventory/Suppliers/components/AddSupplierPopup';

interface SelectOption {
  value: string;
  label: string;
  suplier: string;
}

type Props<T> = {
  data: {
    fileColumns: string[];
    detectedColumns: T;
  };
  file: File;
  onCancelClick: () => void;
  onUpload: (mappedColumns: T, data: any) => Promise<any>;
  uploadSuccess: () => void;
  getPreview: (mappedColumns: T) => Promise<T[]>;
  headers: {
    name: string;
    selector: keyof T;
  }[];
};

const UploadValidation = <
  T extends {
    [key: string]: string;
  },
>(
  props: Props<T>
) => {
  const { t } = useTranslation('common');

  const [headerValues, setHeaderValues] = useState<T>(
    (Object.keys(props.data.detectedColumns) as (keyof T)[]).reduce(
      (acc, key) => {
        acc[key] = props.data.detectedColumns[key] ?? '-';
        return acc;
      },
      {} as T
    )
  );

  const [preview, setPreview] = useState(false);
  const [previewData, setPreviewData] = useState<T[]>([]);
  const [supplier, setSupplierData] = useState<T[]>([]);
  const [selectedValues, setSelectedValues] = useState<{ [key: number]: SelectOption | null }>({});
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);

  const [showPopup, setShowPopup] = useState(false);
  const [editSupplier, setEditSupplier] = useState<LinkedSupplier | null>(
    null
  );
  const [popupMode, setPopupMode] = useState<'add' | 'edit'>('add');



  useEffect(() => {
    const uniqueSupplier = Array.from(new Map(previewData.map(item => [item.
      Supplier, item])).values());
    setSupplierData(uniqueSupplier)
  }, [previewData])

  const { restaurantUUID } = useRestaurantStore((state) => ({
    restaurantUUID: state.selectedRestaurantUUID,
    restaurants: state.restaurants,
  }));

  useEffect(() => {
    if (!restaurantUUID) return;

    fetchSuppliersAndSync();
  }, [restaurantUUID]);

  const fetchSuppliersAndSync = async () => {
    try {
      const data =
        await supplierService.getRestaurantSuppliers(restaurantUUID);
      setSuppliers(data);
      {
        connectedIntegrations && handleSync();
      }
    } catch (error) {
      console.error('Error fetching suppliers or syncing:', error);
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    }
  };



  const [error, setErrror] = useState(false);
  const selectedRestaurantUUID = useRestaurantStore(
    (state) => state.selectedRestaurantUUID
  );

  const getColumnNames = (): T | null => {
    return (Object.keys(headerValues) as Array<keyof T>).reduce(
      (previousValue, key) => {
        return { ...previousValue, [key]: headerValues[key] || 'N/A' };
      },
      headerValues
    );
  };

  const handleChange = (value: SelectOption | null, index: number, sup: string) => {
    console.log('sup', value);

    setSelectedValues((prevSelectedValues) => ({
      ...prevSelectedValues,
      [sup]: value
    }));
  };

  const handleValueChange = (field: keyof T, value: string) => {
    setHeaderValues((prevValues) => ({
      ...prevValues!,
      [field]: value,
    }));

    if (preview) setPreview(false);
  };

  const handlePreviewClick = () => {
    setPreview(!preview);
    if (preview || !selectedRestaurantUUID) return;

    const columnsNames = getColumnNames() as T;

    props
      .getPreview(columnsNames)
      .then((data) => {
        setPreviewData(data);
      })
      .catch((err) => {
        console.log('error : ', err);
      });
  };

  const handleValidClick = () => {
    if (headerValues !== null && selectedRestaurantUUID !== undefined) {
      const columnsNames = getColumnNames() as T;
      console.log('columnsNames', columnsNames)

      props
        .onUpload(columnsNames, selectedValues)
        .then(() => {
          setErrror(false);
          toast.success('ajout avec succes');
          props.uploadSuccess();
        })
        .catch((err) => {
          console.log('error : ', err);
          setErrror(true);
          toast.error('erreur produit');
        });
    }
  };

  useEffect(() => {
    if (!selectedRestaurantUUID) return;
    console.log('selectedRestaurantUUID', selectedRestaurantUUID)

    supplierService
      .getRestaurantSuppliers(selectedRestaurantUUID)
      .then((res) => {
        const suppliersList: Supplier[] = [];
        res.forEach((supplier) => {
          suppliersList.push(supplier);
        });
        setSuppliers(suppliersList);
      });
  }, [selectedRestaurantUUID]);

  const handleAddSupplierClick = () => {
    setPopupMode('add');
    setEditSupplier(null);
    setShowPopup(true);
  };

  return (
    <Popup
      isVisible={true}
      title={t('inventory.uploadCSV.popup.title')}
      subtitle={t('inventory.uploadCSV.popup.subtitle')}
      onRequestClose={props.onCancelClick}>
      <div className="upload-popup">
        <div className="headers">
          {props.headers.map((field) => (
            <div className="header" key={field.name}>
              <span>{field.name}</span>
              <Select
                isClearable
                placeholder={`Select ${field}`}
                options={props.data.fileColumns.map((option) => ({
                  value: option,
                  label: option,
                }))}
                value={{
                  value:
                    headerValues[field.selector as keyof ColumnsNameMapping],
                  label:
                    headerValues[field.selector as keyof ColumnsNameMapping],
                }}
                onChange={(value) =>
                  handleValueChange(field.selector, value?.value ?? '-')
                }
              />
            </div>
          ))}
        </div>
        <div className="preview-btn-container">
          <div className="preview-btn" onClick={handlePreviewClick}>
            <p>{t('preview')}</p>
            {preview ? (
              <i className="fa-solid fa-chevron-up"></i>
            ) : (
              <i className="fa-solid fa-magnifying-glass"></i>
            )}
          </div>
        </div>
        <div
          className="preview"
          style={preview ? { maxHeight: '150px', overflow: "auto" } : { maxHeight: 0 }}>
          <div className=''>
            {supplier && <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}><p style={{ marginBottom: "12px" }}>We have detected <strong>{supplier.length}</strong> new supllier</p>
              <Button
                type="primary"
                actionType="button"
                value={t('common:inventory.addSupplierBtn')}
                className="submit"
                onClick={() => handleAddSupplierClick()}
              /></div>
            }
            {
              supplier && supplier.map((item, index) => {
                return <div key={index} className='flex' style={{ marginBottom: "12px", }}>
                  <p style={{ minWidth: "120px" }}>{item?.Supplier}</p>
                  <Select
                    isClearable
                    placeholder="Select an option"
                    options={suppliers.map((option) => ({
                      value: option.uuid,
                      label: option.name,
                    }))}
                    value={selectedValues[item?.Supplier] || null}
                    onChange={(value) => handleChange(value as SelectOption | null, index, item?.Supplier)}
                  />

                </div>
              })
            }
          </div>
          <div className="table">
            <div className="row first-row">
              <span>{t('ingredient')}</span>
              <span>{t('quantity')}</span>
              <span>{t('unit')}</span>
              <span>{t('supplier')}</span>
              <span>{t('cost')}</span>
            </div>
            {previewData &&
              previewData.map((data: Record<string, string>, index) => (
                <div className="row" key={`row-${index}`}>
                  <span key={`ingredient-${index}`}>
                    {data[headerValues.ingredient]}
                  </span>
                  <span key={`quantity-${index}`}>
                    {data[headerValues.quantity]}
                  </span>
                  <span key={`unit-${index}`}>{data[headerValues.unit]}</span>
                  <span key={`supplier-${index}`}>
                    {data[headerValues.supplier]}
                  </span>
                  <span key={`cost-${index}`}>{data[headerValues.cost]}</span>
                </div>
              ))}
          </div>
        </div>

        {error && (
          <span className="text-error">
            {t('error.trigger')}. {t('error.tryLater')}
          </span>
        )}

        <div className="button-container">
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
      <AddSupplierPopup
        isVisible={showPopup}
        fetchSuppliersAndSync={fetchSuppliersAndSync}
        onRequestClose={() => setShowPopup(false)}
        onSupplierAdded={(supplier) => {
          setSuppliers((suppliers) => [
            ...suppliers,
            {
              ...supplier,
              uuid: Math.random().toString(),
              linked: false,
              linkedAt: new Date(),
            },
          ]);
        }}
        onSupplierUpdated={(updatedSupplier) => {
          setSuppliers((prev) =>
            prev.map((supplier) =>
              supplier.uuid === updatedSupplier.uuid
                ? updatedSupplier
                : supplier
            )
          );
        }}
        editSupplier={editSupplier}
        mode={popupMode}
      />
    </Popup>
  );
};

export default UploadValidation;
