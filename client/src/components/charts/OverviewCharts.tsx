import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { cn } from "@/lib/utils";
import styles from "./OverviewCharts.module.css";

const salesData = [
  { name: 'Jan', value: 0 },
  { name: 'Feb', value: 0 },
  { name: 'Mar', value: 0 },
  { name: 'Apr', value: 0 },
  { name: 'May', value: 180 },
  { name: 'Jun', value: 100 },
  { name: 'Jul', value: 0 },
  { name: 'Aug', value: 0 },
  { name: 'Sep', value: 0 },
];

const customerData = [
  { name: 'Jan', value: 0 },
  { name: 'Feb', value: 0 },
  { name: 'Mar', value: 0 },
  { name: 'Apr', value: 0 },
  { name: 'May', value: 10 },
  { name: 'Jun', value: 2 },
  { name: 'Jul', value: 0 },
  { name: 'Aug', value: 0 },
  { name: 'Sep', value: 0 },
];

interface ChartProps {
  className?: string;
}

export function SalesChart({ className }: ChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300} className={cn(styles.chartContainer, className)}>
      <AreaChart data={salesData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1" className={styles.areaGradient}>
            <stop offset="5%" stopColor="#0284c7" stopOpacity={0.1}/>
            <stop offset="95%" stopColor="#0284c7" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" className={styles.chartGrid} vertical={false} />
        <XAxis 
          dataKey="name" 
          className={styles.chartAxis}
          tickLine={false} 
          axisLine={false} 
        />
        <YAxis 
          className={styles.chartAxis}
          tickLine={false} 
          axisLine={false} 
          tickFormatter={(value) => `$${value}`} 
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '6px',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
          }}
          formatter={(value) => [`$${value}`, 'Sales']}
          wrapperClassName={styles.tooltip}
        />
        <Area 
          type="monotone" 
          dataKey="value" 
          stroke="#0284c7" 
          fillOpacity={1} 
          fill="url(#colorValue)" 
          className={styles.areaSales}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function CustomerChart({ className }: ChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300} className={cn(styles.chartContainer, className)}>
      <AreaChart data={customerData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorCustomers" x1="0" y1="0" x2="0" y2="1" className={styles.areaGradient}>
            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
            <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" className={styles.chartGrid} vertical={false} />
        <XAxis 
          dataKey="name" 
          className={styles.chartAxis}
          tickLine={false} 
          axisLine={false} 
        />
        <YAxis 
          className={styles.chartAxis}
          tickLine={false} 
          axisLine={false} 
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '6px',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
          }}
          formatter={(value) => [value, 'Customers']}
          wrapperClassName={styles.tooltip}
        />
        <Area 
          type="monotone" 
          dataKey="value" 
          stroke="#6366f1" 
          fillOpacity={1} 
          fill="url(#colorCustomers)" 
          className={styles.areaCustomers}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
