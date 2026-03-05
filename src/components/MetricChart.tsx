'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { STORES, STORE_COLORS, METRICS, getMetricValue, formatValue } from '@/lib/data';
import type { MetricKey } from '@/lib/types';
import { WEEKS } from '@/lib/data';

interface Props {
  selectedMetric: MetricKey;
  focusedStoreId?: string | null;
}

export default function MetricChart({ selectedMetric, focusedStoreId }: Props) {
  const hasFocus = focusedStoreId != null;
  const metricConfig = METRICS.find((m) => m.key === selectedMetric)!;

  // Build chart data: one entry per week
  const chartData = WEEKS.map((weekStart) => {
    const entry: Record<string, string | number> = { weekStart };
    // Find weekLabel from any store
    const anyWeek = STORES[0].weeks.find((w) => w.weekStart === weekStart);
    entry.name = anyWeek?.weekLabel ?? weekStart;

    STORES.forEach((store) => {
      const record = store.weeks.find((w) => w.weekStart === weekStart);
      entry[store.storeId] = getMetricValue(record, selectedMetric);
    });
    return entry;
  });

  const formatYAxis = (value: number) => {
    if (metricConfig.format === 'mxn') {
      if (value >= 1000) return `$${(value / 1000).toFixed(0)}k`;
      return `$${value}`;
    }
    if (metricConfig.format === 'rating') return value.toFixed(1);
    if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
    return String(value);
  };

  const formatTooltipValue = (value: number | string | undefined) => {
    if (typeof value !== 'number') return String(value ?? '');
    return formatValue(value, metricConfig.format);
  };

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={340}>
        <LineChart data={chartData} margin={{ top: 8, right: 24, left: 8, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 11, fill: '#6b7280' }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tickFormatter={formatYAxis}
            tick={{ fontSize: 11, fill: '#6b7280' }}
            tickLine={false}
            axisLine={false}
            width={56}
          />
          <Tooltip
            formatter={(value: number | string | undefined, name: string | undefined) => [
              formatTooltipValue(value as number),
              STORES.find((s) => s.storeId === name)?.storeName ?? name ?? '',
            ]}
            contentStyle={{
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
              fontSize: '12px',
            }}
          />
          <Legend
            formatter={(value) =>
              STORES.find((s) => s.storeId === value)?.storeName ?? value
            }
            wrapperStyle={{ fontSize: '12px', paddingTop: '12px' }}
          />
          {STORES.map((store) => {
            const isFocused = store.storeId === focusedStoreId;
            const opacity = hasFocus ? (isFocused ? 1 : 0.12) : 1;
            const strokeWidth = isFocused ? 3 : 2;
            return (
              <Line
                key={store.storeId}
                type="monotone"
                dataKey={store.storeId}
                stroke={STORE_COLORS[store.storeId]}
                strokeWidth={strokeWidth}
                strokeOpacity={opacity}
                dot={{ r: isFocused ? 4 : 3, strokeWidth: 0, fillOpacity: opacity }}
                activeDot={{ r: isFocused ? 6 : 4, fillOpacity: opacity }}
              />
            );
          })}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
