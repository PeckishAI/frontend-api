import axiosClient from '.';

export type MetricType = 'occupancy' | 'profits' | 'sales' | 'savings';

export type RestaurantMetric = {
  occupancy: {
    value: number;
    mom: number;
  };
  sales: {
    value: number;
    mom: number;
  };
};

type MetricsResponse = {
  Occupancy: {
    curr_month: number;
    mom: number;
  };
  Sales: {
    curr_month: number;
    mom: number;
  };
};

const getMetrics = async (
  restaurantUUID: string
): Promise<RestaurantMetric> => {
  const res = await axiosClient.get<MetricsResponse>(
    `/restaurant/overview/${restaurantUUID}/metrics`
  );

  return {
    occupancy: {
      value: res.data.Occupancy.curr_month,
      mom: res.data.Occupancy.mom,
    },
    sales: {
      value: res.data.Sales.curr_month,
      mom: res.data.Sales.mom,
    },
  };
};

type ForecastResponse = {
  [date: string]: {
    [metric in MetricType]?: {
      high: number;
      low: number;
      pred: number;
    };
  };
};

export type Forecast = {
  date: Date;
  occupancy?: number;
  sales?: number;
  profit?: number;
  savings?: number;
}[];

const getForecast = async (restaurantUUID: string): Promise<Forecast> => {
  const res = await axiosClient.get<ForecastResponse>(
    `/restaurant/overview/${restaurantUUID}/forecast`
  );
  console.log(res.data);

  return Object.keys(res.data).map((date) => ({
    date: new Date(date),
    occupancy: res.data[date].occupancy?.pred,
    sales: res.data[date].sales?.pred,
    profit: res.data[date].profits?.pred,
    savings: res.data[date].savings?.pred,
  }));
};

export default {
  getMetrics,
  getForecast,
};
