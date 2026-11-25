import {
  CalendarGraphicConfig,
  DialTheme,
  GraphicCategoryId,
} from '../types/calendar';

export interface ArtworkDialPalette {
  ink: string;
  inkMuted: string;
  ringStroke: string;
  accent: string;
  accentText: string;
  todayStroke: string;
  scrimColor: string;
  sectorLine: string;
  cellHover: string;
}

export interface GraphicCategoryMeta {
  id: Exclude<GraphicCategoryId, 'none' | 'custom'>;
  label: string;
  subtitle: string;
  previewUrl: string;
  dialPalette: ArtworkDialPalette;
  months: Array<{
    title: string;
    imageUrl: string;
    objectPosition: string;
    filterStyle?: string;
  }>;
}

export const GRAPHIC_CATEGORIES: GraphicCategoryMeta[] = [
  {
    id: 'badwolf',
    label: 'Bad Wolf',
    subtitle: "12 scenes from your Bad Wolf No. 1 comic",
    previewUrl: '/assets/badwolf/bw_01_cover.jpg',
    dialPalette: {
      ink: '#FFF7ED',
      inkMuted: '#FCA5A5',
      ringStroke: '#FFF7ED',
      accent: '#DC2626',
      accentText: '#FFFFFF',
      todayStroke: '#F59E0B',
      scrimColor: '#07060A',
      sectorLine: 'rgba(255, 247, 237, 0.28)',
      cellHover: 'rgba(220, 38, 38, 0.28)',
    },
    months: [
      { title: 'Bad Wolf No. 1 — Cover', imageUrl: '/assets/badwolf/bw_01_cover.jpg', objectPosition: '50% 45%' },
      { title: 'La Muerte Cigarettes', imageUrl: '/assets/badwolf/bw_02_lamuerte.jpg', objectPosition: '50% 50%' },
      { title: 'Big Bad Wolf — Prison Visit', imageUrl: '/assets/badwolf/bw_03_prison_dad.jpg', objectPosition: '50% 48%' },
      { title: 'Always My Father', imageUrl: '/assets/badwolf/bw_04_thumbs_up.jpg', objectPosition: '50% 45%' },
      { title: 'Grandma Wolf & Little Red', imageUrl: '/assets/badwolf/bw_05_grandma_red.jpg', objectPosition: '50% 45%' },
      { title: 'Three Little Pigs Brick House', imageUrl: '/assets/badwolf/bw_06_three_pigs.jpg', objectPosition: '50% 48%' },
      { title: 'Shave Those Knuckles!', imageUrl: '/assets/badwolf/bw_07_moose_guard.jpg', objectPosition: '50% 45%' },
      { title: "Talking To My Son?!", imageUrl: '/assets/badwolf/bw_08_titan_dad.jpg', objectPosition: '50% 42%' },
      { title: 'Keep Your Head Up, Kiddo', imageUrl: '/assets/badwolf/bw_09_phone_call.jpg', objectPosition: '50% 45%' },
      { title: 'For When She Has A Headache', imageUrl: '/assets/badwolf/bw_10_jerky_ad.jpg', objectPosition: '50% 50%' },
      { title: 'Wolf Outside the House', imageUrl: '/assets/badwolf/bw_11_house_shock.jpg', objectPosition: '50% 50%' },
      { title: 'F**K My Life — The End', imageUrl: '/assets/badwolf/bw_12_fml_end.jpg', objectPosition: '50% 45%' },
    ],
  },
  {
    id: 'hotrods',
    label: 'Hot Rods',
    subtitle: '12 unique classic iron & speed shop editions',
    previewUrl: '/src/assets/images/hotrod_deuce_garage_1795550874969.jpg',
    dialPalette: {
      ink: '#FFF8EB',
      inkMuted: '#FDE68A',
      ringStroke: '#FFF8EB',
      accent: '#DC2626',
      accentText: '#FFFFFF',
      todayStroke: '#FBBF24',
      scrimColor: '#0A0908',
      sectorLine: 'rgba(255, 248, 235, 0.24)',
      cellHover: 'rgba(251, 191, 36, 0.22)',
    },
    months: [
      { title: "1932 Cherry Deuce Coupe", imageUrl: '/src/assets/images/hotrod_deuce_garage_1795550874969.jpg', objectPosition: '50% 52%' },
      { title: 'Bonneville Salt Flats Roadster', imageUrl: '/src/assets/images/hotrod_salt_flats_1795550875868.jpg', objectPosition: '50% 50%' },
      { title: "1950 Mercury Chopped Lead Sled", imageUrl: '/src/assets/images/hotrod_march_lead_sled_1795551767132.jpg', objectPosition: '50% 52%' },
      { title: '1923 Blown T-Bucket Highway Run', imageUrl: '/src/assets/images/hotrod_april_t_bucket_1795551767845.jpg', objectPosition: '50% 52%' },
      { title: '1931 Model A Patina Rat Rod', imageUrl: '/src/assets/images/hotrod_may_rat_rod_1795551768326.jpg', objectPosition: '50% 50%' },
      { title: "1955 Bel Air Strip Gasser", imageUrl: '/src/assets/images/hotrod_june_belair_gasser_1795551768829.jpg', objectPosition: '50% 50%' },
      { title: '1941 Willys Blown Coupe', imageUrl: '/src/assets/images/hotrod_july_willys_coupe_1795551769542.jpg', objectPosition: '50% 50%' },
      { title: '1959 El Camino Sunset Cruiser', imageUrl: '/src/assets/images/hotrod_august_elcamino_1795551769697.jpg', objectPosition: '50% 54%' },
      { title: '1953 F-100 Autumn Hauler', imageUrl: '/src/assets/images/hotrod_september_pickup_1795551769687.jpg', objectPosition: '50% 50%' },
      { title: '1956 Nomad Ghost Flame Wagon', imageUrl: '/src/assets/images/hotrod_october_nomad_1795551770798.jpg', objectPosition: '50% 55%' },
      { title: '1934 Three-Window Steel Shop Coupe', imageUrl: '/src/assets/images/hotrod_november_coupe_1795551770657.jpg', objectPosition: '50% 52%' },
      { title: '1936 Ford Winter Workshop Pickup', imageUrl: '/src/assets/images/hotrod_december_shop_1795551771734.jpg', objectPosition: '50% 50%' },
    ],
  },
  {
    id: 'pinup',
    label: 'Pin-Up Classics',
    subtitle: '12 unique 1950s retro Americana editions',
    previewUrl: '/src/assets/images/pinup_vintage_garage_1795550877187.jpg',
    dialPalette: {
      ink: '#FFFDF7',
      inkMuted: '#BAE6FD',
      ringStroke: '#FFFDF7',
      accent: '#E11D48',
      accentText: '#FFFFFF',
      todayStroke: '#2DD4BF',
      scrimColor: '#0F111A',
      sectorLine: 'rgba(255, 253, 247, 0.25)',
      cellHover: 'rgba(225, 29, 72, 0.25)',
    },
    months: [
      { title: 'Sunny Side Service Station', imageUrl: '/src/assets/images/pinup_vintage_garage_1795550877187.jpg', objectPosition: '50% 38%' },
      { title: "Dixie's Neon Roadside Diner", imageUrl: '/src/assets/images/pinup_retro_diner_1795550877279.jpg', objectPosition: '50% 24%' },
      { title: 'Route 66 Road Map Stop', imageUrl: '/src/assets/images/pinup_march_route66_1795551866066.jpg', objectPosition: '50% 34%' },
      { title: 'April Showers & Chrome', imageUrl: '/src/assets/images/pinup_april_umbrella_1795551772068.jpg', objectPosition: '50% 34%' },
      { title: "Mel's Drive-In Roller Skates", imageUrl: '/src/assets/images/pinup_may_drivein_1795551772712.jpg', objectPosition: '50% 32%' },
      { title: 'Woodie Wagon Beach Surf', imageUrl: '/src/assets/images/pinup_june_beach_1795551866330.jpg', objectPosition: '50% 34%' },
      { title: 'County Fair Sparklers', imageUrl: '/src/assets/images/pinup_july_fairground_1795551773396.jpg', objectPosition: '50% 30%' },
      { title: 'Lake Lady Mahogany Runabout', imageUrl: '/src/assets/images/pinup_august_boat_1795551866609.jpg', objectPosition: '50% 34%' },
      { title: 'Autumn Orchard Tailgate', imageUrl: '/src/assets/images/pinup_september_orchard_1795551867125.jpg', objectPosition: '50% 32%' },
      { title: 'Dirt Track Checkered Flag', imageUrl: '/src/assets/images/pinup_october_speedway_1795551867369.jpg', objectPosition: '50% 32%' },
      { title: 'Warm Farmhouse Apple Pie', imageUrl: '/src/assets/images/pinup_november_kitchen_1795551867679.jpg', objectPosition: '50% 26%' },
      { title: 'Snowfall Vintage Streetlamps', imageUrl: '/src/assets/images/pinup_december_winter_1795551867838.jpg', objectPosition: '50% 30%' },
    ],
  },
  {
    id: 'choppers',
    label: 'Custom Choppers',
    subtitle: '12 unique bobber & highway editions',
    previewUrl: '/src/assets/images/chopper_custom_shop_1795550877748.jpg',
    dialPalette: {
      ink: '#F8FAFC',
      inkMuted: '#FCD34D',
      ringStroke: '#F8FAFC',
      accent: '#D97706',
      accentText: '#111113',
      todayStroke: '#FB923C',
      scrimColor: '#090A0D',
      sectorLine: 'rgba(248, 250, 252, 0.24)',
      cellHover: 'rgba(217, 119, 6, 0.25)',
    },
    months: [
      { title: 'Raw Steel Bench Bobber', imageUrl: '/src/assets/images/chopper_custom_shop_1795550877748.jpg', objectPosition: '50% 48%' },
      { title: 'Canyon Rim Sunset Cruiser', imageUrl: '/src/assets/images/chopper_open_highway_1795550877967.jpg', objectPosition: '50% 54%' },
      { title: 'Root Beer Flake Springer', imageUrl: '/src/assets/images/chopper_march_garage_1795551883988.jpg', objectPosition: '50% 50%' },
      { title: 'Misty Sea Cliff Scrambler', imageUrl: '/src/assets/images/chopper_april_coast_1795551884955.jpg', objectPosition: '50% 55%' },
      { title: 'Dry Gulch Panhead Sissy Bar', imageUrl: '/src/assets/images/chopper_may_route66_1795551885409.jpg', objectPosition: '50% 50%' },
      { title: 'Redwood Trail Custom Bobber', imageUrl: '/src/assets/images/chopper_june_redwoods_1795551949515.jpg', objectPosition: '50% 52%' },
      { title: 'Main Street Summer Bike Rally', imageUrl: '/src/assets/images/chopper_july_rally_1795551949548.jpg', objectPosition: '50% 52%' },
      { title: 'Bonneville No. 37 Land Speeder', imageUrl: '/src/assets/images/chopper_august_salt_1795551949703.jpg', objectPosition: '50% 48%' },
      { title: 'Autumn Ridge Copper Ironhead', imageUrl: '/src/assets/images/chopper_september_ridge_1795551950144.jpg', objectPosition: '50% 52%' },
      { title: 'Sunbeam Barn Knucklehead', imageUrl: '/src/assets/images/chopper_october_barn_1795551949939.jpg', objectPosition: '50% 50%' },
      { title: 'Rain-Slicked Neon Night Bobber', imageUrl: '/src/assets/images/chopper_november_rain_1795551951200.jpg', objectPosition: '50% 50%' },
      { title: 'Winter Shop Candy Red Chopper', imageUrl: '/src/assets/images/chopper_december_bench_1795551951078.jpg', objectPosition: '50% 52%' },
    ],
  },
  {
    id: 'wildlife',
    label: 'Wilderness & Wolves',
    subtitle: '12 unique ridge & alpine editions',
    previewUrl: '/src/assets/images/wildlife_wolf_moonlight_1795550879675.jpg',
    dialPalette: {
      ink: '#F0F9FF',
      inkMuted: '#BAE6FD',
      ringStroke: '#E0F2FE',
      accent: '#0284C7',
      accentText: '#FFFFFF',
      todayStroke: '#38BDF8',
      scrimColor: '#060D1A',
      sectorLine: 'rgba(224, 242, 254, 0.24)',
      cellHover: 'rgba(56, 189, 248, 0.24)',
    },
    months: [
      { title: 'Full Moon Timber Ridge', imageUrl: '/src/assets/images/wildlife_wolf_moonlight_1795550879675.jpg', objectPosition: '50% 42%' },
      { title: 'Alpine Mirror Dawn', imageUrl: '/src/assets/images/wildlife_alpine_peaks_1795550879138.jpg', objectPosition: '50% 48%' },
      { title: 'Snowmelt Granite Creek Crossing', imageUrl: '/src/assets/images/wildlife_march_creek_1795551951433.jpg', objectPosition: '50% 50%' },
      { title: 'Basalt Canyon Spring Falls', imageUrl: '/src/assets/images/wildlife_april_waterfall_1795551951987.jpg', objectPosition: '50% 50%' },
      { title: 'Wildflower Meadow Wolf Cubs', imageUrl: '/src/assets/images/wildlife_may_meadow_1795552029844.jpg', objectPosition: '50% 52%' },
      { title: 'Glacial River Bald Eagle', imageUrl: '/src/assets/images/wildlife_june_eagle_1795552030328.jpg', objectPosition: '50% 48%' },
      { title: 'Milky Way Ridge Howl', imageUrl: '/src/assets/images/wildlife_july_milkyway_1795552030188.jpg', objectPosition: '50% 48%' },
      { title: 'Sunrise Mist Bull Elk', imageUrl: '/src/assets/images/wildlife_august_elk_1795552030699.jpg', objectPosition: '50% 52%' },
      { title: 'Golden Autumn Aspen Trail', imageUrl: '/src/assets/images/wildlife_september_aspen_1795552029946.jpg', objectPosition: '50% 50%' },
      { title: 'Obsidian Wolf in Forest Fog', imageUrl: '/src/assets/images/wildlife_october_fog_1795552031596.jpg', objectPosition: '50% 48%' },
      { title: 'Arctic Wolf Under Northern Lights', imageUrl: '/src/assets/images/wildlife_november_aurora_1795552031189.jpg', objectPosition: '50% 46%' },
      { title: 'December Spruce Snow Pack', imageUrl: '/src/assets/images/wildlife_december_blizzard_1795552031743.jpg', objectPosition: '50% 52%' },
    ],
  },
];

