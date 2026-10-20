// Customer navigation aliases; never rewrites database categories or relationships.
const groups: [string, string[], string?][] = [
  [
    "Crockery & Dining",
    ["Ceramics", "Serving & Dining", "Serving Plates", "Serving Bowls"],
    "7-pcs-bowl-set",
  ],
  [
    "Cups & Drinkware",
    ["Cups & Drinkware", "Tea Mugs", "Drinkware", "JUGS", "Tumbler"],
    "timy-mugs-group",
  ],
  ["Glasses", ["Glasses", "Glass Bottle"]],
  ["Serving & Dining", ["Serving & Dining", "Serving Plates", "Serving Bowls", "Serving Trays"]],
  ["Bowls", ["Serving Bowls", "Ceramics"]],
  [
    "Jars & Containers",
    ["Jars", "Containers", "Air-tight Containers", "food storage buckets"],
    "crown-jar-dryfruits-gold-tray",
  ],
  [
    "Kitchen",
    ["Kitchen Items", "Kitchen Ware", "Kitchenware", "Strainers", "Ice Cube Tray"],
    "crown-jar-spices-marble",
  ],
  [
    "Kitchenware",
    [
      "Kitchenware",
      "Kitchen Ware",
      "Kitchen Items",
      "Cutlery Stands",
      "Strainers",
      "Ice Cube Tray",
    ],
  ],
  [
    "Lunch Boxes & Lunch Carriers",
    ["Lunch Box", "Lunch Carrier", "Lunch Carriers", "School Lunch Boxes"],
  ],
  ["Water Bottles", ["Water bottle", "Water Bottles", "Kids Water bottle", "Glass Bottle"]],
  ["Food Warmers", ["Food Warmers"]],
  ["Serving Trays", ["Serving Trays"]],
  ["Sheets & Table Covers", ["Home Sheets & Covers", "Textiles"], "premium-table-sheet"],
  ["Bathroom", ["BATHROOM", "Buckets", "Baby Pot"]],
  ["Cleaning", ["Cleaning Items", "Cleaning Spray"]],
  [
    "Storage & Organizers",
    ["Storage Box", "Cutlery Stands", "Tissue Holder", "Tissue Box", "Kids Drawer", "Baskets"],
  ],
  ["Baskets", ["Baskets"]],
  ["Dustbins", ["Dustbins"]],
  ["Decoration & Gifts", ["Decoration & Gift Items", "Gift Set", "Lighting"]],
  [
    "Kids",
    [
      "Kids Stool",
      "Kids Chair",
      "Kids Table",
      "Kids Drawer",
      "Baby Pot",
      "School Lunch Boxes",
      "Kids Water bottle",
    ],
  ],
  ["Towels", ["Towels"], "aqua-blue-bath-towel-set"],
  ["Coolers", ["Cooler", "Water Dispenser"]],
  [
    "Other Home Essentials",
    [
      "Household",
      "Bundle",
      "Stool",
      "Chairs",
      "Furniture",
      "Plastic Items",
      "Watches",
      "Electronics & Gadgets",
      "Glory",
      "Omega",
      "JPI",
      "Three Star",
      "Rockstar",
      "Classic",
      "Prince Ware",
      "Elite Royal",
    ],
  ],
];
export const storefrontCategories = groups.map(([name, categories, image]) => ({
  name,
  categories,
  image,
}));
export function customerCategory(category: string) {
  return (
    storefrontCategories.find((g) => g.categories.includes(category))?.name ||
    "Other Home Essentials"
  );
}
