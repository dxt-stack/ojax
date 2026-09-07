/**
 * OjaX catalog — category codes are stable identifiers stored in the DB.
 * Keep codes stable once released; change labels freely.
 */

export interface CategoryDef {
  code: string;
  label: string;
  icon: string; // matches client icon set
  color: string; // brand tint used for chips (hex)
  sub: { code: string; label: string }[];
}

export const CATEGORIES: CategoryDef[] = [
  {
    code: "phones",
    label: "Phones & Tablets",
    icon: "smartphone",
    color: "#0e9f6e",
    sub: [
      { code: "smartphones", label: "Smartphones" },
      { code: "tablets", label: "Tablets & iPads" },
      { code: "accessories", label: "Phone accessories" },
      { code: "smartwatches", label: "Smartwatches" },
    ],
  },
  {
    code: "computing",
    label: "Computing",
    icon: "laptop",
    color: "#2563eb",
    sub: [
      { code: "laptops", label: "Laptops" },
      { code: "desktops", label: "Desktops & Monitors" },
      { code: "peripherals", label: "Keyboards, mice & parts" },
      { code: "printers", label: "Printers & scanners" },
      { code: "storage", label: "Storage & drives" },
    ],
  },
  {
    code: "electronics",
    label: "Electronics",
    icon: "tv",
    color: "#7c3aed",
    sub: [
      { code: "audio", label: "Headphones & speakers" },
      { code: "cameras", label: "Cameras & photography" },
      { code: "gaming", label: "Gaming & consoles" },
      { code: "tvs", label: "TVs & home theatre" },
      { code: "wearables", label: "Wearables" },
      { code: "other-electronics", label: "Other electronics" },
    ],
  },
  {
    code: "fashion",
    label: "Fashion",
    icon: "shirt",
    color: "#e11d48",
    sub: [
      { code: "men", label: "Men's clothing" },
      { code: "women", label: "Women's clothing" },
      { code: "shoes", label: "Shoes & sneakers" },
      { code: "bags", label: "Bags & backpacks" },
      { code: "accessories-fashion", label: "Accessories" },
    ],
  },
  {
    code: "textbooks",
    label: "Textbooks",
    icon: "book",
    color: "#d97706",
    sub: [
      { code: "engineering", label: "Engineering & tech" },
      { code: "sciences", label: "Sciences & medicine" },
      { code: "business", label: "Business & law" },
      { code: "arts", label: "Arts & humanities" },
      { code: "exam-prep", label: "Exam prep (JAMB, GRE…)" },
    ],
  },
  {
    code: "home",
    label: "Home & Furniture",
    icon: "sofa",
    color: "#059669",
    sub: [
      { code: "furniture", label: "Furniture" },
      { code: "appliances", label: "Appliances" },
      { code: "kitchen", label: "Kitchen & dining" },
      { code: "bedding", label: "Bedding & décor" },
      { code: "lighting", label: "Lighting" },
    ],
  },
  {
    code: "sports",
    label: "Sports & Outdoors",
    icon: "dumbbell",
    color: "#ea580c",
    sub: [
      { code: "gym", label: "Gym & fitness" },
      { code: "bikes", label: "Bikes & scooters" },
      { code: "football", label: "Football & jerseys" },
      { code: "outdoors", label: "Outdoor gear" },
    ],
  },
  {
    code: "hobbies",
    label: "Hobbies & Music",
    icon: "music",
    color: "#db2777",
    sub: [
      { code: "instruments", label: "Instruments" },
      { code: "art", label: "Art & craft" },
      { code: "collectibles", label: "Collectibles" },
      { code: "gaming-hobby", label: "Board & card games" },
    ],
  },
  {
    code: "beauty",
    label: "Beauty & Health",
    icon: "sparkles",
    color: "#c026d3",
    sub: [
      { code: "skincare", label: "Skincare & makeup" },
      { code: "hair", label: "Hair & wigs" },
      { code: "health", label: "Health & wellness" },
    ],
  },
  {
    code: "services",
    label: "Services",
    icon: "briefcase",
    color: "#0d9488",
    sub: [
      { code: "tutoring", label: "Tutoring & lessons" },
      { code: "tech-services", label: "Tech & design gigs" },
      { code: "event-services", label: "Event services" },
      { code: "other-services", label: "Other services" },
    ],
  },
  {
    code: "food",
    label: "Food & Groceries",
    icon: "food",
    color: "#16a34a",
    sub: [
      { code: "snacks", label: "Snacks & treats" },
      { code: "drinks", label: "Drinks" },
      { code: "provisions", label: "Provisions" },
      { code: "homemade", label: "Homemade & small chops" },
    ],
  },
  {
    code: "other",
    label: "Everything Else",
    icon: "grid",
    color: "#64748b",
    sub: [{ code: "misc", label: "Miscellaneous" }],
  },
];

