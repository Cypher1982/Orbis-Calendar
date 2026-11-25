import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Image as ImageIcon,
  Palette,
  Plus,
  Printer,
} from 'lucide-react';
import { AgendaPanel } from './components/AgendaPanel';
import { ClassicGridView } from './components/ClassicGridView';
import { CustomizeDrawer } from './components/CustomizeDrawer';
import { EventModal } from './components/EventModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { PWAInstallButton } from './components/PWAInstallButton';
import { RadialCalendarDial } from './components/RadialCalendarDial';
import {
  CalendarEvent,
  CalendarGraphicConfig,
  CustomThemeColors,
  DialLayoutMode,
  DialThemeId,
} from './types/calendar';
import {
  applyArtworkPaletteToTheme,
  resolveMonthGraphic,
} from './utils/graphicsCatalog';
import {
  loadCustomImagesFromDb,
  saveCustomImagesToDb,
} from './utils/customImageStore';
import {
  buildCustomTheme,
  DIAL_THEMES,
  formatDateKey,
  getHolidaysForMonth,
  MONTH_NAMES,
  parseDateKey,
} from './utils/holidays';

const STORAGE_KEY_EVENTS = 'orbis_calendar_events_v1';
const STORAGE_KEY_THEME = 'orbis_calendar_theme_v1';
const STORAGE_KEY_CUSTOM_COLORS = 'orbis_calendar_custom_colors_v1';
const STORAGE_KEY_LAYOUT = 'orbis_calendar_layout_v1';
const STORAGE_KEY_GRAPHICS = 'orbis_calendar_graphics_v1';

function getTodayDateKey(): string {
  const now = new Date();
  return formatDateKey(now.getFullYear(), now.getMonth(), now.getDate());
}

const DEFAULT_CUSTOM_COLORS: CustomThemeColors = {
  ink: '#0D229E',
  dialBg: '#FFFFFF',
  accent: '#0D229E',
  todayStroke: '#C2410C',
};

const DEFAULT_GRAPHIC_CONFIG: CalendarGraphicConfig = {
  category: 'none',
  placement: 'full',
  watermarkOpacity: 0.22,
  backdropVeil: 0.44,
  autoAdaptInk: true,
  customImagesByMonth: {},
};

