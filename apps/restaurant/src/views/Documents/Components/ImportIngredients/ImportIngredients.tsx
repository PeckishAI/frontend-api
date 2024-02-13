import { Loading, Popup } from 'shared-ui';
import style from './style.module.scss';
import FileUploader from '../../../../components/FileUploader/FileUploader';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Invoice, inventoryService } from '../../../../services';
import { useRestaurantStore } from '../../../../store/useRestaurantStore';
import UploadImgValidation from '../UploadImgValidation/UploadImgValidation';
// import axios from 'axios';

type Props = {
  openUploader: boolean;
  onCloseUploader: () => void;
  onIngredientsImported: () => void;
};

const ImportIngredients = (props: Props) => {
  const { t } = useTranslation(['common', 'ingredient']);

  const selectedRestaurantUUID = useRestaurantStore(
    (state) => state.selectedRestaurantUUID
  )!;

  //   const [importDataPopup, setImportDataPopup] = useState(false);
  const [analyzingFile, setAnalyzingFile] = useState(false); // test with if(uploadedFile) set loading
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const [previewInvoice, setPreviewInvoice] = useState<Invoice | null>(null);
  const [fileType, setFileType] = useState<'csv' | 'img'>();

  const handleUploadImg = useCallback(
    async (file: File) => {
      setFileType('img');
      if (file) {
        setAnalyzingFile(true);
        inventoryService
          .uploadImgFile(selectedRestaurantUUID, file)
          .then((data) => {
            props.onCloseUploader();
            setPreviewInvoice(data);
            setUploadedFile(file);
          })
          .catch((err) => {
            console.log(err);
            setPreviewInvoice({
              ingredients: [
                {
                  mappedUUID: '1e1cb360-1e8e-439f-a1eb-0ff0e8b82af9',
                  detectedName: 'detectedName',
                  mappedName: 'mappedName',
                  quantity: 2,
                  totalPrice: 10,
                  unit: 'Kg',
                  unitPrice: 3,
                },
                {
                  mappedUUID: '1e1cb360-1e8e-439f-a1eb-0ff0e8b82af9',
                  detectedName: 'detectedName',
                  mappedName: 'mappedName',
                  quantity: 2,
                  totalPrice: 10,
                  unit: 'Kg',
                  unitPrice: 3,
                },
                {
                  detectedName: 'detectedName',
                  mappedName: 'mappedName',
                  quantity: 2,
                  totalPrice: 10,
                  unit: 'Kg',
                  unitPrice: 3,
                },
                {
                  detectedName: 'detectedName',
                  mappedName: 'mappedName',
                  quantity: 2,
                  totalPrice: 10,
                  unit: 'Kg',
                  unitPrice: 3,
                },
              ],
              amount: 30,
              date: '03/02/2024',
              documentUUID: '1',
              supplier: 'This is a fake invoice generated',
            });
            props.onCloseUploader();
            setUploadedFile(file);
          })
          .finally(() => {
            setAnalyzingFile(false);
          });
      }
    },
    [selectedRestaurantUUID]
  );

  const handleCloseUploader = () => {
    setAnalyzingFile(false);
    setUploadedFile(null);
    setPreviewInvoice(null);
    props.onCloseUploader();
  };

  return (
    <div>
      <Popup
        title={t('inventory.importData')}
        subtitle="We are able to decrypt an invoice picture to pick up ingredients from it."
        maxWidth={500}
        isVisible={props.openUploader}
        onRequestClose={handleCloseUploader}>
        {analyzingFile ? (
          <Loading size="medium" />
        ) : (
          <div className={style.importData}>
            <p className={style.description}>
              Import your invoices of ingredients as a picture
            </p>
            <FileUploader
              type="img"
              title="Select your invoice picture"
              onFileUploaded={handleUploadImg}
            />
          </div>
        )}
      </Popup>

      {previewInvoice !== null && fileType === 'img' && uploadedFile && (
        <UploadImgValidation
          invoice={previewInvoice}
          onCancelClick={() => {
            setPreviewInvoice(null);
            setUploadedFile(null);
          }}
          onValideClick={() => {
            setPreviewInvoice(null);
            setUploadedFile(null);
            props.onIngredientsImported();
          }}
        />
      )}
    </div>
  );
};

export default ImportIngredients;
