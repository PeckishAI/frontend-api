import { Loading, Popup } from 'shared-ui';
import style from './style.module.scss';
import FileUploader from '../../../../components/FileUploader/FileUploader';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Invoice,
  PreviewCsvResponse,
  inventoryService,
} from '../../../../services';
import { useRestaurantStore } from '../../../../store/useRestaurantStore';
import UploadCsvValidation from '../UploadCsvValidation/UploadCsvValidation';
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
  const [previewCsvFilePopup, setPreviewCsvFilePopup] =
    useState<PreviewCsvResponse | null>(null);
  const [previewInvoice, setPreviewInvoice] = useState<Invoice | null>(null);
  const [fileType, setFileType] = useState<'csv' | 'img'>();

  // let source = axios.CancelToken.source();

  const handleUploadCsv = useCallback(
    (file: File) => {
      console.log('handleUploadCsv');
      setFileType('csv');

      if (file) {
        setAnalyzingFile(true);
        inventoryService
          .uploadCsvFile(selectedRestaurantUUID, file)
          .then((data) => {
            props.onCloseUploader();
            setPreviewCsvFilePopup(data);
            setUploadedFile(file);
          })
          .catch((err) => {
            console.log(err);
          })
          .finally(() => {
            setAnalyzingFile(false);
          });
      }
    },
    [selectedRestaurantUUID]
  );

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
    setPreviewCsvFilePopup(null);
    props.onCloseUploader();
  };

  return (
    <div>
      <Popup
        title={t('inventory.importData')}
        subtitle="We are able to decrypt an invoice picture to pick up ingredients, or simply read csv file."
        maxWidth={500}
        isVisible={props.openUploader}
        onRequestClose={handleCloseUploader}>
        {analyzingFile ? (
          <Loading size="medium" />
        ) : (
          <div className={style.importData}>
            <p className={style.description}>
              Import your inventory as a table file with information such as
              quantities, supplier and costs
            </p>
            <FileUploader
              type="csv"
              title="Select your csv file"
              onFileUploaded={handleUploadCsv}
            />
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

      {previewCsvFilePopup !== null && fileType === 'csv' && uploadedFile && (
        <UploadCsvValidation
          file={uploadedFile}
          data={previewCsvFilePopup}
          uploadSuccess={() => {
            setPreviewCsvFilePopup(null);
            setUploadedFile(null);
            props.onIngredientsImported();
          }}
          onCancelClick={() => {
            setPreviewCsvFilePopup(null);
            setUploadedFile(null);
          }}
        />
      )}

      {previewInvoice !== null && fileType === 'img' && uploadedFile && (
        <UploadImgValidation
          data={previewInvoice}
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
