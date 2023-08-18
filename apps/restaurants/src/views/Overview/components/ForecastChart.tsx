import { Forecast } from '../Overview';
import dayjs from 'dayjs';
import { Chart } from 'react-chartjs-2';
import 'chart.js/auto';

// Get css variable color
const cssvar = (name: string) => {
  return getComputedStyle(document.documentElement).getPropertyValue(name);
};

const primaryColor = cssvar('--primaryColor');

type Props = {
  data: Forecast;
  visibleKey: keyof Forecast['days'][number];
};

export const ForecastChart = (props: Props) => {
  if (!props.data) return;
  const selectedKey =
    props.visibleKey && typeof props.data.days[0][props.visibleKey] === 'number'
      ? props.visibleKey
      : 'revenue';

  return (
    <Chart
      type="line"
      height={300}
      data={{
        labels: props.data.days.map((day) => dayjs(day.date).format('ddd D')),
        datasets: [
          {
            type: 'line',
            label: 'Revenue',
            data: props.data.days.map((day) => day[selectedKey]),
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
            data: props.data.days.map(
              (day) => day[selectedKey] + day[selectedKey] * 0.15
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
            data: props.data.days.map(
              (day) => day[selectedKey] - day[selectedKey] * 0.15
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
              label: (item) => item.formattedValue + '€',
            },
            filter: function (tooltipItem) {
              return tooltipItem.datasetIndex === 0;
            },
          },
        },
        layout: {
          padding: { left: 40, right: 40, bottom: 20, top: 40 },
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
            border: {
              display: false,

              dash: [5],
            },
            ticks: {
              display: false,
              color: 'red',
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
