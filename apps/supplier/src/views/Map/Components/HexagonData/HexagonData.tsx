import './style.scss';
import { HexagonType } from '../Hexagon/Hexagon';
import { Chart } from 'react-chartjs-2';
import 'chart.js/auto';
import { useState } from 'react';

type Props = {
  hexagonList: HexagonType[];
};

// Get css variable color
const cssvar = (name: string) => {
  return getComputedStyle(document.documentElement).getPropertyValue(name);
};
const primaryColor = cssvar('--primaryColor');

const getLastMonthsName = (lastMonthsNb: number) => {
  let monthNames = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sept',
    'Oct',
    'Nov',
    'Dec',
  ];

  let today = new Date();
  let d;
  let months: string[] = [];

  for (let i = lastMonthsNb; i > 0; i -= 1) {
    d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    months[i - 1] = monthNames[d.getMonth()];
  }
  return months;
};

const HexagonData = (props: Props) => {
  if (props.hexagonList.length === 0) {
    return;
  }

  const [selectedTab, setSelectedTab] = useState(0);

  return (
    <div className="hexagon-data">
      <p className="name">Zone information</p>
      {/* {props.hexagonList.map((hexagon) => (
        <p key={`id-key-${hexagon.id}`}>
          ID : {hexagon.id}, <br />
          Coordinates :{' '}
          {hexagon.coordinates.map((coordinate) => (
            <p
              style={{ fontSize: '0.6rem' }}
              key={`coordinate-key-${hexagon.id}`}>
              {coordinate.toString()}
            </p>
          ))}
        </p>
      ))} */}
      {/* <Tabs
        tabs={['City area', 'Selected area']}
        onClick={(index) => setSelectedTab(index)}
        selectedIndex={selectedTab}
        className="hex-tabs"
      /> */}
      <div className="hex-tabs">
        <div className="wrapper">
          <div
            className={`selector ${
              selectedTab === 0 ? 'left' : 'right'
            }`}></div>
          <p className="tab" onClick={() => setSelectedTab(0)}>
            City area
          </p>
          <p className="tab" onClick={() => setSelectedTab(1)}>
            Selected area
          </p>
        </div>
      </div>
      {selectedTab === 0 && (
        <>
          <p className="note">
            <i className="fa-solid fa-circle-info"></i>Data based on Amsterdam
            city
          </p>
          <div className="charts-container">
            <div className="chart">
              <span className="chart-title">Market Share</span>
              <Chart
                type="line"
                data={{
                  labels: getLastMonthsName(5),
                  datasets: [
                    {
                      data: [37, 32, 44, 31, 49, 41, 37],
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
                  ],
                }}
                options={{
                  scales: {
                    y: {
                      ticks: {
                        callback: (value) => {
                          return `${value} %`;
                        },
                      },
                    },
                  },
                  plugins: { legend: { display: false } },
                }}
              />
            </div>
            <div className="chart">
              <span className="chart-title">Top ingredients</span>
              <Chart
                type="bar"
                data={{
                  labels: ['Banana', 'Tomato', 'Asparagus', 'Carrot'],
                  datasets: [
                    {
                      data: [44, 37, 32, 31],
                      borderColor: primaryColor,
                      backgroundColor: primaryColor,
                      borderRadius: 4,
                    },
                  ],
                }}
                options={{
                  scales: {
                    y: {
                      ticks: {
                        callback: (value) => {
                          return `${value} %`;
                        },
                      },
                    },
                  },
                  plugins: { legend: { display: false } },
                }}
              />
            </div>
          </div>
        </>
      )}
      {selectedTab === 1 && (
        <>
          <p className="note">
            <i className="fa-solid fa-circle-info"></i>Data based on clicked
            hexagon(s)
          </p>
          <div className="charts-container">
            <div className="chart">
              <span className="chart-title">Market Share</span>
              <Chart
                type="line"
                data={{
                  labels: getLastMonthsName(5),
                  datasets: [
                    {
                      data: [42, 47, 38, 49, 44, 37, 45],
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
                  ],
                }}
                options={{
                  scales: {
                    y: {
                      ticks: {
                        callback: (value) => {
                          return `${value} %`;
                        },
                      },
                    },
                  },
                  plugins: { legend: { display: false } },
                }}
              />
            </div>
            <div className="chart">
              <span className="chart-title">Top ingredients</span>
              <Chart
                type="bar"
                data={{
                  labels: ['Banana', 'Tomato', 'Celery', 'Cucumber'],
                  datasets: [
                    {
                      data: [41, 39, 38, 31],
                      borderColor: primaryColor,
                      backgroundColor: primaryColor,
                      borderRadius: 4,
                    },
                  ],
                }}
                options={{
                  scales: {
                    y: {
                      ticks: {
                        callback: (value) => {
                          return `${value} %`;
                        },
                      },
                    },
                  },
                  plugins: { legend: { display: false } },
                }}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default HexagonData;
