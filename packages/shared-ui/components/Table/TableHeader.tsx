import { ColumnDefinitionType } from './Table';

type Props<T, K extends keyof T> = {
  columns: Array<ColumnDefinitionType<T, K>>;
  className: string;
};

const TableHeader = <T, K extends keyof T>(props: Props<T, K>) => {
  return (
    <thead>
      <tr>
        {props.columns.map((colums, index) => (
          <th key={`headCell-${index}`}>
            {typeof colums.header === 'function'
              ? colums.header()
              : colums.header}
          </th>
        ))}
      </tr>
    </thead>
  );
};

export default TableHeader;
