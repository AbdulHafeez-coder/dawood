export const CATEGORY_TAXONOMY_VERSION = "2026-10-20";

const source = (product, category) => product.category === category;
const named = (product, pattern) => pattern.test(product.name);
const sheetsSource = (product) => source(product, "Home Sheets & Covers");
const crockerySources = new Set([
  "Containers",
  "Jars",
  "Glasses",
  "Tea Mugs",
  "Serving Bowls",
  "Serving Plates",
  "Serving & Dining",
  "Cups & Drinkware",
  "Ceramics",
  "Food Warmers",
  "Kitchenware",
  "Kitchen Ware",
  "Glass Bottle",
  "Drinkware",
  "JUGS",
  "Tumbler",
]);

export const taxonomyGroups = [
  {
    name: "Sheets",
    image: "premium-table-sheet",
    subcategories: [
      {
        name: "Dining Table Sheets",
        matches: (p) => sheetsSource(p) && named(p, /dining|table mat|table runner|placemat/i),
      },
      { name: "Center & Side Table Sheets", matches: (p) => p.id === "prod-c5fd53b3" },
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
    name: "Gadgets",
    image: "gadgets-category",
    subcategories: [
      {
        name: "Other Electrical Appliances",
        matches: (p) =>
          source(p, "Electronics & Gadgets") && named(p, /electric|electronic|juicer|chopper/i),
      },
      {
        name: "Useful Household Gadgets",
        matches: (p) =>
          source(p, "Electronics & Gadgets") && !named(p, /electric|electronic|juicer|chopper/i),
      },
    ],
  },
  {
    name: "Crockery",
    image: "7-pcs-bowl-set",
    subcategories: [
      {
        name: "Cups, Glasses & Mugs",
        matches: (p) => crockerySources.has(p.category) && named(p, /cup|glass|mug|water set/i),
      },
      {
        name: "Plates & Bowls",
        matches: (p) => crockerySources.has(p.category) && named(p, /plate|bowl|dish/i),
      },
      {
        name: "Dinner Sets",
        matches: (p) => crockerySources.has(p.category) && named(p, /dinner.?set/i),
      },
      {
        name: "Kitchen Storage Containers & Jars",
        matches: (p) => crockerySources.has(p.category) && named(p, /container|jar/i),
      },
      {
        name: "Plastic Crockery and Tableware",
        matches: (p) =>
          crockerySources.has(p.category) &&
          !named(p, /cup|glass|mug|water set|plate|bowl|dish|dinner.?set|container|jar/i),
      },
    ],
  },
];

export function findTaxonomy(value) {
  if (!value) return undefined;
  return taxonomyGroups
    .flatMap((group) => [
      {
        group: group.name,
        matches: (product) =>
          group.subcategories.some((subcategory) => subcategory.matches(product)),
      },
      ...group.subcategories.map((subcategory) => ({
        group: group.name,
        subcategory: subcategory.name,
        matches: subcategory.matches,
      })),
    ])
    .find((entry) => entry.group === value || entry.subcategory === value);
}

export const isTaxonomyCategory = (value) => Boolean(findTaxonomy(value));
