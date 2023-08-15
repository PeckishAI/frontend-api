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
} from 'shared-ui';
import { ColumnDefinitionType } from 'shared-ui/components/Table/Table';
import { DropdownOptionsDefinitionType } from 'shared-ui/components/Dropdown/Dropdown';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Tooltip } from 'react-tooltip';
import { inventoryService } from '../services';
import { Ingredient } from '../services/types';

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

const Inventory = () => {
  const { t } = useTranslation('common');

  const [selectedTab, setSelectedTab] = useState(0);
  const [ingredientsList, setIngredientsList] = useState<Ingredient[]>([]);
  const [editingRowId, setEditingRowId] = useState<string | null>();
  const [deletingRowId, setDeletingRowId] = useState<string | null>();
  const [addingRow, setAddingRow] = useState(false);
  const [editedValues, setEditedValues] = useState<Ingredient | null>(null);
  const [popupDelete, setPopupDelete] = useState(false);
  const [popupError, setPopupError] = useState('');
  const [loadingData, setLoadingdata] = useState(false);
  const [uploadPopup, setUploadPopup] = useState<any | null>(null);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [loadingButton, setLoadingButton] = useState(false);

  const toggleTab = (tabIndex: number) => {
    setSelectedTab(tabIndex);
  };

  const reloadInventoryData = useCallback(async () => {
    setLoadingdata(true);
    try {
      const response = await inventoryService.getIngredientList();
      const list = response.data; // Accès à la propriété data de la réponse

      const convertedData = Object.keys(list).map((key) => ({
        id: key,
        theoriticalStock: 0, // Tempoprary till API implementation
        ...list[key],
      }));
      setIngredientsList(convertedData);
    } catch (err) {
      if (err instanceof Error) {
        togglePopupError(err.message);
      } else {
        console.error('Unexpected error type:', err);
      }
    }

    setLoadingdata(false);
  }, []);

  useEffect(() => {
    reloadInventoryData();
  }, [reloadInventoryData]);

  const handleEditClick = (row: Ingredient) => {
    setEditingRowId(row.id);
    setEditedValues({ ...row });
  };

  const handleSaveEdit = () => {
    setLoadingdata(true);
    if (editingRowId !== null && !addingRow) {
      console.log('API request to edit ingredient');
      inventoryService
        .updateIngredient(editedValues)
        .catch((err) => {
          togglePopupError(err.message);
        })
        .then(() => reloadInventoryData());
      setEditingRowId(null);
      setEditedValues(null);
    } else {
      console.log('API request to Add new ingredient');
      inventoryService
        .addIngredient(editedValues)
        .catch((err) => {
          togglePopupError(err.message);
        })
        .then(() => reloadInventoryData());
      setAddingRow(false);
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

  const handleDeleteClick = (row: Ingredient) => {
    setDeletingRowId(row.id);
    togglePopupDelete();
  };

  const handleValueChange = (field: keyof Ingredient, value: string) => {
    setEditedValues((prevValues) => ({
      ...prevValues!,
      [field]: value,
    }));
  };

  const togglePopupDelete = () => {
    setPopupDelete(!popupDelete);
  };

  const togglePopupError = (msg: string) => {
    setPopupError(msg);
  };

  const handleAddNewIngredient = () => {
    const newIngredient: Ingredient = {
      id: '',
      name: '',
      theoriticalStock: 0,
      quantity: 0,
      unit: '',
      supplier: '',
      cost: 0,
      actions: undefined,
    };

    setIngredientsList([newIngredient, ...ingredientsList]);
    setAddingRow(true);
    setEditingRowId(newIngredient.id);
    setEditedValues(newIngredient);
  };

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLoadingButton(true);
      inventoryService
        .uploadCsvFile(file)
        .then((res) => {
          setUploadPopup(res.data);
          setCsvFile(file);
        })
        .catch((err) => {
          console.log(err);
        })
        .finally(() => {
          setLoadingButton(false);
        });
    }
  };

  const handleUploadCsvValidate = () => {
    setUploadPopup(null);
    reloadInventoryData();
  };

  const columns: ColumnDefinitionType<Ingredient, keyof Ingredient>[] = [
    {
      key: 'name',
      header: t('ingredientName'),
      width: '15%',
      classname: 'column-bold',
      renderItem: ({ row }) =>
        editingRowId === row.id ? (
          <Input
            type="text"
            min={0}
            placeholder="Name"
            onChange={(value) => handleValueChange('name', value)}
            value={editedValues!.name}
          />
        ) : (
          row.name
        ),
    },

    { key: 'theoriticalStock', header: t('theoriticalStock'), width: '15%' },
    {
      key: 'quantity',
      header: t('actualStock'),
      width: '15%',
      renderItem: ({ row }) =>
        editingRowId === row.id ? (
          <Input
            type="number"
            min={0}
            placeholder="Quantity"
            onChange={(value) => handleValueChange('quantity', value)}
            value={editedValues!.quantity}
          />
        ) : (
          row.quantity
        ),
    },
    {
      key: 'unit',
      header: t('unit'),
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
      key: 'supplier',
      header: t('supplier'),
      width: '15%',
      renderItem: ({ row }) =>
        editingRowId === row.id ? (
          <Dropdown
            options={suppliers}
            selectedOption={editedValues!.supplier}
            onOptionChange={(value) => handleValueChange('supplier', value)}
          />
        ) : (
          row.supplier
        ),
    },
    {
      key: 'cost',
      header: t('price'),
      width: '10%',
      classname: 'column-bold',
      renderItem: ({ row }) =>
        editingRowId === row.id ? (
          <Input
            type="number"
            min={0}
            placeholder={t('price')}
            onChange={(value) => handleValueChange('cost', value)}
            value={editedValues!.cost}
          />
        ) : (
          `${row.cost} €`
        ),
    },
    {
      key: 'actions',
      header: t('actions'),
      width: '10%',
      renderItem: ({ row }) => {
        return (
          <div className="actions">
            {editingRowId === row.id ? (
              <i
                className="fa-solid fa-check"
                data-tooltip-id="actions-tooltip"
                data-tooltip-content={t('validate')}
                onClick={handleSaveEdit}></i>
            ) : (
              <i
                className="fa-solid fa-pen-to-square"
                data-tooltip-id="actions-tooltip"
                data-tooltip-content={t('edit')}
                onClick={() => handleEditClick(row)}></i>
            )}

            {editingRowId === row.id ? (
              <i
                className="fa-solid fa-times"
                data-tooltip-id="actions-tooltip"
                data-tooltip-content={t('cancel')}
                onClick={handleCancelEdit}></i>
            ) : (
              <i
                className="fa-solid fa-trash"
                data-tooltip-id="actions-tooltip"
                data-tooltip-content={t('delete')}
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
            value={''}
            placeholder="Search"
            onChange={() => null}
          />
          <span>Filter</span>
          <Button
            value="Upload CSV"
            type="secondary"
            loading={loadingButton}
            onClick={() => fileInputRef.current && fileInputRef.current.click()}
          />
          <input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            style={{ display: 'none' }} // hide input
            ref={fileInputRef}
          />
          <Button
            value="Add ingredient"
            type="primary"
            className="add"
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

      <Tooltip className="tooltip" id="actions-tooltip" />
      <Popup
        type="warning"
        msg="Are you sure you want to delete it ?"
        // subMsg='Cette action aura des impactes sur les éléments suivant : trousse, bonjour..."'
        onConfirm={() => {
          inventoryService
            .deleteIngredient(deletingRowId)
            .catch((err) => {
              togglePopupError(err.message);
            })
            .then(() => reloadInventoryData());
          togglePopupDelete();
        }}
        revele={popupDelete}
        togglePopup={togglePopupDelete}
      />
      <Popup
        type="error"
        msg={t('error.trigger') + '. ' + t('error.tryLater') + '.'}
        subMsg={popupError}
        revele={popupError === '' ? false : true}
        togglePopup={() => togglePopupError('')}
      />
      {loadingData && (
        <div className="loading-middle-page-overlay">
          <div className="loading-container">
            <Lottie type="loading" width="200px" />
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
