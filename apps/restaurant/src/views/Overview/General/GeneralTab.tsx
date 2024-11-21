import React, { useEffect, useImperativeHandle, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { EmptyPage, Loading } from 'shared-ui';
import { Tooltip } from 'react-tooltip';
import { useRestaurantStore } from '../../../store/useRestaurantStore';
import { format } from 'date-fns';
import { TrendCard, TrendCardSkeleton } from '../components/TrendCard';
import { formatCurrency, prettyNumber } from '../../../utils/helpers';
import { CostOfSalesCard } from '../components/CostOfSalesCard';
import Vector from '../../../assets/img/categories/Vector.svg';
import { FaRegMoneyBillAlt } from 'react-icons/fa';
// import DateRangePickerComponent from '../../../components/DateRangePicker/DateRangePicker';
import {
  FiltersType,
  defaultFilters,
} from '../components/CostFilter/CostFilters';
import styles from '../General/GeneralTab.module.scss';
import { TFunction } from 'i18next';
import overviewService, {
  ApiResponse,
  CostofSales,
  MetricType,
} from '../../../services/overview.service';

export type GeneralTabRef = {
  renderOptions: () => React.ReactNode;
};

const metricIcon: { [K in keyof ApiResponse]: React.ReactNode } = {
  costofgoodsold: <img src={Vector} />,
  sales: <FaRegMoneyBillAlt />,
};

export const metricFormat: {
  [K in MetricType]: (options: {
    value?: number | null;
    t: TFunction<['overview', 'common'], undefined>;
    currency?: string | null;
  }) => string;
} = {
  costofgoodsold: ({ value, t }) =>
    t('trend.people', {
      count: value ?? 0,
      formattedCount: prettyNumber(value),
    }),
  sales: ({ value, currency }) => formatCurrency(value, currency),
  profits: ({ value, currency }) => formatCurrency(value, currency),
  savings: ({ value, currency }) => formatCurrency(value, currency),
};

type Props = {
  searchValue: string;
  setLoadingState: (loading: boolean) => void;
  forceOptionsUpdate: () => void;
  dateRange?: [Date | null, Date | null];
};

export const GeneralTab = React.forwardRef<GeneralTabRef, Props>(
  (props, forwardedRef) => {
    const { t } = useTranslation(['overview', 'common']);
    const [loadingMetrics, setLoadingMetrics] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [cost, setCost] = useState<ApiResponse>();
    const [inventoryValue, setInventoryValue] = useState<number>(0);
    const [loadingCostOfSales, setLoadingCostOfSales] = useState(false);
    const [costOfSales, setCostOfSales] = useState<CostofSales>();
    const [filterOption, setFilterOption] = useState<CostofSales>();
    const [filters, setFilters] = useState<FiltersType>(defaultFilters);

    const { selectedRestaurantUUID, restaurants } = useRestaurantStore();

    const currentCurrency = restaurants.find(
      (restaurant) => restaurant.uuid === selectedRestaurantUUID
    )?.currency;

    const [localDateRange] = useState<[Date | null, Date | null]>([null, null]);

    // Use props.dateRange if provided, otherwise use localDateRange
    const dateRange = props.dateRange || localDateRange;

    useEffect(() => {
      if (dateRange[0] && dateRange[1]) {
        console.log('Fetching data with date range:', dateRange);
        // Call your overview service here with the date range
      }
    }, [dateRange]);

    useEffect(() => {
      if (!selectedRestaurantUUID) return;
      if (dateRange && dateRange[0] && dateRange[1]) {
        setLoadingMetrics(true);
        overviewService
          .getInventoryValue(
            selectedRestaurantUUID,
            format(dateRange[0], 'yyyy-MM-dd'),
            format(dateRange[1], 'yyyy-MM-dd')
          )
          .then((res) => {
            if (res) {
              setInventoryValue(res.total_inventory_value || 0);
            }
          })
          .finally(() => {
            setLoadingMetrics(false);
          });
      }
    }, [selectedRestaurantUUID, props.dateRange]);

    useEffect(() => {
      if (!selectedRestaurantUUID) return;
      if (dateRange && dateRange[0] && dateRange[1]) {
        setLoadingMetrics(true);
        overviewService
          .getCostMetric(
            selectedRestaurantUUID,
            format(dateRange[0], 'yyyy-MM-dd'),
            format(dateRange[1], 'yyyy-MM-dd')
          )
          .then((res) => {
            if (res) {
              setCost(res);
            }
          })
          .finally(() => {
            setLoadingMetrics(false);
          });

        overviewService
          .getCostOfSales(
            selectedRestaurantUUID,
            format(dateRange[0], 'yyyy-MM-dd'),
            format(dateRange[1], 'yyyy-MM-dd')
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
    }, [selectedRestaurantUUID, props.dateRange]);

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

    useImperativeHandle(forwardedRef, () => ({
      renderOptions: () => {
        return null; // Add options rendering if needed
      },
    }));

    return (
      <>
        {selectedRestaurantUUID ? (
          <>
            {/* <div className={styles.datepicker}>
              <DateRangePickerComponent setValue={setValue} value={value} />
            </div> */}
            <div className={styles.trends}>
              {loadingMetrics &&
                [1, 2, 3].map((i) => <TrendCardSkeleton key={i} />)}

              {!loadingMetrics && (
                <>
                  <TrendCard
                    title="Cost of Goods Sold"
                    value={cost?.costofgoodsold?.value?.toFixed(2) || '0'}
                    icon={<img src={Vector} />}
                    percentage={
                      Number(cost?.costofgoodsold?.percentage?.toFixed(2)) || 0
                    }
                  />
                  <TrendCard
                    title="Sales"
                    value={cost?.sales?.value?.toFixed(2) || '0'}
                    icon={<FaRegMoneyBillAlt />}
                    percentage={
                      Number(cost?.sales?.percentage?.toFixed(2)) || 0
                    }
                  />
                  <TrendCard
                    title="Inventory Value"
                    value={inventoryValue?.toFixed(2) || '0'}
                    icon={<i className="fa-solid fa-cubes-stacked"></i>}
                  />
                </>
              )}
            </div>

            {isLoading ? (
              <Loading size="large" />
            ) : (
              <CostOfSalesCard
                data={costOfSales}
                filterOption={filterOption}
                loading={loadingCostOfSales}
                selectedRestaurantUUID={selectedRestaurantUUID}
                currency={currentCurrency}
                value={props.dateRange}
                setFilters={setFilters}
                filters={filters}
                setIsLoading={setIsLoading}
              />
            )}
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
  }
);

GeneralTab.displayName = 'GeneralTab';
