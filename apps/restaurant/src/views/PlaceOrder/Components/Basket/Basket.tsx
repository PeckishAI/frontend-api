import { Button, DialogBox, Input, useDebounceEffect } from 'shared-ui';
import styles from './styles.module.scss';
import { useRestaurantCurrency } from '../../../../store/useRestaurantStore';
import { IngredientOption } from '../IngredientsTable/IngredientsTable';
import { formatCurrency } from '../../../../utils/helpers';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { SupplierNote } from '../ShoppingView/ShoppingView';
import classNames from 'classnames';

type Props = {
  cartItems: IngredientOption[];
  setCartItems: React.Dispatch<React.SetStateAction<IngredientOption[]>>;
  setSupplierNotes: React.Dispatch<React.SetStateAction<SupplierNote[]>>;
  onOrderSubmited: () => void;
};

const Basket = (props: Props) => {
  const { t } = useTranslation(['placeOrder', 'common', 'ingredient']);
  const { currencyISO } = useRestaurantCurrency();

  const [removeItemPopup, setRemoveItemPopup] = useState('');
  // notes Values for each supplier stored here to avoid update parent state on valuesChange
  const [notesValues, setNotesValues] = useState<SupplierNote[]>([]);

  // Create an object where suppliers are keys and ingredients values.
  const ingredientsBySupplier: Record<string, IngredientOption[]> =
    props.cartItems.reduce((acc, item) => {
      if (!acc[item.ingredientSupplier]) {
        acc[item.ingredientSupplier] = [];
      }
      acc[item.ingredientSupplier].push(item);
      return acc;
    }, {});

  const totalAmount = props.cartItems.reduce((total, item) => {
    return total + item.ingredientUnitPrice * item.ingredientQuantity;
  }, 0);

  const handleRemoveItem = (itemId: string) => {
    const updatedCartItems = props.cartItems.filter(
      (item) => item.ingredientUUID !== itemId
    );
    props.setCartItems(updatedCartItems);
    setRemoveItemPopup('');
  };

  const handleQuantityChange = (uuid: string, newQuantity: string) => {
    const item = props.cartItems.find((item) => item.ingredientUUID === uuid);

    if (item !== undefined) {
      const newQuantityNb = Number(newQuantity);
      if (newQuantityNb <= 0) setRemoveItemPopup(uuid);
      else {
        props.setCartItems((prevCartItems) =>
          prevCartItems.map((item) =>
            item.ingredientUUID === uuid
              ? { ...item, ingredientQuantity: newQuantityNb }
              : item
          )
        );
      }
    }
  };

  const handleNotesValuesChange = (supplierName: string, newNote: string) => {
    setNotesValues((prevNotes) => {
      const supplierIndex = prevNotes.findIndex(
        (note) => note.supplierName === supplierName
      );

      const updatedSupplierNotes = [...prevNotes];

      if (supplierIndex !== -1) {
        updatedSupplierNotes[supplierIndex] = {
          ...updatedSupplierNotes[supplierIndex],
          note: newNote,
        };
      } else {
        updatedSupplierNotes.push({
          supplierName: supplierName,
          note: newNote,
        });
      }
      return updatedSupplierNotes;
    });
  };

  const handleCreateNote = (supplierName: string) => {
    setNotesValues((prevList) => [
      ...prevList,
      { supplierName: supplierName, note: '' },
    ]);
  };
  const handleRemoveNote = (supplierName: string) => {
    setNotesValues((prevList) =>
      prevList.filter((item) => item.supplierName !== supplierName)
    );
  };

  // update supplierNotes in parent component with 500ms debounce to avoid spam and lag
  useDebounceEffect(
    () => {
      props.setSupplierNotes(notesValues);
    },
    500,
    [notesValues]
  );

  const handlePlaceOrder = () => {
    setNotesValues([]);
    props.onOrderSubmited();
  };

  return (
    <div className={styles.basket}>
      <>
        <h2 className={styles.title}>
          <i className="fa-solid fa-cart-shopping"></i>
          {t('placeOrder:shoppingBasket')}
        </h2>
        {props.cartItems.length === 0 && (
          <p
            style={{
              textAlign: 'center',
              marginTop: '200px',
            }}>
            {t('placeOrder:basketIsEmpty')}
          </p>
        )}
        <div className={styles.container}>
          {Object.entries(ingredientsBySupplier).map(([supplier, items]) => (
            <div className={styles.ingredientsBySupplier} key={supplier}>
              <p className={styles.supplierName}>
                {supplier === 'null' ? t('common:unknown') : supplier}
              </p>
              <div className={styles.ingredients}>
                {items.map((item) => (
                  <div className={styles.row} key={item.ingredientUUID}>
                    <p className={styles.label}>{item.ingredientName}</p>
                    <div className={styles.qantityContainer}>
                      <p className={styles.qty}>{item.ingredientUnit} x</p>
                      <i
                        className="fa-solid fa-minus"
                        onClick={() =>
                          handleQuantityChange(
                            item.ingredientUUID,
                            String(item.ingredientQuantity - 1)
                          )
                        }></i>
                      <Input
                        type="number"
                        min={0}
                        step="1"
                        placeholder={t('common:quantity')}
                        className={styles.quantity}
                        value={item.ingredientQuantity}
                        onChange={(value) =>
                          handleQuantityChange(item.ingredientUUID, value)
                        }
                      />
                      <i
                        className="fa-solid fa-plus"
                        onClick={() =>
                          handleQuantityChange(
                            item.ingredientUUID,
                            String(item.ingredientQuantity + 1)
                          )
                        }></i>
                    </div>
                    <p className={styles.cost}>
                      {formatCurrency(
                        item.ingredientQuantity * item.ingredientUnitPrice,
                        currencyISO
                      )}
                    </p>
                  </div>
                ))}
              </div>
              <div className={styles.supplierNote}>
                {notesValues.find((s) => s.supplierName === supplier) ===
                undefined ? (
                  <p onClick={() => handleCreateNote(supplier)}>
                    <i className="fa-solid fa-plus"></i> Add note for {supplier}
                  </p>
                ) : (
                  <>
                    <p onClick={() => handleRemoveNote(supplier)}>
                      <i className="fa-solid fa-minus"></i> Remove note for{' '}
                      {supplier}
                    </p>
                    <textarea
                      onChange={(e) =>
                        handleNotesValuesChange(supplier, e.target.value)
                      }
                      placeholder={`Note for ${supplier}`}
                      className={classNames(styles.note, 'input')}>
                      {notesValues.find((s) => s.supplierName === supplier)
                        ?.note ?? ''}
                    </textarea>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </>
      <div>
        <div className={styles.total}>
          <p>{t('placeOrder:total')} :</p>
          <p className={styles.amount}>
            {formatCurrency(totalAmount, currencyISO)}
          </p>
        </div>
        <Button
          type="primary"
          value={t('placeOrder:placeOrder.title')}
          className={styles.submit}
          disabled={totalAmount === 0}
          onClick={handlePlaceOrder}
        />
      </div>
      <DialogBox
        isOpen={removeItemPopup !== ''}
        type="warning"
        onRequestClose={() => setRemoveItemPopup('')}
        msg={t('placeOrder:basket.removeItem.message')}
        onConfirm={() => handleRemoveItem(removeItemPopup)}
      />
    </div>
  );
};

export default Basket;
