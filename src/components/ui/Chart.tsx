import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface ChartProps {
  type: 'line' | 'area' | 'bar' | 'pie';
  data: any[];
  height?: number;
  xAxisKey?: string;
  dataKey?: string;
  color?: string;
  gradient?: boolean;
  showGrid?: boolean;
  showTooltip?: boolean;
  className?: string;
}

const Chart: React.FC<ChartProps> = ({
  type,
  data,
  height = 300,
  xAxisKey = 'name',
  dataKey = 'value',
  color = '#3B82F6',
  gradient = true,
  showGrid = true,
  showTooltip = true,
  className = ''
}) => {
  const { theme } = useTheme();

  const chartColors = {
    primary: theme === 'dark' ? '#60A5FA' : '#3B82F6',
    secondary: theme === 'dark' ? '#34D399' : '#10B981',
    tertiary: theme === 'dark' ? '#F472B6' : '#EC4899',
    quaternary: theme === 'dark' ? '#FBBF24' : '#F59E0B',
  };

  const pieColors = [
    chartColors.primary,
    chartColors.secondary,
    chartColors.tertiary,
    chartColors.quaternary,
    '#8B5CF6',
    '#EF4444'
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className={`
          p-3 rounded-lg shadow-lg border
          ${theme === 'dark' 
            ? 'bg-slate-800/95 border-white/10 text-white' 
            : 'bg-white/95 border-slate-200 text-slate-800'
          }
        `}>
          <p className="font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {entry.value?.toLocaleString()}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const axisStyle = {
    fontSize: 12,
    fill: theme === 'dark' ? '#94A3B8' : '#64748B'
  };

  const gridStyle = {
    stroke: theme === 'dark' ? '#334155' : '#E2E8F0',
    strokeDasharray: '3 3'
  };

  const renderChart = () => {
    switch (type) {
      case 'line':
        return (
          <LineChart data={data}>
            {showGrid && <CartesianGrid {...gridStyle} />}
            <XAxis dataKey={xAxisKey} axisLine={false} tickLine={false} style={axisStyle} />
            <YAxis axisLine={false} tickLine={false} style={axisStyle} />
            {showTooltip && <Tooltip content={<CustomTooltip />} />}
            <Line 
              type="monotone" 
              dataKey={dataKey} 
              stroke={color || chartColors.primary}
              strokeWidth={3}
              dot={{ fill: color || chartColors.primary, r: 4 }}
              activeDot={{ r: 6, fill: color || chartColors.primary }}
            />
          </LineChart>
        );

      case 'area':
        return (
          <AreaChart data={data}>
            {showGrid && <CartesianGrid {...gridStyle} />}
            <XAxis dataKey={xAxisKey} axisLine={false} tickLine={false} style={axisStyle} />
            <YAxis axisLine={false} tickLine={false} style={axisStyle} />
            {showTooltip && <Tooltip content={<CustomTooltip />} />}
            <defs>
              <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color || chartColors.primary} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={color || chartColors.primary} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <Area 
              type="monotone" 
              dataKey={dataKey} 
              stroke={color || chartColors.primary}
              strokeWidth={2}
              fill={gradient ? "url(#colorGradient)" : color || chartColors.primary}
            />
          </AreaChart>
        );

      case 'bar':
        return (
          <BarChart data={data}>
            {showGrid && <CartesianGrid {...gridStyle} />}
            <XAxis dataKey={xAxisKey} axisLine={false} tickLine={false} style={axisStyle} />
            <YAxis axisLine={false} tickLine={false} style={axisStyle} />
            {showTooltip && <Tooltip content={<CustomTooltip />} />}
            <Bar 
              dataKey={dataKey} 
              fill={color || chartColors.primary}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        );

      case 'pie':
        return (
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={120}
              paddingAngle={2}
              dataKey={dataKey}
            >
              {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
            ))}
            </Pie>
            {showTooltip && <Tooltip content={<CustomTooltip />} />}
          </PieChart>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`w-full ${className}`}>
      <ResponsiveContainer width="100%" height={height}>
        {renderChart() || <div>No chart data</div>}
      </ResponsiveContainer>
    </div>
  );
};

export default Chart;
