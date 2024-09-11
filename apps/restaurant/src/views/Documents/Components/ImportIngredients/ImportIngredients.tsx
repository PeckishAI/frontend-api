import { Loading, SidePanel } from 'shared-ui';
import style from './style.module.scss';
import FileUploader from '../../../../components/FileUploader/FileUploader';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Invoice, inventoryService } from '../../../../services';
import { useRestaurantStore } from '../../../../store/useRestaurantStore';
import UploadImgValidation from '../UploadImgValidation/UploadImgValidation';

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

  const [analyzingFile, setAnalyzingFile] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]); // Manage multiple files
  const [previewInvoice, setPreviewInvoice] = useState<Invoice | null>(null);
  const [fileType, setFileType] = useState<'csv' | 'img'>();
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false); // Control SidePanel visibility

  const handleUploadImgs = useCallback(
    async (files: FileList) => {
      setFileType('img');
      const fileArray = Array.from(files);
      if (fileArray.length > 0) {
        setAnalyzingFile(true);

        try {
          // Commented out API call, directly setting preview invoice data
          const data = await inventoryService.uploadImgFile(
            selectedRestaurantUUID,
            fileArray
          );
          console.log('Uploaded data:', data);
          setPreviewInvoice(data);
          // setPreviewInvoice({
          //   invoices: [
          //     {
          //       amount: {
          //         currency: 'GBP',
          //         total: 752.44,
          //       },
          //       date: '2022-07-23',
          //       discount: {
          //         currency: '-',
          //         total: 0,
          //       },
          //       document_group_uuid: '-',
          //       documents: [
          //         {
          //           document_type: 'invoice',
          //           document_uuid: '-',
          //           file_path: 'invoice_image_1.jpg',
          //         },
          //       ],
          //       ingredients: [
          //         {
          //           given_name:
          //             'CH1796 Premium Halal Frozen 70% Chicken Fillet 1x10kg',
          //           ingredient_uuid: '-',
          //           mapped_name: '-',
          //           quantity: 10,
          //           total_cost: {
          //             currency: 'GBP',
          //             total: 389.9,
          //           },
          //           unit: 'kg',
          //           unit_cost: {
          //             currency: 'GBP',
          //             total: 38.99,
          //           },
          //         },
          //         {
          //           given_name: 'MS270 Prahhom Coconut Milk 17-19% 6x290ml',
          //           ingredient_uuid: '-',
          //           mapped_name: '-',
          //           quantity: 6,
          //           total_cost: {
          //             currency: 'GBP',
          //             total: 32.99,
          //           },
          //           unit: 'unit',
          //           unit_cost: {
          //             currency: 'GBP',
          //             total: 32.99,
          //           },
          //         },
          //         {
          //           given_name: 'VEG771 Fresh Bean Sprouts 1x4kg',
          //           ingredient_uuid: '-',
          //           mapped_name: '-',
          //           quantity: 4,
          //           total_cost: {
          //             currency: 'GBP',
          //             total: 5.99,
          //           },
          //           unit: 'kg',
          //           unit_cost: {
          //             currency: 'GBP',
          //             total: 5.99,
          //           },
          //         },
          //         {
          //           given_name:
          //             'FSH675 Songa Euacedo Vannamei Prawn P&D (21/25) 5x600g',
          //           ingredient_uuid: '-',
          //           mapped_name: '-',
          //           quantity: 5,
          //           total_cost: {
          //             currency: 'GBP',
          //             total: 105.98,
          //           },
          //           unit: 'kg',
          //           unit_cost: {
          //             currency: 'GBP',
          //             total: 52.99,
          //           },
          //         },
          //         {
          //           given_name: 'HYK063 Pepsi 24x330ml',
          //           ingredient_uuid: '-',
          //           mapped_name: '-',
          //           quantity: 24,
          //           total_cost: {
          //             currency: 'GBP',
          //             total: 9.99,
          //           },
          //           unit: 'can',
          //           unit_cost: {
          //             currency: 'GBP',
          //             total: 9.99,
          //           },
          //         },
          //         {
          //           given_name: 'DRK062 Diet Coke 24x330ml',
          //           ingredient_uuid: '-',
          //           mapped_name: '-',
          //           quantity: 24,
          //           total_cost: {
          //             currency: 'GBP',
          //             total: 10.99,
          //           },
          //           unit: 'can',
          //           unit_cost: {
          //             currency: 'GBP',
          //             total: 10.99,
          //           },
          //         },
          //         {
          //           given_name: 'VGT081 Tofu King Fried Tofu 1x750g',
          //           ingredient_uuid: '-',
          //           mapped_name: '-',
          //           quantity: 15,
          //           total_cost: {
          //             currency: 'GBP',
          //             total: 119.85,
          //           },
          //           unit: 'box',
          //           unit_cost: {
          //             currency: 'GBP',
          //             total: 7.99,
          //           },
          //         },
          //         {
          //           given_name: 'CON106 4oz Microwave Cups with Lids 1x1000',
          //           ingredient_uuid: '-',
          //           mapped_name: '-',
          //           quantity: 1000,
          //           total_cost: {
          //             currency: 'GBP',
          //             total: 29.99,
          //           },
          //           unit: 'unit',
          //           unit_cost: {
          //             currency: 'GBP',
          //             total: 29.99,
          //           },
          //         },
          //       ],
          //       invoice_number: 'C91156356',
          //       invoice_uuid: '-',
          //       restaurant_uuid: '-',
          //       supplier_name: 'testingInvetory@gmail.com',
          //       supplier_uuid: 'b63547dd-5b56-4e2c-8948-356430c21d84',
          //       vat: {
          //         currency: 'GBP',
          //         total: 16.29,
          //       },
          //     },
          //   ],
          // });

          setUploadedFiles(fileArray); // Set the uploaded file array
        } catch (error) {
          console.error('Error uploading images:', error);
        } finally {
          setAnalyzingFile(false);
        }
      }
    },
    [selectedRestaurantUUID]
  );

  const handleCloseSidePanel = () => {
    setAnalyzingFile(false);
    setUploadedFiles([]);
    setPreviewInvoice(null);
    setIsSidePanelOpen(false); // Close SidePanel
    props.onCloseUploader();
  };

  return (
    <div>
      <SidePanel
        isOpen={props.openUploader} // Control SidePanel open/close
        onRequestClose={handleCloseSidePanel} // Close function
        width={'100%'} // You can adjust the width as per your design
      >
        {analyzingFile ? (
          <Loading size="medium" />
        ) : previewInvoice === null ? (
          <div className={style.importData}>
            <p className={style.description}>
              Import your invoices of ingredients as a picture
            </p>
            <FileUploader
              type="img"
              title="Select your invoice pictures"
              onFilesUploaded={handleUploadImgs} // Accept multiple files
              multiple // Enable multiple file selection
            />
          </div>
        ) : (
          <UploadImgValidation
            invoice={previewInvoice}
            uploadedFiles={uploadedFiles}
            handleCloseUploader={handleCloseSidePanel}
            onCancelClick={() => {
              setPreviewInvoice(null);
              setUploadedFiles([]);
            }}
            onValideClick={() => {
              setPreviewInvoice(null);
              setUploadedFiles([]);
              props.onIngredientsImported();
              handleCloseSidePanel();
            }}
          />
        )}
      </SidePanel>
    </div>
  );
};

export default ImportIngredients;
