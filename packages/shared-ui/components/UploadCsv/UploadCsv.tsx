import './style.scss';
import { useTranslation } from 'react-i18next';
import { Button, Input } from 'shared-ui';
import { useState } from 'react';
import { inventoryService } from '../../../../apps/restaurant/src/services';
import { useRestaurantStore } from '../../../../apps/restaurant/src/store/useRestaurantStore';

type Props = {
  fileCsv: File | null;
  extractedData: any;
  onCancelClick: () => void;
  onValidateClick: () => void;
};

type Headers = {
  ingredient: string;
  quantity: string;
  unit: string;
  supplier: string;
  cost: string;
};

const UploadCsv = (props: Props) => {
  const { t } = useTranslation('common');
  const headers: Headers = {
    ingredient: props.extractedData.ingredient,
    quantity: props.extractedData.quantity,
    unit: props.extractedData.unit,
    supplier: props.extractedData.supplier,
    cost: props.extractedData.cost,
  };

  const [headerValues, setHeaderValues] = useState<Headers | null>(headers);
  const [preview, setPreview] = useState(false);
  const [previewData, setPreviewData] = useState([]);
  const [error, setErrror] = useState(false);
  const selectedRestaurantUUID = useRestaurantStore(
    (state) => state.selectedRestaurantUUID
  );

  const handleValueChange = (field: keyof Headers, value: any) => {
    setHeaderValues((prevValues) => ({
      ...prevValues!,
      [field]: value,
    }));

    if (preview) setPreview(false);
  };

  const handlePreviewClick = () => {
    if (!preview) {
      inventoryService
        .getPreviewUploadedCsv(props.fileCsv, headerValues)
        .then((res) => {
          setPreviewData(res.data);
        })
        .catch((err) => {
          console.log('error : ', err);
        });
    }
    setPreview(!preview);
  };

  const handleValidClick = () => {
    if (headerValues !== null && selectedRestaurantUUID !== undefined) {
      inventoryService
        .validUploadedCsv(selectedRestaurantUUID, props.fileCsv, headerValues)
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
    <div className="upload-popup">
      <div className="overlay"></div>
      <div className="popup">
        <h2>Your information uploaded :</h2>
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
        <div>
          <Button
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
          />
        </div>
        <div
          className="preview"
          style={preview ? { height: '200px' } : { height: 0 }}>
          <div className="table">
            <div className="row first-row">
              <span>{t('ingredient')}</span>
              <span>{t('quantity')}</span>
              <span>{t('unit')}</span>
            </div>
            {previewData &&
              previewData.map((data: any, index) => (
                <div className="row" key={`row-${index}`}>
                  <span key={`ingredient-${index}`}>
                    {data[headerValues!.ingredient]}
                  </span>
                  <span key={`quantity-${index}`}>
                    {data[headerValues!.quantity]}
                  </span>
                  <span key={`unit-${index}`}>{data[headerValues!.unit]}</span>
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
    </div>
  );
};

export default UploadCsv;
