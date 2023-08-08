import { useTranslation } from 'react-i18next';
import { Table, Tabs, Dropdown, Popup } from 'shared-ui';
import { ColumnDefinitionType } from 'shared-ui/components/Table/Table';
import { DropdownOptionsDefinitionType } from 'shared-ui/components/Dropdown/Dropdown';
import { useEffect, useState } from 'react';
import { Tooltip } from 'react-tooltip';
import { inventoryService } from '../_services';

type Props = {};

type Ingredient = {
  id: string;
  ingredientName: string;
  theoriticalStock: number;
  actualStock: number;
  unit: string;
  supplier: string;
  price: number;
  actions: void;
};

const tabs = ['Stock', 'analyses', 'Orders'];

const units: DropdownOptionsDefinitionType[] = [
  { label: 'g', value: 'g' },
  { label: 'kg', value: 'kg' },
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
  const [selectedUnit, setSelectedUnit] = useState<{
    [key: string]: string;
  }>({});
  const [selectedSupplier, setSelectedSupplier] = useState<{
    [key: string]: string;
  }>({});
  const [popupRevele, setPopupRevele] = useState(false);

  const toggleTab = (tabIndex: number) => {
    setSelectedTab(tabIndex);
  };

  useEffect(() => {
    inventoryService.getIngredientList().then((res) => {
      setIngredientsList(res.data);
    });
  }, []);

  const onUnitChange = (row, event) => {
    setSelectedUnit({
      ...selectedUnit,
      [row.id]: event.target.value,
    });
  };

  const onSupplierChange = (row, event) => {
    setSelectedSupplier({
      ...selectedSupplier,
      [row.id]: event.target.value,
    });
  };

  const togglePopup = () => {
    setPopupRevele(!popupRevele);
  };

  const columns: ColumnDefinitionType<Ingredient, keyof Ingredient>[] = [
    {
      key: 'ingredientName',
      header: t('ingredientName'),
      classname: 'column-bold',
    },
    { key: 'theoriticalStock', header: t('theoriticalStock') },
    { key: 'actualStock', header: t('actualStock') },
    {
      key: 'unit',
      header: t('unit'),
      renderItem: (row) => (
        <Dropdown
          options={units}
          selectedOption={selectedUnit[row.id]}
          onOptionChange={(e) => onUnitChange(row, e)}
        />
      ),
    },
    {
      key: 'supplier',
      header: t('supplier'),
      renderItem: (row) => (
        <Dropdown
          options={suppliers}
          selectedOption={selectedSupplier[row.id]}
          onOptionChange={(e) => onSupplierChange(row, e)}
        />
      ),
    },
    {
      key: 'price',
      header: t('price'),
      renderItem: (row) => `${row.price} €`,
      classname: 'column-bold',
    },
    {
      key: 'actions',
      header: t('actions'),
      renderItem: (row) => {
        return (
          <div className="actions">
            <i
              className="fa-solid fa-pen-to-square"
              data-tooltip-id="actions-tooltip"
              data-tooltip-content={t('edit')}></i>
            <i
              className="fa-solid fa-trash"
              data-tooltip-id="actions-tooltip"
              data-tooltip-content={t('delete')}
              onClick={togglePopup}></i>
          </div>
        );
      },
    },
  ];

  return (
    <div className="inventory">
      <Tabs tabs={tabs} onClick={toggleTab} selectedIndex={selectedTab} />

      {selectedTab === 0 && <Table data={ingredientsList} columns={columns} />}
      <Tooltip className="tooltip" id="actions-tooltip" />
      <Popup
        type="warning"
        msg="Are you sure you want to delete it ?"
        subMsg='Cette action aura des impactes sur les éléments suivant : trousse, bonjour..."'
        onConfirm={() => {
          console.log('supression confirmée');
          togglePopup();
        }}
        revele={popupRevele}
        togglePopup={togglePopup}
      />
    </div>
  );
};

export default Inventory;
