export type SheetConfig = {
  base10: number;
  floor10: number;
  promo10: number | null;
  enabled10: boolean;
  stock10: number | null;
  enabled12: boolean;
  price12: number;
  stock12: number | null;
  custom: boolean;
  customRate: number;
  sourceRolls: number | null;
  tiers: { quantity: number; percent: number }[];
};
export type SheetSelection = {
  length: number;
  config: SheetConfig;
  normalUnit?: number;
  savings?: number;
  error?: string;
};
export const SHEET_CONFIG_KEY = "dm-preview-wallpaper-sheets-v1";
export function defaultSheetConfig(base10 = 1500): SheetConfig {
  return {
    base10,
    floor10: 1200,
    promo10: null,
    enabled10: true,
    stock10: null,
    enabled12: false,
    price12: 0,
    stock12: null,
    custom: false,
    customRate: 0,
    sourceRolls: null,
    tiers: [],
  };
}
const money = (n: number) => Math.round(n * 100) / 100;
export function validateSheetConfig(c: SheetConfig) {
  if (
    !c ||
    ![c.base10, c.floor10, c.price12, c.customRate].every((n) => Number.isFinite(n) && n >= 0) ||
    c.floor10 < 1200 ||
    c.base10 < c.floor10
  )
    throw new Error(
      "Standard price must cover the minimum (at least PKR 1,200). / کم از کم قیمت 1,200 روپے ہے۔",
    );
  if (
    c.promo10 !== null &&
    (!Number.isFinite(c.promo10) || c.promo10 < c.floor10 || c.promo10 > c.base10)
  )
    throw new Error("Promotional price must be between minimum and normal price.");
  if (
    [c.stock10, c.stock12, c.sourceRolls].some(
      (n) => n !== null && (!Number.isSafeInteger(n) || n! < 0),
    )
  )
    throw new Error("Stock must be a whole number or blank for confirmation.");
  if (c.enabled12 && c.price12 < c.floor10 * 1.2)
    throw new Error("Set a 12-ft price above its proportional minimum.");
  if (c.custom && c.customRate < c.floor10 / 10)
    throw new Error("Set a custom rate above the proportional minimum.");
  if (
    !Array.isArray(c.tiers) ||
    c.tiers.some(
      (t) =>
        !Number.isSafeInteger(t.quantity) ||
        t.quantity < 2 ||
        !Number.isFinite(t.percent) ||
        t.percent < 0 ||
        t.percent > 100,
    ) ||
    new Set(c.tiers.map((t) => t.quantity)).size !== c.tiers.length
  )
    throw new Error("Use unique whole quantity thresholds (2+) and discounts from 0–100%.");
  return c;
}
export function getSheetConfig(id: string, fallback = defaultSheetConfig()): SheetConfig {
  if (typeof window === "undefined") return fallback;
  try {
    const c = JSON.parse(localStorage.getItem(SHEET_CONFIG_KEY) || "{}")[id];
    return c ? validateSheetConfig(c) : fallback;
  } catch {
    return fallback;
  }
}
export function saveSheetConfig(id: string, c: SheetConfig) {
  validateSheetConfig(c);
  const all = JSON.parse(localStorage.getItem(SHEET_CONFIG_KEY) || "{}");
  localStorage.setItem(SHEET_CONFIG_KEY, JSON.stringify({ ...all, [id]: c }));
  window.dispatchEvent(new Event("dm-sheet-config"));
}
export function quoteSheets(
  c: SheetConfig,
  length: number,
  quantity: number,
  discountQuantity = quantity,
) {
  validateSheetConfig(c);
  if (
    !Number.isFinite(length) ||
    length <= 0 ||
    length >= 60 ||
    Math.abs(length * 100 - Math.round(length * 100)) > 1e-6
  )
    throw new Error("Online cuts must be shorter than 60 ft. Full rolls are inquiry-only.");
  if (
    !Number.isSafeInteger(quantity) ||
    quantity < 1 ||
    !Number.isSafeInteger(discountQuantity) ||
    discountQuantity < quantity
  )
    throw new Error("Choose a whole sheet quantity (1+).");
  const standard = length === 10;
  const twelve = length === 12;
  if ((standard && !c.enabled10) || (twelve && !c.enabled12) || (!standard && !twelve && !c.custom))
    throw new Error("This sheet length is not available online. / یہ لمبائی دستیاب نہیں۔");
  const stock = standard ? c.stock10 : twelve ? c.stock12 : null;
  if (stock !== null && quantity > stock)
    throw new Error("Requested quantity exceeds configured stock. / مقدار اسٹاک سے زیادہ ہے۔");
  const normalUnit = money(standard ? c.base10 : twelve ? c.price12 : c.customRate * length);
  const percent = Math.max(
    0,
    ...c.tiers.filter((t) => discountQuantity >= t.quantity).map((t) => t.percent),
  );
  const promotional = standard ? (c.promo10 ?? normalUnit) : normalUnit;
  const unit = money(
    Math.max((c.floor10 * length) / 10, Math.min(promotional, normalUnit * (1 - percent / 100))),
  );
  return {
    unit,
    normalUnit,
    total: money(unit * quantity),
    savings: money((normalUnit - unit) * quantity),
    quantity,
  };
}
export function roomSheets(walls: number[], height: number, cutLength: number) {
  if (
    !walls.length ||
    ![...walls, height, cutLength].every(
      (n) => Number.isFinite(n) && n > 0 && Math.abs(n * 100 - Math.round(n * 100)) < 1e-6,
    ) ||
    height > 60 ||
    cutLength >= 60
  )
    throw new Error(
      "Enter valid dimensions; online cuts must be under 60 ft. / درست پیمائش درج کریں۔",
    );
  const perWall = walls.map((w) => Math.ceil(w / 5));
  const strips = perWall.reduce((a, b) => a + b, 0);
  if (!Number.isSafeInteger(strips)) throw new Error("Dimensions are too large.");
  const stripsPerRoll = Math.floor(6000 / Math.round(cutLength * 100));
  return {
    perWall,
    strips,
    length: cutLength,
    runningFeet: money(strips * cutLength),
    rolls: Math.ceil(strips / stripsPerRoll),
    short: cutLength < height,
  };
}
export function repriceSheetCart<
  T extends {
    id: string;
    baseId?: string;
    price: number;
    qty: number;
    wallpaperSheet?: SheetSelection;
  },
