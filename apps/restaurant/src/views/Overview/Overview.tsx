import { FaRegMoneyBillAlt } from 'react-icons/fa';
import { TrendCard, TrendCardSkeleton } from './components/TrendCard';
import { formatCurrency, prettyNumber } from '../../utils/helpers';
import styles from './Overview.module.scss';
import { CostOfSalesCard } from './components/CostOfSalesCard';
import { Tooltip } from 'react-tooltip';
import { useEffect, useState } from 'react';
import overviewService, {
  ApiResponse,
  CostofSales,
  MetricType,
} from '../../services/overview.service';
import { useRestaurantStore } from '../../store/useRestaurantStore';
import { useTranslation } from 'react-i18next';
import { EmptyPage, Loading, useTitle } from 'shared-ui';
import { TFunction } from 'i18next';
import DateRangePickerComponent from '../../components/DateRangePicker/DateRangePicker';
import { format } from 'date-fns';
import Vector from '../../assets/img/categories/Vector.svg';
import {
  FiltersType,
  defaultFilters,
} from './components/CostFilter/CostFilters';
import CustomPagination from './components/Pagination/CustomPagination';
import { ChartCard } from '../../components/ChartsCard/ChartCard';
import { BarChart } from 'shared-ui/components/BarChart/BarChart';

const dummyData = [
  { label: 'January', value: 65 },
  { label: 'February', value: 45 },
  { label: 'March', value: 80 },
  { label: 'April', value: 30 },
  { label: 'May', value: 55 },
];

const metricIcon: { [K in keyof ApiResponse]: React.ReactNode } = {
  costofgoodsold: <img src={Vector} />,
  sales: <FaRegMoneyBillAlt />,
  profits: <FaRegMoneyBillAlt />, // Add this new line
};

export const metricFormat: {
  [K in MetricType]: (options: {
    value?: number | null;
    t: TFunction<['overview', 'common'], undefined>;
    currency?: string | null;
  }) => string;
} = {
  costofgoodssold: ({ value, t }) =>
    t('trend.people', {
      count: value ?? 0,
      formattedCount: prettyNumber(value),
    }),
  sales: ({ value, currency }) => formatCurrency(value, currency),
  profits: ({ value, currency }) => formatCurrency(value, currency),
  savings: ({ value, currency }) => formatCurrency(value, currency),
};

const Overview = () => {
  const { t } = useTranslation(['overview', 'common']);
  useTitle(t('common:pages.overview'));

  const [loadingMetrics, setLoadingMetrics] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [cost, setcost] = useState<ApiResponse>();
  const [loadingCostOfSales, setLoadingCostOfSales] = useState(false);
  const [costOfSales, setCostOfSales] = useState<CostofSales>();

  const [filterOption, setFilterOption] = useState<CostofSales>();
  const [filters, setFilters] = useState<FiltersType>(defaultFilters);
  const [value, setValue] = useState([null, null]);
  const [page, setPage] = useState(1);
  const { selectedRestaurantUUID, restaurants } = useRestaurantStore();

  const ITEMS_PER_PAGE = 10; // Define items per page

  const handleChange = (NewValue: number) => {
    setPage(NewValue);
  };

  const startIndex = (page - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedCostOfSales = costOfSales?.slice(startIndex, endIndex);

  const currentCurrency = restaurants.find(
    (restaurant) => restaurant.uuid === selectedRestaurantUUID
  )?.currency;

  useEffect(() => {
    if (!selectedRestaurantUUID) return;
    if (value[0] && value[1]) {
      setLoadingMetrics(true);
      overviewService
        .getCostMetric(
          selectedRestaurantUUID,
          format(value[0], 'yyyy-MM-dd'),
          format(value[1], 'yyyy-MM-dd')
        )
        .then((res) => {
          if (res) {
            setcost(res);
          }
        })
        .finally(() => {
          setLoadingMetrics(false);
        });

      overviewService
        .getCostOfSales(
          selectedRestaurantUUID,
          format(value[0], 'yyyy-MM-dd'),
          format(value[1], 'yyyy-MM-dd')
        )
        .then((res) => {
          if (res) {
            setCostOfSales(res);
            setFilterOption(res);
          }
        })
        .finally(() => {
          setLoadingCostOfSales(false);
        });
    }
  }, [selectedRestaurantUUID, value[0], value[1]]);

  useEffect(() => {
    const applyFilters = () => {
      let filteredList = [...(filterOption || [])];

      if (filters.selectedTag) {
        filteredList = filteredList.filter(
          (ingredient) => ingredient.tag_name === filters?.selectedTag?.name
        );
      }
      setCostOfSales(filteredList);
    };

    applyFilters();
  }, [filters]);

  return (
    <>
      {selectedRestaurantUUID ? (
        <>
          <>
            {/* <div className={styles.overviewContainer}>
              <div className={styles.chartsContainer}>
                <ChartCard title="Monthly Sales">
                  <BarChart data={dummyData} height={300} />
                </ChartCard>
              </div>
            </div> */}
            <div className={styles.datepicker}>
              <DateRangePickerComponent setValue={setValue} value={value} />
            </div>
            <div className={styles.trends}>
              {/* {loadingMetrics &&
                [1, 2, 3].map((i) => <TrendCardSkeleton key={i} />)} */}
              {loadingMetrics &&
                [1, 2].map((i) => <TrendCardSkeleton key={i} />)}

              {!loadingMetrics && (
                <>
                  <TrendCard
                    title="Cost of Goods Sold"
                    value={cost?.costofgoodsold?.value?.toFixed(2) || '0'}
                    icon={<img src={Vector} />}
                    percentage={
                      cost?.costofgoodsold?.percentage?.toFixed(2) || '0'
                    }
                  />
                  <TrendCard
                    title="Sales"
                    value={cost?.sales?.value?.toFixed(2) || '0'}
                    icon={<FaRegMoneyBillAlt />}
                    percentage={cost?.sales?.percentage?.toFixed(2) || '0'}
                  />
                  {/* <TrendCard
                    title="Inventory Value"
                    value={cost?.sales?.value?.toFixed(2) || '0'} // Using sales data for now
                    icon={<FaRegMoneyBillAlt />}
                    percentage={cost?.sales?.percentage?.toFixed(2) || '0'} // Using sales data for now
                  /> */}
                </>
              )}
            </div>

            {isLoading ? (
              <Loading size="large" />
            ) : (
              <>
                <CostOfSalesCard
                  data={paginatedCostOfSales}
                  filterOption={filterOption}
                  loading={loadingCostOfSales}
                  selectedRestaurantUUID={selectedRestaurantUUID}
                  currency={currentCurrency}
                  value={value}
                  setFilters={setFilters}
                  filters={filters}
                  setIsLoading={setIsLoading}
                />
                <CustomPagination
                  shape="rounded"
                  count={Math.ceil((costOfSales?.length || 0) / ITEMS_PER_PAGE)}
                  value={page}
                  onChange={handleChange}
                  sx={{
                    '& .MuiPaginationItem-root': {
                      color: '#5e72e4',
                      '&:hover': {
                        backgroundColor: 'none',
                      },
                    },
                    '& .MuiPaginationItem-root.Mui-selected': {
                      backgroundColor: '#5e72e4',
                      color: 'white',
                      '&:hover': {
                        backgroundColor: '#5e72e4',
                      },
                    },
                  }}
                />
              </>
            )}
          </>
        </>
      ) : (
        <EmptyPage
          title={t('common:myRestaurants.emptyTitle')}
          description={t('common:myrestaurants.emptyText')}
        />
      )}

      <Tooltip id="overview-tooltip" />
    </>
  );
};

export default Overview;
