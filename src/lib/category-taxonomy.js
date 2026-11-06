export const CATEGORY_TAXONOMY_VERSION = "2026-11-06";
const source = (p, category) => p.category === category;
const named = (p, pattern) => pattern.test(p.name);
const sheetsSource = (p) => source(p, "Home Sheets & Covers");

// Explicit admin assignments take precedence over legacy name matching.
export function productPlacement(p) {
  const explicit = /^(Crockery|Household) [/] (.+)$/.exec(p.category);
  if (explicit) return { group: explicit[1], subcategory: explicit[2] };
  const name = p.name || "";
  const category = p.category || "";
  if (/sheet|towel|wallpaper|textile/i.test(category)) return undefined;
  if (/kettle/i.test(name)) return { group: "Household", subcategory: "Electric Kettles" };
  if (/beater|frother|mixer|chopper|juicer|blender/i.test(name))
    return { group: "Household", subcategory: "Kitchen Gadgets" };
  if (/Storage Box|Baskets|Kids Drawer|Tissue Holder|Cutlery Stands/i.test(category))
    return { group: "Household", subcategory: "Storage & Organizers" };
  if (/Cleaning Spray|Dustbins/i.test(category))
    return { group: "Household", subcategory: "Cleaning Essentials" };
  if (/Cleaning Items/i.test(category)) return { group: "Crockery", subcategory: "Cleaning Items" };
  if (/jar|container/i.test(name))
    return { group: "Crockery", subcategory: "Serving & Storage" };
  if (/home decor|decorative|flowers|showpieces/i.test(name))
    return { group: "Household", subcategory: "Home Utility Items" };
  if (/Electronics|Watches|Decoration|Gift Set|Household/i.test(category))
    return { group: "Household", subcategory: "Other Household Items" };
  if (/Kids Chair|Kids Table|BATHROOM|Buckets|Stool|Furniture|Cooler/i.test(category))
    return { group: "Household", subcategory: "Home Utility Items" };
  if (/dinner.?set/i.test(name)) return { group: "Crockery", subcategory: "Dinner Sets" };
  if (/water.?set|jug|pitcher/i.test(name))
    return { group: "Crockery", subcategory: "Jugs & Water Sets" };
  if (/glass(?:es)? set|drinking glasses/i.test(name))
    return { group: "Crockery", subcategory: "Glasses" };
  if (/mug|cup|tumbler|sipper/i.test(name))
    return { group: "Crockery", subcategory: "Cups & Mugs" };
  if (/spoon|ladle|spatula|skimmer|strainer|tong|masher|whisk|cutlery/i.test(name))
    return { group: "Crockery", subcategory: "Kitchen Tools" };
  if (/glass/i.test(name) && /glass|drinkware/i.test(category))
    return { group: "Crockery", subcategory: "Glasses" };
  if (
    /Plastic Items|Lunch Box|Lunch Carrier|School Lunch|Water bottle|Water Bottles|Kids Water/i.test(
      category,
    )
  )
    return { group: "Crockery", subcategory: "Plastic Kitchen Items" };
  if (
    /Containers|Jars|Serving|Ceramics|Kitchenware|Kitchen Ware|Kitchen Items|Food Warmers|Air-tight/i.test(
      category,
    )
  )
    return { group: "Crockery", subcategory: "Serving & Storage" };
  return undefined;
}
const assigned = (group, names) =>
  names.map((name) => ({
    name,
    matches: (p) => {
      const placement = productPlacement(p);
      return placement?.group === group && placement.subcategory === name;
    },
  }));
export const taxonomyGroups = [
  {
    name: "Sheets",
    image: "premium-table-sheet",
    subcategories: [
      {
        name: "Dining Table Sheets",
        matches: (p) =>
          (source(p, "Sheets") && p.tagline === "Dining Table Sheets") ||
          (sheetsSource(p) && named(p, /dining|table mat|table runner|placemat/i)),
      },
      ...[
        "Dastarkhwan Sheets",
        "PVC Table Mat / Protective Sheets",
        "Self-Adhesive Marble Sheets",
      ].map((name) => ({
        name,
        matches: (p) => source(p, "Sheets") && p.tagline === name,
      })),
      {
        name: "Center & Side Table Sheets",
        matches: (p) =>
          p.id === "prod-c5fd53b3" ||
          (source(p, "Sheets") && p.tagline === "Center & Side Table Sheets"),
      },
      { name: "Dressing & Bedside Table Sheets", matches: (p) => p.id === "prod-53f5fe33" },
      {
        name: "Wallpaper Sheets",
        matches: (p) => p.id === "prod-7c584e73" || p.id === "white-marble-wall-sheet-10x5",
      },
    ],
  },
  {
    name: "Towels",
    image: "aqua-blue-bath-towel-set",
    subcategories: [
      { name: "Bath Towels", matches: (p) => source(p, "Towels") && named(p, /bath towel/i) },
      { name: "Hand Towels", matches: (p) => source(p, "Towels") && named(p, /hand towel/i) },
      { name: "Face Towels", matches: (p) => source(p, "Towels") && named(p, /face towel/i) },
      { name: "Towel Sets", matches: (p) => source(p, "Towels") && named(p, /towel set/i) },
    ],
  },

  {
    name: "Crockery",
    image: "crockery",
    subcategories: assigned("Crockery", [
      "Dinner Sets",
      "Cups & Mugs",
      "Glasses",
      "Jugs & Water Sets",
      "Serving & Storage",
      "Kitchen Tools",
      "Plastic Kitchen Items",
      "Cleaning Items",
    ]),
  },
  {
    name: "Household",
    image: "household",
    subcategories: assigned("Household", [
      "Electric Kettles",
      "Kitchen Gadgets",
      "Storage & Organizers",
      "Cleaning Essentials",
      "Home Utility Items",
      "Other Household Items",
    ]),
  },
];
export function findTaxonomy(value) {
  if (value === "Gadgets" || value === "House Gadgets") value = "Household";
  for (const group of taxonomyGroups) {
    if (group.name === value)
      return {
        group: group.name,
        matches: (p) =>
          (group.name === "Sheets" && p.category === "Sheets") ||
          group.subcategories.some((s) => s.matches(p)),
      };
    const sub = group.subcategories.find((s) => s.name === value);
    if (sub) return { group: group.name, subcategory: sub.name, matches: sub.matches };
  }
}
export const isTaxonomyCategory = (value) => Boolean(findTaxonomy(value));

