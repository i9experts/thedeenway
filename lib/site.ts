// Facts shared across every language. Source: TDS Parents' Handbook 2025–26.

export const site = {
  url: "https://www.thedeenwayschool.com",
  email: "admin@thedeenwayschool.net",
  facebook: [
    { label: "The Deenway School", href: "https://facebook.com/thedeenwayschool" },
    { label: "A.A. Ansari Campus", href: "https://facebook.com/tds.aaansari" },
    { label: "Faisalabad Campus", href: "https://facebook.com/thedeenwayfsl" },
  ],
  // Main admissions WhatsApp / phone line (Fatima Campus).
  whatsapp: "923342221788",
};

export type CampusId = "fatima" | "ansari" | "faisalabad";

export const campuses: {
  id: CampusId;
  city: "karachi" | "faisalabad";
  address: string;
  phones: { display: string; tel: string }[];
  whatsapp: string;
  image: string;
  mapQuery: string;
}[] = [
  {
    id: "fatima",
    city: "karachi",
    address: "D-8, Block-5, Shahrah-e-Jahangir, Gulberg Town, F.B. Area, Karachi, Sindh",
    phones: [{ display: "+92 334 222 1788", tel: "+923342221788" }],
    whatsapp: "923342221788",
    image: "circle-time",
    mapQuery: "D-8 Block 5 Shahrah-e-Jahangir Gulberg Town FB Area Karachi",
  },
  {
    id: "ansari",
    city: "karachi",
    address: "C-32, Block-11, Ziauddin Road, Gulberg Town, F.B. Area, Karachi, Sindh",
    phones: [
      { display: "+92 334 222 1787", tel: "+923342221787" },
      { display: "0301 110 3555", tel: "+923011103555" },
    ],
    whatsapp: "923342221787",
    image: "assembly-2",
    mapQuery: "C-32 Block 11 Ziauddin Road Gulberg Town FB Area Karachi",
  },
  {
    id: "faisalabad",
    city: "faisalabad",
    address: "40-W-101, Susan Road, Madina Town, Faisalabad, Punjab",
    phones: [
      { display: "0301 110 4555", tel: "+923011104555" },
      { display: "0301 116 8555", tel: "+923011168555" },
    ],
    whatsapp: "923011104555",
    image: "sports",
    mapQuery: "40-W-101 Susan Road Madina Town Faisalabad",
  },
];

export function mapsUrl(query: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

export function img(name: string, size: 800 | 1600 = 1600) {
  return `/images/${name}-${size}.webp`;
}

export const downloads = [
  { id: "handbook", file: "/docs/parents-handbook-2025-26.pdf", size: "9.9 MB" },
  { id: "preprimary", file: "/docs/pre-primary-assessment-syllabus.pdf", size: "1.2 MB" },
  { id: "primary", file: "/docs/diagnostic-assessment-primary.pdf", size: "2.2 MB" },
  { id: "middle", file: "/docs/middle-school-admission-assessment.pdf", size: "2.5 MB" },
] as const;

export type DownloadId = (typeof downloads)[number]["id"];

// Fee schedule 2025–26 as published in the Parents' Handbook (PKR).
export const fees = [
  { stage: "preprimary", admission: 20000, monthly: 10000 },
  { stage: "primary", admission: 22000, monthly: 12000 },
  { stage: "middle", admission: 24000, monthly: 14500 },
  { stage: "secondary", admission: 26000, monthly: 15000 },
] as const;

export type StageId = (typeof fees)[number]["stage"];
