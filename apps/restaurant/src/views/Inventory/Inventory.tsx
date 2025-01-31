import { useTranslation } from 'react-i18next';
import { Tabs, Input, Lottie, useTitle } from 'shared-ui';
import { useEffect, useReducer, useRef, useState } from 'react';
import { SupplierTab, SupplierTabRef } from './Suppliers/SupplierTab';
import { IngredientTab, IngredientTabRef } from './Ingredients/IngredientTab';
import { useNavigate, useParams } from 'react-router-dom';
import { OrderTab, OrderTabRef } from './Orders/OrderTab';
import { TransferTab, TransferTabRef } from './Transfers/TransferTab';

// type RouteParams = {
//   tab: 'stock' | 'suppliers' | 'orders';
// };

type RouteParams = {
  tab: 'stock' | 'suppliers' | 'orders' | 'transfers';
};

// type RouteParams = {
//   tab: 'stock' | 'suppliers' | 'orders' | 'transfers';
// };

const getTabIndex = (tab?: string) => {
  if (tab === 'stock') return 0;
  if (tab === 'suppliers') return 1;
  if (tab === 'orders') return 2;
  if (tab === 'transfers') return 3;
  return 0;
};

const getTabName = (tabIndex: number) => {
  if (tabIndex === 0) return 'stock';
  if (tabIndex === 1) return 'suppliers';
  if (tabIndex === 2) return 'orders';
  if (tabIndex === 3) return 'transfers';
  return 'stock';
};

const Inventory = () => {
  const { t } = useTranslation('common');
  useTitle(t('pages.inventory.stock'));

  const { tab } = useParams<RouteParams>();
  const navigate = useNavigate();

  const TABS = [
    t('pages.inventory.stock'),
    t('pages.inventory.suppliers'),
    t('pages.inventory.orders'),
    t('pages.inventory.transfers'),
  ];

  const supplierTabRef = useRef<SupplierTabRef>(null);
  const ingredientTabRef = useRef<IngredientTabRef>(null);
  const orderTabRef = useRef<OrderTabRef>(null);
  const transferTabRef = useRef<TransferTabRef>(null);

  const [selectedTab, setSelectedTab] = useState(0);
  const [searchValue, setSearchValue] = useState<string>('');
  const [loadingData, setLoadingData] = useState<boolean>(false);

  const [, forceUpdate] = useReducer((x) => x + 1, 0);

  useEffect(() => {
    setSelectedTab(getTabIndex(tab));
    // To show the options
    // forceUpdate();
  }, [tab]);

  const renderSelectedTab = () => {
    if (selectedTab === 0) {
      return (
        <IngredientTab
          ref={ingredientTabRef}
          setLoadingState={setLoadingData}
          searchValue={searchValue}
          forceOptionsUpdate={forceUpdate}
        />
      );
    }
    if (selectedTab === 1) {
      return (
        <SupplierTab
          ref={supplierTabRef}
          setLoadingState={setLoadingData}
          searchValue={searchValue}
          forceOptionsUpdate={forceUpdate}
        />
      );
    }
    if (selectedTab === 2) {
      return (
        <OrderTab
          ref={orderTabRef}
          // setLoadingState={setLoadingData}
          searchValue={searchValue}
          forceOptionsUpdate={forceUpdate}
        />
      );
    }
    if (selectedTab === 3) {
      return (
        <TransferTab
          ref={transferTabRef}
          setLoadingState={setLoadingData}
          searchValue={searchValue}
          forceOptionsUpdate={forceUpdate}
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
          onClick={(tabIndex) => {
            navigate({
              pathname: `/inventory/${getTabName(tabIndex)}`,
            });
            setSelectedTab(tabIndex);
            setSearchValue('');
          }}
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
          {selectedTab === 2 && orderTabRef.current?.renderOptions()}
          {selectedTab === 3 && transferTabRef.current?.renderOptions()}
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
