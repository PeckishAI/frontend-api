import {
  forwardRef,
  useImperativeHandle,
  useMemo,
  useState,
  useEffect,
} from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button,
  Table,
  OrderDetail,
  Popup,
  LabeledInput,
  Input,
  Dropdown,
} from 'shared-ui';
import { DropdownOptionsDefinitionType } from 'shared-ui/components/Dropdown/Dropdown';
import { useIngredients } from '../../../services/hooks';
import { ColumnDefinitionType } from 'shared-ui/components/Table/Table';
import { useNavigate } from 'react-router-dom';
import classNames from 'classnames';
import styles from './OrderTab.module.scss';
import { Tooltip } from 'react-tooltip';
import { Order, useOrders } from '../../../utils/orders-mock';
import { formatCurrency } from '../../../utils/helpers';
import { useRestaurantCurrency } from '../../../store/useRestaurantStore';
import { Ingredient, Invoice, inventoryService } from '../../../services';
import dayjs from 'dayjs';

export type OrderTabRef = {
  renderOptions: () => React.ReactNode;
};

type Props = {
  forceOptionsUpdate: () => void;
  isVisible: boolean;
  onRequestClose: () => void;
};

interface IngredientOption {
  ingredientUUID: string;
  ingredientName: string;
  ingredientUnit: string;
  ingredientQuantity: number;
  ingredientUnitPrice: number;
  ingredientSupplier: string;
}

export const units: DropdownOptionsDefinitionType[] = [
  { label: 'kg', value: 'kg' },
  { label: 'g', value: 'g' },
  { label: 'tbsp', value: 'tbsp' },
  { label: 'l', value: 'L' },
  { label: 'ml', value: 'ml' },
  { label: 'unit', value: 'unit' },
];

