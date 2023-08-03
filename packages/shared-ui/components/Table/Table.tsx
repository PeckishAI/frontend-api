import React from 'react';
import TableHeader from './TableHeader';
import TableRows from './TableRows';

export type ColumnDefinitionType<T, K extends keyof T> = {
  key: K;
  header: string;
};

type Props<T, K extends keyof T> = {
  data: Array<T>;
  columns: Array<ColumnDefinitionType<T, K>>;
};

const Table = <T, K extends keyof T>(props: Props<T, K>) => {
  return (
    <table>
      <TableHeader columns={props.columns} className="table-header" />
      <TableRows data={props.data} columns={props.columns} />
    </table>
  );
};

export default Table;
