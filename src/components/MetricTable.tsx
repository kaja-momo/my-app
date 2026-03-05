'use client';

import { STORES, METRICS, STORE_COLORS, getWeekRecord, getMetricValue, formatValue } from '@/lib/data';
import type { MetricKey } from '@/lib/types';
import { cn } from '@/lib/utils';

interface Props {
  weekStart: string;
  selectedMetric: MetricKey;
  onSelectMetric: (key: MetricKey) => void;
  focusedStore?: string | null;
  onFocusStore?: (storeId: string | null) => void;
}

function getCellStyle(
  value: number,
  values: number[],
  higherIsBetter: boolean | null
): string {
  if (higherIsBetter === null) return '';
  const min = Math.min(...values);
  const max = Math.max(...values);
  if (max === min) return '';

  const ratio = (value - min) / (max - min);
  // ratio=1 → best, ratio=0 → worst
  const goodRatio = higherIsBetter ? ratio : 1 - ratio;

  if (goodRatio >= 0.85) return 'bg-emerald-50 text-emerald-800 font-semibold';
  if (goodRatio >= 0.6) return 'bg-emerald-50/50 text-emerald-700';
  if (goodRatio <= 0.15) return 'bg-red-50 text-red-700 font-semibold';
  if (goodRatio <= 0.4) return 'bg-red-50/50 text-red-600';
  return '';
}

export default function MetricTable({ weekStart, selectedMetric, onSelectMetric, focusedStore, onFocusStore }: Props) {
  const hasFocus = focusedStore != null;

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-muted/50 border-b border-border">
            <th className="sticky left-0 bg-muted/50 px-4 py-3 text-left font-medium text-muted-foreground min-w-[160px] z-10">
              Metric
            </th>
            {STORES.map((store) => {
              const isFocused = store.storeId === focusedStore;
              return (
                <th
                  key={store.storeId}
                  className={cn(
                    'px-4 py-3 text-right min-w-[110px] transition-opacity duration-200',
                    onFocusStore && 'cursor-pointer select-none',
                    hasFocus && !isFocused && 'opacity-30',
                  )}
                  style={{ color: STORE_COLORS[store.storeId] }}
                  onClick={() => onFocusStore?.(isFocused ? null : store.storeId)}
                >
                  <span className={cn(
                    'inline-flex items-center gap-1 font-semibold transition-all',
                    isFocused && 'underline underline-offset-2',
                  )}>
                    {store.storeName}
                    {onFocusStore && (
                      <span className="text-[10px] font-normal opacity-50 group-hover:opacity-100">
                        {isFocused ? '×' : '↗'}
                      </span>
                    )}
                  </span>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {METRICS.map((metric, rowIdx) => {
            const records = STORES.map((s) => getWeekRecord(s, weekStart));
            const values = STORES.map((s, i) => getMetricValue(records[i], metric.key));
            const isSelected = metric.key === selectedMetric;

            return (
              <tr
                key={metric.key}
                onClick={() => onSelectMetric(metric.key)}
                className={cn(
                  'cursor-pointer border-b border-border transition-colors hover:bg-accent/40',
                  rowIdx % 2 === 0 ? 'bg-background' : 'bg-muted/20',
                  isSelected && 'ring-2 ring-inset ring-primary/30 bg-primary/5'
                )}
              >
                <td className={cn(
                  'sticky left-0 px-4 py-2.5 font-medium z-10',
                  rowIdx % 2 === 0 ? 'bg-background' : 'bg-muted/20',
                  isSelected && 'bg-primary/5'
                )}>
                  <span className={cn(isSelected && 'text-primary font-semibold')}>
                    {metric.label}
                  </span>
                </td>
                {STORES.map((store, colIdx) => {
                  const val = values[colIdx];
                  const cellStyle = getCellStyle(val, values, metric.higherIsBetter);
                  const isFocused = store.storeId === focusedStore;
                  return (
                    <td
                      key={store.storeId}
                      className={cn(
                        'px-4 py-2.5 text-right tabular-nums rounded-sm transition-opacity duration-200',
                        cellStyle,
                        hasFocus && !isFocused && 'opacity-25',
                      )}
                    >
                      {formatValue(val, metric.format)}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
