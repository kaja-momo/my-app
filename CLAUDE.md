# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev -- -p 3001   # dev server (use port 3001 to avoid collision with sales-dashboard on 3000)
npm run build            # production build
npx tsc --noEmit         # type-check without emitting
npx shadcn@latest add <component>  # add a shadcn/ui component into src/components/ui/
```

No test runner is configured.

## Architecture

Single-page Next.js App Router app. All state lives in `src/app/page.tsx` (`'use client'`):
- `weekIdx` — index into `WEEKS[]` array, controls which week the table displays
- `selectedMetric` — `MetricKey`, controls which metric the trend chart plots

### Data layer (`src/lib/`)

**`types.ts`** — core interfaces: `WeeklyRecord` (one store, one week), `StoreData` (store + all weeks), `MetricKey` union, `MetricConfig`.

**`data.ts`** — single source of truth for everything:
- `STORES: StoreData[]` — 6 stores × 8 weeks of sample data (Jan 6 – Mar 1, 2026)
- `WEEKS: string[]` — sorted `weekStart` strings (`"YYYY-MM-DD"`)
- `METRICS: MetricConfig[]` — ordered list of all 10 metrics with label, format, and `higherIsBetter`
- `STORE_COLORS` — storeId → hex color map
- `getWeekRecord(store, weekStart)` — find a store's record for a given week
- `getMetricValue(record, key)` — read a metric value; `avgTicket` is derived here (`salesMXN / orders`), not stored in `WeeklyRecord`
- `formatValue(value, format)` — formats a number as `count`, `mxn` (MXN currency), or `rating`

`avgTicket` is intentionally absent from `WeeklyRecord` — always compute it via `getMetricValue`.

### Components

**`MetricTable`** — receives `weekStart`, `selectedMetric`, and `onSelectMetric`. Renders a table with metrics as rows and stores as columns. Per-row heatmap coloring uses min/max normalization across the 6 store values; green = best, red = worst (direction determined by `higherIsBetter`). Clicking a row calls `onSelectMetric`.

**`MetricChart`** — receives `selectedMetric`. Builds chart data by iterating `WEEKS`, looking up each store's value via `getMetricValue`. Renders a Recharts `LineChart` with one `<Line>` per store.

### Styling

Tailwind v4 — no `tailwind.config.ts`. Configuration is purely CSS-based in `src/app/globals.css` via `@import "tailwindcss"` and `@import "shadcn/tailwind.css"`. shadcn components go in `src/components/ui/`.

### Adding real data

Replace the raw `RawRow` arrays in `data.ts` with values parsed from Excel. The `makeWeeks()` helper maps positional arrays to `WeeklyRecord` objects — keep the column order: `[orders, salesMXN, cancelledOrders, chargebackOrders, chargebacksMXN, reviews, avgRating, adsSpend, promosSpend]`.
