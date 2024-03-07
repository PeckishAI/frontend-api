import styles from './styles.module.scss';
import IngredientsTable, {
  IngredientOption,
} from '../IngredientsTable/IngredientsTable';
import { useEffect, useState } from 'react';
import { Button, Input, Select, SidePanel } from 'shared-ui';
import Basket from '../Basket/Basket';
import { Supplier } from '../../../../services';
import { useRestaurantStore } from '../../../../store/useRestaurantStore';
import supplierService from '../../../../services/supplier.service';
import { useTranslation } from 'react-i18next';
import { useIngredients } from '../../../../services/hooks';
import {
  SupplierOrder,
  ordersService,
} from '../../../../services/orders.service';
import toast from 'react-hot-toast';

type Props = {
  generatedOrder?: GeneratedOrder;
};

export type GeneratedOrder = {
  // maybe replace type by InvoiceIngredient one
  ingredients: {
    uuid: string;
    quantity: number;
  }[];
};

export type SupplierNote = {
  supplierName: string;
  note: string;
};

const ShoppingView = (props: Props) => {
  const { t } = useTranslation(['placeOrder']);
  const { ingredients } = useIngredients();
  const selectedRestaurantUUID = useRestaurantStore(
    (state) => state.selectedRestaurantUUID
  );
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [cartItems, setCartItems] = useState<IngredientOption[]>([]);
  const [supplierNotes, setSupplierNotes] = useState<SupplierNote[]>([]);
  const [basketIsOpen, setBasketIsOpen] = useState(false);

  useEffect(() => {
    if (!selectedRestaurantUUID) return;

    supplierService
      .getRestaurantSuppliers(selectedRestaurantUUID)
      .then((res) => {
        const suppliersList: Supplier[] = [];
        res.forEach((supplier) => {
          suppliersList.push(supplier);
        });
        setSuppliers(suppliersList);
      });
  }, [selectedRestaurantUUID]);

  const handleGeneratedOrder = () => {
    if (props.generatedOrder && props.generatedOrder.ingredients) {
      props.generatedOrder.ingredients.forEach((ingredient) => {
        const ingredientInventory = ingredients.find(
          (i) => i.id === ingredient.uuid
        );

        const existingItemIndex = cartItems.findIndex(
          (item) => item.ingredientUUID === ingredient.uuid
        );

        if (existingItemIndex === -1 && ingredientInventory) {
          // If ingredient isn't in cart, add it

          const newIngredient = {
            ingredientUUID: ingredientInventory.id,
            ingredientName: ingredientInventory.name,
            ingredientUnit: ingredientInventory.unit,
            ingredientQuantity: ingredient.quantity,
            ingredientUnitPrice: ingredientInventory.unitCost,
            ingredientSupplier: ingredientInventory.supplier,
          };
          setCartItems((prevCartItems) => [...prevCartItems, newIngredient]);
        } else {
          setCartItems((prevCartItems) =>
            prevCartItems.map((item, index) =>
              index === existingItemIndex
                ? {
                    ...item,
                    ingredientQuantity:
                      item.ingredientQuantity + ingredient.quantity,
                  }
                : item
            )
          );
        }
      });
      setBasketIsOpen(true);
    }
  };
  useEffect(() => {
    handleGeneratedOrder();
  }, [props.generatedOrder]);

  const toggleBasket = () => {
    setBasketIsOpen((state) => !state);
  };

  const handleSupplierChange = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
  };

  const handleOrderSubmited = () => {
    if (!selectedRestaurantUUID || !suppliers) return;

    const ingredientsBySupplier = groupIngredientsBySupplier(cartItems);

    // Create order per supplier
    const orders: SupplierOrder[] = Object.entries(ingredientsBySupplier).map(
      ([supplierName, ingredients]) => ({
        supplier_uuid:
          suppliers.find((s) => s.name === supplierName)?.uuid ?? supplierName,
        price: calculateOrderAmount(ingredients), // Calculer le montant total de la commande
        ingredients,
        note: supplierNotes.find((note) => note.supplierName === supplierName)
          ?.note,
      })
    );

    // send one by one order
    let orderSuccess = 0;
    orders.forEach((order) => {
      ordersService
        .placeSupplierOrder(selectedRestaurantUUID, order)
        .then(() => {
          orderSuccess++;
          console.log('Commande envoyée:', order);
        })
        .catch(() => {})
        .finally(() => {
          if (orderSuccess === orders.length)
            toast.success(t('placeOrder:orderSubmited'));
        });
    });
    setCartItems([]);
    setSupplierNotes([]);
    setBasketIsOpen(false);
  };

  // function to regroup ingredients by supplier
  const groupIngredientsBySupplier = (ingredients: IngredientOption[]) => {
    const ingredientsBySupplier: { [key: string]: IngredientOption[] } = {};

    ingredients.forEach((ingredient) => {
      if (!ingredientsBySupplier[ingredient.ingredientSupplier]) {
        ingredientsBySupplier[ingredient.ingredientSupplier] = [];
      }
      ingredientsBySupplier[ingredient.ingredientSupplier].push(ingredient);
    });

    return ingredientsBySupplier;
  };

  // function to calcul order price
  const calculateOrderAmount = (ingredients: IngredientOption[]) => {
    return ingredients.reduce(
      (total, ingredient) =>
        total + ingredient.ingredientQuantity * ingredient.ingredientUnitPrice,
      0
    );
  };

  return (
    <div className={styles.shoppingView}>
      <div className={styles.tools}>
        <div className={styles.filters}>
          <div className={styles.selectWrapper}>
            <Select
              placeholder={t('placeOrder:filterBySupplier')}
              options={suppliers}
              size="large"
              className={styles.supplierFilter}
              isClearable
              getOptionLabel={(option) => option.name}
              getOptionValue={(option) => option.name}
              onChange={(value) => handleSupplierChange(value)}
              value={selectedSupplier ?? null}
            />
          </div>
          <Input
            type="text"
            value={searchTerm}
            placeholder={t('placeOrder:filterByIngredient')}
            onChange={(val) => setSearchTerm(val)}
            className={styles.searchIng}
          />
        </div>
        <div className={styles.basketRecap}>
          <Button
            type="primary"
            value={t('placeOrder:basket')}
            icon={<i className="fa-solid fa-cart-shopping"></i>}
            onClick={toggleBasket}
          />
          <div className={styles.itemsNbContainer}>
            <p className={styles.itemsNb}>{cartItems.length}</p>
          </div>
        </div>
      </div>

      <IngredientsTable
        cartItems={cartItems}
        setCartItems={setCartItems}
        searchTermFilter={searchTerm}
        supplierFilter={selectedSupplier}
      />

      <SidePanel isOpen={basketIsOpen} onRequestClose={toggleBasket}>
        <Basket
          cartItems={cartItems}
          setCartItems={setCartItems}
          setSupplierNotes={setSupplierNotes}
          onOrderSubmited={handleOrderSubmited}
        />
      </SidePanel>
    </div>
  );
};

export default ShoppingView;
