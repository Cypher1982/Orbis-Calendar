import {
  CustomThemeColors,
  DialTheme,
  DialThemeId,
  HolidayItem,
} from '../types/calendar';

export const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export const MONTH_ABBR = [
  'Jan.',
  'Feb.',
  'Mar.',
  'Apr.',
  'May',
  'Jun.',
  'Jul.',
  'Aug.',
  'Sep.',
  'Oct.',
  'Nov.',
  'Dec.',
];

export const WEEKDAY_LETTERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export const WEEKDAY_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const clean = hex.replace('#', '');
  const full =
    clean.length === 3
      ? clean
          .split('')
          .map((c) => c + c)
          .join('')
      : clean;
  const num = parseInt(full, 16);
  if (Number.isNaN(num)) return { r: 13, g: 34, b: 158 };
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

function getLuminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  const toLinear = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

function rgba(hex: string, alpha: number): string {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function shiftHex(hex: string, delta: number): string {
  const { r, g, b } = hexToRgb(hex);
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  const nr = clamp(r + delta);
  const ng = clamp(g + delta);
  const nb = clamp(b + delta);
  return `#${[nr, ng, nb].map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}

export function buildCustomTheme(colors: CustomThemeColors): DialTheme {
  const bgLum = getLuminance(colors.dialBg);
  const isDark = bgLum < 0.35;
  const accentLum = getLuminance(colors.accent);
  const cellSelectedText = accentLum > 0.45 ? '#0B0F1A' : '#FFFFFF';

  const pageBg = isDark
    ? shiftHex(colors.dialBg, -8)
    : shiftHex(colors.dialBg, -11);
  const panelBg = isDark
    ? shiftHex(colors.dialBg, 6)
    : colors.dialBg;

  return {
    id: 'custom',
    label: 'Custom',
    pageBg,
    panelBg,
    dialBg: colors.dialBg,
    ink: colors.ink,
    inkMuted: rgba(colors.ink, 0.72),
    inkSubtle: rgba(colors.ink, 0.16),
    ringStroke: colors.ink,
    sectorLine: rgba(colors.ink, 0.16),
    cellHover: rgba(colors.accent, 0.14),
    cellSelectedBg: colors.accent,
    cellSelectedText,
    todayStroke: colors.todayStroke,
    accentStar: colors.accent,
    isDark,
  };
}

export const DIAL_THEMES: Record<Exclude<DialThemeId, 'custom'>, DialTheme> = {
  cobalt: {
    id: 'cobalt',
    label: 'Cobalt Print',
    pageBg: '#F4F6FA',
    panelBg: '#FFFFFF',
    dialBg: '#FFFFFF',
    ink: '#0D229E',
    inkMuted: '#3B4EC4',
    inkSubtle: 'rgba(13, 34, 158, 0.14)',
    ringStroke: '#0D229E',
    sectorLine: 'rgba(13, 34, 158, 0.16)',
    cellHover: 'rgba(13, 34, 158, 0.08)',
    cellSelectedBg: '#0D229E',
    cellSelectedText: '#FFFFFF',
    todayStroke: '#C2410C',
    accentStar: '#0D229E',
    isDark: false,
  },
  crimson: {
    id: 'crimson',
    label: 'Hot Rod Red',
    pageBg: '#F6F1F0',
    panelBg: '#FFFDFC',
    dialBg: '#FFFDFB',
    ink: '#991B1B',
    inkMuted: '#B91C1C',
    inkSubtle: 'rgba(153, 27, 27, 0.15)',
    ringStroke: '#991B1B',
    sectorLine: 'rgba(153, 27, 27, 0.15)',
    cellHover: 'rgba(153, 27, 27, 0.08)',
    cellSelectedBg: '#991B1B',
    cellSelectedText: '#FFFFFF',
    todayStroke: '#1D4ED8',
    accentStar: '#991B1B',
    isDark: false,
  },
  brass: {
    id: 'brass',
    label: 'Garage Brass',
    pageBg: '#111113',
    panelBg: '#18181B',
    dialBg: '#141416',
    ink: '#FBBF24',
    inkMuted: '#D97706',
    inkSubtle: 'rgba(251, 191, 36, 0.18)',
    ringStroke: '#F59E0B',
    sectorLine: 'rgba(251, 191, 36, 0.16)',
    cellHover: 'rgba(251, 191, 36, 0.14)',
    cellSelectedBg: '#F59E0B',
    cellSelectedText: '#111113',
    todayStroke: '#F87171',
    accentStar: '#FDE68A',
    isDark: true,
  },
  emerald: {
    id: 'emerald',
    label: 'Emerald Field',
    pageBg: '#F1F6F3',
    panelBg: '#FFFFFF',
    dialBg: '#FCFDFC',
    ink: '#065F46',
    inkMuted: '#047857',
    inkSubtle: 'rgba(6, 95, 70, 0.15)',
    ringStroke: '#065F46',
    sectorLine: 'rgba(6, 95, 70, 0.15)',
    cellHover: 'rgba(6, 95, 70, 0.08)',
    cellSelectedBg: '#065F46',
    cellSelectedText: '#FFFFFF',
    todayStroke: '#D97706',
    accentStar: '#065F46',
    isDark: false,
  },
  archival: {
    id: 'archival',
    label: 'Archival Ink',
    pageBg: '#F3F1EC',
    panelBg: '#FAF8F4',
    dialBg: '#FCFBF8',
    ink: '#171C26',
    inkMuted: '#525B6B',
    inkSubtle: 'rgba(23, 28, 38, 0.12)',
    ringStroke: '#171C26',
    sectorLine: 'rgba(23, 28, 38, 0.15)',
    cellHover: 'rgba(23, 28, 38, 0.07)',
    cellSelectedBg: '#991B1B',
    cellSelectedText: '#FAF8F4',
    todayStroke: '#991B1B',
    accentStar: '#991B1B',
    isDark: false,
  },
  blueprint: {
    id: 'blueprint',
    label: 'Night Blueprint',
    pageBg: '#090F1D',
    panelBg: '#0F172A',
    dialBg: '#0C152B',
    ink: '#E2ECFF',
    inkMuted: '#93B4F4',
    inkSubtle: 'rgba(147, 180, 244, 0.16)',
    ringStroke: '#60A5FA',
    sectorLine: 'rgba(96, 165, 250, 0.18)',
    cellHover: 'rgba(96, 165, 250, 0.16)',
    cellSelectedBg: '#60A5FA',
    cellSelectedText: '#090F1D',
    todayStroke: '#F59E0B',
    accentStar: '#93C5FD',
    isDark: true,
  },
};

export function formatDateKey(year: number, month: number, day: number): string {
  const m = String(month + 1).padStart(2, '0');
  const d = String(day).padStart(2, '0');
  return `${year}-${m}-${d}`;
}

export function parseDateKey(dateKey: string): { year: number; month: number; day: number } {
  const [y, m, d] = dateKey.split('-').map(Number);
  return { year: y, month: m - 1, day: d };
}

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

export function getFirstWeekday(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

function getNthWeekdayOfMonth(
  year: number,
  month: number,
  weekday: number,
  nth: number
): number {
  const firstDay = getFirstWeekday(year, month);
  const offset = (weekday - firstDay + 7) % 7;
  return 1 + offset + (nth - 1) * 7;
}

function getLastWeekdayOfMonth(year: number, month: number, weekday: number): number {
  const totalDays = getDaysInMonth(year, month);
  const lastDayWeekday = new Date(year, month, totalDays).getDay();
  const diff = (lastDayWeekday - weekday + 7) % 7;
  return totalDays - diff;
}

export function getHolidaysForMonth(year: number, month: number): HolidayItem[] {
  const items: HolidayItem[] = [];
  const abbr = MONTH_ABBR[month];

  const push = (day: number, title: string) => {
    items.push({
      dateKey: formatDateKey(year, month, day),
      day,
      month,
      year,
      title,
      shortDateLabel: `${abbr} ${day}`,
    });
  };

  if (month === 0) {
    const jan1DayOfWeek = new Date(year, 0, 1).getDay();
    if (jan1DayOfWeek === 6) {
      push(1, "New Year's Day");
    } else if (jan1DayOfWeek === 0) {
      push(1, "New Year's Day");
      push(2, "New Year's Day (Observed)");
    } else {
      push(1, "New Year's Day");
    }
    const mlkDay = getNthWeekdayOfMonth(year, 0, 1, 3);
    push(mlkDay, 'Martin Luther King Jr. Day');

    if (year >= 1937 && (year - 1937) % 4 === 0) {
      push(20, 'Inauguration Day');
    }
  } else if (month === 1) {
    push(2, 'Groundhog Day');
    push(14, "Valentine's Day");
    push(getNthWeekdayOfMonth(year, 1, 1, 3), "Presidents' Day");
  } else if (month === 2) {
    push(17, "St. Patrick's Day");
    push(20, 'Spring Equinox');
  } else if (month === 3) {
    push(1, "April Fools' Day");
    push(22, 'Earth Day');
  } else if (month === 4) {
    push(getNthWeekdayOfMonth(year, 4, 0, 2), "Mother's Day");
    push(getLastWeekdayOfMonth(year, 4, 1), 'Memorial Day');
  } else if (month === 5) {
    push(14, 'Flag Day');
    push(19, 'Juneteenth');
    push(getNthWeekdayOfMonth(year, 5, 0, 3), "Father's Day");
    push(21, 'Summer Solstice');
  } else if (month === 6) {
    push(4, 'Independence Day');
  } else if (month === 8) {
    push(getNthWeekdayOfMonth(year, 8, 1, 1), 'Labor Day');
    push(22, 'Autumn Equinox');
  } else if (month === 9) {
    push(getNthWeekdayOfMonth(year, 9, 1, 2), "Indigenous Peoples' Day");
    push(31, 'Halloween');
  } else if (month === 10) {
    push(11, 'Veterans Day');
    push(getNthWeekdayOfMonth(year, 10, 4, 4), 'Thanksgiving Day');
  } else if (month === 11) {
    push(21, 'Winter Solstice');
    push(24, 'Christmas Eve');
    push(25, 'Christmas Day');
    push(31, "New Year's Eve");
  }

  return items.sort((a, b) => a.day - b.day);
}
