import type { StoreData, MetricConfig } from './types';

// 8 weeks: Jan 5 – Mar 1, 2026 — each weekStart is a Monday
const WEEK_DEFS = [
  { weekStart: '2026-01-05', weekLabel: 'Jan 5 – Jan 11' },
  { weekStart: '2026-01-12', weekLabel: 'Jan 12 – Jan 18' },
  { weekStart: '2026-01-19', weekLabel: 'Jan 19 – Jan 25' },
  { weekStart: '2026-01-26', weekLabel: 'Jan 26 – Feb 1' },
  { weekStart: '2026-02-02', weekLabel: 'Feb 2 – Feb 8' },
  { weekStart: '2026-02-09', weekLabel: 'Feb 9 – Feb 15' },
  { weekStart: '2026-02-16', weekLabel: 'Feb 16 – Feb 22' },
  { weekStart: '2026-02-23', weekLabel: 'Feb 23 – Mar 1' },
];

export const WEEKS = WEEK_DEFS.map((w) => w.weekStart);

// Raw weekly data per store (order matches WEEK_DEFS)
// Fields: [orders, salesMXN, cancelledOrders, chargebackOrders, chargebacksMXN, reviews, avgRating, adsSpend, promosSpend]
type RawRow = [number, number, number, number, number, number, number, number, number];

function makeWeeks(rows: RawRow[]): StoreData['weeks'] {
  return rows.map((r, i) => ({
    weekStart: WEEK_DEFS[i].weekStart,
    weekLabel: WEEK_DEFS[i].weekLabel,
    orders: r[0],
    salesMXN: r[1],
    cancelledOrders: r[2],
    chargebackOrders: r[3],
    chargebacksMXN: r[4],
    reviews: r[5],
    avgRating: r[6],
    adsSpend: r[7],
    promosSpend: r[8],
  }));
}

export const STORES: StoreData[] = [
  {
    storeId: 'narvarte',
    storeName: 'Narvarte',
    weeks: makeWeeks([
      [312, 118400, 18, 5, 1800, 52, 4.5, 9200, 14000],
      [289, 110200, 21, 4, 1400, 48, 4.4, 8800, 13500],
      [330, 124800, 15, 6, 2100, 58, 4.6, 10000, 15000],
      [298, 113100, 22, 3, 1100, 45, 4.3, 8500, 12800],
      [345, 131000, 14, 7, 2400, 62, 4.7, 11200, 16500],
      [310, 117600, 19, 5, 1700, 55, 4.5, 9500, 14200],
      [358, 136000, 12, 4, 1300, 65, 4.8, 12000, 17500],
      [372, 141200, 11, 3, 1050, 70, 4.8, 12800, 18200],
    ]),
  },
  {
    storeId: 'del-valle',
    storeName: 'Del Valle',
    weeks: makeWeeks([
      [245, 91500, 14, 3, 1050, 38, 4.3, 7200, 10800],
      [228, 85400, 16, 4, 1400, 34, 4.2, 6800, 10200],
      [261, 97500, 12, 2, 700, 42, 4.4, 7800, 11500],
      [235, 87900, 18, 5, 1750, 36, 4.1, 6500, 9800],
      [278, 103900, 11, 3, 1050, 46, 4.5, 8500, 12800],
      [252, 94200, 15, 4, 1400, 40, 4.3, 7500, 11200],
      [290, 108500, 9, 2, 700, 50, 4.6, 9200, 13800],
      [305, 114000, 8, 2, 700, 54, 4.6, 9800, 14500],
    ]),
  },
  {
    storeId: 'roma',
    storeName: 'Roma',
    weeks: makeWeeks([
      [420, 163800, 25, 9, 3150, 72, 4.2, 14500, 21000],
      [398, 155200, 28, 10, 3500, 68, 4.1, 13800, 20200],
      [445, 173600, 22, 8, 2800, 78, 4.3, 15500, 22500],
      [410, 159900, 30, 11, 3850, 65, 4.0, 13200, 19500],
      [462, 180200, 20, 7, 2450, 82, 4.4, 16800, 24000],
      [435, 169700, 24, 9, 3150, 76, 4.2, 15200, 22000],
      [478, 186400, 18, 6, 2100, 86, 4.5, 17500, 25500],
      [495, 193000, 16, 5, 1750, 90, 4.5, 18200, 26500],
    ]),
  },
  {
    storeId: 'reforma',
    storeName: 'Reforma',
    weeks: makeWeeks([
      [188, 75200, 12, 4, 1400, 30, 4.1, 6200, 9000],
      [172, 68800, 14, 5, 1750, 27, 4.0, 5800, 8500],
      [195, 78000, 10, 3, 1050, 33, 4.2, 6800, 9800],
      [178, 71200, 16, 6, 2100, 28, 3.9, 5500, 8000],
      [205, 82000, 9, 4, 1400, 36, 4.2, 7200, 10500],
      [192, 76800, 13, 5, 1750, 32, 4.1, 6500, 9500],
      [215, 86000, 8, 3, 1050, 38, 4.3, 7800, 11500],
      [225, 90000, 7, 2, 700, 42, 4.4, 8200, 12000],
    ]),
  },
  {
    storeId: 'jda',
    storeName: 'JDA',
    weeks: makeWeeks([
      [155, 58500, 20, 8, 2800, 22, 3.8, 5200, 7500],
      [142, 53700, 23, 9, 3150, 19, 3.7, 4800, 7000],
      [168, 63500, 17, 7, 2450, 25, 3.9, 5800, 8500],
      [148, 55900, 25, 10, 3500, 20, 3.7, 4500, 6800],
      [175, 66100, 16, 6, 2100, 28, 4.0, 6200, 9000],
      [160, 60500, 21, 8, 2800, 24, 3.9, 5500, 8000],
      [182, 68800, 14, 5, 1750, 30, 4.1, 6800, 10000],
      [195, 73700, 12, 4, 1400, 34, 4.2, 7200, 10500],
    ]),
  },
  {
    storeId: 'polanco',
    storeName: 'Polanco',
    weeks: makeWeeks([
      [380, 175600, 16, 6, 2100, 65, 4.7, 13500, 19500],
      [362, 167300, 18, 7, 2450, 60, 4.6, 12800, 18500],
      [398, 184100, 14, 5, 1750, 70, 4.8, 14500, 21000],
      [372, 171900, 20, 8, 2800, 62, 4.5, 12200, 17800],
      [415, 191900, 12, 4, 1400, 75, 4.9, 15800, 23000],
      [385, 178000, 17, 6, 2100, 68, 4.7, 13800, 20000],
      [428, 197900, 11, 3, 1050, 78, 4.9, 16500, 24000],
      [445, 205700, 9, 2, 700, 82, 4.9, 17200, 25000],
    ]),
  },
];

