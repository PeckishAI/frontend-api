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

  const { currencyISO } = useRestaurantCurrency();

  // set ingredientList
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

  const handleQuantityChange = (uuid: string, newQuantity: string) => {
    const newQuantityNb = Number(newQuantity);

    // Update cartItems
    if (newQuantityNb >= 0) {
      const existingItemIndex = props.cartItems.findIndex(
        (item) => item.ingredientUUID === uuid
      );

      if (existingItemIndex === -1) {
        // If the ingredient isn't in cart, add it
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
        // Else, update ingredient quantity in cart
        props.setCartItems((prevCartItems) =>
          prevCartItems.map((item) =>
            item.ingredientUUID === uuid
              ? { ...item, ingredientQuantity: newQuantityNb }
              : item
          )
        );
      }
    } else {
      // If the quantity requested is equal to 0, remove item
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
      header: t('ingredient:placeholder.ingredientQuantity'),
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
