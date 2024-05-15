import axios from 'axios';
import { GLOBAL_CONFIG } from 'shared-config';

export type MetricType = 'costofgoodsold' | 'profits' | 'sales' | 'savings';

export type RestaurantMetric = {
  occupancy: {
    value?: number;
    mom?: number;
  };
  sales: {
    value?: number;
    mom?: number;
  };
};

export type ApiResponse = {
  costofgoodsold: {
    value?: number;
    percentage?: number;
  };
  sales: {
    value?: number;
    percentage?: number;
  };
};
type MetricsResponses = {
  costofgoodsold: {
    value?: number;
    percentage?: number;
  };
  sales: {
    value?: number;
    percentage?: number;
  };
};

const apiUrl = GLOBAL_CONFIG.apiUrl; // Get the API URL based on the environment

const getCostMetric = async (
  restaurantUUID: string,
  weekStart: string,
  weekEnd: string
): Promise<ApiResponse> => {
  try {
    const res = await axios.get<MetricsResponses>(
      `${apiUrl}/overview/${restaurantUUID}/cost_and_sales?start_date=${weekStart}&end_date=${weekEnd}`
    );

    return {
      costofgoodsold: {
        value: res.data.cost_of_goods,
        percentage: res.data.cost_change_percentage,
      },
      sales: {
        value: res.data.sales,
        percentage: res.data.sales_change_percentage,
      },
    };
  } catch (error) {
    console.error('Error fetching forecast data:', error);
    return null;
  }
};

export type Forecast = {
  date: Date;
  ingredient_name?: number;
  sales?: number;
  opening_qty: number;
  purchased_qty: number;
  closing_qty: number;
  actual_cos: number;
  theoretical_cos: number;
  variance: number;
}[];

const getForecast = async (
  restaurantUUID: string,
  weekStart: string,
  weekEnd: string
): Promise<Forecast> => {
  try {
    const res = await axios.get<Forecast>(
      `${apiUrl}/overview/${restaurantUUID}/fetch_data`,
      {
        params: {
          start_date: weekStart,
          end_date: weekEnd,
        },
      }
    );

    return res.data.map((item) => ({
      ingredient_name: item.ingredient_name,
      unit: item.unit,
      cost_per_unit: item.cost_per_unit,
      opening_qty: item.opening_qty,
      purchased_qty: item.purchased_qty,
      sold_qty: item.sold_qty,
      closing_qty: item.closing_qty,
      actual_cos: item.actual_cos,
      theoretical_cos: item.theoretical_cos,
      variance: item.variance,
    }));
  } catch (error) {
    console.error('Error fetching forecast data:', error);
    return null;
  }
};

export type Ingredient = {
  ingredient_name: string;
  unit: string;
  cost_per_unit: number;
  opening_qty: number;
  purchased_qty: number;
  closing_qty: number;
  actual_cos: number;
  theoretical_cos: number;
  sold_qty: number;
  variance: number;
};

interface GetCostResponse {
  csv_data: Ingredient;
}
const getCsv = async (
  restaurantUUID: string,
  weekStart: string,
  weekEnd: string,
  downlaod_csv: string
): Promise<GetCostResponse> => {
  try {
    const res = await axios.get<Ingredient>(
      `${apiUrl}/overview/${restaurantUUID}/fetch_data?start_date=${weekStart}&end_date=${weekEnd}&downlaod_csv=${downlaod_csv}`
    );

    return {
      csv_data: res.data,
    };
  } catch (error) {
    console.error('Error fetching forecast data:', error);
    return [];
  }
};

export default {
  getForecast,
  getCostMetric,
  getCsv,
};
