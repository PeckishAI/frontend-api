import { useState, useRef, useEffect } from 'react';
import styles from './styles.module.scss';
import { Button, IconButton, Select } from 'shared-ui';
import { Supplier, TagsTMP } from '../../../../services';
import { useTranslation } from 'react-i18next';
import { MultiValue } from 'react-select';

type Props = {
  suppliers: Supplier[];
  tags: TagsTMP[];
  onApplyFilters: (filters: FiltersType) => void;
};

export type FiltersType = {
  selectedTag: MultiValue<TagsTMP>;
  selectedSupplier: MultiValue<Supplier>;
};

export const defaultFilters: FiltersType = {
  selectedTag: [],
  selectedSupplier: [],
};

const Filters = ({ suppliers, tags, onApplyFilters }: Props) => {
  const { t } = useTranslation(['common', 'ingredient']);
  const [isVisible, setIsVisible] = useState(false);
  const popupRef = useRef(null);
  const triggerRef = useRef(null);
  const [filters, setFilters] = useState<FiltersType>(defaultFilters);

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

  const handleFiltersChange = (
    key: keyof FiltersType,
    value: MultiValue<TagsTMP> | MultiValue<Supplier>
  ) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleResetFilters = () => {
    if (filters !== defaultFilters) {
      setFilters(defaultFilters);
      onApplyFilters(defaultFilters);
    }
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
        tooltipMsg={t('filter')}
        tooltipId="inventory-tooltip"
        ref={triggerRef}
      />

      {isVisible && (
        <div ref={popupRef} className={styles.filters}>
          <p className={styles.title}>{t('filterBy')} :</p>
          <div className="filter-selection">
            <Select
              placeholder={'Tag'}
              options={tags}
              size="small"
              isClearable
              isMulti
              menuPosition="fixed"
              maxMenuHeight={200}
              getOptionLabel={(option: TagsTMP) => option.tag_name || ''}
              getOptionValue={(option: TagsTMP) => option.tag_uuid || ''}
              onChange={(value: MultiValue<TagsTMP>) =>
                handleFiltersChange('selectedTag', value)
              }
              value={filters.selectedTag}
            />
            <Select
              placeholder={t('ingredient:supplier')}
              options={suppliers}
              size="small"
              isClearable
              isMulti
              menuPosition="fixed"
              maxMenuHeight={200}
              getOptionLabel={(option: Supplier) => option.name || ''}
              getOptionValue={(option: Supplier) => option.uuid || ''}
              onChange={(value: MultiValue<Supplier>) =>
                handleFiltersChange('selectedSupplier', value)
              }
              value={filters.selectedSupplier}
            />
          </div>
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
              disabled={!filters?.selectedSupplier && !filters?.selectedTag}
              onClick={handleApplyFilter}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Filters;
