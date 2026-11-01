export type WallpaperPricing = { rate?: number; cutPrices?: Record<number, number> };
export function calculateWallpaper(width: number, height: number, length: number) {
  if (
    ![width, height, length].every(
      (n) =>
        Number.isFinite(n) &&
        n > 0 &&
        Number.isSafeInteger(Math.round(n * 100)) &&
        Math.abs(n * 100 - Math.round(n * 100)) < 0.000001,
    )
  )
    throw new Error(
      "Enter positive measurements with up to two decimal places. / درست پیمائش درج کریں۔",
    );
  if (height > 60 || length > 60)
    throw new Error(
      "A continuous strip cannot exceed 60 ft. / ایک مسلسل پٹی 60 فٹ سے زیادہ نہیں ہو سکتی۔",
    );
  const strips = Math.ceil(width / 5);
  const stripsPerRoll = Math.floor(6000 / Math.round(length * 100));
  const rolls = Math.ceil(strips / stripsPerRoll);
  const runningFeet = (strips * Math.round(length * 100)) / 100;
  return {
    strips,
    stripLength: length,
    runningFeet,
    stripsPerRoll,
    rolls,
    offcutFeet: (rolls * 6000 - strips * Math.round(length * 100)) / 100,
    short: length < height,
    coveredWidth: strips * 5,
  };
}
export function estimateWallpaper(
  result: ReturnType<typeof calculateWallpaper>,
  pricing: WallpaperPricing,
) {
  const cut = pricing.cutPrices?.[result.stripLength];
  const amount =
    Number.isFinite(cut) && cut! > 0
      ? result.strips * cut!
      : Number.isFinite(pricing.rate) && pricing.rate! > 0
        ? result.runningFeet * pricing.rate!
        : null;
  return amount === null ? null : Math.round(amount * 100) / 100;
}

// Optional explicit product metadata. Never infer the unit of an unlabelled price.
export function wallpaperConfiguration(price: number, details: string[]) {
  const entry = details.find((d) => d.startsWith("wallpaper_config:"));
  try {
    const config = JSON.parse(entry?.slice("wallpaper_config:".length) || "{}");
    const basis = Number(config.priceLengthFt);
    const cutPrices: Record<number, number> = {};
    if (config.cutPrices && typeof config.cutPrices === "object") {
      for (const [length, sellingPrice] of Object.entries(config.cutPrices)) {
        if (
          Number(length) > 0 &&
          Number(length) <= 60 &&
          typeof sellingPrice === "number" &&
          Number.isFinite(sellingPrice) &&
          sellingPrice > 0
        )
          cutPrices[Number(length)] = sellingPrice;
      }
    }
    const readyCuts: number[] = Array.isArray(config.readyCuts)
      ? [
          ...new Set<number>(
            config.readyCuts.filter(
              (n: unknown): n is number =>
                typeof n === "number" && n > 0 && n <= 60 && Number.isInteger(n * 100),
            ),
          ),
        ]
      : [];
    return {
      rate:
        Number.isFinite(basis) && basis > 0 && basis <= 60 && price > 0 ? price / basis : undefined,
      readyCuts,
      cutPrices,
      availableRolls:
        Number.isInteger(config.availableRolls) && config.availableRolls >= 0
          ? (config.availableRolls as number)
          : undefined,
    };
  } catch {
    return { rate: undefined, readyCuts: [] as number[], availableRolls: undefined };
  }
}
