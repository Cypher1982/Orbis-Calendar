import React from 'react';
import { CalendarEvent, DialTheme, HolidayItem } from '../types/calendar';
import {
  formatDateKey,
  getDaysInMonth,
  getFirstWeekday,
  MONTH_NAMES,
  WEEKDAY_NAMES,
} from '../utils/holidays';

interface ClassicGridViewProps {
  year: number;
  month: number;
  selectedDateKey: string;
  todayDateKey: string;
  eventsByDate: Record<string, CalendarEvent[]>;
  holidays: HolidayItem[];
  theme: DialTheme;
  onSelectDate: (dateKey: string) => void;
}

export const ClassicGridView: React.FC<ClassicGridViewProps> = ({
  year,
  month,
  selectedDateKey,
  todayDateKey,
  eventsByDate,
  holidays,
  theme,
  onSelectDate,
}) => {
  const totalDays = getDaysInMonth(year, month);
  const firstWeekday = getFirstWeekday(year, month);
  const totalSlots = Math.ceil((firstWeekday + totalDays) / 7) * 7;

  const holidayMap = new Map<string, HolidayItem>();
  holidays.forEach((h) => holidayMap.set(h.dateKey, h));

  const cells: Array<{ day: number | null; dateKey: string | null }> = [];
  for (let i = 0; i < totalSlots; i++) {
    const day = i - firstWeekday + 1;
    if (day >= 1 && day <= totalDays) {
      cells.push({ day, dateKey: formatDateKey(year, month, day) });
    } else {
      cells.push({ day: null, dateKey: null });
    }
  }

  return (
    <div
      className="w-full max-w-[740px] mx-auto rounded-lg border p-5 sm:p-6"
      style={{
        backgroundColor: theme.dialBg,
        borderColor: theme.inkSubtle,
        color: theme.ink,
      }}
    >
      <div className="mb-4 text-center">
        <h2 className="font-dial text-2xl sm:text-3xl font-bold tracking-wider uppercase">
          {MONTH_NAMES[month]} {year}
        </h2>
      </div>

      <div
        className="grid grid-cols-7 border-b pb-2 mb-2 text-center"
        style={{ borderColor: theme.inkSubtle }}
      >
        {WEEKDAY_NAMES.map((wd) => (
          <div
            key={wd}
            className="font-dial text-xs sm:text-sm font-bold tracking-wide"
            style={{ color: theme.inkMuted }}
          >
            {wd.slice(0, 3)}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {cells.map((cell, idx) => {
          if (!cell.day || !cell.dateKey) {
            return <div key={`empty-${idx}`} className="min-h-[74px]" />;
          }

          const isSelected = cell.dateKey === selectedDateKey;
          const isToday = cell.dateKey === todayDateKey;
          const dayEvents = eventsByDate[cell.dateKey] || [];
          const holiday = holidayMap.get(cell.dateKey);

          return (
            <button
              key={cell.dateKey}
              type="button"
              onClick={() => onSelectDate(cell.dateKey!)}
              className="min-h-[74px] p-2 rounded-md border text-left flex flex-col justify-between transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2"
              style={{
                backgroundColor: isSelected ? theme.cellSelectedBg : 'transparent',
                color: isSelected ? theme.cellSelectedText : theme.ink,
                borderColor:
                  isToday && !isSelected
                    ? theme.todayStroke
                    : theme.inkSubtle,
                borderWidth: isToday && !isSelected ? '2px' : '1px',
              }}
            >
              <div className="flex items-center justify-between w-full">
                <span className="font-dial text-base font-bold tabular-nums">
                  {cell.day}
                </span>
                {holiday && (
                  <span className="text-[11px]" title={holiday.title}>
                    ★
                  </span>
                )}
              </div>

              <div className="space-y-0.5 w-full overflow-hidden">
                {holiday && (
                  <p className="text-[10px] leading-tight truncate opacity-85">
                    {holiday.title}
                  </p>
                )}
                {dayEvents.slice(0, 2).map((ev) => (
                  <p
                    key={ev.id}
                    className="text-[10px] leading-tight truncate font-medium opacity-90"
                  >
                    {ev.time ? `${ev.time} ` : ''}
                    {ev.title}
                  </p>
                ))}
                {dayEvents.length > 2 && (
                  <p className="text-[10px] opacity-75">
                    +{dayEvents.length - 2} more
                  </p>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
