import React from 'react';
import './style.scss';
import TableHeader from './TableHeader';
import TableRows from './TableRows';

export type ColumnDefinitionType<T, K extends keyof T> = {
  key: K;
  header: string;
  renderItem?: (row: T) => React.ReactNode | string;
  classname?: string;
};

type Props<T, K extends keyof T> = {
  data?: Array<T>;
  columns: Array<ColumnDefinitionType<T, K>>;
};

const Table = <T, K extends keyof T>(props: Props<T, K>) => {
  return (
    <div className="table-container">
      <table>
        <TableHeader columns={props.columns} className="table-header" />
        <TableRows data={props.data} columns={props.columns} />
      </table>
    </div>
  );
};

export default Table;
