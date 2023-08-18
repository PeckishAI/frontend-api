import dayjs from 'dayjs';
import { Forecast } from './Overview';

export const forecastMock: Forecast = {
  currency: 'EUR',
  days: Array.from({ length: 7 }, (_, i) => ({
    date: dayjs().add(i, 'day').toDate(),

    revenue: Math.floor(Math.random() * 1000),
    profit: Math.floor(Math.random() * 1000),
    sales: Math.floor(Math.random() * 1000),
    savings: Math.floor(Math.random() * 1000),
  })),
};
