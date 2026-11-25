import React, { useMemo, useState } from 'react';
import {
  Check,
  Edit3,
  Pin,
  Plus,
  Search,
  Star,
  Trash2,
} from 'lucide-react';
import {
  CalendarEvent,
  DialTheme,
  EventCategory,
  HolidayItem,
} from '../types/calendar';
import {
  MONTH_ABBR,
  MONTH_NAMES,
  parseDateKey,
  WEEKDAY_NAMES,
} from '../utils/holidays';

interface AgendaPanelProps {
  year: number;
  month: number;
  selectedDateKey: string;
  todayDateKey: string;
  eventsByDate: Record<string, CalendarEvent[]>;
  holidays: HolidayItem[];
  theme: DialTheme;
  onSelectDate: (dateKey: string) => void;
  onOpenNewEvent: (dateKey: string) => void;
  onEditEvent: (event: CalendarEvent) => void;
  onDeleteEvent: (id: string) => void;
  onToggleComplete: (id: string) => void;
  onTogglePin: (id: string) => void;
}

const CATEGORY_LABELS: Record<EventCategory, string> = {
  work: 'Work',
  shop: 'Shop & Build',
  personal: 'Personal',
  milestone: 'Milestone',
};

export const AgendaPanel: React.FC<AgendaPanelProps> = ({
  year,
  month,
  selectedDateKey,
  todayDateKey,
  eventsByDate,
  holidays,
  theme,
  onSelectDate,
  onOpenNewEvent,
  onEditEvent,
  onDeleteEvent,
  onToggleComplete,
  onTogglePin,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const selectedParsed = parseDateKey(selectedDateKey);
  const selectedWeekday = new Date(
    selectedParsed.year,
    selectedParsed.month,
    selectedParsed.day
  ).getDay();

  const selectedDayHolidays = useMemo(
    () => holidays.filter((h) => h.dateKey === selectedDateKey),
    [holidays, selectedDateKey]
  );

  const selectedDayEvents = useMemo(() => {
    const list = eventsByDate[selectedDateKey] || [];
    return [...list].sort((a, b) => (a.time || '99:99').localeCompare(b.time || '99:99'));
  }, [eventsByDate, selectedDateKey]);

  const monthPrefix = `${year}-${String(month + 1).padStart(2, '0')}-`;

  const monthEvents = useMemo(() => {
    const all: CalendarEvent[] = [];
    Object.keys(eventsByDate)
      .filter((k) => k.startsWith(monthPrefix))
      .sort()
      .forEach((k) => {
        all.push(...eventsByDate[k]);
      });

    if (!searchQuery.trim()) return all;
    const q = searchQuery.toLowerCase();
    return all.filter(
      (ev) =>
        ev.title.toLowerCase().includes(q) ||
        (ev.notes && ev.notes.toLowerCase().includes(q)) ||
        CATEGORY_LABELS[ev.category].toLowerCase().includes(q)
    );
  }, [eventsByDate, monthPrefix, searchQuery]);

  const filteredHolidays = useMemo(() => {
    if (!searchQuery.trim()) return holidays;
    const q = searchQuery.toLowerCase();
    return holidays.filter((h) => h.title.toLowerCase().includes(q));
  }, [holidays, searchQuery]);

  return (
    <aside
      className="no-print w-full lg:w-[400px] xl:w-[420px] shrink-0 rounded-lg border flex flex-col"
      style={{
        backgroundColor: theme.panelBg,
        borderColor: theme.inkSubtle,
        color: theme.ink,
      }}
    >
      {/* Selected Date Header */}
      <div
        className="p-5 border-b"
        style={{ borderColor: theme.inkSubtle }}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p
              className="text-xs font-medium tracking-wide"
              style={{ color: theme.inkMuted }}
            >
              {WEEKDAY_NAMES[selectedWeekday]}
              {selectedDateKey === todayDateKey ? ' · Today' : ''}
            </p>
            <h2 className="font-dial text-2xl font-bold mt-0.5">
              {MONTH_NAMES[selectedParsed.month]} {selectedParsed.day},{' '}
              {selectedParsed.year}
            </h2>
          </div>

          <button
            type="button"
            onClick={() => onOpenNewEvent(selectedDateKey)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md text-xs font-semibold transition-opacity hover:opacity-90 whitespace-nowrap shrink-0 cursor-pointer"
            style={{
              backgroundColor: theme.cellSelectedBg,
              color: theme.cellSelectedText,
            }}
          >
            <Plus className="w-3.5 h-3.5" />
            Add Event
          </button>
        </div>

        {/* Holidays on selected date */}
        {selectedDayHolidays.length > 0 && (
          <div className="mt-3 space-y-1">
            {selectedDayHolidays.map((h) => (
              <div
                key={h.title}
                className="flex items-center gap-2 text-xs font-medium"
                style={{ color: theme.inkMuted }}
              >
                <Star className="w-3.5 h-3.5 shrink-0 fill-current" />
                <span>{h.title}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Selected Day Events */}
      <div
        className="p-5 border-b"
        style={{ borderColor: theme.inkSubtle }}
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold">Day Schedule</h3>
          <span
            className="font-mono-tabular text-xs"
            style={{ color: theme.inkMuted }}
          >
            {selectedDayEvents.length}{' '}
            {selectedDayEvents.length === 1 ? 'item' : 'items'}
          </span>
        </div>

        {selectedDayEvents.length === 0 ? (
          <div
            className="rounded-md border border-dashed p-4 text-center"
            style={{ borderColor: theme.inkSubtle }}
          >
            <p className="text-xs" style={{ color: theme.inkMuted }}>
              Nothing scheduled for {MONTH_ABBR[selectedParsed.month]}{' '}
              {selectedParsed.day}.
            </p>
            <button
              type="button"
              onClick={() => onOpenNewEvent(selectedDateKey)}
              className="mt-2.5 text-xs font-semibold underline underline-offset-4 hover:opacity-80 cursor-pointer"
              style={{ color: theme.ink }}
            >
              Schedule an event or pin a callout
            </button>
          </div>
        ) : (
          <ul className="space-y-2.5">
            {selectedDayEvents.map((ev) => (
              <li
                key={ev.id}
                className="rounded-md border p-3 transition-colors"
                style={{ borderColor: theme.inkSubtle }}
              >
                <div className="flex items-start gap-2.5">
                  <button
                    type="button"
                    onClick={() => onToggleComplete(ev.id)}
                    aria-label={
                      ev.completed ? 'Mark incomplete' : 'Mark complete'
                    }
                    className="mt-0.5 w-4 h-4 rounded border flex items-center justify-center shrink-0 cursor-pointer"
                    style={{
                      borderColor: theme.ink,
                      backgroundColor: ev.completed
                        ? theme.cellSelectedBg
                        : 'transparent',
                      color: theme.cellSelectedText,
                    }}
                  >
                    {ev.completed && <Check className="w-3 h-3" />}
                  </button>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p
                        className={`text-sm font-semibold leading-snug ${
                          ev.completed ? 'line-through opacity-55' : ''
                        }`}
                      >
                        {ev.title}
                      </p>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => onTogglePin(ev.id)}
                          title={
                            ev.pinnedToCorner
                              ? 'Unpin from dial corner'
                              : 'Pin as corner callout on dial'
                          }
                          aria-label="Pin to dial corner"
                          className="p-1 rounded hover:opacity-75 cursor-pointer"
                          style={{
                            color: ev.pinnedToCorner
                              ? theme.ink
                              : theme.inkMuted,
                            opacity: ev.pinnedToCorner ? 1 : 0.45,
                          }}
                        >
                          <Pin className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onEditEvent(ev)}
                          aria-label="Edit event"
                          className="p-1 rounded hover:opacity-75 cursor-pointer"
                          style={{ color: theme.inkMuted }}
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteEvent(ev.id)}
                          aria-label="Delete event"
                          className="p-1 rounded hover:opacity-75 cursor-pointer"
                          style={{ color: theme.inkMuted }}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div
                      className="mt-1 flex items-center gap-2 text-xs"
                      style={{ color: theme.inkMuted }}
                    >
                      <span className="font-mono-tabular">
                        {ev.time
                          ? ev.endTime
                            ? `${ev.time}–${ev.endTime}`
                            : ev.time
                          : 'All day'}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{CATEGORY_LABELS[ev.category]}</span>
                      {ev.pinnedToCorner && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span>Pinned on dial</span>
                        </>
                      )}
                    </div>

                    {ev.notes && (
                      <p
                        className="mt-1.5 text-xs leading-relaxed"
                        style={{ color: theme.inkMuted }}
                      >
                        {ev.notes}
                      </p>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Month Overview & Search */}
      <div className="p-5 flex-1 flex flex-col min-h-0">
        <div className="flex items-center justify-between gap-2 mb-3">
          <h3 className="text-sm font-semibold">
            {MONTH_NAMES[month]} Overview
          </h3>
          <span
            className="font-mono-tabular text-xs"
            style={{ color: theme.inkMuted }}
          >
            {filteredHolidays.length + monthEvents.length} total
          </span>
        </div>

        <div className="relative mb-3">
          <Search
            className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: theme.inkMuted }}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search ${MONTH_NAMES[month]} holidays & events...`}
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-md border bg-transparent outline-none focus:ring-1"
            style={{
              borderColor: theme.inkSubtle,
              color: theme.ink,
            }}
          />
        </div>

        <div className="space-y-1.5 overflow-y-auto max-h-[260px] pr-1">
          {filteredHolidays.map((h) => (
            <button
              key={`ov-h-${h.dateKey}-${h.title}`}
              type="button"
              onClick={() => onSelectDate(h.dateKey)}
              className="w-full text-left px-2.5 py-2 rounded-md border flex items-center justify-between gap-3 text-xs transition-colors cursor-pointer"
              style={{
                borderColor:
                  h.dateKey === selectedDateKey
                    ? theme.ink
                    : 'transparent',
                backgroundColor:
                  h.dateKey === selectedDateKey
                    ? theme.cellHover
                    : 'transparent',
              }}
            >
              <span className="truncate font-medium">★ {h.title}</span>
              <span
                className="font-mono-tabular shrink-0"
                style={{ color: theme.inkMuted }}
              >
                {h.shortDateLabel}
              </span>
            </button>
          ))}

          {monthEvents.map((ev) => {
            const parsed = parseDateKey(ev.dateKey);
            return (
              <button
                key={`ov-e-${ev.id}`}
                type="button"
                onClick={() => onSelectDate(ev.dateKey)}
                className="w-full text-left px-2.5 py-2 rounded-md border flex items-center justify-between gap-3 text-xs transition-colors cursor-pointer"
                style={{
                  borderColor:
                    ev.dateKey === selectedDateKey
                      ? theme.ink
                      : 'transparent',
                  backgroundColor:
                    ev.dateKey === selectedDateKey
                      ? theme.cellHover
                      : 'transparent',
                }}
              >
                <span
                  className={`truncate font-medium ${
                    ev.completed ? 'line-through opacity-60' : ''
                  }`}
                >
                  {ev.pinnedToCorner ? '★ ' : ''}
                  {ev.title}
                </span>
                <span
                  className="font-mono-tabular shrink-0"
                  style={{ color: theme.inkMuted }}
                >
                  {MONTH_ABBR[parsed.month]} {parsed.day}
                </span>
              </button>
            );
          })}

          {filteredHolidays.length === 0 && monthEvents.length === 0 && (
            <p className="text-xs py-4 text-center" style={{ color: theme.inkMuted }}>
              No holidays or events match your filter.
            </p>
          )}
        </div>
      </div>
    </aside>
  );
};
