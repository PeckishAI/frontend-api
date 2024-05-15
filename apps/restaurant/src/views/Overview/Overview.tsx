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
import { EmptyPage, useTitle } from 'shared-ui';
import { TFunction } from 'i18next';
import DateRangePickerComponent from '../../components/DateRangePicker/DateRangePicker';
import { format } from 'date-fns';
import Vector from '../../assets/img/categories/Vector.svg';

const metricIcon: { [K in keyof ApiResponse]: React.ReactNode } = {
  costofgoodsold: <img src={Vector} />,
  sales: <FaRegMoneyBillAlt />,
};

// Savings <MdOutlineSavings />
// Profits <PiBankBold />

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
  const [cost, setcost] = useState<ApiResponse>();
  const [loadingCostOfSales, setLoadingCostOfSales] = useState(false);
  const [costOfSales, setCostOfSales] = useState<CostofSales>();
  const [value, setValue] = useState([null, null]);

  const { selectedRestaurantUUID, restaurants } = useRestaurantStore();

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
          }
        })
        .finally(() => {
          setLoadingCostOfSales(false);
        });
    }
  }, [selectedRestaurantUUID, value[0], value[1]]);

  return (
    <>
      {selectedRestaurantUUID ? (
        <>
          <div className={styles.trends}>
            {loadingMetrics && [1, 2].map((i) => <TrendCardSkeleton key={i} />)}
            {!loadingMetrics &&
              cost &&
              Object.keys(cost).map((key) => (
                <TrendCard
                  key={key}
                  title={key === 'costofgoodsold' ? 'Cost of Goods Sold' : key}
                  value={cost[key]?.value?.toFixed(2) || 0}
                  icon={metricIcon[key]}
                  percentage={cost[key]?.percentage}
                />
              ))}
            {!loadingMetrics &&
              !cost &&
              [1, 2].map((key) => (
                <TrendCard
                  key={key}
                  title={key === 1 ? 'Cost of Goods Sold' : 'Sales'}
                  value="0"
                  icon={metricIcon[key === 1 ? 'costofgoodsold' : 'sales']}
                  percentage="0"
                />
              ))}
            <div className={styles.datepicker}>
              <DateRangePickerComponent setValue={setValue} value={value} />
            </div>
          </div>
          <CostOfSalesCard
            data={costOfSales}
            loading={loadingCostOfSales}
            selectedRestaurantUUID={selectedRestaurantUUID}
            currency={currentCurrency}
            value={value}
          />
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