export interface ResolvedMonthGraphic {
  imageUrl: string;
  caption: string;
  categoryLabel: string;
  objectPosition: string;
  filterStyle?: string;
  isCustomUpload: boolean;
  dialPalette: ArtworkDialPalette;
}

const DEFAULT_CUSTOM_PALETTE: ArtworkDialPalette = {
  ink: '#FFFFFF',
  inkMuted: '#E2E8F0',
  ringStroke: '#FFFFFF',
  accent: '#2563EB',
  accentText: '#FFFFFF',
  todayStroke: '#FBBF24',
  scrimColor: '#0A0E17',
  sectorLine: 'rgba(255, 255, 255, 0.24)',
  cellHover: 'rgba(255, 255, 255, 0.2)',
};

export function resolveMonthGraphic(
  config: CalendarGraphicConfig,
  month: number
): ResolvedMonthGraphic | null {
  if (config.category === 'none') return null;

  const customOverride = config.customImagesByMonth[month];
  if (config.category === 'custom') {
    if (!customOverride) return null;
    const ink = customOverride.detectedInk || DEFAULT_CUSTOM_PALETTE.ink;
    const accent = customOverride.detectedAccent || DEFAULT_CUSTOM_PALETTE.accent;
    const scrimColor = customOverride.detectedScrim || DEFAULT_CUSTOM_PALETTE.scrimColor;
    return {
      imageUrl: customOverride.dataUrl,
      caption: customOverride.label,
      categoryLabel: 'Camera Roll',
      objectPosition: '50% 50%',
      isCustomUpload: true,
      dialPalette: {
        ...DEFAULT_CUSTOM_PALETTE,
        ink,
        ringStroke: ink,
        accent,
        scrimColor,
      },
    };
  }

  if (customOverride) {
    const cat = GRAPHIC_CATEGORIES.find((c) => c.id === config.category);
    const ink = customOverride.detectedInk || cat?.dialPalette.ink || DEFAULT_CUSTOM_PALETTE.ink;
    const accent =
      customOverride.detectedAccent ||
      cat?.dialPalette.accent ||
      DEFAULT_CUSTOM_PALETTE.accent;
    return {
      imageUrl: customOverride.dataUrl,
      caption: customOverride.label,
      categoryLabel: cat ? cat.label : 'Custom',
      objectPosition: '50% 50%',
      isCustomUpload: true,
      dialPalette: {
        ...(cat?.dialPalette || DEFAULT_CUSTOM_PALETTE),
        ink,
        ringStroke: ink,
        accent,
      },
    };
  }

  const cat = GRAPHIC_CATEGORIES.find((c) => c.id === config.category);
  if (!cat) return null;
  const entry = cat.months[month % 12];
  return {
    imageUrl: entry.imageUrl,
    caption: entry.title,
    categoryLabel: cat.label,
    objectPosition: entry.objectPosition,
    filterStyle: entry.filterStyle,
    isCustomUpload: false,
    dialPalette: cat.dialPalette,
  };
}