export const OrderTab = forwardRef<OrderTabRef, Props>(
  (props, forwardedRef) => {
    const { t } = useTranslation('common');
    const [orderDetail, setOrderDetail] = useState<string>();
    const navigate = useNavigate();

    const [isPopupVisible, setPopupVisible] = useState(false);

    const orders = useOrders((state) => state.orders).sort((a, b) => {
      const aDate = dayjs(a.orderDate, 'DD/MM/YYYY');
      const bDate = dayjs(b.orderDate, 'DD/MM/YYYY');
      return bDate.unix() - aDate.unix();
    });

    const selectedOrder = orders.find((order) => order.uuid === orderDetail);
    const { currencyISO } = useRestaurantCurrency();

    const { ingredients, loading: loadingIngredients } = useIngredients();
    const [ingredientOptions, setIngredientOptions] = useState<
      IngredientOption[]
    >([]);

    const suppliers: DropdownOptionsDefinitionType[] = [
      { label: 'None', value: '' }, // 'None' option with an empty string as the value
      ...Array.from(
        new Set(
          ingredients
            .filter((ingredient) => ingredient.supplier)
            .map((ingredient) => ingredient.supplier)
        )
      ).map((supplier) => ({
        label: supplier,
        value: supplier,
      })),
    ];

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

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSupplier, setSelectedSupplier] = useState('');

    const filteredIngredientOptions = useMemo(() => {
      return ingredientOptions.filter((option) => {
        // Filter by search term
        const matchesSearchTerm = option.ingredientName
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase());

        // Filter by selected supplier
        const matchesSupplier = selectedSupplier
          ? option.ingredientSupplier === selectedSupplier
          : true; // If 'None' or no supplier is selected, include all options

        return matchesSearchTerm && matchesSupplier;
      });
    }, [ingredientOptions, searchTerm, selectedSupplier]);

    const handleQuantityChange = (index, newQuantity) => {
      setIngredientOptions((currentOptions) =>
        currentOptions.map((option, idx) =>
          idx === index
            ? { ...option, ingredientQuantity: parseFloat(newQuantity) || 0 }
            : option
        )
      );
    };

    const increaseUnit = (index) => {
      setIngredientOptions((currentOptions) =>
        currentOptions.map((option, idx) =>
          idx === index
            ? { ...option, ingredientQuantity: option.ingredientQuantity + 1 }
            : option
        )
      );
    };

    const decreaseUnit = (index) => {
      setIngredientOptions((currentOptions) =>
        currentOptions.map((option, idx) =>
          idx === index
            ? {
                ...option,
                ingredientQuantity: Math.max(0, option.ingredientQuantity - 1),
              }
            : option
        )
      );
    };

    // Render options for the tab bar
    useImperativeHandle(
      forwardedRef,
      () => {
        props.forceOptionsUpdate();

        return {
          renderOptions: () => (
            <div className={styles.orderButtonSection}>
              <Button
                value={t('orders.placeOrder')}
                type="primary"
                onClick={() => setPopupVisible(true)}
                className={styles.orderButton}
              />
              <Button
                value={t('orders.showPredictedOrder')}
                type="primary"
                onClick={() => navigate('/orders/validation')}
              />
            </div>
          ),
        };
      },
      []
    );

    const columns: ColumnDefinitionType<Order>[] = useMemo(
      () => [
        { key: 'supplier', header: t('orders.supplier') },
        { key: 'orderDate', header: t('orders.orderDate') },
        { key: 'deliveryDate', header: t('orders.deliveryDate') },
        {
          key: 'status',
          header: t('orders.status'),
          renderItem: ({ row }) => t(`orders.statusStates.${row.status}`),
        },
        {
          key: 'price',
          header: t('price'),
          renderItem: ({ row }) => formatCurrency(row.price, currencyISO),
          classname: 'column-bold',
        },
        {
          key: 'uuid',
          header: t('orders.detail'),
          renderItem: ({ row }) => {
            return (
              <>
                <i
                  className={classNames(
                    'fa-solid fa-arrow-up-right-from-square',
                    styles.icon
                  )}
                  data-tooltip-id="detail-tooltip"
                  data-tooltip-content={t('orders.detail.tooltip')}
                  onClick={() => setOrderDetail(row.uuid)}
                />
              </>
            );
          },
        },
      ],
      [t, currencyISO]
    );

    const placeOrderColumn = [
      {
        key: 'ingredientName',
        header: t('ingredientName'),
        classname: 'column-bold',
        renderItem: ({ row, index }) => (
          <p>{ingredientOptions[index].ingredientName}</p>
        ),
      },
      {
        key: 'supplier',
        header: t('orders.supplier'),
        classname: 'column-bold',
        renderItem: ({ row, index }) => (
          <p>{ingredientOptions[index].ingredientSupplier}</p>
        ),
      },
      {
        key: 'quantity',
        header: t('quantity'),
        classname: 'column-bold',
        renderItem: ({ row, index }) => (
          <div className={styles.quantitySection}>
            <Button
              type="primary"
              actionType="submit"
              value={t('orders.decreaseQuantity')}
              className="button-fixed-bottom"
              onClick={() => decreaseUnit(index)}
            />
            <Input
              type="number"
              min={0}
              step="0.01"
              placeholder={t('quantity')}
              className={styles.quantity}
              value={ingredientOptions[index].ingredientQuantity}
              onChange={(value) => handleQuantityChange(index, value)}
            />
            <Button
              type="primary"
              actionType="submit"
              value={t('orders.increaseQuantity')}
              className="button-fixed-bottom"
              onClick={() => increaseUnit(index)}
            />
          </div>
        ),
      },
      {
        key: 'unit',
        header: t('unit'),
        classname: 'column-bold',
        renderItem: ({ row, index }) => (
          // <Dropdown
          //   placeholder={t('inventory.selectUnit')}
          //   options={units}
          //   selectedOption={ingredientOptions[index].ingredientUnit}
          //   onOptionChange={(value) => handleValueChange('unit', value)}
          // />
          <p>{ingredientOptions[index].ingredientUnit}</p>
        ),
      },
      {
        key: 'unitPrice',
        header: t('unitCost'),
        classname: 'column-bold',
        renderItem: ({ row, index }) => (
          <p>{ingredientOptions[index].ingredientUnitPrice}</p>
        ),
      },
      {
        key: 'totalPrice',
        header: t('totalCost'),
        classname: 'column-bold',
        renderItem: ({ row, index }) => (
          <p>
            {formatCurrency(
              ingredientOptions[index].ingredientUnitPrice *
                ingredientOptions[index].ingredientQuantity || 0,
              currencyISO
            )}
          </p>
        ),
      },
    ];

    return (
      <div className="orders">
        <Table data={orders} columns={columns} />
        <OrderDetail
          isVisible={orderDetail !== undefined}
          onRequestClose={() => setOrderDetail(undefined)}
          upperBanner={
            selectedOrder
              ? [
                  {
                    title: t('orders.supplier'),
                    value: selectedOrder.supplier,
                  },
                  {
                    title: t('orders.deliveryDate'),
                    value: selectedOrder.deliveryDate,
                  },
                  {
                    title: t('price'),
                    value: formatCurrency(selectedOrder.price, currencyISO),
                  },
                  {
                    title: t('orders.status'),
                    value: t(`orders.statusStates.${selectedOrder.status}`),
                  },
                ]
              : []
          }
          tableHeaders={[
            {
              key: 'name',
              header: t('name'),
            },
            {
              key: 'quantity',
              header: t('quantity'),
              renderItem: ({ row }) => `${row.quantity} ${row.unit}`,
            },

            {
              key: 'unitCost',
              header: t('price'),
              renderItem: ({ row }) =>
                formatCurrency(row.unitCost, currencyISO),
              classname: 'column-bold',
            },
          ]}
          tableData={selectedOrder?.products || []}
        />
        <Tooltip className="tooltip" id="detail-tooltip" />
        <Popup
          isVisible={isPopupVisible}
          onRequestClose={props.onRequestClose}
          scrollable={true}>
          <div className={styles.filterContainer}>
            <LabeledInput
              lighter
              placeholder={t('search')}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Dropdown
              options={suppliers}
              selectedOption={selectedSupplier}
              onOptionChange={setSelectedSupplier}
            />
          </div>
          <Table
            data={filteredIngredientOptions}
            columns={placeOrderColumn}></Table>
          <Button
            type="primary"
            value={t('orders.placeOrder')}
            className={styles.submitButton}
          />
        </Popup>
      </div>
    );
  }
);

OrderTab.displayName = 'OrderTab';