export default function App() {
  const todayDateKey = useMemo(() => getTodayDateKey(), []);

  // Default to January 2027 to match the user's reference dial immediately
  const [year, setYear] = useState<number>(2027);
  const [month, setMonth] = useState<number>(0);
  const [selectedDateKey, setSelectedDateKey] = useState<string>('2027-01-01');

  const [layoutMode, setLayoutMode] = useState<DialLayoutMode>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_LAYOUT);
    if (saved === 'concentric' || saved === 'continuous' || saved === 'grid') {
      return saved;
    }
    return 'concentric';
  });

  const [themeId, setThemeId] = useState<DialThemeId>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_THEME) as DialThemeId | null;
    if (
      saved &&
      (saved === 'custom' || Object.prototype.hasOwnProperty.call(DIAL_THEMES, saved))
    ) {
      return saved;
    }
    return 'cobalt';
  });

  const [customColors, setCustomColors] = useState<CustomThemeColors>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_CUSTOM_COLORS);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.ink && parsed.dialBg && parsed.accent) {
          return parsed;
        }
      }
    } catch {
      // ignore storage errors
    }
    return DEFAULT_CUSTOM_COLORS;
  });

  const [graphicConfig, setGraphicConfig] = useState<CalendarGraphicConfig>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_GRAPHICS);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.category && parsed.placement) {
          return {
            ...DEFAULT_GRAPHIC_CONFIG,
            ...parsed,
            customImagesByMonth: parsed.customImagesByMonth || {},
          };
        }
      }
    } catch {
      // ignore storage errors
    }
    return DEFAULT_GRAPHIC_CONFIG;
  });

  const [events, setEvents] = useState<CalendarEvent[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_EVENTS);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore storage errors
    }
    return [];
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [modalDateKey, setModalDateKey] = useState<string>('2027-01-01');
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);

  const [customizeOpen, setCustomizeOpen] = useState(false);
  const [customizeTab, setCustomizeTab] = useState<'colors' | 'graphics'>('colors');

  const dialSvgRef = useRef<SVGSVGElement | null>(null);

  const theme = useMemo(() => {
    if (themeId === 'custom') {
      return buildCustomTheme(customColors);
    }
    return DIAL_THEMES[themeId];
  }, [themeId, customColors]);

  const activeMonthGraphic = useMemo(
    () => resolveMonthGraphic(graphicConfig, month),
    [graphicConfig, month]
  );

  const dialTheme = useMemo(() => {
    if (
      activeMonthGraphic &&
      graphicConfig.placement === 'full' &&
      graphicConfig.autoAdaptInk
    ) {
      return applyArtworkPaletteToTheme(theme, activeMonthGraphic.dialPalette);
    }
    return theme;
  }, [theme, activeMonthGraphic, graphicConfig.placement, graphicConfig.autoAdaptInk]);

  const hasHydratedMediaRef = useRef(false);

  useEffect(() => {
    let active = true;
    loadCustomImagesFromDb().then((storedImages) => {
      if (!active) return;
      hasHydratedMediaRef.current = true;
      if (Object.keys(storedImages).length > 0) {
        setGraphicConfig((prev) => ({
          ...prev,
          customImagesByMonth: {
            ...storedImages,
            ...prev.customImagesByMonth,
          },
        }));
      }
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_EVENTS, JSON.stringify(events));
    } catch {
      // ignore storage errors
    }
  }, [events]);

  useEffect(() => {
    if (hasHydratedMediaRef.current) {
      saveCustomImagesToDb(graphicConfig.customImagesByMonth);
    }
    try {
      localStorage.setItem(STORAGE_KEY_GRAPHICS, JSON.stringify(graphicConfig));
    } catch {
      // If 12 high-res custom photos exceed localStorage 5MB quota, keep settings in localStorage
      // while IndexedDB holds the full customImagesByMonth map.
      try {
        localStorage.setItem(
          STORAGE_KEY_GRAPHICS,
          JSON.stringify({ ...graphicConfig, customImagesByMonth: {} })
        );
      } catch {
        // ignore storage errors
      }
    }
  }, [graphicConfig]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_CUSTOM_COLORS, JSON.stringify(customColors));
  }, [customColors]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_THEME, themeId);
    if (theme.isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [themeId, theme.isDark]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_LAYOUT, layoutMode);
  }, [layoutMode]);

  const holidays = useMemo(
    () => getHolidaysForMonth(year, month),
    [year, month]
  );

  const eventsByDate = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {};
    for (const ev of events) {
      if (!map[ev.dateKey]) map[ev.dateKey] = [];
      map[ev.dateKey].push(ev);
    }
    return map;
  }, [events]);

  const handleSelectDate = (dateKey: string) => {
    setSelectedDateKey(dateKey);
    const parsed = parseDateKey(dateKey);
    if (parsed.year !== year || parsed.month !== month) {
      setYear(parsed.year);
      setMonth(parsed.month);
    }
  };

  const handlePrevMonth = () => {
    if (month === 0) {
      const nextY = year - 1;
      setYear(nextY);
      setMonth(11);
      setSelectedDateKey(formatDateKey(nextY, 11, 1));
    } else {
      const nextM = month - 1;
      setMonth(nextM);
      setSelectedDateKey(formatDateKey(year, nextM, 1));
    }
  };

  const handleNextMonth = () => {
    if (month === 11) {
      const nextY = year + 1;
      setYear(nextY);
      setMonth(0);
      setSelectedDateKey(formatDateKey(nextY, 0, 1));
    } else {
      const nextM = month + 1;
      setMonth(nextM);
      setSelectedDateKey(formatDateKey(year, nextM, 1));
    }
  };

  const handleJumpToday = () => {
    const parsed = parseDateKey(todayDateKey);
    setYear(parsed.year);
    setMonth(parsed.month);
    setSelectedDateKey(todayDateKey);
  };

  const handleJumpJan2027 = () => {
    setYear(2027);
    setMonth(0);
    setSelectedDateKey('2027-01-01');
  };

  const handleOpenNewEvent = (dateKey: string) => {
    setEditingEvent(null);
    setModalDateKey(dateKey);
    setModalOpen(true);
  };

  const handleEditEvent = (event: CalendarEvent) => {
    setEditingEvent(event);
    setModalDateKey(event.dateKey);
    setModalOpen(true);
  };

  const handleSaveEvent = (
    data: Omit<CalendarEvent, 'id'>,
    existingId?: string
  ) => {
    if (existingId) {
      setEvents((prev) =>
        prev.map((ev) => (ev.id === existingId ? { ...data, id: existingId } : ev))
      );
    } else {
      const newEvent: CalendarEvent = {
        ...data,
        id:
          typeof crypto !== 'undefined' && crypto.randomUUID
            ? crypto.randomUUID()
            : `ev-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      };
      setEvents((prev) => [...prev, newEvent]);
    }
    handleSelectDate(data.dateKey);
  };

  const handleDeleteEvent = (id: string) => {
    setEvents((prev) => prev.filter((ev) => ev.id !== id));
  };

  const handleToggleComplete = (id: string) => {
    setEvents((prev) =>
      prev.map((ev) =>
        ev.id === id ? { ...ev, completed: !ev.completed } : ev
      )
    );
  };

  const handleTogglePin = (id: string) => {
    setEvents((prev) =>
      prev.map((ev) =>
        ev.id === id ? { ...ev, pinnedToCorner: !ev.pinnedToCorner } : ev
      )
    );
  };

  const handleExportSvg = () => {
    if (!dialSvgRef.current) return;
    const serializer = new XMLSerializer();
    let svgString = serializer.serializeToString(dialSvgRef.current);
    if (!svgString.includes('xmlns="http://www.w3.org/2000/svg"')) {
      svgString = svgString.replace(
        '<svg',
        '<svg xmlns="http://www.w3.org/2000/svg"'
      );
    }
    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `orbis-calendar-${MONTH_NAMES[month].toLowerCase()}-${year}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const yearOptions = useMemo(() => {
    const arr: number[] = [];
    for (let y = 2020; y <= 2035; y++) arr.push(y);
    return arr;
  }, []);

  const openCustomize = (tab: 'colors' | 'graphics') => {
    setCustomizeTab(tab);
    setCustomizeOpen(true);
  };

  const showPosterAboveDial =
    Boolean(activeMonthGraphic) &&
    (graphicConfig.placement === 'poster' || layoutMode === 'grid');

  return (
    <div
      className="min-h-screen flex flex-col transition-colors duration-200"
      style={{ backgroundColor: theme.pageBg, color: theme.ink }}
    >
      {/* Top Bar (3-zone contract) */}
      <header
        className="no-print border-b px-4 sm:px-6 lg:px-8 py-3.5"
        style={{
          backgroundColor: theme.panelBg,
          borderColor: theme.inkSubtle,
        }}
      >
        <div className="max-w-[1400px] mx-auto flex items-center justify-between gap-8">
          {/* Zone 1: Brand wordmark */}
          <span className="font-dial text-xl font-bold tracking-tight whitespace-nowrap shrink-0">
            Orbis Calendar
          </span>

          {/* Zone 2: Concise single-line actions */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <button
              type="button"
              onClick={handleJumpToday}
              className="hover:underline underline-offset-4 whitespace-nowrap shrink-0 cursor-pointer"
              style={{ color: theme.inkMuted }}
            >
              Today
            </button>
            <button
              type="button"
              onClick={handleJumpJan2027}
              className="hover:underline underline-offset-4 whitespace-nowrap shrink-0 cursor-pointer"
              style={{ color: theme.inkMuted }}
            >
              Jan 2027
            </button>
            {layoutMode !== 'grid' && (
              <button
                type="button"
                onClick={handleExportSvg}
                className="inline-flex items-center gap-1.5 hover:underline underline-offset-4 whitespace-nowrap shrink-0 cursor-pointer"
                style={{ color: theme.inkMuted }}
              >
                <Download className="w-3.5 h-3.5" />
                Export SVG
              </button>
            )}
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 hover:underline underline-offset-4 whitespace-nowrap shrink-0 cursor-pointer"
              style={{ color: theme.inkMuted }}
            >
              <Printer className="w-3.5 h-3.5" />
              Print Dial
            </button>
          </nav>

          {/* Zone 3: Install App & Primary CTA */}
          <div className="shrink-0 flex items-center gap-2.5">
            <PWAInstallButton theme={theme} />
            <button
              type="button"
              onClick={() => handleOpenNewEvent(selectedDateKey)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-md transition-opacity hover:opacity-90 whitespace-nowrap shrink-0 cursor-pointer"
              style={{
                backgroundColor: theme.cellSelectedBg,
                color: theme.cellSelectedText,
              }}
            >
              <Plus className="w-3.5 h-3.5" />
              New Event
            </button>
          </div>
        </div>
      </header>

      {/* Main Split Workspace */}
      <main className="flex-1 max-w-[1400px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col lg:flex-row gap-6 items-start">
        {/* Left: Dial Canvas + Workspace Toolbar */}
        <section className="flex-1 w-full min-w-0 flex flex-col gap-4">
          {/* Workspace Toolbar */}
          <div
            className="no-print rounded-lg border px-4 py-3 flex flex-wrap items-center justify-between gap-3"
            style={{
              backgroundColor: theme.panelBg,
              borderColor: theme.inkSubtle,
            }}
          >
            {/* Month / Year Navigation */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handlePrevMonth}
                aria-label="Previous month"
                className="p-1.5 rounded-md border hover:opacity-75 cursor-pointer"
                style={{ borderColor: theme.inkSubtle }}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <select
                aria-label="Select month"
                value={month}
                onChange={(e) => {
                  const m = Number(e.target.value);
                  setMonth(m);
                  setSelectedDateKey(formatDateKey(year, m, 1));
                }}
                className="px-2.5 py-1.5 text-xs font-semibold rounded-md border outline-none cursor-pointer"
                style={{
                  borderColor: theme.inkSubtle,
                  backgroundColor: theme.panelBg,
                  color: theme.ink,
                }}
              >
                {MONTH_NAMES.map((name, idx) => (
                  <option key={name} value={idx}>
                    {name}
                  </option>
                ))}
              </select>

              <select
                aria-label="Select year"
                value={year}
                onChange={(e) => {
                  const y = Number(e.target.value);
                  setYear(y);
                  setSelectedDateKey(formatDateKey(y, month, 1));
                }}
                className="px-2.5 py-1.5 text-xs font-semibold font-mono-tabular rounded-md border outline-none cursor-pointer"
                style={{
                  borderColor: theme.inkSubtle,
                  backgroundColor: theme.panelBg,
                  color: theme.ink,
                }}
              >
                {yearOptions.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={handleNextMonth}
                aria-label="Next month"
                className="p-1.5 rounded-md border hover:opacity-75 cursor-pointer"
                style={{ borderColor: theme.inkSubtle }}
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={handleJumpToday}
                className="md:hidden ml-1 px-2.5 py-1.5 text-xs font-semibold rounded-md border whitespace-nowrap cursor-pointer"
                style={{ borderColor: theme.inkSubtle }}
              >
                Today
              </button>
            </div>

            {/* Layout Mode + Color & Graphics Studio Triggers */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Dial Layout Mode */}
              <div
                className="inline-flex items-center p-0.5 rounded-md border"
                style={{ borderColor: theme.inkSubtle }}
                role="group"
                aria-label="Calendar layout mode"
              >
                {(
                  [
                    { id: 'concentric', label: 'Spiral Rings' },
                    { id: 'continuous', label: '2-Ring Spiral' },
                    { id: 'grid', label: 'Grid' },
                  ] as const
                ).map((opt) => {
                  const active = layoutMode === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setLayoutMode(opt.id)}
                      className="px-2.5 py-1 text-xs font-semibold rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                      style={{
                        backgroundColor: active
                          ? theme.cellSelectedBg
                          : 'transparent',
                        color: active ? theme.cellSelectedText : theme.inkMuted,
                      }}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>

              {/* Color Scheme Studio Button */}
              <button
                type="button"
                onClick={() => openCustomize('colors')}
                className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-md border transition-colors hover:opacity-85 whitespace-nowrap shrink-0 cursor-pointer"
                style={{ borderColor: theme.inkSubtle }}
              >
                <Palette className="w-3.5 h-3.5" />
                <span>{theme.label}</span>
              </button>

              {/* Graphics & Camera Roll Studio Button */}
              <button
                type="button"
                onClick={() => openCustomize('graphics')}
                className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-md border transition-colors hover:opacity-85 whitespace-nowrap shrink-0 cursor-pointer"
                style={{
                  borderColor: activeMonthGraphic
                    ? theme.cellSelectedBg
                    : theme.inkSubtle,
                  backgroundColor: activeMonthGraphic
                    ? theme.cellHover
                    : 'transparent',
                }}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>
                  {activeMonthGraphic
                    ? activeMonthGraphic.categoryLabel
                    : 'Graphics'}
                </span>
              </button>
            </div>
          </div>

          {/* Primary Dial / Grid Surface (plus optional Wall-Calendar Poster Plate) */}
          <div
            className="print-dial-container rounded-lg border p-3 sm:p-5 flex flex-col items-center justify-center gap-4"
            style={{
              backgroundColor: theme.dialBg,
              borderColor: theme.inkSubtle,
            }}
          >
            {showPosterAboveDial && activeMonthGraphic && (
              <div
                className="w-full max-w-[740px] rounded-lg border overflow-hidden"
                style={{ borderColor: theme.inkSubtle }}
              >
                <div className="aspect-[16/8.5] w-full overflow-hidden bg-black/10 relative">
                  <img
                    src={activeMonthGraphic.imageUrl}
                    alt={`${MONTH_NAMES[month]} — ${activeMonthGraphic.caption}`}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                    style={{
                      objectPosition: activeMonthGraphic.objectPosition,
                      filter: activeMonthGraphic.filterStyle,
                    }}
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent px-4 py-3 flex items-end justify-between gap-4">
                    <div className="text-white min-w-0">
                      <p className="text-[11px] font-medium opacity-85">
                        {activeMonthGraphic.categoryLabel} · {MONTH_NAMES[month]} {year}
                      </p>
                      <p className="font-dial text-base sm:text-lg font-bold truncate">
                        {activeMonthGraphic.caption}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => openCustomize('graphics')}
                      className="no-print px-2.5 py-1 text-[11px] font-semibold rounded bg-white/90 text-slate-900 hover:bg-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      Change Art
                    </button>
                  </div>
                </div>
              </div>
            )}

            {layoutMode === 'grid' ? (
              <ClassicGridView
                year={year}
                month={month}
                selectedDateKey={selectedDateKey}
                todayDateKey={todayDateKey}
                eventsByDate={eventsByDate}
                holidays={holidays}
                theme={theme}
                onSelectDate={handleSelectDate}
              />
            ) : (
              <>
                <RadialCalendarDial
                  year={year}
                  month={month}
                  selectedDateKey={selectedDateKey}
                  todayDateKey={todayDateKey}
                  eventsByDate={eventsByDate}
                  holidays={holidays}
                  layoutMode={layoutMode}
                  theme={dialTheme}
                  graphic={activeMonthGraphic}
                  graphicPlacement={graphicConfig.placement}
                  watermarkOpacity={graphicConfig.watermarkOpacity}
                  backdropVeil={graphicConfig.backdropVeil}
                  onSelectDate={handleSelectDate}
                  svgRef={dialSvgRef}
                />
                {activeMonthGraphic && graphicConfig.placement === 'full' && (
                  <div
                    className="no-print w-full max-w-[740px] flex flex-wrap items-center justify-between gap-2 px-1 text-xs"
                    style={{ color: theme.inkMuted }}
                  >
                    <span>
                      {activeMonthGraphic.categoryLabel} ·{' '}
                      <strong className="font-semibold" style={{ color: theme.ink }}>
                        {activeMonthGraphic.caption}
                      </strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => openCustomize('graphics')}
                      className="font-semibold underline underline-offset-4 hover:opacity-80 cursor-pointer"
                      style={{ color: theme.ink }}
                    >
                      Adjust artwork & veil
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </section>

        {/* Right: Selected Day Agenda & Month Overview */}
        <AgendaPanel
          year={year}
          month={month}
          selectedDateKey={selectedDateKey}
          todayDateKey={todayDateKey}
          eventsByDate={eventsByDate}
          holidays={holidays}
          theme={theme}
          onSelectDate={handleSelectDate}
          onOpenNewEvent={handleOpenNewEvent}
          onEditEvent={handleEditEvent}
          onDeleteEvent={handleDeleteEvent}
          onToggleComplete={handleToggleComplete}
          onTogglePin={handleTogglePin}
        />
      </main>

      <EventModal
        isOpen={modalOpen}
        initialDateKey={modalDateKey}
        editingEvent={editingEvent}
        theme={theme}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveEvent}
        onDelete={handleDeleteEvent}
      />

      <CustomizeDrawer
        isOpen={customizeOpen}
        initialTab={customizeTab}
        year={year}
        month={month}
        themeId={themeId}
        customColors={customColors}
        activeTheme={theme}
        graphicConfig={graphicConfig}
        onClose={() => setCustomizeOpen(false)}
        onSelectTheme={setThemeId}
        onChangeCustomColors={setCustomColors}
        onChangeGraphicConfig={setGraphicConfig}
        onJumpToMonth={(mIdx) => {
          setMonth(mIdx);
          setSelectedDateKey(formatDateKey(year, mIdx, 1));
        }}
      />

      <OfflineIndicator />
    </div>
  );
}
