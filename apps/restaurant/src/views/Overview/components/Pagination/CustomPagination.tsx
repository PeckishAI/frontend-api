import React from 'react';
import Pagination from '@mui/material/Pagination';
import styles from './CustomPagination.module.scss';

type CustomPaginationProps = {
  onChange: (newValue: number) => void;
  count: number;
  shape?: string;
  sx?: any;
  value: number;
};

const CustomPagination: React.FC<CustomPaginationProps> = ({
  onChange,
  count,
  shape,
  sx,
  value,
}) => {
  const handleChange = (event: any, newValue: number) => {
    onChange(newValue);
  };

  return (
    <div className={styles.pagination}>
      <Pagination
        shape={shape}
        count={count}
        page={value}
        onChange={handleChange}
        sx={sx}
      />
    </div>
  );
};

export default CustomPagination;
