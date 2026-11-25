import React, { useRef, useState } from 'react';
import {
  Check,
  Image as ImageIcon,
  Palette,
  RotateCcw,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import {
  CalendarGraphicConfig,
  CustomThemeColors,
  DialTheme,
  DialThemeId,
  GraphicPlacement,
} from '../types/calendar';
import {
  compressAndAnalyzeImageFile,
  GRAPHIC_CATEGORIES,
  resolveMonthGraphic,
} from '../utils/graphicsCatalog';
import { DIAL_THEMES, MONTH_ABBR, MONTH_NAMES } from '../utils/holidays';

interface CustomizeDrawerProps {
  isOpen: boolean;
  initialTab: 'colors' | 'graphics';
  year: number;
  month: number;
  themeId: DialThemeId;
  customColors: CustomThemeColors;
  activeTheme: DialTheme;
  graphicConfig: CalendarGraphicConfig;
  onClose: () => void;
  onSelectTheme: (id: DialThemeId) => void;
  onChangeCustomColors: (next: CustomThemeColors) => void;
  onChangeGraphicConfig: (next: CalendarGraphicConfig) => void;
  onJumpToMonth: (monthIdx: number) => void;
}

type UploadMode = 'current' | 'all' | 'sequence';

export const CustomizeDrawer: React.FC<CustomizeDrawerProps> = ({
  isOpen,
  initialTab,
  month,
  themeId,
  customColors,
  activeTheme,
  graphicConfig,
  onClose,
  onSelectTheme,
  onChangeCustomColors,
  onChangeGraphicConfig,
  onJumpToMonth,
}) => {
  const [activeTab, setActiveTab] = useState<'colors' | 'graphics'>(initialTab);
  const [uploadMode, setUploadMode] = useState<UploadMode>('current');
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isProcessingUpload, setIsProcessingUpload] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  React.useEffect(() => {
    if (isOpen) setActiveTab(initialTab);
  }, [isOpen, initialTab]);

  React.useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleFilesSelected = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    setUploadError(null);
    setIsProcessingUpload(true);

    try {
      const files = Array.from(fileList)
        .filter((f) => f.type.startsWith('image/'))
        .sort((a, b) =>
          a.name.localeCompare(b.name, undefined, { numeric: true })
        );
      if (files.length === 0) {
        setUploadError('Please choose image files (JPG, PNG, WEBP, HEIC).');
        setIsProcessingUpload(false);
        return;
      }

      const nextCustomMap = { ...graphicConfig.customImagesByMonth };

      if (uploadMode === 'all') {
        const analyzed = await compressAndAnalyzeImageFile(files[0]);
        const label = files[0].name.replace(/\.[^/.]+$/, '');
        for (let m = 0; m < 12; m++) {
          nextCustomMap[m] = { ...analyzed, label };
        }
      } else if (uploadMode === 'sequence' || files.length > 1) {
        const startMonth = files.length >= 12 ? 0 : month;
        for (let i = 0; i < Math.min(files.length, 12); i++) {
          const targetMonth = (startMonth + i) % 12;
          const analyzed = await compressAndAnalyzeImageFile(files[i]);
          const label = files[i].name.replace(/\.[^/.]+$/, '');
          nextCustomMap[targetMonth] = { ...analyzed, label };
        }
      } else {
        const analyzed = await compressAndAnalyzeImageFile(files[0]);
        const label = files[0].name.replace(/\.[^/.]+$/, '');
        nextCustomMap[month] = { ...analyzed, label };
      }

      onChangeGraphicConfig({
        ...graphicConfig,
        category:
          graphicConfig.category === 'none'
            ? 'custom'
            : graphicConfig.category,
        placement:
          graphicConfig.category === 'none' ? 'full' : graphicConfig.placement,
        customImagesByMonth: nextCustomMap,
      });
    } catch {
      setUploadError('Could not load one of those photos. Try JPG or PNG.');
    } finally {
      setIsProcessingUpload(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleClearMonthUpload = (m: number) => {
    const nextMap = { ...graphicConfig.customImagesByMonth };
    delete nextMap[m];
    onChangeGraphicConfig({
      ...graphicConfig,
      customImagesByMonth: nextMap,
    });
  };

  const handleClearAllUploads = () => {
    onChangeGraphicConfig({
      ...graphicConfig,
      customImagesByMonth: {},
      category: graphicConfig.category === 'custom' ? 'none' : graphicConfig.category,
    });
  };

  const presetKeys = Object.keys(DIAL_THEMES) as Array<
    Exclude<DialThemeId, 'custom'>
  >;
  const hasCustomUploads =
    Object.keys(graphicConfig.customImagesByMonth).length > 0;

  return (
    <div
      className="no-print fixed inset-0 z-50 flex justify-end bg-black/45 backdrop-blur-[2px]"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Customize calendar"
    >
      <div
        className="w-full max-w-lg h-full border-l flex flex-col shadow-2xl overflow-hidden"
        style={{
          backgroundColor: activeTheme.panelBg,
          borderColor: activeTheme.inkSubtle,
          color: activeTheme.ink,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div
          className="px-6 py-4 border-b flex items-center justify-between gap-4"
          style={{ borderColor: activeTheme.inkSubtle }}
        >
          <div>
            <h2 className="font-dial text-xl font-bold">Customize Calendar</h2>
            <p className="text-xs mt-0.5" style={{ color: activeTheme.inkMuted }}>
              Pick custom color schemes, 12-month themes, or camera roll photos
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close customize panel"
            className="p-2 rounded-md hover:opacity-75 cursor-pointer"
            style={{ color: activeTheme.inkMuted }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Segmented Tab Bar */}
        <div
          className="px-6 py-3 border-b flex items-center gap-2"
          style={{ borderColor: activeTheme.inkSubtle }}
        >
          <button
            type="button"
            onClick={() => setActiveTab('colors')}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-md text-xs font-semibold transition-colors cursor-pointer"
            style={{
              backgroundColor:
                activeTab === 'colors'
                  ? activeTheme.cellSelectedBg
                  : 'transparent',
              color:
                activeTab === 'colors'
                  ? activeTheme.cellSelectedText
                  : activeTheme.inkMuted,
            }}
          >
            <Palette className="w-3.5 h-3.5" />
            Color Schemes
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('graphics')}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-md text-xs font-semibold transition-colors cursor-pointer"
            style={{
              backgroundColor:
                activeTab === 'graphics'
                  ? activeTheme.cellSelectedBg
                  : 'transparent',
              color:
                activeTab === 'graphics'
                  ? activeTheme.cellSelectedText
                  : activeTheme.inkMuted,
            }}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            Graphics & Camera Roll
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'colors' ? (
            <>
              {/* Curated Color Presets */}
              <div>
                <h3 className="text-xs font-semibold tracking-wide mb-3">
                  Curated Palettes
                </h3>
                <div className="grid grid-cols-2 gap-2.5">
                  {presetKeys.map((key) => {
                    const preset = DIAL_THEMES[key];
                    const isSelected = themeId === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => onSelectTheme(key)}
                        className="p-3 rounded-lg border text-left transition-all flex items-center justify-between gap-2 cursor-pointer"
                        style={{
                          borderColor: isSelected
                            ? activeTheme.cellSelectedBg
                            : activeTheme.inkSubtle,
                          borderWidth: isSelected ? '2px' : '1px',
                          backgroundColor: isSelected
                            ? activeTheme.cellHover
                            : 'transparent',
                        }}
                      >
                        <div className="min-w-0">
                          <p className="text-xs font-semibold truncate">
                            {preset.label}
                          </p>
                          <div className="flex items-center gap-1.5 mt-2">
                            <span
                              className="w-4 h-4 rounded-full border"
                              style={{
                                backgroundColor: preset.dialBg,
                                borderColor: activeTheme.inkSubtle,
                              }}
                              title="Dial Surface"
                            />
                            <span
                              className="w-4 h-4 rounded-full border"
                              style={{
                                backgroundColor: preset.ink,
                                borderColor: activeTheme.inkSubtle,
                              }}
                              title="Ink & Rings"
                            />
                            <span
                              className="w-4 h-4 rounded-full border"
                              style={{
                                backgroundColor: preset.cellSelectedBg,
                                borderColor: activeTheme.inkSubtle,
                              }}
                              title="Selection Accent"
                            />
                            <span
                              className="w-4 h-4 rounded-full border"
                              style={{
                                backgroundColor: preset.todayStroke,
                                borderColor: activeTheme.inkSubtle,
                              }}
                              title="Today Ring"
                            />
                          </div>
                        </div>
                        {isSelected && <Check className="w-4 h-4 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Color Builder */}
              <div
                className="pt-5 border-t"
                style={{ borderColor: activeTheme.inkSubtle }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-xs font-semibold tracking-wide">
                      Custom Color Scheme
                    </h3>
                    <p
                      className="text-xs mt-0.5"
                      style={{ color: activeTheme.inkMuted }}
                    >
                      Pick any custom ink, dial background, and accent colors
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onChangeCustomColors({
                        ink: '#0D229E',
                        dialBg: '#FFFFFF',
                        accent: '#0D229E',
                        todayStroke: '#C2410C',
                      });
                      onSelectTheme('cobalt');
                    }}
                    className="inline-flex items-center gap-1 text-xs font-medium hover:opacity-75 cursor-pointer"
                    style={{ color: activeTheme.inkMuted }}
                  >
                    <RotateCcw className="w-3 h-3" />
                    Reset
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {(
                    [
                      { key: 'ink', label: 'Ink & Rings' },
                      { key: 'dialBg', label: 'Dial Paper / Surface' },
                      { key: 'accent', label: 'Selected Accent' },
                      { key: 'todayStroke', label: 'Today Highlight' },
                    ] as const
                  ).map((field) => (
                    <label
                      key={field.key}
                      className="p-3 rounded-lg border flex items-center gap-3 cursor-pointer"
                      style={{ borderColor: activeTheme.inkSubtle }}
                    >
                      <input
                        type="color"
                        value={customColors[field.key]}
                        onChange={(e) => {
                          onChangeCustomColors({
                            ...customColors,
                            [field.key]: e.target.value,
                          });
                          onSelectTheme('custom');
                        }}
                        className="w-8 h-8 rounded border-0 p-0 bg-transparent cursor-pointer shrink-0"
                      />
                      <div className="min-w-0">
                        <span className="block text-xs font-semibold truncate">
                          {field.label}
                        </span>
                        <span
                          className="block font-mono-tabular text-[11px] uppercase"
                          style={{ color: activeTheme.inkMuted }}
                        >
                          {customColors[field.key]}
                        </span>
                      </div>
                    </label>
                  ))}
                </div>

                {themeId === 'custom' && (
                  <p
                    className="mt-3 text-xs font-medium"
                    style={{ color: activeTheme.inkMuted }}
                  >
                    Custom scheme active — changes update live on the dial.
                  </p>
                )}
              </div>
            </>
          ) : (
            <>
              {/* 12-Month Category Picker */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-semibold tracking-wide">
                    12-Month Graphic Collections
                  </h3>
                  <button
                    type="button"
                    onClick={() =>
                      onChangeGraphicConfig({
                        ...graphicConfig,
                        category: 'none',
                      })
                    }
                    className="text-xs font-medium underline underline-offset-4 hover:opacity-75 cursor-pointer"
                    style={{ color: activeTheme.inkMuted }}
                  >
                    Pure Dial (No Graphic)
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {GRAPHIC_CATEGORIES.map((cat) => {
                    const isSelected = graphicConfig.category === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() =>
                          onChangeGraphicConfig({
                            ...graphicConfig,
                            category: cat.id,
                            placement:
                              graphicConfig.category === 'none'
                                ? 'full'
                                : graphicConfig.placement,
                          })
                        }
                        className="rounded-lg border overflow-hidden text-left transition-all cursor-pointer group"
                        style={{
                          borderColor: isSelected
                            ? activeTheme.cellSelectedBg
                            : activeTheme.inkSubtle,
                          borderWidth: isSelected ? '2px' : '1px',
                        }}
                      >
                        <div className="aspect-video w-full overflow-hidden bg-black/10 relative">
                          <img
                            src={cat.previewUrl}
                            alt={cat.label}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                          />
                        </div>
                        <div className="p-2.5 flex items-center justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-xs font-semibold truncate">
                              {cat.label}
                            </p>
                            <p
                              className="text-[11px] truncate"
                              style={{ color: activeTheme.inkMuted }}
                            >
                              {cat.subtitle}
                            </p>
                          </div>
                          {isSelected && (
                            <Check className="w-4 h-4 shrink-0" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Camera Roll / Custom Upload */}
              <div
                className="pt-5 border-t"
                style={{ borderColor: activeTheme.inkSubtle }}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-semibold tracking-wide">
                    Camera Roll & Custom Photos
                  </h3>
                  {hasCustomUploads && (
                    <button
                      type="button"
                      onClick={handleClearAllUploads}
                      className="inline-flex items-center gap-1 text-xs font-medium hover:opacity-75 cursor-pointer"
                      style={{ color: activeTheme.inkMuted }}
                    >
                      <Trash2 className="w-3 h-3" />
                      Clear Uploads
                    </button>
                  )}
                </div>

                {/* Upload Target Mode */}
                <div
                  className="inline-flex items-center p-0.5 rounded-md border mb-3 w-full"
                  style={{ borderColor: activeTheme.inkSubtle }}
                >
                  {(
                    [
                      { id: 'current', label: `For ${MONTH_ABBR[month]}` },
                      { id: 'all', label: 'All 12 Months' },
                      { id: 'sequence', label: 'Multi-Photo Sequence' },
                    ] as const
                  ).map((opt) => {
                    const active = uploadMode === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setUploadMode(opt.id)}
                        className="flex-1 px-2 py-1.5 text-[11px] font-semibold rounded transition-colors whitespace-nowrap cursor-pointer"
                        style={{
                          backgroundColor: active
                            ? activeTheme.cellSelectedBg
                            : 'transparent',
                          color: active
                            ? activeTheme.cellSelectedText
                            : activeTheme.inkMuted,
                        }}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>

                {/* Dropzone + Camera Roll Button */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    handleFilesSelected(e.dataTransfer.files);
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      fileInputRef.current?.click();
                    }
                  }}
                  className="rounded-lg border border-dashed p-5 text-center cursor-pointer transition-colors"
                  style={{
                    borderColor: isDragging
                      ? activeTheme.cellSelectedBg
                      : activeTheme.inkSubtle,
                    backgroundColor: isDragging
                      ? activeTheme.cellHover
                      : 'transparent',
                  }}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple={uploadMode === 'sequence'}
                    className="hidden"
                    onChange={(e) => handleFilesSelected(e.target.files)}
                  />
                  <Upload
                    className="w-5 h-5 mx-auto mb-2"
                    style={{ color: activeTheme.inkMuted }}
                  />
                  <p className="text-xs font-semibold">
                    {isProcessingUpload
                      ? 'Preparing photo...'
                      : 'Choose from Camera Roll or drop image here'}
                  </p>
                  <p
                    className="text-[11px] mt-1"
                    style={{ color: activeTheme.inkMuted }}
                  >
                    {uploadMode === 'current'
                      ? `Assigns photo to ${MONTH_NAMES[month]}`
                      : uploadMode === 'all'
                        ? 'Applies selected photo across all 12 months'
                        : `Select up to 12 photos to fill ${MONTH_ABBR[month]} onward`}
                  </p>
                </div>

                {uploadError && (
                  <p className="mt-2 text-xs text-red-600 font-medium">
                    {uploadError}
                  </p>
                )}
              </div>

              {/* Placement & Opacity Controls */}
              {graphicConfig.category !== 'none' && (
                <div
                  className="pt-5 border-t space-y-4"
                  style={{ borderColor: activeTheme.inkSubtle }}
                >
                  <div>
                    <h3 className="text-xs font-semibold tracking-wide mb-2">
                      Artwork Coverage & Placement
                    </h3>
                    <div
                      className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1 rounded-md border"
                      style={{ borderColor: activeTheme.inkSubtle }}
                    >
                      {(
                        [
                          { id: 'full', label: 'Full Cover' },
                          { id: 'watermark', label: 'Dial Circle' },
                          { id: 'poster', label: 'Top Poster' },
                          { id: 'hub', label: 'Center Hub' },
                        ] as Array<{ id: GraphicPlacement; label: string }>
                      ).map((opt) => {
                        const active = graphicConfig.placement === opt.id;
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() =>
                              onChangeGraphicConfig({
                                ...graphicConfig,
                                placement: opt.id,
                              })
                            }
                            className="px-2 py-1.5 text-xs font-semibold rounded transition-colors whitespace-nowrap cursor-pointer"
                            style={{
                              backgroundColor: active
                                ? activeTheme.cellSelectedBg
                                : 'transparent',
                              color: active
                                ? activeTheme.cellSelectedText
                                : activeTheme.inkMuted,
                            }}
                          >
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {graphicConfig.placement === 'full' && (
                    <div className="space-y-3">
                      <div>
                        <div className="flex items-center justify-between text-xs mb-1.5">
                          <span className="font-semibold">
                            Artwork Contrast Veil
                          </span>
                          <span
                            className="font-mono-tabular"
                            style={{ color: activeTheme.inkMuted }}
                          >
                            {Math.round(graphicConfig.backdropVeil * 100)}%
                          </span>
                        </div>
                        <input
                          type="range"
                          min={15}
                          max={75}
                          value={Math.round(graphicConfig.backdropVeil * 100)}
                          onChange={(e) =>
                            onChangeGraphicConfig({
                              ...graphicConfig,
                              backdropVeil: Number(e.target.value) / 100,
                            })
                          }
                          className="w-full cursor-pointer"
                        />
                      </div>

                      <label className="flex items-start gap-2.5 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={graphicConfig.autoAdaptInk}
                          onChange={(e) =>
                            onChangeGraphicConfig({
                              ...graphicConfig,
                              autoAdaptInk: e.target.checked,
                            })
                          }
                          className="mt-0.5 rounded"
                        />
                        <span className="text-xs leading-snug">
                          <strong className="font-semibold">
                            Auto-match spiral colors to artwork
                          </strong>
                          <span
                            className="block mt-0.5"
                            style={{ color: activeTheme.inkMuted }}
                          >
                            Automatically shifts the spiral rings, numbers, and
                            callouts to high-contrast ink over your artwork.
                          </span>
                        </span>
                      </label>
                    </div>
                  )}

                  {graphicConfig.placement === 'watermark' && (
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="font-semibold">Watermark Opacity</span>
                        <span
                          className="font-mono-tabular"
                          style={{ color: activeTheme.inkMuted }}
                        >
                          {Math.round(graphicConfig.watermarkOpacity * 100)}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min={8}
                        max={45}
                        value={Math.round(graphicConfig.watermarkOpacity * 100)}
                        onChange={(e) =>
                          onChangeGraphicConfig({
                            ...graphicConfig,
                            watermarkOpacity: Number(e.target.value) / 100,
                          })
                        }
                        className="w-full cursor-pointer"
                      />
                    </div>
                  )}

                  {/* 12-Month Preview Strip */}
                  <div>
                    <h3 className="text-xs font-semibold tracking-wide mb-2">
                      12-Month Lineup (Click month to preview)
                    </h3>
                    <div className="grid grid-cols-4 gap-2">
                      {MONTH_ABBR.map((abbr, mIdx) => {
                        const resolved = resolveMonthGraphic(
                          graphicConfig,
                          mIdx
                        );
                        const hasOverride = Boolean(
                          graphicConfig.customImagesByMonth[mIdx]
                        );
                        const isViewing = mIdx === month;
                        return (
                          <div
                            key={abbr}
                            className="relative rounded-md border overflow-hidden"
                            style={{
                              borderColor: isViewing
                                ? activeTheme.cellSelectedBg
                                : activeTheme.inkSubtle,
                              borderWidth: isViewing ? '2px' : '1px',
                            }}
                          >
                            <button
                              type="button"
                              onClick={() => onJumpToMonth(mIdx)}
                              className="w-full text-left cursor-pointer block"
                            >
                              <div className="aspect-video w-full bg-black/10 overflow-hidden">
                                {resolved ? (
                                  <img
                                    src={resolved.imageUrl}
                                    alt={`${MONTH_NAMES[mIdx]} artwork`}
                                    referrerPolicy="no-referrer"
                                    className="w-full h-full object-cover"
                                    style={{
                                      objectPosition: resolved.objectPosition,
                                      filter: resolved.filterStyle,
                                    }}
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-[10px] opacity-50">
                                    None
                                  </div>
                                )}
                              </div>
                              <div className="px-1.5 py-1 flex items-center justify-between text-[10px] font-semibold">
                                <span>{abbr}</span>
                                {hasOverride && (
                                  <span style={{ color: activeTheme.inkMuted }}>
                                    Photo
                                  </span>
                                )}
                              </div>
                            </button>
                            {hasOverride && (
                              <button
                                type="button"
                                onClick={() => handleClearMonthUpload(mIdx)}
                                title={`Remove custom photo for ${MONTH_NAMES[mIdx]}`}
                                aria-label={`Remove custom photo for ${MONTH_NAMES[mIdx]}`}
                                className="absolute top-1 right-1 w-4 h-4 rounded-full bg-black/70 text-white flex items-center justify-center text-[10px] hover:bg-black cursor-pointer"
                              >
                                ×
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
