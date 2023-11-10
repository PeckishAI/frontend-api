import './style.scss';
import { useTranslation } from 'react-i18next';
import { Button, Popup, Select } from 'shared-ui';
import { useState } from 'react';
import {
  ColumnsNameMapping,
  inventoryService,
} from '../../../../../apps/restaurant/src/services';
import { useRestaurantStore } from '../../../../../apps/restaurant/src/store/useRestaurantStore';

type Props<T> = {
  data: {
    fileColumns: string[];
    detectedColumns: T;
  };
  file: File;
  onCancelClick: () => void;
  onValidateClick: () => void;

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

      inventoryService
        .validUploadedCsv(selectedRestaurantUUID, props.fileCsv, columnsNames)
        .then(() => {
          setErrror(false);
          props.onValidateClick();
          console.log('no error');
        })
        .catch((err) => {
          console.log('error : ', err);
          setErrror(true);
        });
    }
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
          style={preview ? { maxHeight: '200px' } : { maxHeight: 0 }}>
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
    </Popup>
  );
};

export default UploadValidation;
