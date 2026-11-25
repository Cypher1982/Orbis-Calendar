export type EventCategory = 'work' | 'shop' | 'personal' | 'milestone';

export interface CalendarEvent {
  id: string;
  dateKey: string; // YYYY-MM-DD
  title: string;
  time?: string; // HH:mm or empty for all-day
  endTime?: string;
  category: EventCategory;
  notes?: string;
  completed?: boolean;
  pinnedToCorner?: boolean;
}

export interface HolidayItem {
  dateKey: string;
  day: number;
  month: number; // 0-indexed (0 = Jan)
  year: number;
  title: string;
  shortDateLabel: string;
}

export type DialLayoutMode = 'concentric' | 'continuous' | 'grid';

export type DialThemeId =
  | 'cobalt'
  | 'archival'
  | 'blueprint'
  | 'crimson'
  | 'brass'
  | 'emerald'
  | 'custom';

export interface CustomThemeColors {
  ink: string;
  dialBg: string;
  accent: string;
  todayStroke: string;
}

export interface DialTheme {
  id: DialThemeId;
  label: string;
  pageBg: string;
  panelBg: string;
  dialBg: string;
  ink: string;
  inkMuted: string;
  inkSubtle: string;
  ringStroke: string;
  sectorLine: string;
  cellHover: string;
  cellSelectedBg: string;
  cellSelectedText: string;
  todayStroke: string;
  accentStar: string;
  isDark: boolean;
}

export type GraphicCategoryId =
  | 'none'
  | 'badwolf'
  | 'hotrods'
  | 'pinup'
  | 'choppers'
  | 'wildlife'
  | 'custom';

export type GraphicPlacement = 'full' | 'poster' | 'watermark' | 'hub';

export interface CustomMonthImage {
  dataUrl: string;
  label: string;
  detectedInk?: string;
  detectedAccent?: string;
  detectedScrim?: string;
}

export interface CalendarGraphicConfig {
  category: GraphicCategoryId;
  placement: GraphicPlacement;
  watermarkOpacity: number; // 0.08 to 0.45
  backdropVeil: number; // 0.15 to 0.75 for full cover contrast
  autoAdaptInk: boolean; // auto-adjust spiral colors to stay legible over artwork
  customImagesByMonth: Record<number, CustomMonthImage>;
}
