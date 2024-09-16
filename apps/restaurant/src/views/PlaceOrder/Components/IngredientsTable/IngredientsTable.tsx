import { IconButton, Input, Select, Table, useDebounceMemo } from 'shared-ui';
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
import { Supplier } from '../../../../services/supplier.service';
import SupplierNew from '../../../Inventory/Suppliers/components/SuppplierNew';

type Props = {
  supplierFilter: Supplier | null;
  searchTermFilter: string | null;
  cartItems: IngredientOption[];
  setCartItems: React.Dispatch<React.SetStateAction<IngredientOption[]>>;
};

export type IngredientSupplier = {
  supplier_uuid: string;
  supplier_name: string;
  supplier_cost: number;
  supplier_unit_uuid: string;
  supplier_unit_name: string;
};

export type IngredientOption = {
  ingredientUUID: string;
  ingredientName: string;
  ingredientQuantity: number;
  ingredientSupplier: IngredientSupplier[];
};

const IngredientsTable = (props: Props) => {
  const { t } = useTranslation(['ingredient', 'placeOrder']);
  const { ingredients, loading: loadingIngredients } = useIngredients();
  const [ingredientOptions, setIngredientOptions] = useState<
    IngredientOption[]
  >([]);
  const [newInputAdd, setNewInputAdd] = useState('');
  const [showAddPopup, setShowAddPopup] = useState(false);
  const selectedRestaurantUUID = useRestaurantStore(
    (state) => state.selectedRestaurantUUID
  );

  const { currencyISO } = useRestaurantCurrency();
  const [selectedSupplierMap, setSelectedSupplierMap] = useState<
    Record<string, string>
  >({});

  console.log('ingredients', ingredients);

  useEffect(() => {
    if (ingredients && ingredients.length > 0) {
      const newIngredientOptions: IngredientOption[] = ingredients.map(
        (ingredient) => ({
          ingredientUUID: ingredient.id,
          ingredientName: ingredient.name,
          ingredientQuantity: 0,
          ingredientSupplier: ingredient.supplier_details,
        })
      );

      setIngredientOptions(newIngredientOptions);
    }
  }, [ingredients]);

  const filteredBySupplier = useMemo(() => {
    return props.supplierFilter
      ? ingredientOptions.filter((option) =>
          option.ingredientSupplier.some(
            (supplier) => supplier.supplier_name === props.supplierFilter?.name
          )
        )
      : ingredientOptions;
  }, [props.supplierFilter, ingredientOptions]);

  const filteredIngredients = useDebounceMemo(
    () => {
      return props.searchTermFilter
        ? new Fuse(filteredBySupplier, { keys: ['ingredientName'] })
            .search(props.searchTermFilter)
            .map((r) => r.item)
        : filteredBySupplier;
    },
    200,
    [props.searchTermFilter, filteredBySupplier]
  );

  const handleSupplierChange = (uuid: string, newSupplier: string) => {
    const ingredientToUpdate = ingredientOptions.find(
      (option) => option.ingredientUUID === uuid
    );
    const selectedSupplierDetails = ingredients
      .find((ingredient) => ingredient.id === uuid)
      ?.supplier_details.find(
        (supplier) => supplier.supplier_name === newSupplier
      );

    if (ingredientToUpdate && selectedSupplierDetails) {
      props.setCartItems((prevCartItems) => {
        const existingItemIndex = prevCartItems.findIndex(
          (item) =>
            item.ingredientUUID === uuid &&
            item.ingredientSupplier[0].supplier_name === newSupplier
        );

        if (existingItemIndex !== -1) {
          // If the supplier entry already exists, return the same cart
          return prevCartItems;
        }

        // If not, add a new entry to the cart
        return [
          ...prevCartItems,
          {
            ...ingredientToUpdate,
            ingredientSupplier: [selectedSupplierDetails], // Set supplier array here
            ingredientQuantity: 1,
          },
        ];
      });

      setSelectedSupplierMap((prevMap) => ({
        ...prevMap,
        [uuid]: newSupplier,
      }));
    }
  };

  const handleQuantityChange = (
    uuid: string,
    changeAmount: number,
    supplier: string
  ) => {
    props.setCartItems((prevCartItems) => {
      return prevCartItems
        .map((item) =>
          item.ingredientUUID === uuid &&
          item.ingredientSupplier[0].supplier_name === supplier
            ? {
                ...item,
                ingredientQuantity: Math.max(
                  0,
                  item.ingredientQuantity + changeAmount
                ),
              }
            : item
        )
        .filter((item) => item.ingredientQuantity > 0);
    });
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
        const ingredient = ingredients.find(
          (ing) => ing.id === row.ingredientUUID
        );

        const supplierNames =
          ingredient?.supplier_details.map((supplier) => ({
            label: supplier.supplier_name,
            value: supplier.supplier_name,
          })) || [];

        const selectedSupplier =
          selectedSupplierMap[row.ingredientUUID] || null;

        // Only show dropdown if there are more than 1 supplier, else show supplier directly
        return supplierNames.length > 1 ? (
          <Select
            size="Large"
            options={supplierNames}
            isMulti={false}
            value={
              selectedSupplier
                ? { label: selectedSupplier, value: selectedSupplier }
                : null
            }
            placeholder={'Select supplier'}
            onChange={(selectedOption) => {
              const newSupplier = selectedOption?.value || '';
              handleSupplierChange(row.ingredientUUID, newSupplier);
            }}
          />
        ) : (
          <p>{supplierNames[0]?.label || '--'}</p>
        );
      },
    },
    {
      key: 'ingredientUnitPrice',
      header: t('ingredient:unitCost'),
      renderItem: ({ row }) => {
        // Find the selected supplier based on user selection or default to the first supplier
        const selectedSupplier =
          row.ingredientSupplier.find(
            (supplier) =>
              supplier.supplier_name === selectedSupplierMap[row.ingredientUUID]
          ) || row.ingredientSupplier[0]; // Default to the first supplier

        // Ensure we have a valid supplier before accessing the supplier_cost
        if (!selectedSupplier) {
          return <p>--</p>; // Return a fallback value if no supplier is found
        }

        return (
          <p>
            {formatCurrency(selectedSupplier.supplier_cost || 0, currencyISO)}
          </p>
        );
      },
    },
    {
      key: 'ingredientUnit',
      header: t('ingredient:unit'),
      renderItem: ({ row }) => {
        // Similar logic to ensure we have a valid supplier
        const selectedSupplier =
          row.ingredientSupplier.find(
            (supplier) =>
              supplier.supplier_name === selectedSupplierMap[row.ingredientUUID]
          ) || row.ingredientSupplier[0];

        if (!selectedSupplier) {
          return <p>--</p>; // Return a fallback value if no supplier is found
        }

        return <p>{selectedSupplier.supplier_unit_name || '--'}</p>;
      },
    },

    {
      key: 'ingredientQuantity',
      header: t('ingredient:quantity'),
      width: '15%',
      renderItem: ({ row }) => {
        const item = props.cartItems.find(
          (item) =>
            item.ingredientUUID === row.ingredientUUID &&
            item.ingredientSupplier[0].supplier_name ===
              selectedSupplierMap[row.ingredientUUID]
        );

        return (
          <div className={styles.quantitySection}>
            {item === undefined ? (
              <IconButton
                icon={<i className="fa-solid fa-cart-plus"></i>}
                className={styles.addToCard}
                onClick={() =>
                  handleSupplierChange(
                    row.ingredientUUID,
                    selectedSupplierMap[row.ingredientUUID] ||
                      row.ingredientSupplier[0].supplier_name
                  )
                }
                tooltipMsg={t('placeOrder:addToBasket')}
              />
            ) : (
              <>
                <i
                  className="fa-solid fa-minus"
                  onClick={() =>
                    handleQuantityChange(
                      row.ingredientUUID,
                      -1,
                      item.ingredientSupplier[0].supplier_name
                    )
                  }></i>
                <Input
                  type="number"
                  min={0}
                  step="1"
                  placeholder={t('ingredient:placeholder.ingredientQuantity')}
                  className={styles.quantity}
                  value={item.ingredientQuantity}
                  onChange={(e) =>
                    handleQuantityChange(
                      row.ingredientUUID,
                      parseInt(e.target.value, 10) - item.ingredientQuantity,
                      item.ingredientSupplier[0].supplier_name
                    )
                  }
                />
                <i
                  className="fa-solid fa-plus"
                  onClick={() =>
                    handleQuantityChange(
                      row.ingredientUUID,
                      1,
                      item.ingredientSupplier[0].supplier_name
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
