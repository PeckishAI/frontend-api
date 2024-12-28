
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DataPoint {
  date: string;
  net_sales?: number;
  cost_of_sales?: number;
}

interface ChartProps {
  data: DataPoint[];
  type?: 'sales' | 'cost';
}

export function SalesChart({ data, type = 'sales' }: ChartProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatValue = (value: number) => `$${value.toFixed(2)}`;
  
  const valueKey = type === 'sales' ? 'net_sales' : 'cost_of_sales';
  const color = type === 'sales' ? '#0284c7' : '#ef4444';

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={`color${type}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.1}/>
            <stop offset="95%" stopColor={color} stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
        <XAxis 
          dataKey="date" 
          stroke="#6b7280" 
          fontSize={12} 
          tickLine={false} 
          axisLine={false}
          tickFormatter={formatDate} 
        />
        <YAxis 
          stroke="#6b7280" 
          fontSize={12} 
          tickLine={false} 
          axisLine={false} 
          tickFormatter={formatValue}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '6px',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
          }}
          formatter={(value: number) => [formatValue(value), type === 'sales' ? 'Sales' : 'Cost']}
          labelFormatter={formatDate}
        />
        <Area 
          type="monotone" 
          dataKey={valueKey}
          stroke={color}
          fillOpacity={1} 
          fill={`url(#color${type})`}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
