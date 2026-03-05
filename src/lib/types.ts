export interface WeeklyRecord {
  weekLabel: string;   // "Feb 3 – Feb 9"
  weekStart: string;   // "2026-02-03" for sorting
  orders: number;
  salesMXN: number;
  cancelledOrders: number;
  chargebackOrders: number;
  chargebacksMXN: number;
  reviews: number;
  avgRating: number;
  adsSpend: number;
  promosSpend: number;
}

export interface StoreData {
  storeId: string;
  storeName: string;
  weeks: WeeklyRecord[];
}

export type MetricKey =
  | 'orders'
  | 'salesMXN'
  | 'avgTicket'
  | 'cancelledOrders'
  | 'chargebackOrders'
  | 'chargebacksMXN'
  | 'reviews'
  | 'avgRating'
  | 'adsSpend'
  | 'promosSpend';

export type FormatType = 'count' | 'mxn' | 'rating';

export interface MetricConfig {
  key: MetricKey;
  label: string;
  format: FormatType;
  higherIsBetter: boolean | null;
}