export function categoryByCode(code: string): CategoryDef | undefined {
  return CATEGORIES.find((c) => c.code === code);
}

export const CONDITIONS = [
  { code: "brand-new", label: "Brand new (sealed/unused)", hint: "Never used, tags/box intact" },
  { code: "like-new", label: "Like new", hint: "Used once or twice, flawless" },
  { code: "used-excellent", label: "Used — excellent", hint: "Light wear, fully working" },
  { code: "used-good", label: "Used — good", hint: "Normal wear for its age, works well" },
  { code: "used-fair", label: "Used — fair", hint: "Visible wear; ask the seller for details" },
  { code: "refurbished", label: "Refurbished", hint: "Professionally restored" },
  { code: "broken-for-parts", label: "Broken / for parts", hint: "Doesn't fully work — parts or repair" },
] as const;

export type ConditionCode = (typeof CONDITIONS)[number]["code"];

export function conditionLabel(code: string): string {
  return CONDITIONS.find((c) => c.code === code)?.label ?? code;
}

export const LISTING_STATUSES = ["active", "paused", "sold", "deleted"] as const;

export const EVENT_CATEGORIES = [
  { code: "career", label: "Career & Networking" },
  { code: "academic", label: "Academic & Seminars" },
  { code: "hackathons", label: "Hackathons & Tech" },
  { code: "socials", label: "Socials & Parties" },
  { code: "sports-events", label: "Sports & Games" },
  { code: "arts", label: "Arts, Music & Culture" },
  { code: "community", label: "Community & Volunteering" },
  { code: "religious", label: "Religious & Fellowship" },
] as const;

export interface University {
  code: string;
  name: string;
  city: string;
  state: string;
}

export const UNIVERSITIES: University[] = [
  { code: "UNILAG", name: "University of Lagos", city: "Lagos", state: "Lagos" },
  { code: "LASU", name: "Lagos State University", city: "Ojo", state: "Lagos" },
  { code: "UI", name: "University of Ibadan", city: "Ibadan", state: "Oyo" },
  { code: "OAU", name: "Obafemi Awolowo University", city: "Ile-Ife", state: "Osun" },
  { code: "UNIBEN", name: "University of Benin", city: "Benin City", state: "Edo" },
  { code: "COVENANT", name: "Covenant University", city: "Ota", state: "Ogun" },
  { code: "FUNAAB", name: "Federal University of Agriculture, Abeokuta", city: "Abeokuta", state: "Ogun" },
  { code: "UNN", name: "University of Nigeria, Nsukka", city: "Nsukka", state: "Enugu" },
  { code: "ABU", name: "Ahmadu Bello University", city: "Zaria", state: "Kaduna" },
  { code: "UNILORIN", name: "University of Ilorin", city: "Ilorin", state: "Kwara" },
  { code: "FUTA", name: "Federal University of Technology, Akure", city: "Akure", state: "Ondo" },
  { code: "FUTMINNA", name: "Federal University of Technology, Minna", city: "Minna", state: "Niger" },
  { code: "BUK", name: "Bayero University Kano", city: "Kano", state: "Kano" },
  { code: "UNIMAID", name: "University of Maiduguri", city: "Maiduguri", state: "Borno" },
  { code: "UNIUYO", name: "University of Uyo", city: "Uyo", state: "Akwa Ibom" },
  { code: "UNIPORT", name: "University of Port Harcourt", city: "Port Harcourt", state: "Rivers" },
  { code: "DELSU", name: "Delta State University", city: "Abraka", state: "Delta" },
  { code: "LAUTECH", name: "Ladoke Akintola University of Technology", city: "Ogbomoso", state: "Oyo" },
  { code: "UNIZIK", name: "Nnamdi Azikiwe University", city: "Awka", state: "Anambra" },
  { code: "AAUA", name: "Adekunle Ajasin University", city: "Akungba-Akoko", state: "Ondo" },
  { code: "UI-BABCOCK", name: "Babcock University", city: "Ilishan-Remo", state: "Ogun" },
  { code: "RSUST", name: "Rivers State University", city: "Port Harcourt", state: "Rivers" },
  { code: "EDO-STATE", name: "Edo State University Uzairue", city: "Uzairue", state: "Edo" },
  { code: "UNILAG-NIGERIAN", name: "Nigerian Defence Academy", city: "Kaduna", state: "Kaduna" },
  { code: "ATBU", name: "Abubakar Tafawa Balewa University", city: "Bauchi", state: "Bauchi" },
  { code: "YABATECH", name: "Yaba College of Technology", city: "Yaba", state: "Lagos" },
];

export function universityByCode(code: string): University | undefined {
  return UNIVERSITIES.find((u) => u.code === code);
}
