import { SidePanel, Table } from 'shared-ui';
import styles from './OrderDetail.module.scss';
import { ColumnDefinitionType } from 'shared-ui/components/Table/Table';
import { useEffect } from 'react';

type Ingredient = {
  name: string;
  quantity: number;
  unit: string;
  price: number;
};

// Generate 5 ingredients
const ingredientList: Ingredient[] = Array.from({ length: 10 }, (_, index) => ({
  name: `Ingredient ${index + 1}`,
  quantity: 1,
  unit: 'kg',
  price: 100,
}));

type Props = {
  isVisible: boolean;
  onRequestClose: () => void;
  orderUUID: string;
};

export const OrderDetail = (props: Props) => {
  useEffect(() => {
    console.log('Retrieve order :', props.orderUUID);
  }, [props.orderUUID]);

  const columns: ColumnDefinitionType<Ingredient>[] = [
    {
      key: 'name',
      header: 'Name',
    },
    {
      key: 'quantity',
      header: 'Quantity',
    },
    {
      key: 'unit',
      header: 'Unit',
    },
    {
      key: 'price',
      header: 'Price',
    },
  ];

  return (
    <SidePanel
      loading={false}
      revele={props.isVisible}
      onRequestClose={props.onRequestClose}
      className={styles.sidePanel}>
      <div className={styles.infosContainer}>
        <div className={styles.info}>
          <p className={styles.infoTitle}>Supplier</p>
          <p className={styles.infoValue}>Metro</p>
        </div>
        <div className={styles.info}>
          <p className={styles.infoTitle}>Delivery date</p>
          <p className={styles.infoValue}>15/09/2023</p>
        </div>
        <div className={styles.info}>
          <p className={styles.infoTitle}>Price</p>
          <p className={styles.infoValue}>280€</p>
        </div>
        <div className={styles.info}>
          <p className={styles.infoTitle}>Status</p>
          <p className={styles.infoValue}>Ordered</p>
        </div>
      </div>

      {/* <p>Ordered Ingredients</p> */}
      <Table columns={columns} data={ingredientList} />
    </SidePanel>
  );
};
