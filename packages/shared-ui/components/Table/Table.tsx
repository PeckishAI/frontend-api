import React from 'react';
import './style.scss';
import TableHeader from './TableHeader';
import TableRows from './TableRows';
import classNames from 'classnames';

export type ColumnDefinitionType<T, K extends keyof T = keyof T> = {
  key: K;
  header: string | (() => React.ReactNode);
  renderItem?: (params: {
    row: T;
    value: T[K];
    index: number;
  }) => React.ReactNode | string;
  classname?: string;
  width?: string;
  minWidth?: string;
};

type Props<T, K extends keyof T> = {
  data?: Array<T>;
  columns: Array<ColumnDefinitionType<T, K>>;
  className?: string;
  onRowClick?: (row: T, index: number) => void; // Add onRowClick as an optional prop
};

const Table = <T, K extends keyof T>(props: Props<T, K>) => {
  return (
    <div className={classNames('table-container', props.className)}>
      <table>
        <TableHeader columns={props.columns} className="table-header" />
        {/* Pass onRowClick down to TableRows */}
        <TableRows data={props.data} columns={props.columns} onRowClick={props.onRowClick} />
      </table>
    </div>
  );
};

export default Table;
