import { Button } from 'shared-ui';
import styles from './OrderValidation.module.scss';
import { useTranslation } from 'react-i18next';
import { Tooltip } from 'react-tooltip';
import { SupplierOrderSection } from './components/SupplierOrderSection';
import { useState } from 'react';
import { FaPlus } from 'react-icons/fa';
import { SelectIngredientPopup } from './components/SelectIngredientPopup';
import { Ingredient } from '../../services';

export type OrderForecast = {
  id: string;
  supplierName: string;
  items: {
    id: string;
    name: string;
    quantity: number;
    unit: string;
    price: number;
    availability: string;
  }[];
};

const ORDER_FORECAST: OrderForecast[] = [
  {
    id: '1',
    supplierName: 'Metro',
    items: [
      {
        id: '1',
        name: 'Tomato',
        quantity: 10,
        unit: 'kg',
        price: 10,
        availability: 'YES',
      },
      {
        id: '2',
        name: 'Potato',
        quantity: 10,
        unit: 'kg',
        price: 10,
        availability: 'YES',
      },
      {
        id: '3',
        name: 'Onion',
        quantity: 10,
        unit: 'kg',
        price: 10,
        availability: 'YES',
      },
    ],
  },
  {
    id: '2',
    supplierName: 'Metro',
    items: [
      {
        id: '1',
        name: 'Tomato',
        quantity: 10,
        unit: 'kg',
        price: 10,
        availability: 'NO',
      },
      {
        id: '2',
        name: 'Potato',
        quantity: 10,
        unit: 'kg',
        price: 10,
        availability: 'NO',
      },
      {
        id: '3',
        name: 'Onion',
        quantity: 10,
        unit: 'kg',
        price: 10,
        availability: 'NO',
      },
    ],
  },
];

export const OrderValidation = () => {
  const { t } = useTranslation('common');
  const [orderForecast, setOrderForecast] =
    useState<OrderForecast[]>(ORDER_FORECAST);
  const [isSelectIngredientPopupVisible, setSelectIngredientPopupVisible] =
    useState(false);

  const handleUpdateIngredient =
    (orderUUID: string) => (ingredientUUID: string, quantity: number) => {
      setOrderForecast(
        orderForecast.map((supplierOrder) => {
          if (supplierOrder.id !== orderUUID) return supplierOrder;
          return {
            ...supplierOrder,
            items: supplierOrder.items.map((item) => ({
              ...item,
              quantity: item.id === ingredientUUID ? quantity : item.quantity,
            })),
          };
        }) as OrderForecast[]
      );
    };

  const handleDeleteIngredient =
    (orderUUID: string) => (ingredientUUID: string) => {
      if (
        orderForecast.filter(
          (supplierOrder) => supplierOrder.id === orderUUID
        )[0].items.length === 1
      ) {
        setOrderForecast(
          orderForecast.filter(
            (supplierOrder) => supplierOrder.id !== orderUUID
          )
        );
        return;
      }

      setOrderForecast(
        orderForecast.map((supplierOrder) => {
          if (supplierOrder.id !== orderUUID) return supplierOrder;
          return {
            ...supplierOrder,
            items: supplierOrder.items.filter(
              (item) => item.id !== ingredientUUID
            ),
          };
        }) as OrderForecast[]
      );
    };

  const handleAddIngredient = (ingredient: Ingredient, quantity: number) => {
    const supplierOrder = orderForecast.find(
      (order) => order.supplierName === ingredient.supplier
    );

    if (supplierOrder) {
      setOrderForecast(
        orderForecast.map((order) => {
          if (order.supplierName !== ingredient.supplier) return order;
          return {
            ...order,
            items: [
              ...order.items,
              {
                id: ingredient.id,
                name: ingredient.name,
                quantity,
                unit: ingredient.unit,
                price: ingredient.cost * quantity,
                availability: 'Unknown',
              },
            ],
          };
        })
      );
    } else {
      setOrderForecast([
        ...orderForecast,
        {
          id: ingredient.id,
          supplierName: ingredient.supplier,
          items: [
            {
              id: ingredient.id,
              name: ingredient.name,
              quantity,
              unit: ingredient.unit,
              price: ingredient.cost * quantity,
              availability: 'Unknown',
            },
          ],
        },
      ]);
    }

    setSelectIngredientPopupVisible(false);
  };

  return (
    <div className={styles.pageLayout}>
      <div className={styles.pageHeader}>
        <p className={styles.pageDescription}>
          Peckish have predicted this order for your next week. You can remove
          or update quantity of each elements.
        </p>
        <Button
          icon={<FaPlus />}
          onClick={() => setSelectIngredientPopupVisible(true)}
          type="primary"
          value="Add ingredient"
        />
      </div>

      {orderForecast.map((order) => (
        <SupplierOrderSection
          key={order.id}
          data={order}
          onUpdateIngredient={handleUpdateIngredient(order.id)}
          onDeleteIngredient={handleDeleteIngredient(order.id)}
        />
      ))}

      <div className={styles.bottomSection}>
        <div className={styles.totalOrderPriceContainer}>
          <p className={styles.totalOrderPriceLabel}>Total :</p>
          <p className={styles.totalOrderPrice}>
            {orderForecast.reduce((acc, order) => {
              return (
                acc +
                order.items.reduce((acc, item) => {
                  return acc + item.price;
                }, 0)
              );
            }, 0)}
            €
          </p>
        </div>
        <Button
          value="Submit order"
          type="primary"
          className={styles.validateOrderButton}
        />
      </div>

      <Tooltip id="order-tooltip" className="tooltip" />

      <SelectIngredientPopup
        isVisible={isSelectIngredientPopupVisible}
        onRequestClose={() => setSelectIngredientPopupVisible(false)}
        onAddIngredient={handleAddIngredient}
      />
    </div>
  );
};
