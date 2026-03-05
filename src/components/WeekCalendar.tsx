'use client';

import { useState } from 'react';
import { WEEKS, getWeekLabel } from '@/lib/data';
import { cn } from '@/lib/utils';

// ── Date helpers ──────────────────────────────────────────────────────────────

function addDays(isoDate: string, n: number): string {
  const [y, m, d] = isoDate.split('-').map(Number);
  const dt = new Date(y, m - 1, d + n);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
}

// Pre-compute: ISO day string → weekStart (for all data weeks)
const DAY_TO_WEEK = new Map<string, string>();
WEEKS.forEach((ws) => {
  for (let i = 0; i < 7; i++) DAY_TO_WEEK.set(addDays(ws, i), ws);
});

// Flat array of ISO day strings (+ null pads) for a given month. Mon-first.
function buildMonth(year: number, month: number): (string | null)[] {
  const daysInMonth = new Date(year, month, 0).getDate(); // month is 1-based
  const firstDow = new Date(year, month - 1, 1).getDay(); // 0=Sun
  const padLeft = (firstDow + 6) % 7; // Mon=0 … Sun=6

  const cells: (string | null)[] = Array(padLeft).fill(null);
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(
      `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    );
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

// Derive which calendar months to show from the data range
const DATA_MONTHS: { year: number; month: number }[] = (() => {
  const seen = new Set<string>();
  WEEKS.forEach((ws) => {
    seen.add(ws.slice(0, 7));
    seen.add(addDays(ws, 6).slice(0, 7));
  });
  return [...seen].sort().map((ym) => {
    const [y, m] = ym.split('-').map(Number);
    return { year: y, month: m };
  });
})();

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const DAY_NAMES = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

// ── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  selectedWeekStart: string;
  onSelectWeek: (ws: string) => void;
}

// ── Month grid ────────────────────────────────────────────────────────────────

function MonthGrid({
  year,
  month,
  selectedWeekStart,
  hoveredWeek,
  onHoverDay,
  onClickDay,
}: {
  year: number;
  month: number;
  selectedWeekStart: string;
  hoveredWeek: string | null;
  onHoverDay: (ws: string | null) => void;
  onClickDay: (ws: string) => void;
}) {
  const cells = buildMonth(year, month);

  return (
    <div>
      {/* Month name */}
      <p className="mb-2 text-sm font-semibold text-foreground">
        {MONTH_NAMES[month - 1]} {year}
      </p>

      {/* Day-of-week headers */}
      <div className="grid grid-cols-7">
        {DAY_NAMES.map((d) => (
          <div
            key={d}
            className="flex h-7 w-8 items-center justify-center text-[11px] font-medium text-muted-foreground"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7">
        {cells.map((cell, idx) => {
          if (!cell) {
            return <div key={`pad-${year}-${month}-${idx}`} className="h-8 w-8" />;
          }

          const cellWeek = DAY_TO_WEEK.get(cell) ?? null;
          const isInData = cellWeek !== null;
          const isSelected = cellWeek === selectedWeekStart;
          const isHovered = cellWeek !== null && cellWeek === hoveredWeek;

          // Band edges — only look within the same calendar row (never cross row boundary)
          const ci = idx % 7;
          const prevCell = ci > 0 ? cells[idx - 1] : null;
          const nextCell = ci < 6 ? cells[idx + 1] : null;
          const prevWeek = prevCell ? (DAY_TO_WEEK.get(prevCell) ?? null) : null;
          const nextWeek = nextCell ? (DAY_TO_WEEK.get(nextCell) ?? null) : null;
          const isFirstInBand = prevWeek !== cellWeek;
          const isLastInBand = nextWeek !== cellWeek;

          // Band visibility and color
          const showBand = isInData && (isSelected || isHovered);
          const bandColor =
            isHovered && !isSelected
              ? 'bg-muted/70'                                      // hover preview
              : isSelected && hoveredWeek && !isHovered
              ? 'bg-primary/10'                                    // selected but hovering elsewhere
              : 'bg-primary/20';                                   // selected (no hover / hovering self)

          const dayNum = parseInt(cell.slice(-2));

          return (
            <div
              key={cell}
              className={cn(
                'flex h-8 w-8 items-center justify-center transition-colors',
                isInData && 'cursor-pointer',
                showBand && bandColor,
                showBand && isFirstInBand && 'rounded-l-full',
                showBand && isLastInBand && 'rounded-r-full',
              )}
              onClick={() => cellWeek && onClickDay(cellWeek)}
              onMouseEnter={() => onHoverDay(cellWeek)}
              onMouseLeave={() => onHoverDay(null)}
            >
              <span
                className={cn(
                  'flex h-7 w-7 items-center justify-center rounded-full text-[12px] transition-colors',
                  !isInData && 'text-muted-foreground/30',
                  isInData && !isSelected && 'text-foreground/80',
                  isSelected && 'font-semibold text-primary',
                )}
              >
                {dayNum}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────

export default function WeekCalendar({ selectedWeekStart, onSelectWeek }: Props) {
  const [hoveredWeek, setHoveredWeek] = useState<string | null>(null);

  const displayWeek = hoveredWeek ?? selectedWeekStart;
  const displayLabel = getWeekLabel(displayWeek);

  return (
    <div className="w-max rounded-xl border border-border bg-card px-5 py-4 shadow-sm">
      <div className="flex items-start gap-6">
        {DATA_MONTHS.map(({ year, month }) => (
          <div key={`${year}-${month}`} className="shrink-0">
            <MonthGrid
              year={year}
              month={month}
              selectedWeekStart={selectedWeekStart}
              hoveredWeek={hoveredWeek}
              onHoverDay={setHoveredWeek}
              onClickDay={onSelectWeek}
            />
          </div>
        ))}
      </div>

      {/* Selected / hovered week label below months */}
      <div className="mt-3 border-t border-border pt-2.5">
        <p className="text-[11px] text-muted-foreground">
          {hoveredWeek ? 'Preview: ' : 'Selected: '}
          <span className="font-semibold text-foreground">{displayLabel}</span>
          <span className="ml-2 text-muted-foreground/60">
            week {WEEKS.indexOf(displayWeek) + 1} of {WEEKS.length}
          </span>
        </p>
      </div>
    </div>
  );
}
