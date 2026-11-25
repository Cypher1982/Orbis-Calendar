import React, { useMemo, useState } from 'react';
import {
  CalendarEvent,
  DialLayoutMode,
  DialTheme,
  GraphicPlacement,
  HolidayItem,
} from '../types/calendar';
import { ResolvedMonthGraphic } from '../utils/graphicsCatalog';
import {
  formatDateKey,
  getDaysInMonth,
  getFirstWeekday,
  MONTH_ABBR,
  MONTH_NAMES,
  WEEKDAY_LETTERS,
  WEEKDAY_NAMES,
} from '../utils/holidays';

interface RadialCalendarDialProps {
  year: number;
  month: number;
  selectedDateKey: string;
  todayDateKey: string;
  eventsByDate: Record<string, CalendarEvent[]>;
  holidays: HolidayItem[];
  layoutMode: DialLayoutMode;
  theme: DialTheme;
  graphic?: ResolvedMonthGraphic | null;
  graphicPlacement?: GraphicPlacement;
  watermarkOpacity?: number;
  backdropVeil?: number;
  onSelectDate: (dateKey: string) => void;
  svgRef?: React.RefObject<SVGSVGElement | null>;
}

interface DayCellGeometry {
  day: number;
  dateKey: string;
  weekday: number;
  rInner: number;
  rOuter: number;
  startDeg: number;
  endDeg: number;
  midDeg: number;
  cx: number;
  cy: number;
  pathD: string;
}

interface CalloutItem {
  id: string;
  dateKey: string;
  day: number;
  title: string;
  dateLabel: string;
  isUserPinned: boolean;
}

interface CornerSlot {
  id: 'TL' | 'TR' | 'BL' | 'BR';
  x: number;
  y: number;
  anchor: 'start' | 'end';
  arrowStartXOffset: number;
}

const CX = 420;
const CY = 415;
const R_OUTER = 258;
const R_WEEKDAY_INNER = 208;
const R_HUB_OUTER = 52;
const R_HUB_INNER = 41;
const R_TITLE_ARC = 285;
const SECTOR_SPAN = 360 / 7;

const CORNER_SLOTS: CornerSlot[] = [
  { id: 'TL', x: 26, y: 142, anchor: 'start', arrowStartXOffset: 118 },
  { id: 'TR', x: 814, y: 142, anchor: 'end', arrowStartXOffset: -118 },
  { id: 'BL', x: 26, y: 672, anchor: 'start', arrowStartXOffset: 118 },
  { id: 'BR', x: 814, y: 672, anchor: 'end', arrowStartXOffset: -118 },
];

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
}

function describeAnnularWedge(
  cx: number,
  cy: number,
  rInner: number,
  rOuter: number,
  startDeg: number,
  endDeg: number
): string {
  const p1 = polarToCartesian(cx, cy, rOuter, startDeg);
  const p2 = polarToCartesian(cx, cy, rOuter, endDeg);
  const p3 = polarToCartesian(cx, cy, rInner, endDeg);
  const p4 = polarToCartesian(cx, cy, rInner, startDeg);
  const largeArc = endDeg - startDeg > 180 ? 1 : 0;

  return [
    `M ${p1.x.toFixed(2)} ${p1.y.toFixed(2)}`,
    `A ${rOuter} ${rOuter} 0 ${largeArc} 1 ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`,
    `L ${p3.x.toFixed(2)} ${p3.y.toFixed(2)}`,
    `A ${rInner} ${rInner} 0 ${largeArc} 0 ${p4.x.toFixed(2)} ${p4.y.toFixed(2)}`,
    'Z',
  ].join(' ');
}

function wrapTextLines(text: string, maxChars = 20): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    if (!current) {
      current = word;
    } else if ((current + ' ' + word).length <= maxChars) {
      current += ' ' + word;
    } else {
      lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines.slice(0, 3);
}

