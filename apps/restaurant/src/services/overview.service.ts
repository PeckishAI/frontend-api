import { axiosClient } from './index';

export type MetricType = 'costofgoodsold' | 'profits' | 'sales' | 'savings';

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

export type InventoryValue = {
  total_inventory_value?: number;
  // Add other properties if needed
};

const getCostMetric = async (
  restaurantUUID: string,
  weekStart: string,
  weekEnd: string
): Promise<ApiResponse> => {
  try {
    const res = await axiosClient.get<MetricsResponses>(
      `/overview/${restaurantUUID}/cost_and_sales`,
      {
        params: {
          start_date: weekStart,
          end_date: weekEnd,
        },
      }
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
    console.error('Error fetching data:', error);
    return null;
  }
};

export type CostofSales = {
  date: Date;
  name: string;
  unit: string;
  cost_per_unit: number;
  tags: string[];
  sold_qty: number;
  opening_qty: number;
  purchased_qty: number;
  closing_qty: number;
  actual_cos: number;
  theoretical_cos: number;
  variance: number;
  variance_value: number;
}[];

const getCostOfSales = async (
  restaurantUUID: string,
  weekStart: string,
  weekEnd: string,
  tag: string
): Promise<CostofSales> => {
  try {
    console.log(tag);
    const res = await axiosClient.get<CostofSales>(
      `/overview/${restaurantUUID}/fetch_data`,
      {
        params: {
          start_date: weekStart,
          end_date: weekEnd,
          tag: tag,
        },
      }
    );

    return res.data.map((item) => ({
      ingredient_name: item.name,
      tags: item.tags,
      unit: item.unit,
      cost_per_unit: item.cost_per_unit,
      opening_qty: item.opening_qty,
      purchased_qty: item.purchased_qty,
      sold_qty: item.sold_qty,
      closing_qty: item.closing_qty,
      actual_cos: item.actual_cos,
      theoretical_cos: item.theoretical_cos,
      variance: item.variance,
      varience_value: item.variance_value,
    }));
  } catch (res) {
    console.error('Error fetching data:', res?.data.error);
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
  variance_value: number;
};

interface GetCostResponse {
  csv_data: Ingredient;
}
const getCsv = async (
  restaurantUUID: string,
  weekStart: string,
  weekEnd: string,
  download_csv: string,
  tag: string
): Promise<GetCostResponse> => {
  try {
    console.log(tag);
    const res = await axiosClient.get<Ingredient>(
      `/overview/${restaurantUUID}/fetch_data`,
      {
        params: {
          start_date: weekStart,
          end_date: weekEnd,
          download_csv: download_csv,
          tag: tag,
        },
      }
    );

    return {
      csv_data: res.data,
    };
  } catch (error) {
    console.error('Error fetching Table data:', error);
    return [];
  }
};

const getInventoryValue = async (
  restaurantUUID: string,
  weekStart: string,
  weekEnd: string
): Promise<InventoryValue> => {
  try {
    const res = await axiosClient.get<InventoryValue>(
      `/overview/${restaurantUUID}/inventory_value`,
      {
        params: {
          start_date: weekStart,
          end_date: weekEnd,
        },
      }
    );
    return res.data;
  } catch (res) {
    console.error('Error fetching data');
    return { total_inventory_value: 0 };
  }
};

export default {
  getCostOfSales,
  getCostMetric,
  getCsv,
  getInventoryValue,
};
