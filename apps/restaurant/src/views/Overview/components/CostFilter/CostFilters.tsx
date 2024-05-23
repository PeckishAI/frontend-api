import { useState, useRef, useEffect } from 'react';
import styles from './styles.module.scss';
import { Button, IconButton, Select } from 'shared-ui';
import { useTranslation } from 'react-i18next';
import { Tags } from '../../../../services';

type Props = {
  tag_names: Tags[];
  onApplyFilters: (filters: FiltersType) => void;
};

export type FiltersType = {
  selectedTag?: Tags | null;
};
export const defaultFilters: FiltersType = {
  selectedTag: null,
};

const CostFilters = ({ tag_names, onApplyFilters }: Props) => {
  const { t } = useTranslation(['common', 'ingredient']);
  const [isVisible, setIsVisible] = useState(false);
  const popupRef = useRef(null);
  const triggerRef = useRef(null);
  const [filters, setFilters] = useState<FiltersType>(defaultFilters);

  // Remove duplicate tag names
  const uniqueTagNames = Array.from(
    new Set(tag_names.map((tag) => tag.name))
  ).map((name) => ({ name }));

  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      if (
        popupRef.current &&
        triggerRef.current &&
        !(popupRef.current as Node).contains(e.target as Node) &&
        !(triggerRef.current as Node).contains(e.target as Node)
      ) {
        setIsVisible(false);
      }
    };

    document.addEventListener('mousedown', handleDocumentClick);
    return () => {
      document.removeEventListener('mousedown', handleDocumentClick);
    };
  }, []);

  const handleClick = () => {
    setIsVisible(!isVisible);
  };

  // Update this function to directly set the string value
  const handleFiltersChange = (key: keyof FiltersType, value: Tags | null) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleResetFilters = () => {
    setFilters(defaultFilters);
    onApplyFilters(defaultFilters);
  };

  const handleApplyFilter = () => {
    if (onApplyFilters) {
      onApplyFilters(filters);
    }
  };

  return (
    <div className={styles.filtersContainer}>
      <IconButton
        icon={<i className="fa-solid fa-filter"></i>}
        onClick={handleClick}
        tooltipMsg={t('common:filter')}
        tooltipId="forecast-tooltip"
        ref={triggerRef}
        className={styles.filterIcon}
      />
      {isVisible && (
        <div ref={popupRef} className={styles.filters}>
          <p className={styles.title}>{t('filterBy')} :</p>
          <Select
            placeholder={t('tag:Tag')}
            options={uniqueTagNames}
            size="small"
            isClearable
            menuPosition="fixed"
            maxMenuHeight={200}
            getOptionLabel={(option) => option.name}
            getOptionValue={(option) => option.name}
            // Update the onChange handler to pass the string value directly
            onChange={(value) => handleFiltersChange('selectedTag', value)}
            value={filters.selectedTag}
          />
          <div className={styles.buttons}>
            <Button
              value={t('reset')}
              className={styles.btn}
              type="secondary"
              onClick={handleResetFilters}
            />
            <Button
              value={t('apply')}
              className={styles.btn}
              type="primary"
              disabled={!filters.selectedTag}
              onClick={handleApplyFilter}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default CostFilters;
