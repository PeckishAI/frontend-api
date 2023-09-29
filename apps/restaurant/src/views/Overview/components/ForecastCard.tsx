import { FaInfoCircle } from 'react-icons/fa';
import styles from './ForecastCard.module.scss';
import { Dropdown, IconButton, Table, Tabs } from 'shared-ui';
import dayjs from 'dayjs';
import { Tooltip } from 'react-tooltip';
import { useState, useMemo } from 'react';
import { ForecastChart } from './ForecastChart';
import { Forecast, MetricType } from '../../../services/overview.service';
import Skeleton from 'react-loading-skeleton';
import { prettyNumber } from '../../../utils/helpers';
import { useTranslation } from 'react-i18next';

type Props = {
  data?: Forecast;
  currency?: string | null;
  loading: boolean;
};

// TODO: Calculate depending on available values

//TODO: Vertical table (header = days)
export const ForecastCard = (props: Props) => {
  const { t } = useTranslation(['overview', 'common']);
  const [selectedMode, setSelectedMode] = useState(0);
  const [selectedChartMode, setSelectedChartMode] =
    useState<MetricType>('occupancy');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderItem = ({ value }: { value: any }) =>
    value ? prettyNumber(value) : '--';

  const chartModes = useMemo(() => {
    const hasOccupancy = props.data && props.data[0]?.occupancy != null;
    const hasSales = props.data && props.data[0]?.sales != null;
    const hasProfit = props.data && props.data[0]?.profit != null;
    const hasSavings = props.data && props.data[0]?.savings != null;

    const modes = [
      {
        label: t('occupancy'),
        value: 'occupancy',
        disabled: !hasOccupancy,
      },
      {
        label: t('sales'),
        value: 'sales',
        disabled: !hasSales,
      },
      {
        label: t('profit'),
        value: 'profits',
        disabled: !hasProfit,
      },
      {
        label: t('savings'),
        value: 'savings',
        disabled: !hasSavings,
      },
    ];

    if (hasOccupancy) {
      setSelectedChartMode('occupancy');
    } else if (hasSales) {
      setSelectedChartMode('sales');
    } else if (hasProfit) {
      setSelectedChartMode('profits');
    } else if (hasSavings) {
      setSelectedChartMode('savings');
    } else {
      setSelectedChartMode('occupancy');
    }
    return modes;
  }, [props.data]);

  const handleExportDataClick = () => {
    const rows = props.data;
    if (rows) {
      const header = 'Date, Occupency, Sales, Profit, Savings\n';
      const csvContent =
        'data:text/csv;charset=utf-8,' +
        header +
        rows
          .map((row) => {
            const values = [];
            values.push(row.date.toISOString()); // Convertir la date en format ISO string
            values.push(row.occupancy || '-');
            values.push(row.sales || '-');
            values.push(row.profit || '-');
            values.push(row.savings || '-');
            return values.join(',');
          })
          .join('\n');

      // Créer un lien d'ancrage pour le téléchargement
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', 'forecast.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

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
            <IconButton
              icon={<i className="fa-solid fa-file-export"></i>}
              onClick={handleExportDataClick}
              tooltipMsg={t('common:export')}
              tooltipId="forecast-tooltip"
              className={styles.forecastIiconBtn}
            />
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
              currency={props.currency}
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
