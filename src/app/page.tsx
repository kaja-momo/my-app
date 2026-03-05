'use client';

import { useState } from 'react';
import {
  STORES,
  WEEKS,
  METRICS,
  STORE_COLORS,
  getWeekRecord,
  getMetricValue,
  getWeekLabel,
} from '@/lib/data';
import type { MetricKey } from '@/lib/types';
import MetricTable from '@/components/MetricTable';
import MetricChart from '@/components/MetricChart';
import StoreDetail from '@/components/StoreDetail';
import WeekCalendar from '@/components/WeekCalendar';
import SedeMap from '@/components/SedeMap';

const fmtMXN = (v: number) =>
  new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    maximumFractionDigits: 0,
  }).format(v);

// ── KPI Card ─────────────────────────────────────────────────────────────────
function KpiCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl border border-border bg-card px-5 py-4 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-bold tabular-nums text-foreground">{value}</p>
      {sub && <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}

// ── Week picker with hover-revealed calendar dropdown ─────────────────────────
function WeekPicker({
  weekStart,
  onSelectWeek,
}: {
  weekStart: string;
  onSelectWeek: (ws: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const idx = WEEKS.indexOf(weekStart);
  const label = getWeekLabel(weekStart);

  return (
    // Single wrapper — hovering anywhere inside (trigger OR dropdown) keeps it open
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      {/* ← label → trigger */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => onSelectWeek(WEEKS[Math.max(0, idx - 1)])}
          disabled={idx === 0}
          className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-background text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30"
          aria-label="Previous week"
        >
          ←
        </button>
        <span className="min-w-[160px] cursor-default select-none text-center text-sm font-medium text-foreground">
          {label}
        </span>
        <button
          onClick={() => onSelectWeek(WEEKS[Math.min(WEEKS.length - 1, idx + 1)])}
          disabled={idx === WEEKS.length - 1}
          className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-background text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30"
          aria-label="Next week"
        >
          →
        </button>
      </div>

      {/* Calendar dropdown — rendered directly below trigger, same hover zone */}
      {open && (
        <div className="absolute left-1/2 top-full z-50 mt-2 -translate-x-1/2 drop-shadow-xl">
          <WeekCalendar
            selectedWeekStart={weekStart}
            onSelectWeek={(ws) => {
              onSelectWeek(ws);
              setOpen(false);
            }}
          />
        </div>
      )}
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function Home() {
  const [weekStart, setWeekStart] = useState(WEEKS[WEEKS.length - 1]);
  const [selectedMetric, setSelectedMetric] = useState<MetricKey>('orders');
  const [focusedStore, setFocusedStore] = useState<string | null>(null);

  const weekLabel = getWeekLabel(weekStart);

  const weekRecords = STORES.map((s) => getWeekRecord(s, weekStart));
  const totalOrders = weekRecords.reduce((acc, r) => acc + getMetricValue(r, 'orders'), 0);
  const totalSales = weekRecords.reduce((acc, r) => acc + getMetricValue(r, 'salesMXN'), 0);
  const avgRating =
    weekRecords.reduce((acc, r) => acc + getMetricValue(r, 'avgRating'), 0) / STORES.length;
  const totalAdSpend = weekRecords.reduce(
    (acc, r) => acc + getMetricValue(r, 'adsSpend') + getMetricValue(r, 'promosSpend'),
    0
  );

  const selectedMetricConfig = METRICS.find((m) => m.key === selectedMetric)!;

  return (
    <div className="min-h-screen bg-background">
      {/* ── Header ── */}
      <header className="sticky top-0 z-20 border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-[1400px] flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              Delivery Metrics Dashboard
            </h1>
            <p className="mt-0.5 text-xs text-muted-foreground">6 stores · weekly performance</p>
          </div>

          {/* Week picker — hover to open calendar */}
          <WeekPicker weekStart={weekStart} onSelectWeek={setWeekStart} />

          <div />
        </div>
      </header>

      <main className="mx-auto max-w-[1400px] space-y-6 px-6 py-6">
        {/* ── KPI Bar ── */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <KpiCard
            label="Total Orders"
            value={new Intl.NumberFormat('es-MX').format(totalOrders)}
            sub="across all stores"
          />
          <KpiCard
            label="Total Sales"
            value={fmtMXN(totalSales)}
            sub="combined revenue"
          />
          <KpiCard
            label="Avg Rating"
            value={avgRating.toFixed(2) + ' ★'}
            sub="all stores average"
          />
          <KpiCard
            label="Ad + Promo Spend"
            value={fmtMXN(totalAdSpend)}
            sub="ads + promos combined"
          />
        </div>

        {/* ── Store color legend ── */}
        <div className="flex flex-wrap gap-4">
          {STORES.map((store) => (
            <div key={store.storeId} className="flex items-center gap-1.5">
              <span
                className="inline-block h-3 w-3 rounded-full"
                style={{ background: STORE_COLORS[store.storeId] }}
              />
              <span className="text-xs text-muted-foreground">{store.storeName}</span>
            </div>
          ))}
        </div>

        {/* ── Summary Table / Store Detail ── */}
        <section>
          {focusedStore ? (
            <StoreDetail
              storeId={focusedStore}
              selectedMetric={selectedMetric}
              onSelectMetric={setSelectedMetric}
              onClose={() => setFocusedStore(null)}
            />
          ) : (
            <>
              <div className="mb-3 flex items-baseline gap-2">
                <h2 className="text-base font-semibold text-foreground">Weekly Summary</h2>
                <span className="text-xs text-muted-foreground">
                  {weekLabel} · click a row to update chart · click a store name to drill in
                </span>
              </div>
              <MetricTable
                weekStart={weekStart}
                selectedMetric={selectedMetric}
                onSelectMetric={setSelectedMetric}
                focusedStore={focusedStore}
                onFocusStore={setFocusedStore}
              />
            </>
          )}
        </section>

        {/* ── Trend Chart ── */}
        <section>
          <div className="mb-3 flex items-baseline gap-2">
            <h2 className="text-base font-semibold text-foreground">
              {selectedMetricConfig.label} — Trend (all weeks)
            </h2>
            <span className="text-xs text-muted-foreground">Jan 5 – Mar 1, 2026</span>
          </div>
          <div className="rounded-xl border border-border bg-card px-4 py-4 shadow-sm">
            <MetricChart selectedMetric={selectedMetric} focusedStoreId={focusedStore} />
          </div>
        </section>

        {/* ── Sede Café Locations Map ── */}
        <section>
          <SedeMap />
        </section>
      </main>
    </div>
  );
}
