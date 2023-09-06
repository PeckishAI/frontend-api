import { useTranslation } from 'react-i18next';
import {
  Table,
  Tabs,
  Dropdown,
  Popup,
  Input,
  Button,
  Lottie,
  UploadCsv,
  IconButton,
} from 'shared-ui';
import { ColumnDefinitionType } from 'shared-ui/components/Table/Table';
import { DropdownOptionsDefinitionType } from 'shared-ui/components/Dropdown/Dropdown';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Tooltip } from 'react-tooltip';
import { IngredientForSupplier } from '../services';
// import { useRestaurantStore } from '../store/useRestaurantStore';

const tabs = ['Stock', 'analyses', 'Orders'];

const units: DropdownOptionsDefinitionType[] = [
  { label: 'kg', value: 'kg' },
  { label: 'g', value: 'g' },
  { label: 'tbsp', value: 'tbsp' },
  { label: 'l', value: 'L' },
  { label: 'ml', value: 'ml' },
  { label: 'unit', value: 'unit' },
];

const suppliers: DropdownOptionsDefinitionType[] = [
  { label: 'Supplier 1', value: 'supplier1' },
  { label: 'Supplier 2', value: 'supplier2' },
  { label: 'Supplier 3', value: 'supplier3' },
];

const Catalog = () => {
  const { t } = useTranslation(['common', 'ingredient']);

  const [selectedTab, setSelectedTab] = useState(0);
  const [ingredientsList, setIngredientsList] = useState<
    IngredientForSupplier[]
  >([]);
  const [editingRowId, setEditingRowId] = useState<string | null>();
  const [deletingRowId, setDeletingRowId] = useState<string | null>();
  const [addingRow, setAddingRow] = useState(false);
  const [editedValues, setEditedValues] =
    useState<IngredientForSupplier | null>(null);
  const [popupDelete, setPopupDelete] = useState<string[] | undefined>(
    undefined
  );
  const [popupPreviewEdit, setPopupPreviewEdit] = useState<
    string[] | undefined
  >(undefined);
  const [popupError, setPopupError] = useState('');
  const [loadingData, setLoadingdata] = useState(false);
  const [uploadPopup, setUploadPopup] = useState<any | null>(null);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [loadingButton, setLoadingButton] = useState(false);
  const [searchValue, setSearchValue] = useState<string | null>(null);

  // const selectedRestaurantUUID = useRestaurantStore(
  //   (state) => state.selectedRestaurantUUID
  // );

  const toggleTab = (tabIndex: number) => {
    setSelectedTab(tabIndex);
  };

  // const reloadInventoryData = useCallback(async () => {
  //   if (!selectedRestaurantUUID) return;

  //   setLoadingdata(true);
  //   try {
  //     const response = await inventoryService.getIngredientList(
  //       selectedRestaurantUUID
  //     );
  //     const list = response.data; // Accès à la propriété data de la réponse

  //     const convertedData = Object.keys(list).map((key) => ({
  //       id: key,
  //       theoriticalStock: 0, // Tempoprary till API implementation
  //       ...list[key],
  //     }));
  //     setIngredientsList(convertedData);
  //   } catch (err) {
  //     if (err instanceof Error) {
  //       togglePopupError(err.message);
  //     } else {
  //       console.error('Unexpected error type:', err);
  //     }
  //   }

  //   setLoadingdata(false);
  // }, [selectedRestaurantUUID]);

  // useEffect(() => {
  //   reloadInventoryData();
  // }, [reloadInventoryData]);

  // Handle for actions in tab
  const handleEditClick = (row: IngredientForSupplier) => {
    setEditingRowId(row.id);
    setEditedValues({ ...row });
  };

  const handleSaveEdit = () => {
    // if (!selectedRestaurantUUID) return;

    setLoadingdata(true);
    if (editingRowId !== null && !addingRow) {
      console.log('API request to edit ingredient');
      console.log(editingRowId);
      // setLoadingdata(false);
      // inventoryService
      //   .getIngredientPreview(editingRowId)
      //   .then((res) => {
      //     togglePopupPreviewEdit(res.data);
      //   })
      //   .catch((err) => {
      //     console.log(err);
      //   })
      //   .finally(() => {
      //     setLoadingdata(false);
      //   });
    } else {
      console.log('API request to Add new ingredient');
      // inventoryService
      //   .addIngredient(selectedRestaurantUUID, editedValues)
      //   .catch((err) => {
      //     togglePopupError(err.message);
      //   })
      //   .then(() => reloadInventoryData());
      // setAddingRow(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingRowId(null);
    setEditedValues(null);
    if (addingRow) {
      const updatedList = ingredientsList.filter(
        (ingredient) => ingredient.id !== ''
      );
      setIngredientsList(updatedList);
      setAddingRow(false);
    }
  };

  const handleDeleteClick = (row: IngredientForSupplier) => {
    setDeletingRowId(row.id);
    setLoadingdata(true);
    // inventoryService
    //   .getIngredientPreview(row.id)
    //   .then((res) => {
    //     console.log('preview with id :', row.id, res.data);
    //     togglePopupDelete(res.data);
    //   })
    //   .catch((err) => {
    //     console.log(err);
    //   })
    //   .finally(() => {
    //     setLoadingdata(false);
    //   });
  };

  // Handle for inputs change
  const handleValueChange = (
    field: keyof IngredientForSupplier,
    value: string
  ) => {
    setEditedValues((prevValues) => ({
      ...prevValues!,
      [field]: value,
    }));
  };

  // Handle for Popups
  const togglePopupDelete = (msg: string[] | undefined) => {
    setPopupDelete(msg);
  };
  const handleConfirmPopupDelete = () => {
    if (!deletingRowId) return;
    // inventoryService
    //   .deleteIngredient(deletingRowId)
    //   .catch((err) => {
    //     togglePopupError(err.message);
    //   })
    //   .then(() => reloadInventoryData());
    // togglePopupDelete(undefined);
  };

  const togglePopupPreviewEdit = (msg: string[] | undefined) => {
    setPopupPreviewEdit(msg);
  };
  const handleConfirmPopupPreviewEdit = () => {
    // inventoryService
    //   .updateIngredient(editedValues)
    //   .catch((err) => {
    //     togglePopupError(err.message);
    //   })
    //   .then(() => reloadInventoryData());
    setEditingRowId(null);
    setEditedValues(null);
    togglePopupPreviewEdit(undefined);
  };

  const togglePopupError = (msg: string) => {
    setPopupError(msg);
  };

  // Handle for actions above the tab component
  const handleAddNewIngredient = () => {
    const newIngredient: IngredientForSupplier = {
      id: '',
      name: '',
      stock: 0,
      expectedSales: '',
      unit: '',
      price: 0,
      actions: undefined,
    };

    setIngredientsList([newIngredient, ...ingredientsList]);
    setAddingRow(true);
    setEditingRowId(newIngredient.id);
    setEditedValues(newIngredient);
  };

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    // if (!selectedRestaurantUUID) return;

    const file = e.target.files?.[0];
    if (file) {
      setLoadingButton(true);
      // inventoryService
      //   .uploadCsvFile(selectedRestaurantUUID, file)
      //   .then((res) => {
      //     setUploadPopup(res.data);
      //     setCsvFile(file);
      //   })
      //   .catch((err) => {
      //     console.log(err);
      //   })
      //   .finally(() => {
      //     setLoadingButton(false);
      //   });
    }
  };

  const handleUploadCsvValidate = () => {
    setUploadPopup(null);
    // reloadInventoryData();
  };

  const handleOnSearchValueChange = (value: string) => {
    setSearchValue(value);
  };

  const columns: ColumnDefinitionType<
    IngredientForSupplier,
    keyof IngredientForSupplier
  >[] = [
    {
      key: 'name',
      header: t('ingredient:ingredientName'),
      width: '15%',
      classname: 'column-bold',
      renderItem: ({ row }) =>
        editingRowId === row.id ? (
          <Input
            type="text"
            min={0}
            placeholder={t('ingredient:ingredientName')}
            onChange={(value) => handleValueChange('name', value)}
            value={editedValues!.name}
          />
        ) : (
          row.name
        ),
    },
    {
      key: 'stock',
      header: t('ingredient:stock'),
      width: '15%',
      renderItem: ({ row }) =>
        editingRowId === row.id ? (
          <Input
            type="number"
            min={0}
            placeholder={t('ingredient:stock')}
            onChange={(value) => handleValueChange('stock', value)}
            value={editedValues!.stock}
          />
        ) : (
          row.stock
        ),
    },
    {
      key: 'expectedSales',
      header: t('ingredient:expectedSales'),
      width: '15%',
      renderItem: ({ row }) =>
        editingRowId === row.id ? (
          <Input
            type="number"
            min={0}
            placeholder={t('ingredient:expectedSales')}
            onChange={(value) => handleValueChange('expectedSales', value)}
            value={editedValues!.expectedSales}
          />
        ) : (
          row.expectedSales
        ),
    },
    {
      key: 'unit',
      header: t('ingredient:unit'),
      width: '10%',
      renderItem: ({ row }) =>
        editingRowId === row.id ? (
          <Dropdown
            options={units}
            selectedOption={editedValues!.unit}
            onOptionChange={(value) => handleValueChange('unit', value)}
          />
        ) : (
          row.unit
        ),
    },
    {
      key: 'price',
      header: t('ingredient:price'),
      width: '10%',
      classname: 'column-bold',
      renderItem: ({ row }) =>
        editingRowId === row.id ? (
          <Input
            type="number"
            min={0}
            placeholder={t('ingredient:price')}
            onChange={(value) => handleValueChange('price', value)}
            value={editedValues!.price}
          />
        ) : (
          `${row.price} €`
        ),
    },
    {
      key: 'actions',
      header: t('ingredient:actions'),
      width: '10%',
      renderItem: ({ row }) => {
        return (
          <div className="actions">
            {editingRowId === row.id ? (
              <i
                className="fa-solid fa-check"
                data-tooltip-id="inventory-tooltip"
                data-tooltip-content={t('common:validate')}
                onClick={handleSaveEdit}></i>
            ) : (
              <i
                className="fa-solid fa-pen-to-square"
                data-tooltip-id="inventory-tooltip"
                data-tooltip-content={t('common:edit')}
                onClick={() => handleEditClick(row)}></i>
            )}

            {editingRowId === row.id ? (
              <i
                className="fa-solid fa-times"
                data-tooltip-id="inventory-tooltip"
                data-tooltip-content={t('common:cancel')}
                onClick={handleCancelEdit}></i>
            ) : (
              <i
                className="fa-solid fa-trash"
                data-tooltip-id="inventory-tooltip"
                data-tooltip-content={t('common:delete')}
                onClick={() => handleDeleteClick(row)}></i>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="inventory">
      <div className="tabs-and-tools">
        <Tabs tabs={tabs} onClick={toggleTab} selectedIndex={selectedTab} />
        <div className="tools">
          <Input
            type="text"
            value={searchValue ?? ''}
            placeholder={t('common:search')}
            onChange={(value) => {
              handleOnSearchValueChange(value);
            }}
          />
          <IconButton
            icon={<i className="fa-solid fa-filter"></i>}
            onClick={() => null}
            tooltipMsg="Filter"
            tooltipId="inventory-tooltip"
          />
          <IconButton
            icon={<i className="fa-solid fa-download"></i>}
            onClick={() => null}
            tooltipMsg={t('common:export')}
            tooltipId="inventory-tooltip"
          />
          <IconButton
            icon={<i className="fa-solid fa-file-arrow-down"></i>}
            onClick={() => fileInputRef.current && fileInputRef.current.click()}
            tooltipMsg={`${t('common:import')} CSV`}
            tooltipId="inventory-tooltip"
            loading={loadingButton}
          />
          <input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            style={{ display: 'none' }} // hide input
            ref={fileInputRef}
          />
          <Button
            value={t('ingredient:addIngredient')}
            type="primary"
            onClick={!addingRow ? handleAddNewIngredient : () => null}
          />
        </div>
      </div>

      {selectedTab === 0 && <Table data={ingredientsList} columns={columns} />}

      {uploadPopup !== null && (
        <UploadCsv
          fileCsv={csvFile}
          extractedData={uploadPopup}
          onCancelClick={() => {
            setUploadPopup(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
          }}
          onValidateClick={handleUploadCsvValidate}
        />
      )}

      <Tooltip className="tooltip" id="inventory-tooltip" />
      <Popup
        type="warning"
        msg={t('common:warning.delete')}
        subMsg={
          popupDelete?.length !== 0
            ? t('common:warning.impactedRecipes')
            : undefined
        }
        list={popupDelete?.length !== 0 ? popupDelete : undefined}
        onConfirm={handleConfirmPopupDelete}
        revele={popupDelete === undefined ? false : true}
        togglePopup={() => togglePopupDelete(undefined)}
      />
      <Popup
        type="warning"
        msg={t('common:warning.edit')}
        subMsg={
          popupPreviewEdit?.length !== 0
            ? t('common:warning.impactedRecipes')
            : undefined
        }
        list={popupPreviewEdit?.length !== 0 ? popupPreviewEdit : undefined}
        onConfirm={handleConfirmPopupPreviewEdit}
        revele={popupPreviewEdit === undefined ? false : true}
        togglePopup={() => togglePopupPreviewEdit(undefined)}
      />
      <Popup
        type="error"
        msg={
          t('common:error.trigger') + '. ' + t('common:error.tryLater') + '.'
        }
        subMsg={popupError}
        revele={popupError === '' ? false : true}
        togglePopup={() => togglePopupError('')}
      />
      {loadingData && (
        <div className="loading-container">
          <Lottie type="loading" width="200px" />
        </div>
      )}
    </div>
  );
};

export default Catalog;
