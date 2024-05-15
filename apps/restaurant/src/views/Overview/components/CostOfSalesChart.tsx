import dayjs from 'dayjs';
import { Chart } from 'react-chartjs-2';
import 'chart.js/auto';
import { CostofSales, MetricType } from '../../../services/overview.service';
import { metricFormat } from '../Overview';
import { useTranslation } from 'react-i18next';

// Get css variable color
const cssvar = (name: string) => {
  return getComputedStyle(document.documentElement).getPropertyValue(name);
};

const primaryColor = cssvar('--primaryColor');

type Props = {
  data?: CostofSales;
  currency?: string | null;
  visibleMetric: MetricType;
};

export const CostOfSalesChart = (props: Props) => {
  const { t } = useTranslation('overview');

  if (!props.data) return;
  const selectedMetric: MetricType = props.visibleMetric ?? 'costofgoodssold';

  return (
    <Chart
      type="line"
      height={300}
      data={{
        labels: props.data.map((day) => dayjs(day.date).format('ddd D')),
        datasets: [
          {
            type: 'line',
            label: 'Revenue',
            data: props.data.map((day) => day[selectedMetric]),
            borderColor: primaryColor,
            tension: 0.4,
            pointBorderColor: 'white',
            pointBorderWidth: 2,
            pointBackgroundColor: primaryColor,
            pointHoverBorderWidth: 2,
            pointHoverBackgroundColor: primaryColor,
            pointRadius: 4,
            pointHoverRadius: 4,
          },
          // error area
          {
            type: 'line',
            label: 'Error max',
            data: props.data.map(
              (day) => day[selectedMetric]! + day[selectedMetric]! * 0.15
            ),

            borderColor: primaryColor + '40',
            borderWidth: 2,
            borderDash: [15, 10],
            tension: 0.4,
            pointRadius: 0,
            pointHoverRadius: 0,

            backgroundColor: primaryColor + '20',
            // fill until error min dataset
            fill: '+1', // can also be 2
          },
          {
            type: 'line',
            label: 'Error min',
            data: props.data.map(
              (day) => day[selectedMetric]! - day[selectedMetric]! * 0.15
            ),

            borderColor: primaryColor + '40',
            borderWidth: 2,
            borderDash: [15, 10],
            tension: 0.4,
            pointRadius: 0,
            pointHoverRadius: 0,
          },
        ],
      }}
      options={{
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            padding: 10,
            backgroundColor: '#000000bd',
            titleAlign: 'center',
            displayColors: false,
            yAlign: 'top',
            caretPadding: 10,
            titleFont: {
              family: 'Montserrat',
            },
            bodyFont: {
              family: 'Montserrat',
            },
            callbacks: {
              label: (item) =>
                metricFormat[selectedMetric]({
                  value: item.raw as number,
                  t,
                  currency: props.currency,
                }),
            },
            filter: function (tooltipItem) {
              return tooltipItem.datasetIndex === 0;
            },
          },
        },
        layout: {
          padding: { left: 20, right: 40, bottom: 20, top: 40 },
        },
        interaction: {
          intersect: false,
          mode: 'nearest',
          axis: 'x',
        },

        // resize with windows
        maintainAspectRatio: false,
        responsive: true,

        scales: {
          y: {
            title: {
              display: true,
              padding: 0,
              text: selectedMetric,
            },
            border: {
              display: false,

              dash: [5],
            },
            ticks: {
              // display: false,
              padding: 10,
              font: {
                family: 'Montserrat',
              },
            },
            grid: {
              drawTicks: false,
            },
          },
          x: {
            border: {
              display: false,
            },
            ticks: {
              font: {
                family: 'Montserrat',
              },
            },

            grid: {
              display: false,
            },
          },
        },
      }}
    />
  );
};
