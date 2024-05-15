import { FaInfoCircle } from 'react-icons/fa';
import styles from './ForecastCard.module.scss';
import { Dropdown, IconButton, Loading, Table, Tabs } from 'shared-ui';
import dayjs from 'dayjs';
import { Tooltip } from 'react-tooltip';
import { useState, useMemo } from 'react';
import { ForecastChart } from './ForecastChart';
import { Forecast, MetricType } from '../../../services/overview.service';
import Skeleton from 'react-loading-skeleton';
import { prettyNumber } from '../../../utils/helpers';
import { useTranslation } from 'react-i18next';
import overviewService from '../../../services/overview.service';
type Props = {
  data?: Forecast;
  currency?: string | null;
  loading: boolean;
};
import { format } from 'date-fns';
// TODO: Calculate depending on available values

//TODO: Vertical table (header = days)
export const ForecastCard = (props: Props) => {
  const { t } = useTranslation(['overview', 'common']);
  const [selectedMode, setSelectedMode] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedChartMode, setSelectedChartMode] =
    useState<MetricType>('occupancy');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderItem = ({ value }: { value: any }) =>
    value !== null && value !== undefined ? value : '0';

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
    setIsLoading(true);
    const rows = props.data;
    if (rows) {
      overviewService
        .getCsv(
          props?.selectedRestaurantUUID,
          format(props.value[0], 'yyyy-MM-dd'),
          format(props.value[1], 'yyyy-MM-dd'),
          'True'
        )
        .then((response) => {
          const csvHeader = Object.keys(response.csv_data[0]).join(',') + '\n';
          const csvData = response.csv_data
            .map((item) => Object.values(item).join(','))
            .join('\n');
          const csvContent = csvHeader + csvData;
          const blob = new Blob([csvContent], {
            type: 'text/csv;charset=utf-8',
          });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'data.csv';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          setIsLoading(false);
          console.log('Download initiated');
        })
        .catch((error) => {
          setIsLoading(false);
          console.error('Error downloading CSV:', error);
        });
    } else {
      setIsLoading(false);
      console.error('No data available to download.');
    }
  };

  return (
    <>
      <div className={styles.card}>
        <div className={styles.header}>
          <div>
            <h2 className={styles.title}>{t('forecast')}</h2>
            <Tabs
              tabs={[t('tab.table')]} //  t('tab.chart')]
              onClick={setSelectedMode}
              selectedIndex={selectedMode}
              className={styles.tabs}
            />
          </div>
          {isLoading && <Loading />}
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
              <>
                <Table
                  style={{ background: 'red' }}
                  data={props.data}
                  columns={[
                    {
                      header: t('Ingredient Name'),
                      key: 'ingredient_name',
                      renderItem,
                    },
                    {
                      header: t('Unit'),
                      key: 'unit',
                      renderItem,
                    },
                    {
                      header: t('cost/unit'),
                      key: 'cost_per_unit',
                      renderItem: ({ value }) =>
                        value != null
                          ? `£${parseFloat(value).toFixed(2)}`
                          : '£0.00',
                    },
                    {
                      header: t('sold Qty'),
                      key: 'sold_qty',
                      renderItem: ({ value }) =>
                        value != null
                          ? `${parseFloat(value).toFixed(2)}`
                          : '0.00',
                    },
                    {
                      header: t('Theoretical Cos'),
                      key: 'theoretical_cos',
                      renderItem: ({ value }) =>
                        value != null
                          ? `£${parseFloat(value).toFixed(2)}`
                          : '£0.00',
                    },
                    {
                      header: t('opening Qty'),
                      key: 'opening_qty',
                      renderItem: ({ value }) =>
                        value != null
                          ? `${parseFloat(value).toFixed(2)}`
                          : '0.00',
                    },
                    {
                      header: t('purchased Qty'),
                      key: 'purchased_qty',
                      renderItem: ({ value }) =>
                        value != null
                          ? `${parseFloat(value).toFixed(2)}`
                          : '0.00',
                    },
                    {
                      header: t('closing Qty'),
                      key: 'closing_qty',
                      renderItem: ({ value }) =>
                        value != null
                          ? `${parseFloat(value).toFixed(2)}`
                          : '0.00',
                    },
                    {
                      header: t('actual Cos'),
                      key: 'actual_cos',
                      renderItem: ({ value }) =>
                        value != null
                          ? `£${parseFloat(value).toFixed(2)}`
                          : '£0.00',
                    },
                    {
                      header: t('Variance'),
                      key: 'variance',
                      renderItem: ({ value }) =>
                        value != null
                          ? `${parseFloat(value).toFixed(2)}%`
                          : '0.00%',
                    },
                  ]}
                />
              </>
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
        { header: 'ingredient_name', key: 'ingredient_name', renderItem },
        { header: 'unit', key: 'unit', renderItem },
        { header: 'opening_qty', key: 'opening_qty', renderItem },
        { header: 'purchased_qty', key: 'purchased_qty', renderItem },
        { header: 'cost_per_unit', key: 'cost_per_unit', renderItem },
        { header: 'sold_qty', key: 'sold_qty', renderItem },
        { header: 'closing_qty', key: 'closing_qty', renderItem },
        { header: 'actual_cos', key: 'actual_cos', renderItem },
        { header: 'theoretical_cos', key: 'theoretical_cos', renderItem },
        { header: 'variance', key: 'variance', renderItem },
      ]}
    />
  );
};