export const METRICS: MetricConfig[] = [
  { key: 'orders', label: 'Orders', format: 'count', higherIsBetter: true },
  { key: 'salesMXN', label: 'Sales (MXN)', format: 'mxn', higherIsBetter: true },
  { key: 'avgTicket', label: 'Avg Ticket', format: 'mxn', higherIsBetter: true },
  { key: 'cancelledOrders', label: 'Cancelled Orders', format: 'count', higherIsBetter: false },
  { key: 'chargebackOrders', label: 'Chargeback Orders', format: 'count', higherIsBetter: false },
  { key: 'chargebacksMXN', label: 'Chargebacks (MXN)', format: 'mxn', higherIsBetter: false },
  { key: 'reviews', label: 'Reviews', format: 'count', higherIsBetter: true },
  { key: 'avgRating', label: 'Avg Rating', format: 'rating', higherIsBetter: true },
  { key: 'adsSpend', label: 'Ads Spend', format: 'mxn', higherIsBetter: null },
  { key: 'promosSpend', label: 'Promos Spend', format: 'mxn', higherIsBetter: null },
];

export const STORE_COLORS: Record<string, string> = {
  narvarte: '#6366f1',
  'del-valle': '#f59e0b',
  roma: '#10b981',
  reforma: '#ef4444',
  jda: '#8b5cf6',
  polanco: '#06b6d4',
};

export function getWeekRecord(store: StoreData, weekStart: string) {
  return store.weeks.find((w) => w.weekStart === weekStart);
}

export function getMetricValue(record: StoreData['weeks'][number] | undefined, key: import('./types').MetricKey): number {
  if (!record) return 0;
  if (key === 'avgTicket') {
    return record.orders > 0 ? record.salesMXN / record.orders : 0;
  }
  return record[key as keyof typeof record] as number;
}

export function getWeekLabel(weekStart: string): string {
  return WEEK_DEFS.find((w) => w.weekStart === weekStart)?.weekLabel ?? weekStart;
}

export function formatValue(value: number, format: import('./types').FormatType): string {
  switch (format) {
    case 'mxn':
      return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN',
        maximumFractionDigits: 0,
      }).format(value);
    case 'rating':
      return value.toFixed(1) + ' ★';
    case 'count':
    default:
      return new Intl.NumberFormat('es-MX').format(value);
  }
}
