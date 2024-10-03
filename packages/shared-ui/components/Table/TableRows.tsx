import { ColumnDefinitionType } from './Table';

type Props<T, K extends keyof T> = {
  data?: Array<T>;
  columns: Array<ColumnDefinitionType<T, K>>;
  onRowClick?: (row: T, index: number) => void; // Add onRowClick as an optional prop
};

const TableRows = <T, K extends keyof T>(props: Props<T, K>) => {
  return (
    <tbody>
      {props.data &&
        props.data.map((row, index) => (
          <tr
            key={`row-${index}`}
            onClick={props.onRowClick ? () => props.onRowClick?.(row, index) : undefined} // Conditionally apply onClick
            style={{ cursor: props.onRowClick ? 'pointer' : 'auto' }} // Change cursor style only if onRowClick is defined
          >
            {props.columns.map((column, index2) => (
              <td
                key={`cell-${index2}`}
                className={column.classname}
                style={{ width: column.width, minWidth: column.minWidth }}
              >
                {column.renderItem === undefined ? (
                  <>{row[column.key]}</>
                ) : (
                  column.renderItem({ row, value: row[column.key], index })
                )}
              </td>
            ))}
          </tr>
        ))}
    </tbody>
  );
};

export default TableRows;