export function applyArtworkPaletteToTheme(
  baseTheme: DialTheme,
  palette: ArtworkDialPalette
): DialTheme {
  return {
    ...baseTheme,
    ink: palette.ink,
    inkMuted: palette.inkMuted,
    ringStroke: palette.ringStroke,
    sectorLine: palette.sectorLine,
    cellHover: palette.cellHover,
    cellSelectedBg: palette.accent,
    cellSelectedText: palette.accentText,
    todayStroke: palette.todayStroke,
    accentStar: palette.inkMuted,
  };
}

export interface CompressedAnalyzedImage {
  dataUrl: string;
  detectedInk: string;
  detectedAccent: string;
  detectedScrim: string;
}

export function compressAndAnalyzeImageFile(
  file: File,
  maxDim = 1200
): Promise<CompressedAnalyzedImage> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Unsupported image format'));
      img.onload = () => {
        const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
        const width = Math.max(1, Math.round(img.width * scale));
        const height = Math.max(1, Math.round(img.height * scale));
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve({
            dataUrl: reader.result as string,
            detectedInk: '#FFFFFF',
            detectedAccent: '#2563EB',
            detectedScrim: '#0A0E17',
          });
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.84);

        const sampleCanvas = document.createElement('canvas');
        sampleCanvas.width = 24;
        sampleCanvas.height = 24;
        const sCtx = sampleCanvas.getContext('2d');
        let avgR = 120;
        let avgB = 120;
        if (sCtx) {
          sCtx.drawImage(img, 0, 0, 24, 24);
          const pixels = sCtx.getImageData(0, 0, 24, 24).data;
          let sumR = 0;
          let sumB = 0;
          const count = pixels.length / 4;
          for (let i = 0; i < pixels.length; i += 4) {
            sumR += pixels[i];
            sumB += pixels[i + 2];
          }
          avgR = sumR / count;
          avgB = sumB / count;
        }

        const isWarm = avgR > avgB + 15;
        const detectedInk = isWarm ? '#FFF9ED' : '#F4F8FF';
        const detectedAccent = isWarm ? '#DC2626' : '#2563EB';
        const detectedScrim = isWarm ? '#120D0A' : '#080D18';

        resolve({
          dataUrl,
          detectedInk,
          detectedAccent,
          detectedScrim,
        });
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}
