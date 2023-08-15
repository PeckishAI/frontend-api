import { useTranslation } from 'react-i18next';
import { Table, Tabs, Dropdown, Popup, Input, Lottie } from 'shared-ui';
import { ColumnDefinitionType } from 'shared-ui/components/Table/Table';
import { DropdownOptionsDefinitionType } from 'shared-ui/components/Dropdown/Dropdown';
import { useEffect, useState } from 'react';
import { Tooltip } from 'react-tooltip';
import { inventoryService } from '../_services';

type Props = {};

type Ingredient = {
  id: string;
  name: string;
  theoriticalStock: number;
  quantity: number;
  unit: string;
  supplier: string;
  cost: number;
  actions: void;
};

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
  { label: 'Supply Depot', value: 'supplyDepot' },
  { label: 'Crown Distributing', value: 'crownDistributing' },
  { label: 'Worldwide Beverages', value: 'worldwideBeverages' },
];

const Inventory = (props: Props) => {
  const { t } = useTranslation('common');

  const [selectedTab, setSelectedTab] = useState(0);
  const [ingredientsList, setIngredientsList] = useState<Ingredient[]>();
  const [editingRowId, setEditingRowId] = useState<string | null>();
  const [deletingRowId, setDeletingRowId] = useState<string | null>();
  const [editedValues, setEditedValues] = useState<Ingredient | null>(null);
  const [popupRevele, setPopupRevele] = useState(false);
  const [loadingData, setLoadingdata] = useState(false);

  const toggleTab = (tabIndex: number) => {
    setSelectedTab(tabIndex);
  };

  function reloadInventoryData() {
    (async () => {
      try {
        setLoadingdata(true);
        const list = await inventoryService.getIngredientList();
        if (list.requestStatus === 200) {
          setLoadingdata(false);
        }
        setIngredientsList(list.data);
      } catch (error) {
        console.error('Error fetching ingredient list:', error);
      }
    })();
  }
  useEffect(() => {
    reloadInventoryData();
  }, []);

  const handleEditClick = (row: Ingredient) => {
    setEditingRowId(row.id);
    setEditedValues({ ...row });
  };

  const handleSaveEdit = () => {
    console.log('line edited saved'); // request to api on /update...
    setLoadingdata(true);
    inventoryService.updateIngredient(editedValues).then((res) => {
      if (res.status === 200) {
        reloadInventoryData();
      }
    });

    setEditingRowId(null);
    setEditedValues(null);
  };

  const handleCancelEdit = () => {
    setEditingRowId(null);
    setEditedValues(null);
  };

  const handleDeleteClick = (row: Ingredient) => {
    setDeletingRowId(row.id);
    togglePopupDelete();
  };

  const handleValueChange = (field: keyof Ingredient, value: any) => {
    setEditedValues((prevValues) => ({
      ...prevValues!,
      [field]: value,
    }));
  };

  const togglePopupDelete = () => {
    setPopupRevele(!popupRevele);
  };

  const columns: ColumnDefinitionType<Ingredient, keyof Ingredient>[] = [
    {
      key: 'name',
      header: t('ingredientName'),
      width: '15%',
      classname: 'column-bold',
      renderItem: (row) =>
        editingRowId === row.id ? (
          <Input
            type="text"
            min={0}
            placeholder="Quantity"
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
      renderItem: (row) =>
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
      renderItem: (row) =>
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
      renderItem: (row) =>
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
      renderItem: (row) =>
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
      renderItem: (row) => {
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
          <button className="button upload">Upload CSV</button>
          <button className="button add">Add ingredient</button>
        </div>
      </div>

      {selectedTab === 0 && <Table data={ingredientsList} columns={columns} />}
      <Tooltip className="tooltip" id="actions-tooltip" />
      <Popup
        type="warning"
        msg="Are you sure you want to delete it ?"
        // subMsg='Cette action aura des impactes sur les éléments suivant : trousse, bonjour..."'
        onConfirm={() => {
          console.log('editing row id :', deletingRowId);

          inventoryService.deleteIngredient(deletingRowId);
          console.log('after');

          togglePopupDelete();
        }}
        revele={popupRevele}
        togglePopup={togglePopupDelete}
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