>(items: T[]): T[] {
  const totals = new Map<string, number>();
  for (const item of items)
    if (item.wallpaperSheet) {
      const id = item.baseId || item.id;
      totals.set(id, (totals.get(id) || 0) + item.qty);
    }
  return items.map((item) => {
    if (!item.wallpaperSheet) return item;
    const id = item.baseId || item.id;
    const config = getSheetConfig(id, item.wallpaperSheet.config);
    try {
      const q = quoteSheets(config, item.wallpaperSheet.length, item.qty, totals.get(id));
      const rolls = items
        .filter((i) => i.wallpaperSheet && (i.baseId || i.id) === id)
        .reduce((sum, i) => sum + Math.ceil(i.qty / Math.floor(60 / i.wallpaperSheet!.length)), 0);
      if (config.sourceRolls !== null && rolls > config.sourceRolls)
        throw new Error("Not enough source rolls for these cuts; ask us to confirm availability.");
      return {
        ...item,
        price: q.unit,
        wallpaperSheet: {
          ...item.wallpaperSheet,
          config,
          normalUnit: q.normalUnit,
          savings: q.savings,
          error: undefined,
        },
      };
    } catch (e) {
      return {
        ...item,
        wallpaperSheet: { ...item.wallpaperSheet, config, error: (e as Error).message },
      };
    }
  });
}
