import { IconButton, Input, Table, useDebounceMemo } from 'shared-ui';
import styles from './styles.module.scss';
import { useTranslation } from 'react-i18next';
import { useIngredients } from '../../../../services/hooks';
import { useEffect, useMemo, useState } from 'react';
import Fuse from 'fuse.js';
import { ColumnDefinitionType } from 'shared-ui/components/Table/Table';
import { useRestaurantCurrency } from '../../../../store/useRestaurantStore';
import { formatCurrency } from '../../../../utils/helpers';
import { Supplier } from '../../../../services/supplier.service';
import Select from 'react-select';

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
  ingredientSupplier: {
    supplier_name: string;
    supplier_cost: number;
  }[];
};

const IngredientsTable = (props: Props) => {
  const { t } = useTranslation(['ingredient', 'placeOrder']);

  const { ingredients, loading: loadingIngredients } = useIngredients();
  const [ingredientOptions, setIngredientOptions] = useState<
    IngredientOption[]
  >([]);
  const { currencyISO } = useRestaurantCurrency();
  const [selectedSupplierMap, setSelectedSupplierMap] = useState<
    Record<string, string>
  >({});

  // Set ingredientList
  useEffect(() => {
    if (ingredients && ingredients.length > 0) {
      const newIngredientOptions: IngredientOption[] = ingredients.map(
        (ingredient) => {
          // Get the first supplier's details if available
          const firstSupplier =
            ingredient.supplier_details.length > 0
              ? ingredient.supplier_details[0]
              : { supplier_name: '', supplier_cost: 0 };

          // Map over supplier_details and join supplier_names
          const supplierNames = ingredient.supplier_details
            .map((supplier) => supplier.supplier_name)
            .join(', '); // Join names with comma

          return {
            ingredientUUID: ingredient.id,
            ingredientName: ingredient.name,
            ingredientUnit: ingredient.unit,
            ingredientQuantity: 0,
            ingredientUnitPrice: firstSupplier.supplier_cost, // Use the first supplier's cost
            ingredientSupplier: supplierNames, // Use concatenated supplier names
          };
        }
      );

      setIngredientOptions(newIngredientOptions);
    }
  }, [ingredients]);

  const filteredBySupplier = useMemo(() => {
    return props.supplierFilter
      ? ingredientOptions.filter((option) => {
          // Split the ingredientSupplier string into an array of supplier names
          const supplierNamesArray = option.ingredientSupplier
            .split(',')
            .map((supplier) => supplier.trim());

          // Check if the selected supplier exists in the array
          return supplierNamesArray.includes(props.supplierFilter.name);
        })
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
            item.ingredientSupplier === newSupplier
        );

        if (existingItemIndex !== -1) {
          // If the supplier entry already exists, increase the quantity by 1
          const updatedCartItems = [...prevCartItems];
          updatedCartItems[existingItemIndex].ingredientQuantity += 1;
          return updatedCartItems;
        }

        // If not, add a new entry to the cart
        return [
          ...prevCartItems,
          {
            ...ingredientToUpdate,
            ingredientSupplier: newSupplier,
            ingredientUnitPrice: selectedSupplierDetails.supplier_cost,
            ingredientQuantity: 1,
          },
        ];
      });

      setSelectedSupplierMap((prevMap) => ({
        ...prevMap,
        [uuid]: newSupplier,
      }));

      setIngredientOptions((prevOptions) =>
        prevOptions.map((option) =>
          option.ingredientUUID === uuid
            ? {
                ...option,
                ingredientSupplier: newSupplier,
                ingredientUnitPrice: selectedSupplierDetails.supplier_cost,
              }
            : option
        )
      );
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
          item.ingredientUUID === uuid && item.ingredientSupplier === supplier
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

        const supplierNames = ingredient?.supplier_details.map((supplier) => ({
          label: supplier.supplier_name,
          value: supplier.supplier_name,
        }));

        if (supplierNames.length === 1) {
          // If there is only one supplier, show the name directly
          return <p>{supplierNames[0].label}</p>;
        }

        const selectedSupplier =
          selectedSupplierMap[row.ingredientUUID] || null; // Initially null to show placeholder

        return (
          <Select
            options={supplierNames}
            isMulti={false}
            value={
              selectedSupplier
                ? { label: selectedSupplier, value: selectedSupplier }
                : null
            }
            placeholder={'Select supplier'} // Placeholder will show "Select supplier"
            onChange={(selectedOption) => {
              const newSupplier = selectedOption?.value || '';
              handleSupplierChange(row.ingredientUUID, newSupplier);
            }}
          />
        );
      },
    },
    {
      key: 'ingredientUnitPrice',
      header: t('ingredient:unitCost'),
      renderItem: ({ row }) => (
        <p>{formatCurrency(row.ingredientUnitPrice, currencyISO)}</p>
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
          (item) =>
            item.ingredientUUID === row.ingredientUUID &&
            item.ingredientSupplier === selectedSupplierMap[row.ingredientUUID]
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
                      row.ingredientSupplier
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
                      item.ingredientSupplier
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
                      item.ingredientSupplier
                    )
                  }
                />
                <i
                  className="fa-solid fa-plus"
                  onClick={() =>
                    handleQuantityChange(
                      row.ingredientUUID,
                      1,
                      item.ingredientSupplier
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
  );
};

export default IngredientsTable;
