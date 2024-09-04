import styles from './CostOfSalesCard.module.scss';
import { Dropdown, IconButton, Table, Tabs } from 'shared-ui';
import dayjs from 'dayjs';
import { Tooltip } from 'react-tooltip';
import { useState, useMemo } from 'react';
import { CostOfSalesChart } from './CostOfSalesChart';
import { CostofSales, MetricType } from '../../../services/overview.service';
import Skeleton from 'react-loading-skeleton';
import { useTranslation } from 'react-i18next';
import overviewService from '../../../services/overview.service';
import { format } from 'date-fns';
import CostFilters from './CostFilter/CostFilters';

type Props = {
  data?: CostofSales;
  currency?: string | null;
  loading: boolean;
  value: [Date | null, Date | null];
  selectedRestaurantUUID: string;
  filterOption?: string;
  setFilters: () => void;
  filters: string;
  isLoading: boolean;
  setIsLoading: (value: boolean) => void;
};

export const CostOfSalesCard: React.FC<Props> = ({
  data,
  loading,
  selectedRestaurantUUID,
  currency,
  value,
  filterOption,
  setFilters,
  filters,
  setIsLoading,
}) => {
  const { t } = useTranslation(['overview', 'common', 'ingredient']);
  const [selectedMode, setSelectedMode] = useState(0);
  const [selectedChartMode, setSelectedChartMode] =
    useState<MetricType>('costofgoodssold');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderItem = ({ value }: { value: any }) =>
    value !== null && value !== undefined ? value : '0';

  const chartModes = useMemo(() => {
    const hascostofgoodssold = data && data[0]?.costofgoodssold != null;
    const hasSales = data && data[0]?.sales != null;
    const hasProfit = data && data[0]?.profit != null;
    const hasSavings = data && data[0]?.savings != null;

    const modes = [
      {
        label: t('costofgoodssold'),
        value: 'costofgoodssold',
        disabled: !hascostofgoodssold,
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

    if (hascostofgoodssold) {
      setSelectedChartMode('costofgoodssold');
    } else if (hasSales) {
      setSelectedChartMode('sales');
    } else if (hasProfit) {
      setSelectedChartMode('profits');
    } else if (hasSavings) {
      setSelectedChartMode('savings');
    } else {
      setSelectedChartMode('costofgoodssold');
    }
    return modes;
  }, [data]);

  const handleExportDataClick = () => {
    setIsLoading(true);

    const rows = data;
    if (rows) {
      overviewService
        .getCsv(
          selectedRestaurantUUID,
          format(value[0], 'yyyy-MM-dd'),
          format(value[1], 'yyyy-MM-dd'),
          'True',
          filters?.selectedTag?.name
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
            <h2 className={styles.title}>{t('CostofSales')}</h2>
            <Tabs
              tabs={[t('tab.table')]} //  t('tab.chart')]
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
                  setSelectedChartMode(value as 'costofgoodssold' | 'sales')
                }
              />
            )}

            <CostFilters
              tag_names={(filterOption || []).map((s) => ({
                name: s.tag_name,
              }))}
              onApplyFilters={(newFilters) => setFilters(newFilters)}
            />

            <IconButton
              icon={<i className="fa-solid fa-file-export"></i>}
              onClick={handleExportDataClick}
              tooltipMsg={t('common:export')}
              tooltipId="forecast-tooltip"
              className={styles.forecastIiconBtn}
            />
            <IconButton
              icon={<i className="fa-solid fa-circle-info"></i>}
              tooltipMsg={t('CostofSalesTooltip')}
              tooltipId="forecast-tooltip"
              className={styles.forecastIiconBtn}
            />
          </div>
        </div>

        <div className={styles.content}>
          {/* {Children} */}
          {selectedMode === 0 ? (
            loading ? (
              <ForecastTableSkeleton />
            ) : (
              <>
                <Table
                  style={{ background: 'red' }}
                  data={data}
                  columns={[
                    {
                      header: t('ingredient:ingredientName'),
                      key: 'ingredient_name',
                      renderItem,
                    },
                    {
                      header: t('ingredient:unit'),
                      key: 'unit',
                      renderItem,
                    },
                    {
                      header: t('ingredient:unitCost'),
                      key: 'cost_per_unit',
                      renderItem: ({ value }) =>
                        value != null
                          ? `£${parseFloat(value).toFixed(2)}`
                          : '£0.00',
                    },
                    {
                      header: t('ingredient:soldQty'),
                      key: 'sold_qty',
                      renderItem: ({ value }) =>
                        value != null
                          ? `${parseFloat(value).toFixed(2)}`
                          : '0.00',
                    },
                    {
                      header: t('ingredient:theoreticalStock'),
                      key: 'theoretical_cos',
                      renderItem: ({ value }) =>
                        value != null
                          ? `£${parseFloat(value).toFixed(2)}`
                          : '£0.00',
                    },
                    {
                      header: t('ingredient:openingQty'),
                      key: 'opening_qty',
                      renderItem: ({ value }) =>
                        value != null
                          ? `${parseFloat(value).toFixed(2)}`
                          : '0.00',
                    },
                    {
                      header: t('ingredient:purchasedQty'),
                      key: 'purchased_qty',
                      renderItem: ({ value }) =>
                        value != null
                          ? `${parseFloat(value).toFixed(2)}`
                          : '0.00',
                    },
                    {
                      header: t('ingredient:closingQty'),
                      key: 'closing_qty',
                      renderItem: ({ value }) =>
                        value != null
                          ? `${parseFloat(value).toFixed(2)}`
                          : '0.00',
                    },
                    {
                      header: t('ingredient:actualCos'),
                      key: 'actual_cos',
                      renderItem: ({ value }) =>
                        value != null
                          ? `£${parseFloat(value).toFixed(2)}`
                          : '£0.00',
                    },
                    {
                      header: t('ingredient:variance'),
                      key: 'variance',
                      renderItem: ({ value }) =>
                        value != null
                          ? `${parseFloat(value).toFixed(2)}%`
                          : '0.00%',
                    },
                    {
                      header: t('ingredient:variance_value'),
                      key: 'variance_value',
                      renderItem: ({ value }) =>
                        value != null
                          ? `${parseFloat(value).toFixed(2)}`
                          : '0.00',
                    },
                  ]}
                />
              </>
            )
          ) : (
            <CostOfSalesChart
              data={data}
              visibleMetric={selectedChartMode}
              currency={currency}
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
      data={[...Array(7)].map<CostofSales[number]>((_, i) => ({
        date: dayjs().add(i, 'day').toDate(),
        costofgoodssold: 0,
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
