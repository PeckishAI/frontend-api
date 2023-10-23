import './style.scss';
import { useTranslation } from 'react-i18next';
import { Button, Popup, Select } from 'shared-ui';
import { useState } from 'react';
import {
  ColumnsNameMapping,
  PreviewResponse,
  inventoryService,
} from '../../../../../apps/restaurant/src/services';
import { useRestaurantStore } from '../../../../../apps/restaurant/src/store/useRestaurantStore';

type Props = {
  fileCsv: File;
  extractedData: PreviewResponse;
  onCancelClick: () => void;
  onValidateClick: () => void;
};

const UploadCsv = (props: Props) => {
  const { t } = useTranslation('common');

  const [headerValues, setHeaderValues] = useState<ColumnsNameMapping>({
    ingredient: props.extractedData.detected_columns.ingredient ?? '-',
    quantity: props.extractedData.detected_columns.quantity ?? '-',
    unit: props.extractedData.detected_columns.unit ?? '-',
    supplier: props.extractedData.detected_columns.supplier ?? '-',
    cost: props.extractedData.detected_columns.cost ?? '-',
  });
  const [preview, setPreview] = useState(false);
  const [previewData, setPreviewData] = useState([]);
  const [error, setErrror] = useState(false);
  const selectedRestaurantUUID = useRestaurantStore(
    (state) => state.selectedRestaurantUUID
  );

  const getColumnNames = (): ColumnsNameMapping | null => {
    return (
      Object.keys(headerValues) as Array<keyof ColumnsNameMapping>
    ).reduce<ColumnsNameMapping>((previousValue, key) => {
      // const key = k as keyof typeof headerValues;
      return { ...previousValue, [key]: headerValues[key] || 'N/A' };
    }, headerValues);
  };

  const handleValueChange = (
    field: keyof ColumnsNameMapping,
    value: string
  ) => {
    setHeaderValues((prevValues) => ({
      ...prevValues!,
      [field]: value,
    }));

    if (preview) setPreview(false);
  };

  const handlePreviewClick = () => {
    setPreview(!preview);
    if (preview || !selectedRestaurantUUID) return;

    const columnsNames = getColumnNames() as ColumnsNameMapping;

    inventoryService
      .getPreviewUploadedCsv(
        selectedRestaurantUUID,
        props.fileCsv,
        columnsNames
      )
      .then((res) => {
        console.log('preview : ', res.data);

        setPreviewData(res.data);
      })
      .catch((err) => {
        console.log('error : ', err);
      });
  };

  const handleValidClick = () => {
    if (headerValues !== null && selectedRestaurantUUID !== undefined) {
      const columnsNames = getColumnNames() as ColumnsNameMapping;

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

  console.log(
    'props.extractedData.file_columns : ',
    props.extractedData.file_columns
  );

  const options = props.extractedData.file_columns.map((column) => ({
    value: column,
    label: column,
  }));

  return (
    <Popup
      isVisible={true}
      title={t('inventory.uploadCSV.popup.title')}
      subtitle={t('inventory.uploadCSV.popup.subtitle')}
      onRequestClose={props.onCancelClick}>
      <div className="upload-popup">
        <div className="headers">
          <div className="header">
            <span>Ingredient</span>
            <Select
              isClearable
              placeholder={t('ingredient')}
              options={options}
              value={{
                value: headerValues!.ingredient,
                label: headerValues!.ingredient,
              }}
              onChange={(value) =>
                handleValueChange('ingredient', value?.value ?? '-')
              }
            />
          </div>
          <div className="header">
            <span>Quantity</span>
            <Select
              isClearable
              placeholder={t('quantity')}
              options={options}
              value={{
                value: headerValues!.quantity,
                label: headerValues!.quantity,
              }}
              onChange={(value) =>
                handleValueChange('quantity', value?.value ?? '-')
              }
            />
          </div>
          <div className="header">
            <span>{t('unit')}</span>
            <Select
              isClearable
              placeholder={t('unit')}
              options={options}
              value={{
                value: headerValues!.unit,
                label: headerValues!.unit,
              }}
              onChange={(value) =>
                handleValueChange('unit', value?.value ?? '-')
              }
            />
          </div>
          <div className="header">
            <span>{t('supplier')}</span>
            <Select
              isClearable
              placeholder={t('supplier')}
              options={options}
              value={{
                value: headerValues!.supplier,
                label: headerValues!.supplier,
              }}
              onChange={(value) =>
                handleValueChange('supplier', value?.value ?? '-')
              }
            />
          </div>
          <div className="header">
            <span>{t('cost')}</span>
            <Select
              isClearable
              placeholder={t('cost')}
              options={options}
              value={{
                value: headerValues!.cost,
                label: headerValues!.cost,
              }}
              onChange={(value) =>
                handleValueChange('cost', value?.value ?? '-')
              }
            />
          </div>
        </div>
        <div className="preview-btn-container">
          {/* <Button
            type="secondary"
            value={t('preview')}
            onClick={handlePreviewClick}
            icon={
              preview ? (
                <i className="fa-solid fa-chevron-up"></i>
              ) : (
                <i className="fa-solid fa-chevron-down"></i>
              )
            }
          /> */}

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
                  <span key={`supplier-${index}`}>{data[headerValues.supplier]}</span>
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

export default UploadCsv;
