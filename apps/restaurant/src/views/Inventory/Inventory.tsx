import { useTranslation } from 'react-i18next';
import { Tabs, Input, Lottie } from 'shared-ui';
import { useRef, useState } from 'react';
import { SupplierTab, SupplierTabRef } from './SupplierTab';
import { IngredientTab, IngredientTabRef } from './IngredientTab';

const TABS = ['Stock', 'Suppliers', 'Orders'];

const Inventory = () => {
  const { t } = useTranslation('common');

  const supplierTabRef = useRef<SupplierTabRef>(null);
  const ingredientTabRef = useRef<IngredientTabRef>(null);

  const [selectedTab, setSelectedTab] = useState(1);
  const [searchValue, setSearchValue] = useState<string>('');
  const [loadingData, setLoadingData] = useState<boolean>(false);

  const renderSelectedTab = () => {
    if (selectedTab === 0) {
      return (
        <IngredientTab
          ref={ingredientTabRef}
          setLoadingState={setLoadingData}
          searchValue={searchValue}
        />
      );
    }
    if (selectedTab === 1) {
      return (
        <SupplierTab
          ref={supplierTabRef}
          setLoadingState={setLoadingData}
          searchValue={searchValue}
        />
      );
    }
    return null;
  };

  return (
    <div className="inventory">
      <div className="tabs-and-tools">
        <Tabs
          tabs={TABS}
          onClick={setSelectedTab}
          selectedIndex={selectedTab}
        />
        <div className="tools">
          <Input
            type="text"
            value={searchValue}
            placeholder={t('search')}
            onChange={setSearchValue}
          />
          {selectedTab === 0 && ingredientTabRef.current?.renderOptions()}
          {selectedTab === 1 && supplierTabRef.current?.renderOptions()}
        </div>
      </div>

      {renderSelectedTab()}

      {loadingData && (
        <div className="loading-container">
          <Lottie type="loading" width="200px" />
        </div>
      )}
    </div>
  );
};

export default Inventory;
