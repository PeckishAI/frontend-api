import { IconButton, Input, Table, useDebounceMemo } from 'shared-ui';
import styles from './styles.module.scss';
import { useTranslation } from 'react-i18next';
import { useIngredients } from '../../../../services/hooks';
import { useEffect, useMemo, useState } from 'react';
import Fuse from 'fuse.js';
import { ColumnDefinitionType } from 'shared-ui/components/Table/Table';
import {
  useRestaurantCurrency,
  useRestaurantStore,
} from '../../../../store/useRestaurantStore';
import { formatCurrency } from '../../../../utils/helpers';
import supplierService, {
  Supplier,
} from '../../../../services/supplier.service';
import CreatableSelect from 'react-select/creatable';
import SupplierNew from '../../../Inventory/Suppliers/components/SuppplierNew';

type Props = {
  supplierFilter: Supplier | null;
  searchTermFilter: string | null;
  cartItems: IngredientOption[];
  setCartItems: React.Dispatch<React.SetStateAction<IngredientOption[]>>;
};

export type IngredientOption = {
  ingredientUUID: string;
  ingredientName: string;
  ingredientUnit: string;
  ingredientQuantity: number;
  ingredientUnitPrice: number;
  ingredientSupplier: string;
};

const IngredientsTable = (props: Props) => {
  const { t } = useTranslation(['ingredient', 'placeOrder']);
  const { ingredients, loading: loadingIngredients } = useIngredients();
  const [ingredientOptions, setIngredientOptions] = useState<
    IngredientOption[]
  >([]);
  const [inputValues, setInputValues] = useState<{ [key: string]: string }>({});
  const [newInputAdd, setNewInputAdd] = useState('');

  const [suppliers, setSuppliers] = useState<
    { label: string; value: string }[]
  >([]);
  const [showAddPopup, setShowAddPopup] = useState(false);
  const selectedRestaurantUUID = useRestaurantStore(
    (state) => state.selectedRestaurantUUID
  );

  const handleInputChange = (value, field, ingredientUUID) => {
    console.log('Value', value);
    setInputValues((prev) => ({
      ...prev,
      [ingredientUUID]: value,
    }));
    setNewInputAdd('');
  };
  const { currencyISO } = useRestaurantCurrency();

  useEffect(() => {
    if (ingredients && ingredients.length > 0) {
      const newIngredientOptions: IngredientOption[] = ingredients.map(
        (ingredient) => ({
          ingredientUUID: ingredient.id,
          ingredientName: ingredient.name,
          ingredientUnit: ingredient.unit,
          ingredientQuantity: 0,
          ingredientUnitPrice: ingredient.unitCost,
          ingredientSupplier: ingredient.supplier,
        })
      );

      setIngredientOptions(newIngredientOptions);
    }
  }, [ingredients]);

  const filteredBySupplier = useMemo(() => {
    return props.supplierFilter
      ? ingredientOptions.filter(
          (option) => option.ingredientSupplier === props.supplierFilter?.name
        )
      : ingredientOptions;
  }, [props.supplierFilter, ingredientOptions]);

  const filteredIngredients = useDebounceMemo(
    () => {
      return props.searchTermFilter
        ? new Fuse(filteredBySupplier, {
            keys: ['ingredientName'],
          })
            .search(props.searchTermFilter)
            .map((r) => r.item)
        : filteredBySupplier;
    },
    200,
    [props.searchTermFilter, filteredBySupplier]
  );

  useEffect(() => {
    if (!selectedRestaurantUUID) return;

    supplierService
      .getRestaurantSuppliers(selectedRestaurantUUID)
      .then((res) => {
        const suppliersList = res.map((supplier) => ({
          label: supplier.name,
          value: supplier.supplier_uuid,
        }));
        setSuppliers(suppliersList);
      });
  }, [selectedRestaurantUUID]);

  const handleQuantityChange = (uuid: string, newQuantity: string) => {
    const newQuantityNb = Number(newQuantity);

    if (newQuantityNb >= 0) {
      const existingItemIndex = props.cartItems.findIndex(
        (item) => item.ingredientUUID === uuid
      );

      if (existingItemIndex === -1) {
        const ingredientToAdd = ingredientOptions.find(
          (option) => option.ingredientUUID === uuid
        );
        if (ingredientToAdd) {
          props.setCartItems((prevCartItems) => [
            ...prevCartItems,
            { ...ingredientToAdd, ingredientQuantity: newQuantityNb },
          ]);
        }
      } else {
        props.setCartItems((prevCartItems) =>
          prevCartItems.map((item) =>
            item.ingredientUUID === uuid
              ? { ...item, ingredientQuantity: newQuantityNb }
              : item
          )
        );
      }
    } else {
      props.setCartItems((prevCartItems) =>
        prevCartItems.filter((item) => item.ingredientUUID !== uuid)
      );
    }
  };

  const placeOrderColumn: ColumnDefinitionType<
    IngredientOption,
    keyof IngredientOption
  >[] = [
    {
      key: 'ingredientName',
      header: t('ingredient:ingredientName'),
      width: '25%',
    },
    {
      key: 'ingredientSupplier',
      header: t('ingredient:supplier'),
      width: '25%',
      renderItem: ({ row }) => {
        const inputValue = inputValues[row.ingredientUUID] || '';

        return (
          <CreatableSelect
            options={suppliers}
            className={styles.input}
            inputValue={inputValue}
            value={suppliers.find((supplier) => supplier.value === inputValue)}
            onInputChange={(newInputValue) => {
              handleInputChange(newInputValue, 'supplier', row.ingredientUUID);
            }}
            onChange={(newValue, actionMeta) => {
              if (actionMeta.action === 'create-option') {
                setShowAddPopup(true);
                handleInputChange(
                  newValue.label,
                  'supplier',
                  row.ingredientUUID
                );
                setNewInputAdd(newValue.label);
              } else if (newValue) {
                handleInputChange(
                  newValue.value,
                  'supplier',
                  row.ingredientUUID
                );
              } else {
                handleInputChange('', 'supplier', row.ingredientUUID);
              }
            }}
            isClearable
            placeholder="Enter or select a supplier"
            noOptionsMessage={({ inputValue }) =>
              inputValue !== ''
                ? `Add "${inputValue}" as new supplier`
                : 'No options'
            }
            styles={{
              control: (provided) => ({
                ...provided,
                minHeight: '56px',
              }),
              menu: (provided) => ({
                ...provided,
                zIndex: 9999,
              }),
              menuList: (provided) => ({
                ...provided,
                maxHeight: '200px',
                overflowY: 'auto',
              }),
              option: (provided, state) => ({
                ...provided,
                backgroundColor: state.isSelected
                  ? '#007BFF'
                  : provided.backgroundColor,
                color: state.isSelected ? '#FFFFFF' : provided.color,
              }),
              container: (provided) => ({
                ...provided,
                overflow: 'visible',
              }),
            }}
          />
        );
      },
    },
    {
      key: 'ingredientUnitPrice',
      header: t('ingredient:unitCost'),
      renderItem: ({ index }) => (
        <p>
          {formatCurrency(
            ingredientOptions[index].ingredientUnitPrice,
            currencyISO
          )}
        </p>
      ),
    },
    {
      key: 'ingredientUnit',
      header: t('ingredient:unit'),
    },
    {
      key: 'ingredientQuantity',
      header: t('ingredient:quantity'),
      width: '15%',
      renderItem: ({ row }) => {
        const item = props.cartItems.find(
          (item) => item.ingredientUUID === row.ingredientUUID
        );

        return (
          <div className={styles.quantitySection}>
            {item === undefined ? (
              <IconButton
                icon={<i className="fa-solid fa-cart-plus"></i>}
                className={styles.addToCard}
                onClick={() => handleQuantityChange(row.ingredientUUID, '1')}
                tooltipMsg={t('placeOrder:addToBasket')}
              />
            ) : (
              <>
                <i
                  className="fa-solid fa-minus"
                  onClick={() =>
                    handleQuantityChange(
                      row.ingredientUUID,
                      String(item.ingredientQuantity - 1)
                    )
                  }></i>
                <Input
                  type="number"
                  min={0}
                  step="1"
                  placeholder={t('ingredient:placeholder.ingredientQuantity')}
                  className={styles.quantity}
                  value={item.ingredientQuantity}
                  onChange={(value) =>
                    handleQuantityChange(row.ingredientUUID, value)
                  }
                />
                <i
                  className="fa-solid fa-plus"
                  onClick={() =>
                    handleQuantityChange(
                      row.ingredientUUID,
                      String(item.ingredientQuantity + 1)
                    )
                  }></i>
              </>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <>
      <div className={styles.ingredientsContainer}>
        {loadingIngredients ? (
          <p>{t('ingredient:loadingIngredients')}</p>
        ) : (
          <>
            <div className={styles.tabContainer}>
              <Table data={filteredIngredients} columns={placeOrderColumn} />
            </div>
          </>
        )}
      </div>
      <SupplierNew
        isVisible={showAddPopup}
        onRequestClose={() => setShowAddPopup(false)}
        onNew={newInputAdd}
      />
    </>
  );
};

export default IngredientsTable;
