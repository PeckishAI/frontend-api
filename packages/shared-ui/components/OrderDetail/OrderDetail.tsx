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

type Props<T> = {
  isVisible: boolean;
  onRequestClose: () => void;
  orderUUID: string;
  upperBanner: {
    title: string;
    value: string | number;
  }[];
  tableHeaders: ColumnDefinitionType<T>[];
  tableData: T[];
};

export const OrderDetail = <T extends object>(props: Props<T>) => {
  useEffect(() => {
    console.log('Retrieve order :', props.orderUUID);
  }, [props.orderUUID]);

  return (
    <SidePanel
      loading={false}
      revele={props.isVisible}
      onRequestClose={props.onRequestClose}
      className={styles.sidePanel}>
      <div className={styles.infosContainer}>
        {props.upperBanner.map((info) => (
          <div className={styles.info}>
            <p className={styles.infoTitle}>{info.title}</p>
            <p className={styles.infoValue}>{info.value}</p>
          </div>
        ))}
      </div>
      <Table columns={props.tableHeaders} data={props.tableData} />
    </SidePanel>
  );
};
