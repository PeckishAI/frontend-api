import './style.scss';
import { useTranslation } from 'react-i18next';
import { Button, Input, Popup } from 'shared-ui';
import { useState } from 'react';
import {
  ColumnsNameMapping,
  inventoryService,
} from '../../../../../apps/restaurant/src/services';
import { useRestaurantStore } from '../../../../../apps/restaurant/src/store/useRestaurantStore';

type Props = {
  fileCsv: File;
  extractedData: ColumnsNameMapping;
  onCancelClick: () => void;
  onValidateClick: () => void;
};

const UploadCsv = (props: Props) => {
  const { t } = useTranslation('common');

  const [headerValues, setHeaderValues] = useState<ColumnsNameMapping>({
    ingredient: props.extractedData.ingredient,
    quantity: props.extractedData.quantity,
    unit: props.extractedData.unit,
    supplier: props.extractedData.supplier,
    cost: props.extractedData.cost,
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

  return (
    <Popup
      isVisible={true}
      title="Your information uploaded"
      subtitle="We have extracted the following column names from your file. Please check if the mapping everything is correct."
      onRequestClose={props.onCancelClick}>
      <div className="upload-popup">
        <div className="headers">
          <div className="header">
            <span>Ingredient</span>
            <Input
              type="text"
              placeholder={t('ingredient')}
              value={headerValues!.ingredient}
              width="120px"
              onChange={(value) => handleValueChange('ingredient', value)}
            />
          </div>
          <div className="header">
            <span>Quantity</span>
            <Input
              type="text"
              placeholder={t('quantity')}
              value={headerValues!.quantity}
              width="120px"
              onChange={(value) => handleValueChange('quantity', value)}
            />
          </div>
          <div className="header">
            <span>{t('unit')}</span>
            <Input
              type="text"
              placeholder={t('unit')}
              value={headerValues!.unit}
              width="120px"
              onChange={(value) => handleValueChange('unit', value)}
            />
          </div>
          <div className="header">
            <span>{t('supplier')}</span>
            <Input
              type="text"
              placeholder={t('supplier')}
              value={headerValues!.supplier}
              width="120px"
              onChange={(value) => handleValueChange('supplier', value)}
            />
          </div>
          <div className="header">
            <span>{t('cost')}</span>
            <Input
              type="text"
              placeholder={t('cost')}
              value={headerValues!.cost}
              width="120px"
              onChange={(value) => handleValueChange('cost', value)}
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
