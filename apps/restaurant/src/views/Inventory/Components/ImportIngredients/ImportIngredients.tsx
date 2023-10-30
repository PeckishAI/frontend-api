import { Loading, Popup, UploadValidation } from 'shared-ui';
import style from './style.module.scss';
import FileUploader from '../../../../components/FileUploader/FileUploader';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PreviewResponse, inventoryService } from '../../../../services';
import { useRestaurantStore } from '../../../../store/useRestaurantStore';

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
  const [previewFilePopup, setPreviewFilePopup] =
    useState<PreviewResponse | null>(null);
  const [fileType, setFileType] = useState<'csv' | 'img'>();

  const handleUploadCsv = useCallback(
    async (file: File) => {
      console.log('handleUploadCsv');

      if (file) {
        setAnalyzingFile(true);
        inventoryService
          .uploadCsvFile(selectedRestaurantUUID, file)
          .then((data) => {
            props.onCloseUploader();
            setPreviewFilePopup(data);
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

  const handleUploadImg = (file: File) => {
    if (file) console.log('IngredientTab : img file detected');
  };

  const handleUploadCsvValidate = () => {
    setPreviewFilePopup(null);
    setUploadedFile(null);
  };

  return (
    <div>
      <Popup
        title={t('inventory.importData')}
        subtitle="We are able to decrypt an invoice picture to pick up ingredients, or simply read csv file."
        maxWidth={500}
        isVisible={props.openUploader}
        onRequestClose={() => props.onCloseUploader()}>
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

      {previewFilePopup !== null && uploadedFile && (
        <UploadValidation
          fileCsv={uploadedFile}
          data={previewFilePopup}
          headers={[
            {
              name: 'Ingredient',
              selector: 'ingredient',
            },
            {
              name: 'Quantity',
              selector: 'quantity',
            },
            {
              name: 'Cost',
              selector: 'cost',
            },
            {
              name: 'Unit',
              selector: 'unit',
            },
            {
              name: 'Supplier',
              selector: 'supplier',
            },
          ]}
          getPreview={(columns) =>
            inventoryService.getPreviewUploadedCsv(
              selectedRestaurantUUID!,
              uploadedFile,
              columns
            )
          }
          onCancelClick={() => {
            setPreviewFilePopup(null);
            setUploadedFile(null);
          }}
          onValidateClick={handleUploadCsvValidate}
        />
      )}
    </div>
  );
};

export default ImportIngredients;
