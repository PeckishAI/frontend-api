import { ColumnDefinitionType } from './Table';

type Props<T, K extends keyof T> = {
  data: Array<T>;
  columns: Array<ColumnDefinitionType<T, K>>;
};

const TableRows = <T, K extends keyof T>(props: Props<T, K>) => {
  return (
    <tbody>
      {props.data.map((row, index) => (
        <tr key={`row-${index}`}>
          {props.columns.map((column, index2) => (
            <td key={`cell-${index2}`} className={column.classname}>
              {column.renderItem === undefined
                ? row[column.key]
                : column.renderItem(row)}
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  );
};

export default TableRows;
