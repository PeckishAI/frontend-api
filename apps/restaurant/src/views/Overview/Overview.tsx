import { FaRegMoneyBillAlt } from 'react-icons/fa';
import { HiOutlineUserGroup } from 'react-icons/hi';
import { TrendCard, TrendCardSkeleton } from './components/TrendCard';
import { formatCurrency, prettyNumber } from '../../utils/helpers';
import styles from './Overview.module.scss';
import { ForecastCard } from './components/ForecastCard';
import { Tooltip } from 'react-tooltip';
import { useEffect, useState } from 'react';
import overviewService, {
  Forecast,
  MetricType,
  RestaurantMetric,
} from '../../services/overview.service';
import { useRestaurantStore } from '../../store/useRestaurantStore';
import { useTranslation } from 'react-i18next';
import { EmptyPage } from 'shared-ui';
import { TFunction } from 'i18next';

const metricIcon: { [K in keyof RestaurantMetric]: React.ReactNode } = {
  occupancy: <HiOutlineUserGroup />,
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
  occupancy: ({ value, t }) =>
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
  const [loadingMetrics, setLoadingMetrics] = useState(false);
  const [metrics, setMetrics] = useState<RestaurantMetric>();

  const [loadingForecast, setLoadingForecast] = useState(false);
  const [forecast, setForecast] = useState<Forecast>();

  const { selectedRestaurantUUID, restaurants } = useRestaurantStore();

  const currentCurrency = restaurants.find(
    (restaurant) => restaurant.uuid === selectedRestaurantUUID
  )?.currency;

  useEffect(() => {
    if (!selectedRestaurantUUID) return;

    setLoadingMetrics(true);
    overviewService
      .getMetrics(selectedRestaurantUUID)
      .then((res) => {
        setMetrics(res);
      })
      .finally(() => {
        setLoadingMetrics(false);
      });

    setLoadingForecast(true);
    overviewService
      .getForecast(selectedRestaurantUUID)
      .then((res) => {
        setForecast(res);
      })
      .finally(() => {
        setLoadingForecast(false);
      });
  }, [selectedRestaurantUUID]);

  return (
    <>
      {selectedRestaurantUUID ? (
        <>
          <div className={styles.trends}>
            {loadingMetrics && [1, 2].map((i) => <TrendCardSkeleton key={i} />)}
            {!loadingMetrics &&
              metrics &&
              (Object.keys(metrics) as (keyof RestaurantMetric)[]).map(
                (key) => (
                  <TrendCard
                    key={key}
                    title={t(key)}
                    value={metricFormat[key]({
                      value: metrics[key].value,
                      t,
                      currency: currentCurrency,
                    })}
                    icon={metricIcon[key]}
                    percentage={metrics[key].mom}
                  />
                )
              )}
          </div>
          <ForecastCard
            data={forecast}
            loading={loadingForecast}
            currency={currentCurrency}
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
