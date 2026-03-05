'use client';

import { STORES, METRICS, STORE_COLORS, getMetricValue, formatValue } from '@/lib/data';
import type { MetricKey } from '@/lib/types';
import { cn } from '@/lib/utils';

interface Props {
  storeId: string;
  selectedMetric: MetricKey;
  onSelectMetric: (key: MetricKey) => void;
  onClose: () => void;
}

function getWeekCellClass(
  value: number,
  rowValues: number[],
  higherIsBetter: boolean | null
): string {
  if (higherIsBetter === null) return '';
  const min = Math.min(...rowValues);
  const max = Math.max(...rowValues);
  if (max === min) return '';
  const ratio = (value - min) / (max - min);
  const goodRatio = higherIsBetter ? ratio : 1 - ratio;
  if (goodRatio >= 0.85) return 'bg-emerald-50 text-emerald-800 font-semibold';
  if (goodRatio >= 0.6) return 'bg-emerald-50/40 text-emerald-700';
  if (goodRatio <= 0.15) return 'bg-red-50 text-red-700 font-semibold';
  if (goodRatio <= 0.4) return 'bg-red-50/40 text-red-600';
  return '';
}

export default function StoreDetail({ storeId, selectedMetric, onSelectMetric, onClose }: Props) {
  const store = STORES.find((s) => s.storeId === storeId)!;
  const color = STORE_COLORS[storeId];
  const weeks = store.weeks;

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className="inline-block h-3 w-3 rounded-full"
            style={{ background: color, boxShadow: `0 0 0 2px white, 0 0 0 3px ${color}` }}
          />
          <h2 className="text-base font-semibold text-foreground">
            {store.storeName}
            <span className="ml-2 font-normal text-muted-foreground text-sm">
              — all metrics by week
            </span>
          </h2>
        </div>
        <button
          onClick={onClose}
          className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          ← All stores
        </button>
      </div>

      {/* Table: rows = metrics, cols = weeks */}
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="sticky left-0 z-10 min-w-[160px] bg-muted/50 px-4 py-3 text-left font-medium text-muted-foreground">
                Metric
              </th>
              {weeks.map((w) => (
                <th
                  key={w.weekStart}
                  className="min-w-[100px] whitespace-nowrap px-3 py-3 text-right text-xs font-medium text-muted-foreground"
                >
                  {w.weekLabel.split(' – ')[0]}
                </th>
              ))}
              <th className="px-3 py-3 text-right text-xs font-medium text-muted-foreground">
                8-wk trend
              </th>
            </tr>
          </thead>
          <tbody>
            {METRICS.map((metric, rowIdx) => {
              const values = weeks.map((w) => getMetricValue(w, metric.key));
              const first = values[0];
              const last = values[values.length - 1];
              const diff = last - first;
              const pct = first !== 0 ? (diff / first) * 100 : 0;
              const isUp = diff > 0.005;
              const isDown = diff < -0.005;
              const trendGood =
                metric.higherIsBetter === null
                  ? null
                  : metric.higherIsBetter
                  ? isUp
                  : isDown;
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
                  <td
                    className={cn(
                      'sticky left-0 z-10 px-4 py-2.5 font-medium',
                      rowIdx % 2 === 0 ? 'bg-background' : 'bg-muted/20',
                      isSelected && 'bg-primary/5'
                    )}
                  >
                    <span className={cn(isSelected && 'text-primary font-semibold')}>
                      {metric.label}
                    </span>
                  </td>

                  {values.map((val, wi) => (
                    <td
                      key={weeks[wi].weekStart}
                      className={cn(
                        'px-3 py-2.5 text-right tabular-nums text-xs',
                        getWeekCellClass(val, values, metric.higherIsBetter)
                      )}
                    >
                      {formatValue(val, metric.format)}
                    </td>
                  ))}

                  {/* Trend */}
                  <td className="px-3 py-2.5 text-right">
                    <span
                      className={cn(
                        'inline-flex items-center gap-0.5 text-xs font-semibold tabular-nums',
                        trendGood === true && 'text-emerald-600',
                        trendGood === false && 'text-red-500',
                        trendGood === null && 'text-muted-foreground'
                      )}
                    >
                      {isUp ? '↑' : isDown ? '↓' : '→'}
                      {Math.abs(pct).toFixed(0)}%
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