export const RadialCalendarDial: React.FC<RadialCalendarDialProps> = ({
  year,
  month,
  selectedDateKey,
  todayDateKey,
  eventsByDate,
  holidays,
  layoutMode,
  theme,
  graphic,
  graphicPlacement = 'full',
  watermarkOpacity = 0.22,
  backdropVeil = 0.44,
  onSelectDate,
  svgRef,
}) => {
  const [hoveredDateKey, setHoveredDateKey] = useState<string | null>(null);

  const totalDays = getDaysInMonth(year, month);
  const firstWeekday = getFirstWeekday(year, month);
  const numWeeks = Math.ceil((firstWeekday + totalDays) / 7);

  // Build day cell geometry based on layoutMode ('concentric' or 'continuous')
  const { cells, ringRadii } = useMemo(() => {
    const built: DayCellGeometry[] = [];
    const rings: number[] = [];

    if (layoutMode === 'continuous') {
      // Two-ring continuous spiral layout inspired directly by the reference dial
      const outerCount = Math.ceil(totalDays * 0.58); // e.g., 18 for 31 days
      const innerCount = totalDays - outerCount;
      const rMid = (R_WEEKDAY_INNER + R_HUB_OUTER) / 2;
      rings.push(rMid);

      const outerSpan = 360 / outerCount;
      const innerSpan = 360 / Math.max(innerCount, 1);
      const startOffset = -10; // starts near 12 o'clock

      for (let d = 1; d <= totalDays; d++) {
        const isOuter = d <= outerCount;
        const idx = isOuter ? d - 1 : d - outerCount - 1;
        const span = isOuter ? outerSpan : innerSpan;
        const rOuter = isOuter ? R_WEEKDAY_INNER : rMid;
        const rInner = isOuter ? rMid : R_HUB_OUTER;
        const startDeg = startOffset + idx * span;
        const endDeg = startDeg + span;
        const midDeg = (startDeg + endDeg) / 2;
        const midR = (rInner + rOuter) / 2;
        const center = polarToCartesian(CX, CY, midR, midDeg);
        const weekday = new Date(year, month, d).getDay();

        built.push({
          day: d,
          dateKey: formatDateKey(year, month, d),
          weekday,
          rInner,
          rOuter,
          startDeg,
          endDeg,
          midDeg,
          cx: center.x,
          cy: center.y,
          pathD: describeAnnularWedge(CX, CY, rInner, rOuter, startDeg, endDeg),
        });
      }
    } else {
      // Concentric weekly rings aligned strictly to S M T W T F S sectors
      const ringThickness = (R_WEEKDAY_INNER - R_HUB_OUTER) / numWeeks;
      for (let w = 1; w < numWeeks; w++) {
        rings.push(R_WEEKDAY_INNER - w * ringThickness);
      }

      for (let d = 1; d <= totalDays; d++) {
        const slot = firstWeekday + (d - 1);
        const weekIdx = Math.floor(slot / 7);
        const col = slot % 7;
        const rOuter = R_WEEKDAY_INNER - weekIdx * ringThickness;
        const rInner = R_WEEKDAY_INNER - (weekIdx + 1) * ringThickness;
        const startDeg = (col - 1) * SECTOR_SPAN;
        const endDeg = col * SECTOR_SPAN;
        const midDeg = (col - 0.5) * SECTOR_SPAN;
        const midR = (rInner + rOuter) / 2;
        const center = polarToCartesian(CX, CY, midR, midDeg);

        built.push({
          day: d,
          dateKey: formatDateKey(year, month, d),
          weekday: col,
          rInner,
          rOuter,
          startDeg,
          endDeg,
          midDeg,
          cx: center.x,
          cy: center.y,
          pathD: describeAnnularWedge(CX, CY, rInner, rOuter, startDeg, endDeg),
        });
      }
    }

    return { cells: built, ringRadii: rings };
  }, [layoutMode, totalDays, firstWeekday, numWeeks, year, month]);

  // Title arc path (left-to-right across the top)
  const titleArcD = useMemo(() => {
    const start = polarToCartesian(CX, CY, R_TITLE_ARC, -56);
    const end = polarToCartesian(CX, CY, R_TITLE_ARC, 56);
    return `M ${start.x.toFixed(2)} ${start.y.toFixed(2)} A ${R_TITLE_ARC} ${R_TITLE_ARC} 0 0 1 ${end.x.toFixed(2)} ${end.y.toFixed(2)}`;
  }, []);

  // Build up to 4 corner callouts (pinned user events first, then month holidays)
  const assignedCallouts = useMemo(() => {
    const candidates: CalloutItem[] = [];
    const seenDates = new Set<string>();

    // 1. User pinned events in this month
    const monthPrefix = `${year}-${String(month + 1).padStart(2, '0')}-`;
    Object.keys(eventsByDate)
      .filter((k) => k.startsWith(monthPrefix))
      .sort()
      .forEach((dateKey) => {
        const pinned = eventsByDate[dateKey].filter((e) => e.pinnedToCorner);
        for (const ev of pinned) {
          const dayNum = Number(dateKey.split('-')[2]);
          candidates.push({
            id: `ev-${ev.id}`,
            dateKey,
            day: dayNum,
            title: ev.title,
            dateLabel: `${MONTH_ABBR[month]} ${dayNum}`,
            isUserPinned: true,
          });
          seenDates.add(dateKey);
        }
      });

    // 2. Holidays in this month
    for (const h of holidays) {
      if (!seenDates.has(h.dateKey)) {
        candidates.push({
          id: `hol-${h.dateKey}-${h.title}`,
          dateKey: h.dateKey,
          day: h.day,
          title: h.title,
          dateLabel: h.shortDateLabel,
          isUserPinned: false,
        });
        seenDates.add(h.dateKey);
      }
    }

    const topFour = candidates.slice(0, 4);
    const availableSlots = [...CORNER_SLOTS];

    return topFour
      .map((item) => {
        const cell = cells.find((c) => c.dateKey === item.dateKey);
        if (!cell || availableSlots.length === 0) return null;

        // Pick closest unoccupied corner to the target cell
        let bestIdx = 0;
        let bestDist = Infinity;
        availableSlots.forEach((slot, idx) => {
          const dx = slot.x - cell.cx;
          const dy = slot.y - cell.cy;
          const dist = dx * dx + dy * dy;
          if (dist < bestDist) {
            bestDist = dist;
            bestIdx = idx;
          }
        });

        const slot = availableSlots.splice(bestIdx, 1)[0];
        const lines = wrapTextLines(item.title, 19);
        const maxLineLen = Math.max(
          ...lines.map((l, idx) => l.length + (idx === 0 ? 2 : 0)),
          item.dateLabel.length
        );
        const estTextWidth = Math.min(162, Math.max(76, maxLineLen * 7.1 + 10));

        // Compute curved Bezier arrow path from corner label edge to cell
        const startX =
          slot.anchor === 'start'
            ? slot.x + estTextWidth
            : slot.x - estTextWidth;
        const startY = slot.y + 8;

        // Pull target slightly outward toward the corner so arrowhead points cleanly at the numeral
        const vx = cell.cx - startX;
        const vy = cell.cy - startY;
        const len = Math.hypot(vx, vy) || 1;
        const targetOffset = 15;
        const endX = cell.cx - (vx / len) * targetOffset;
        const endY = cell.cy - (vy / len) * targetOffset;

        // Gentle perpendicular curve toward outer corner
        const midX = (startX + endX) / 2;
        const midY = (startY + endY) / 2;
        const ctrlX = midX + (slot.anchor === 'start' ? -18 : 18);
        const ctrlY = midY + (slot.id.startsWith('T') ? -24 : 24);

        const arrowD = `M ${startX.toFixed(1)} ${startY.toFixed(1)} Q ${ctrlX.toFixed(1)} ${ctrlY.toFixed(1)} ${endX.toFixed(1)} ${endY.toFixed(1)}`;

        return {
          ...item,
          slot,
          arrowD,
          lines,
        };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null);
  }, [eventsByDate, holidays, cells, year, month]);

  const holidayDateMap = useMemo(() => {
    const map = new Map<string, HolidayItem>();
    for (const h of holidays) {
      map.set(h.dateKey, h);
    }
    return map;
  }, [holidays]);

  const activeCell = useMemo(() => {
    const key = hoveredDateKey || selectedDateKey;
    return cells.find((c) => c.dateKey === key) || null;
  }, [hoveredDateKey, selectedDateKey, cells]);

  const selectedCell = useMemo(() => {
    return cells.find((c) => c.dateKey === selectedDateKey) || null;
  }, [selectedDateKey, cells]);

  const titleText = `${MONTH_NAMES[month].toUpperCase()} ${year}`;
  const arrowMarkerId = `orbis-arrow-${theme.id}`;
  const isFullCover = Boolean(graphic && graphicPlacement === 'full');
  const scrimColor = graphic?.dialPalette.scrimColor || '#090D16';

  return (
    <div className="w-full flex flex-col items-center justify-center select-none">
      <svg
        ref={svgRef}
        viewBox="0 0 840 760"
        className="w-full max-w-[740px] h-auto rounded-md overflow-hidden"
        role="img"
        aria-label={`${MONTH_NAMES[month]} ${year} circular spiral calendar`}
        style={{ backgroundColor: theme.dialBg }}
      >
        <defs>
          <path id="orbisTitleArc" d={titleArcD} fill="none" />
          <clipPath id="orbisDialClip">
            <circle cx={CX} cy={CY} r={R_OUTER - 1} />
          </clipPath>
          <clipPath id="orbisHubClip">
            <circle cx={CX} cy={CY} r={R_HUB_INNER - 1} />
          </clipPath>
          <radialGradient id="orbisDialVignette" cx="50%" cy="54%" r="52%">
            <stop offset="0%" stopColor={scrimColor} stopOpacity="0.34" />
            <stop offset="68%" stopColor={scrimColor} stopOpacity="0.22" />
            <stop offset="100%" stopColor={scrimColor} stopOpacity="0.04" />
          </radialGradient>
          <filter
            id="orbisContrastHalo"
            x="-10%"
            y="-10%"
            width="120%"
            height="120%"
          >
            <feDropShadow
              dx="0"
              dy="1"
              stdDeviation="2.2"
              floodColor="#000000"
              floodOpacity="0.78"
            />
          </filter>
          <marker
            id={arrowMarkerId}
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="6.5"
            markerHeight="6.5"
            orient="auto-start-reverse"
          >
            <path d="M 0 1.5 L 9 5 L 0 8.5 z" fill={theme.ink} />
          </marker>
        </defs>

        {/* Crisp dial surface background for clean SVG export */}
        <rect x="0" y="0" width="840" height="760" fill={theme.dialBg} />

        {/* Full-Cover Edge-to-Edge Calendar Artwork */}
        {isFullCover && graphic && (
          <g>
            <image
              href={graphic.imageUrl}
              x="0"
              y="0"
              width="840"
              height="760"
              preserveAspectRatio="xMidYMid slice"
            />
            <rect
              x="0"
              y="0"
              width="840"
              height="760"
              fill={scrimColor}
              fillOpacity={backdropVeil}
            />
            <rect
              x="0"
              y="0"
              width="840"
              height="760"
              fill="url(#orbisDialVignette)"
            />
          </g>
        )}

        {/* Optional Dial Watermark Graphic clipped inside main circle */}
        {graphic && graphicPlacement === 'watermark' && (
          <g>
            <image
              href={graphic.imageUrl}
              x={CX - R_OUTER}
              y={CY - R_OUTER}
              width={R_OUTER * 2}
              height={R_OUTER * 2}
              preserveAspectRatio="xMidYMid slice"
              clipPath="url(#orbisDialClip)"
              opacity={watermarkOpacity}
            />
          </g>
        )}

        <g filter={isFullCover ? 'url(#orbisContrastHalo)' : undefined}>

        {/* Arched Month & Year Header */}
        <text
          fill={theme.ink}
          className="font-dial"
          fontSize="38"
          fontWeight="700"
          letterSpacing="0.06em"
        >
          <textPath href="#orbisTitleArc" startOffset="50%" textAnchor="middle">
            {titleText}
          </textPath>
        </text>

        {/* Outer Dial Circle */}
        <circle
          cx={CX}
          cy={CY}
          r={R_OUTER}
          fill="none"
          stroke={theme.ringStroke}
          strokeWidth="3.2"
        />

        {/* Weekday Letters Ring */}
        {WEEKDAY_LETTERS.map((letter, col) => {
          const midDeg = (col - 0.5) * SECTOR_SPAN;
          const pos = polarToCartesian(CX, CY, (R_OUTER + R_WEEKDAY_INNER) / 2, midDeg);
          const isHighlightedSector =
            layoutMode === 'concentric' && activeCell?.weekday === col;

          return (
            <g key={`wd-${col}`}>
              {isHighlightedSector && (
                <path
                  d={describeAnnularWedge(
                    CX,
                    CY,
                    R_WEEKDAY_INNER,
                    R_OUTER,
                    (col - 1) * SECTOR_SPAN,
                    col * SECTOR_SPAN
                  )}
                  fill={theme.cellHover}
                />
              )}
              <text
                x={pos.x}
                y={pos.y}
                fill={theme.ink}
                className="font-dial"
                fontSize="28"
                fontWeight="700"
                textAnchor="middle"
                dominantBaseline="central"
              >
                <title>{WEEKDAY_NAMES[col]}</title>
                {letter}
              </text>
            </g>
          );
        })}

        {/* Inner Boundary of Weekday Ring */}
        <circle
          cx={CX}
          cy={CY}
          r={R_WEEKDAY_INNER}
          fill="none"
          stroke={theme.ringStroke}
          strokeWidth="2.8"
        />

        {/* Subtle radial sector lines in concentric mode */}
        {layoutMode === 'concentric' &&
          WEEKDAY_LETTERS.map((_, col) => {
            const boundaryDeg = col * SECTOR_SPAN;
            const pOuter = polarToCartesian(CX, CY, R_WEEKDAY_INNER, boundaryDeg);
            const pInner = polarToCartesian(CX, CY, R_HUB_OUTER, boundaryDeg);
            return (
              <line
                key={`sec-line-${col}`}
                x1={pInner.x}
                y1={pInner.y}
                x2={pOuter.x}
                y2={pOuter.y}
                stroke={theme.sectorLine}
                strokeWidth="1"
              />
            );
          })}

        {/* Concentric Week Divider Rings */}
        {ringRadii.map((r, idx) => (
          <circle
            key={`ring-${idx}`}
            cx={CX}
            cy={CY}
            r={r}
            fill="none"
            stroke={theme.ringStroke}
            strokeWidth="2"
          />
        ))}

        {/* Interactive Day Cells */}
        {cells.map((cell) => {
          const isSelected = cell.dateKey === selectedDateKey;
          const isToday = cell.dateKey === todayDateKey;
          const isHovered = cell.dateKey === hoveredDateKey;
          const dayEvents = eventsByDate[cell.dateKey] || [];
          const holiday = holidayDateMap.get(cell.dateKey);
          const hasPinned = dayEvents.some((e) => e.pinnedToCorner);
          const eventDots = Math.min(dayEvents.length, 3);

          const textFill = isSelected ? theme.cellSelectedText : theme.ink;
          const fontSize =
            layoutMode === 'concentric' && numWeeks >= 6
              ? 15
              : layoutMode === 'continuous'
                ? 18
                : 17.5;

          return (
            <g
              key={cell.dateKey}
              onClick={() => onSelectDate(cell.dateKey)}
              onMouseEnter={() => setHoveredDateKey(cell.dateKey)}
              onMouseLeave={() => setHoveredDateKey(null)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelectDate(cell.dateKey);
                }
              }}
              tabIndex={0}
              role="button"
              aria-label={`${WEEKDAY_NAMES[cell.weekday]}, ${MONTH_NAMES[month]} ${cell.day}, ${year}${holiday ? `, ${holiday.title}` : ''}${dayEvents.length ? `, ${dayEvents.length} events` : ''}`}
              aria-pressed={isSelected}
              className="cursor-pointer outline-none"
            >
              {/* Cell Fill */}
              <path
                d={cell.pathD}
                fill={
                  isSelected
                    ? theme.cellSelectedBg
                    : isHovered
                      ? theme.cellHover
                      : 'transparent'
                }
                stroke={isToday && !isSelected ? theme.todayStroke : 'none'}
                strokeWidth={isToday && !isSelected ? '2.2' : '0'}
              />

              {/* Star indicator for holiday or pinned milestone */}
              {(holiday || hasPinned) && (
                <text
                  x={cell.cx + 12}
                  y={cell.cy - 8}
                  fill={isSelected ? theme.cellSelectedText : theme.accentStar}
                  fontSize="9"
                  textAnchor="middle"
                  dominantBaseline="central"
                  pointerEvents="none"
                >
                  ★
                </text>
              )}

              {/* Day Number */}
              <text
                x={cell.cx}
                y={eventDots > 0 ? cell.cy - 2 : cell.cy}
                fill={textFill}
                className="font-dial"
                fontSize={fontSize}
                fontWeight={isSelected || isToday ? '700' : '600'}
                textAnchor="middle"
                dominantBaseline="central"
                pointerEvents="none"
              >
                {cell.day}
              </text>

              {/* Event indicator dots */}
              {eventDots > 0 && (
                <g pointerEvents="none">
                  {Array.from({ length: eventDots }).map((_, dotIdx) => {
                    const spread = (dotIdx - (eventDots - 1) / 2) * 5.5;
                    return (
                      <circle
                        key={dotIdx}
                        cx={cell.cx + spread}
                        cy={cell.cy + 10.5}
                        r="1.8"
                        fill={isSelected ? theme.cellSelectedText : theme.inkMuted}
                      />
                    );
                  })}
                </g>
              )}
            </g>
          );
        })}

        {/* Central Double-Ring Bullseye Hub (signature motif from reference) */}
        <circle
          cx={CX}
          cy={CY}
          r={R_HUB_OUTER}
          fill={isFullCover ? scrimColor : theme.dialBg}
          fillOpacity={isFullCover ? 0.56 : 1}
          stroke={theme.ringStroke}
          strokeWidth="2.8"
        />
        <circle
          cx={CX}
          cy={CY}
          r={R_HUB_INNER}
          fill="none"
          stroke={theme.ringStroke}
          strokeWidth="2"
        />

        {/* Optional Center Hub Medallion Graphic */}
        {graphic && graphicPlacement === 'hub' && (
          <g pointerEvents="none">
            <image
              href={graphic.imageUrl}
              x={CX - R_HUB_INNER}
              y={CY - R_HUB_INNER}
              width={R_HUB_INNER * 2}
              height={R_HUB_INNER * 2}
              preserveAspectRatio="xMidYMid slice"
              clipPath="url(#orbisHubClip)"
            />
            <circle
              cx={CX}
              cy={CY}
              r={R_HUB_INNER - 1}
              fill={theme.dialBg}
              fillOpacity="0.48"
            />
          </g>
        )}

        {/* Selected day readout inside bullseye hub */}
        {(hoveredDateKey || selectedCell) && (
          <g pointerEvents="none">
            <text
              x={CX}
              y={CY - 8}
              fill={theme.inkMuted}
              className="font-dial"
              fontSize="10"
              fontWeight="600"
              letterSpacing="0.08em"
              textAnchor="middle"
              dominantBaseline="central"
            >
              {WEEKDAY_NAMES[
                (activeCell || selectedCell)!.weekday
              ]
                .slice(0, 3)
                .toUpperCase()}
            </text>
            <text
              x={CX}
              y={CY + 9}
              fill={theme.ink}
              className="font-dial"
              fontSize="22"
              fontWeight="700"
              textAnchor="middle"
              dominantBaseline="central"
            >
              {(activeCell || selectedCell)!.day}
            </text>
          </g>
        )}

        {/* Corner Callout Annotations & Curved Pointer Arrows */}
        {assignedCallouts.map((callout) => {
          const isActive =
            callout.dateKey === selectedDateKey ||
            callout.dateKey === hoveredDateKey;

          return (
            <g
              key={callout.id}
              onClick={() => onSelectDate(callout.dateKey)}
              onMouseEnter={() => setHoveredDateKey(callout.dateKey)}
              onMouseLeave={() => setHoveredDateKey(null)}
              className="cursor-pointer"
            >
              {/* Curved Arrow */}
              <path
                d={callout.arrowD}
                fill="none"
                stroke={theme.ink}
                strokeWidth={isActive ? '2.2' : isFullCover ? '1.65' : '1.25'}
                strokeOpacity={isActive ? 1 : isFullCover ? 0.92 : 0.8}
                markerEnd={`url(#${arrowMarkerId})`}
              />

              {/* Starred Label Block */}
              <text
                x={callout.slot.x}
                y={callout.slot.y}
                fill={theme.ink}
                className="font-dial"
                fontSize="13.5"
                fontWeight={isActive ? '700' : '600'}
                textAnchor={callout.slot.anchor}
              >
                {callout.lines.map((line, lineIdx) => (
                  <tspan
                    key={lineIdx}
                    x={callout.slot.x}
                    dy={lineIdx === 0 ? '0' : '16'}
                  >
                    {lineIdx === 0 ? `★ ${line}` : line}
                  </tspan>
                ))}
                <tspan
                  x={callout.slot.x}
                  dy="16"
                  fontSize="12.5"
                  fontWeight="600"
                  fill={theme.inkMuted}
                >
                  {callout.dateLabel}
                </tspan>
              </text>
            </g>
          );
        })}
        </g>
      </svg>
    </div>
  );
};
