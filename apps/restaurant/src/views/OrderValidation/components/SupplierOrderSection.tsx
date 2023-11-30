import { useState } from 'react';
import { Checkbox, CollapsibleMenu, DialogBox, Input, Table } from 'shared-ui';
import { ColumnDefinitionType } from 'shared-ui/components/Table/Table';
import { useTranslation } from 'react-i18next';
import styles from '../OrderValidation.module.scss';
import { FaCheck, FaTimes, FaTrash } from 'react-icons/fa';
import { FaPenToSquare } from 'react-icons/fa6';
import { PredictedOrder } from '../../../utils/orders-mock';
import {
  useRestaurantCurrency,
  useRestaurantStore,
} from '../../../store/useRestaurantStore';
import { formatCurrency } from '../../../utils/helpers';

type Props = {
  data: PredictedOrder;
  isSelected: boolean;
  toggleSelect: () => void;
  onUpdateIngredient: (uuid: string, quantity: number) => void;
  onDeleteIngredient: (uuid: string) => void;
};

export const SupplierOrderSection = (props: Props) => {
  const { t } = useTranslation('common');
  const [updatingItemId, setUpdatingItemId] = useState<string | null>(null);
  const [updatingItemQuantity, setUpdatingItemQuantity] = useState<string>('');
  const [deleteIngredientUUID, setDeleteIngredientUUID] = useState<
    string | null
  >(null);
  const { currencyISO } = useRestaurantCurrency();

  const columns: ColumnDefinitionType<PredictedOrder['products'][number]>[] = [
    {
      header: t('name'),
      key: 'name',
    },
    {
      header: t('quantity'),
      key: 'quantity',
      renderItem: ({ row }) => {
        if (updatingItemId === row.id) {
          return (
            <Input
              className={styles.quantityInput}
              type="number"
              placeholder="Quantity"
              onChange={setUpdatingItemQuantity}
              value={updatingItemQuantity}
            />
          );
        }

        return `${row.quantity} ${row.unit}`;
      },
    },
    {
      header: t('price'),
      key: 'cost',
      renderItem: ({ row }) => (
        <p className={styles.priceColumn}>
          {formatCurrency(row.cost, currencyISO)}
        </p>
      ),
    },
    {
      header: t('availability'),
      key: 'availability',
    },
    {
      header: t('actions'),
      key: 'id',
      renderItem: ({ row }) => (
        <div className={styles.actions}>
          {updatingItemId === row.id ? (
            <>
              <FaCheck
                className={styles.actionButton}
                data-tooltip-id="order-tooltip"
                data-tooltip-content={t('validate')}
                onClick={() => {
                  setUpdatingItemId(null);
                  props.onUpdateIngredient(row.id, +updatingItemQuantity);
                }}
              />
              <FaTimes
                className={styles.actionButton}
                data-tooltip-id="order-tooltip"
                data-tooltip-content={t('cancel')}
                onClick={() => setUpdatingItemId(null)}
              />
            </>
          ) : (
            <>
              <FaPenToSquare
                className={styles.actionButton}
                data-tooltip-id="order-tooltip"
                data-tooltip-content={t('edit')}
                onClick={() => {
                  setUpdatingItemId(row.id);
                  setUpdatingItemQuantity(`${row.quantity}`);
                }}
              />
              <FaTrash
                className={styles.actionButton}
                data-tooltip-id="order-tooltip"
                data-tooltip-content={t('delete')}
                onClick={() => setDeleteIngredientUUID(row.id)}
              />
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <>
      <CollapsibleMenu
        className={styles.collapsibleMenu}
        header={
          <div className={styles.collapsibleHeader}>
            <p className={styles.supplierName}>{props.data.supplier}</p>
            <p className={styles.totalPrice}>{`${formatCurrency(
              props.data.products.reduce((prev, curr) => prev + curr.cost, 0),
              currencyISO
            )} (${t('order.validation.items', {
              count: props.data.products.length,
            })})`}</p>

            <Checkbox
              className={styles.checkbox}
              checked={props.isSelected}
              onCheck={() => {
                props.toggleSelect();
              }}
            />
          </div>
        }>
        <Table columns={columns} data={props.data.products} />
      </CollapsibleMenu>

      <DialogBox
        msg={t('order.validation.deleteItemPopup', {
          name: props.data.products.find((i) => i.id === deleteIngredientUUID)
            ?.name,
        })}
        type="warning"
        onRequestClose={() => setDeleteIngredientUUID(null)}
        isOpen={!!deleteIngredientUUID}
        onConfirm={() => {
          if (!deleteIngredientUUID) return;
          props.onDeleteIngredient(deleteIngredientUUID);
          setDeleteIngredientUUID(null);
        }}
      />
    </>
  );
};
