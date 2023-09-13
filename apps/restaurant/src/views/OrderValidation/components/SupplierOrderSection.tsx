import { useState } from 'react';
import { CollapsibleMenu, DialogBox, Input, Table } from 'shared-ui';
import { ColumnDefinitionType } from 'shared-ui/components/Table/Table';
import { OrderForecast } from '../OrderValidation';
import { useTranslation } from 'react-i18next';
import styles from '../OrderValidation.module.scss';
import { FaCheck, FaTimes, FaTrash } from 'react-icons/fa';
import { FaPenToSquare } from 'react-icons/fa6';

type Props = {
  data: OrderForecast;
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

  const columns: ColumnDefinitionType<OrderForecast['items'][number]>[] = [
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
      key: 'price',
      renderItem: ({ row }) => (
        <p className={styles.priceColumn}>{`${row.price} €`}</p>
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
            <p className={styles.supplierName}>{props.data.supplierName}</p>
            <p className={styles.totalPrice}>{`${props.data.items.reduce(
              (prev, curr) => prev + curr.price,
              0
            )}€ (${t('order.validation.items', {
              count: props.data.items.length,
            })})`}</p>
          </div>
        }>
        <Table columns={columns} data={props.data.items} />
      </CollapsibleMenu>

      <DialogBox
        msg={t('order.validation.deleteItemPopup', {
          name: props.data.items.find((i) => i.id === deleteIngredientUUID)
            ?.name,
        })}
        type="warning"
        onRequestClose={() => setDeleteIngredientUUID(null)}
        revele={!!deleteIngredientUUID}
        onConfirm={() => {
          if (!deleteIngredientUUID) return;
          props.onDeleteIngredient(deleteIngredientUUID);
          setDeleteIngredientUUID(null);
        }}
      />
    </>
  );
};
