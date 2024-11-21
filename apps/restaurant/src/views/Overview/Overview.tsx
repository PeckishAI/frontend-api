import { useTranslation } from 'react-i18next';
import { Tabs, useTitle, Lottie } from 'shared-ui';
import { useEffect, useReducer, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { GeneralTab, GeneralTabRef } from './General/GeneralTab';
import DateRangePickerComponent from '../../components/DateRangePicker/DateRangePicker';
import { subDays } from 'date-fns';
import styles from './Overview.module.scss';

type RouteParams = {
  tab: 'general';
};

const getTabIndex = (tab?: string) => {
  if (tab === 'general') return 0;
  return 0;
};

const getTabName = (tabIndex: number) => {
  if (tabIndex === 0) return 'general';
  return 'general';
};

const Overview = () => {
  const { t } = useTranslation(['overview', 'common']);
  useTitle(t('common:pages.overview.overview'));

  const { tab } = useParams<RouteParams>();
  const navigate = useNavigate();

  const TABS = [t('common:pages.overview.general')];

  const generalTabRef = useRef<GeneralTabRef>(null);

  const [selectedTab, setSelectedTab] = useState(0);
  const [searchValue, setSearchValue] = useState<string>('');
  const [loadingData, setLoadingData] = useState<boolean>(false);

  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([
    subDays(new Date(), 7), // 7 days ago
    new Date(), // today
  ]);

  const [, forceUpdate] = useReducer((x) => x + 1, 0);

  useEffect(() => {
    setSelectedTab(getTabIndex(tab));
  }, [tab]);

  const renderSelectedTab = () => {
    if (selectedTab === 0) {
      return (
        <GeneralTab
          ref={generalTabRef}
          setLoadingState={setLoadingData}
          searchValue={searchValue}
          forceOptionsUpdate={forceUpdate}
          dateRange={dateRange}
        />
      );
    }
    return null;
  };

  return (
    <div className={styles.overview}>
      <div className={styles.tabsAndTools}>
        <Tabs
          tabs={TABS}
          onClick={(tabIndex) => {
            navigate({
              pathname: `/overview/${getTabName(tabIndex)}`,
            });
            setSelectedTab(tabIndex);
            setSearchValue('');
          }}
          selectedIndex={selectedTab}
        />
        <div className={styles.tools}>
          <DateRangePickerComponent setValue={setDateRange} value={dateRange} />
          {/* {selectedTab === 0 && generalTabRef.current?.renderOptions()} */}
          {selectedTab === 0 && generalTabRef.current?.renderOptions()}
        </div>
      </div>

      {renderSelectedTab()}

      {loadingData && (
        <div className={styles.loadingContainer}>
          <Lottie type="loading" width="200px" />
        </div>
      )}
    </div>
  );
};

export default Overview;
