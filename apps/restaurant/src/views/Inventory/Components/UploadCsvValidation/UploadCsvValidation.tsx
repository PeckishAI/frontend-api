import { UploadValidation } from 'shared-ui';
import { PreviewCsvResponse, inventoryService } from '../../../../services';
import { useRestaurantStore } from '../../../../store/useRestaurantStore';

type Props = {
  file: File;
  data: PreviewCsvResponse;
  onCancelClick: () => void;
  uploadSuccess: () => void;
};

const UploadCsvValidation = (props: Props) => {
  const selectedRestaurantUUID = useRestaurantStore(
    (state) => state.selectedRestaurantUUID
  )!;
  return (
    <div>
      <UploadValidation
        file={props.file}
        data={props.data}
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
            props.file,
            columns
          )
        }
        onCancelClick={() => {
          props.onCancelClick();
        }}
        uploadSuccess={() => {
          props.uploadSuccess();
        }}
        onUpload={(mappedColumns, selectedValues) =>
          inventoryService.validUploadedCsv(
            selectedRestaurantUUID,
            props.file,
            mappedColumns,
            selectedValues
          )
        }
      />
    </div>
  );
};

export default UploadCsvValidation;
