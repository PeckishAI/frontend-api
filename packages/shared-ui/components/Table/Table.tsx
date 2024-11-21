// Table.tsx
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
  onRowClick?: (row: T, index: number) => void;
};

type Props<T, K extends keyof T> = {
  data?: Array<T>;
  columns: Array<ColumnDefinitionType<T, K>>;
  className?: string;
  scrollable?: boolean; // New prop for enabling scroll
  maxHeight?: string; // Optional max height when scrollable
};

const Table = <T, K extends keyof T>(props: Props<T, K>) => {
  return (
    <div
      className={classNames('table-container', props.className, {
        'table-scrollable': props.scrollable,
      })}
      style={
        props.scrollable ? { maxHeight: props.maxHeight || '100%' } : undefined
      }>
      <table>
        <TableHeader columns={props.columns} className="table-header" />
        <TableRows
          data={props.data}
          columns={props.columns}
          onRowClick={props.onRowClick}
        />
      </table>
    </div>
  );
};

export default Table;
