import { SidePanel, Table } from 'shared-ui';
import styles from './OrderDetail.module.scss';
import { ColumnDefinitionType } from 'shared-ui/components/Table/Table';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

type Ingredient = {
  name: string;
  quantity: number;
  unit: string;
  price: number;
};

// Generate 5 ingredients
const ingredientList: Ingredient[] = [
  { name: "Tomatoes", quantity: 3, unit: "kg", price: 2.99 },
  { name: "Chicken", quantity: 600, unit: "g", price: 5.49 },
  { name: "Onions", quantity: 30, unit: "unit", price: 1.29 },
  { name: "Bell Peppers", quantity: 250, unit: "g", price: 2.99 },
  { name: "Rice", quantity: 8, unit: "kg", price: 1.99 },
  { name: "Carrots", quantity: 400, unit: "g", price: 1.49 },
  { name: "Potatoes", quantity: 700, unit: "g", price: 2.79 },
  { name: "Green Beans", quantity: 300, unit: "g", price: 2.49 },
  { name: "Canned Tuna", quantity: 150, unit: "g", price: 2.29 },
  { name: "Lentils", quantity: 250, unit: "g", price: 1.79 },
]

type Props = {
  isVisible: boolean;
  onRequestClose: () => void;
  orderUUID: string;
};

export const OrderDetail = (props: Props) => {
  const { t } = useTranslation('common');
  useEffect(() => {
    console.log('Retrieve order :', props.orderUUID);
  }, [props.orderUUID]);
  console.log(ingredientList);

  const columns: ColumnDefinitionType<Ingredient>[] = [
    {
      key: 'name',
      header: t('name'),
    },
    {
      key: 'quantity',
      header: t('quantity'),
    },
    {
      key: 'unit',
      header: t('unit'),
    },
    {
      key: 'price',
      header: t('price'),
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
          <p className={styles.infoTitle}>{t('orders.supplier')}</p>
          <p className={styles.infoValue}>Metro</p>
        </div>
        <div className={styles.info}>
          <p className={styles.infoTitle}>{t('orders.deliveryDate')}</p>
          <p className={styles.infoValue}>15/09/2023</p>
        </div>
        <div className={styles.info}>
          <p className={styles.infoTitle}>{t('price')}</p>
          <p className={styles.infoValue}>280€</p>
        </div>
        <div className={styles.info}>
          <p className={styles.infoTitle}>{t('orders.status')}</p>
          <p className={styles.infoValue}>
            {t(`orders.statusStates.delivered`)}
          </p>
        </div>
      </div>

      <Table columns={columns} data={ingredientList} />
    </SidePanel>
  );
};
