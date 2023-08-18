import './style.scss';
import { useTranslation } from 'react-i18next';
import { Button, Input } from 'shared-ui';
import { useState } from 'react';
import { inventoryService } from '../../../../apps/restaurants/src/services';

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
    if (headerValues !== null) {
      inventoryService
        .validUploadedCsv(props.fileCsv, headerValues)
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
              placeholder="Ingredient"
              value={headerValues!.ingredient}
              width="120px"
              onChange={(value) => handleValueChange('ingredient', value)}
            />
          </div>
          <div className="header">
            <span>Quantity</span>
            <Input
              type="text"
              placeholder="Quantity"
              value={headerValues!.quantity}
              width="120px"
              onChange={(value) => handleValueChange('quantity', value)}
            />
          </div>
          <div className="header">
            <span>Unit</span>
            <Input
              type="text"
              placeholder="Unit"
              value={headerValues!.unit}
              width="120px"
              onChange={(value) => handleValueChange('unit', value)}
            />
          </div>
          <div className="header">
            <span>Supplier</span>
            <Input
              type="text"
              placeholder="Supplier"
              value={headerValues!.supplier}
              width="120px"
              onChange={(value) => handleValueChange('supplier', value)}
            />
          </div>
          <div className="header">
            <span>Cost</span>
            <Input
              type="text"
              placeholder="Cost"
              value={headerValues!.cost}
              width="120px"
              onChange={(value) => handleValueChange('cost', value)}
            />
          </div>
        </div>
        <div>
          <Button
            type="secondary"
            value="Preview"
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
              <span>Ingredient</span>
              <span>Quantity</span>
              <span>Unit</span>
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
            An error has occured. Please try again
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
