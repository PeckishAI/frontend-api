import { FaInfoCircle } from 'react-icons/fa';
import styles from './ForecastCard.module.scss';
import { Dropdown, Table, Tabs } from 'shared-ui';
import dayjs from 'dayjs';
import { Tooltip } from 'react-tooltip';
import { useState } from 'react';
import { ForecastChart } from './ForecastChart';
import { Forecast } from '../../../services/overview.service';
import Skeleton from 'react-loading-skeleton';
import { prettyNumber } from '../../../utils/helpers';
import { useTranslation } from 'react-i18next';

type Props = {
  data?: Forecast;
  loading: boolean;
};

// TODO: Calculate depending on available values

//TODO: Vertical table (header = days)
export const ForecastCard = (props: Props) => {
  const { t } = useTranslation(['overview', 'common']);
  const [selectedMode, setSelectedMode] = useState(0);
  const [selectedChartMode, setSelectedChartMode] = useState<
    'occupancy' | 'sales'
  >('occupancy');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderItem = ({ value }: { value: any }) =>
    value ? prettyNumber(value) : '--';

  const chartModes = [
    {
      label: t('occupancy'),
      value: 'occupancy',
      disabled: !props.data || props.data[0]?.occupancy === undefined,
    },
    {
      label: t('sales'),
      value: 'sales',
      disabled: !props.data || props.data[0]?.sales === undefined,
    },
    {
      label: t('profit'),
      value: 'profit',
      disabled: !props.data || props.data[0]?.profit === undefined,
    },
    {
      label: t('savings'),
      value: 'savings',
      disabled: !props.data || props.data[0]?.savings === undefined,
    },
  ];

  return (
    <>
      <div className={styles.card}>
        <div className={styles.header}>
          <div>
            <h2 className={styles.title}>{t('forecast')}</h2>
            <Tabs
              tabs={[t('tab.table'), t('tab.chart')]}
              onClick={setSelectedMode}
              selectedIndex={selectedMode}
              className={styles.tabs}
            />
          </div>
          <div className={styles.rightHeader}>
            {selectedMode === 1 && (
              <Dropdown
                options={chartModes}
                selectedOption={selectedChartMode}
                onOptionChange={(value) =>
                  setSelectedChartMode(value as 'occupancy' | 'sales')
                }
              />
            )}
            <FaInfoCircle
              data-tooltip-id="forecast-tooltip"
              data-tooltip-content={t('forecastTooltip')}
            />
          </div>
        </div>
        <div className={styles.content}>
          {/* {Children} */}
          {selectedMode === 0 ? (
            props.loading ? (
              <ForecastTableSkeleton />
            ) : (
              <Table
                data={props.data}
                columns={[
                  {
                    header: t('common:date'),
                    key: 'date',
                    renderItem: ({ row }) => dayjs(row.date).format('ddd D'),
                  },
                  { header: t('occupancy'), key: 'occupancy', renderItem },
                  { header: t('sales'), key: 'sales', renderItem },
                  { header: t('profit'), key: 'profit', renderItem },
                  { header: t('savings'), key: 'savings', renderItem },
                ]}
              />
            )
          ) : (
            <ForecastChart
              data={props.data}
              visibleMetric={selectedChartMode}
            />
          )}
        </div>
      </div>

      <Tooltip id="forecast-tooltip" />
    </>
  );
};

const ForecastTableSkeleton = () => {
  const renderItem = () => <Skeleton width={50} />;

  return (
    <Table
      data={[...Array(7)].map<Forecast[number]>((_, i) => ({
        date: dayjs().add(i, 'day').toDate(),
        occupancy: 0,
        profit: 0,
        sales: 0,
        savings: 0,
      }))}
      columns={[
        {
          header: 'Date',
          key: 'date',
          renderItem: ({ row }) => dayjs(row.date).format('ddd D'),
        },
        { header: 'Occupancy', key: 'occupancy', renderItem },
        { header: 'Sales', key: 'sales', renderItem },
        { header: 'Profit', key: 'profit', renderItem },
        { header: 'Savings', key: 'savings', renderItem },
      ]}
    />
  );
};
