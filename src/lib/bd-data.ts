// বাংলাদেশের বিভাগ ও জেলার ডেটা — searchable cascading dropdowns এর জন্য
export const DIVISIONS = [
  "ঢাকা",
  "চট্টগ্রাম",
  "রাজশাহী",
  "খুলনা",
  "বরিশাল",
  "সিলেট",
  "রংপুর",
  "ময়মনসিংহ",
] as const;

export type Division = (typeof DIVISIONS)[number];

export const DISTRICTS: Record<Division, string[]> = {
  "ঢাকা": ["ঢাকা", "গাজীপুর", "নারায়ণগঞ্জ", "টাঙ্গাইল", "মানিকগঞ্জ", "মুন্সিগঞ্জ", "নরসিংদী", "ফরিদপুর", "রাজবাড়ী", "গোপালগঞ্জ", "মাদারীপুর", "শরীয়তপুর", "কিশোরগঞ্জ"],
  "চট্টগ্রাম": ["চট্টগ্রাম", "কক্সবাজার", "কুমিল্লা", "নোয়াখালী", "ফেনী", "চাঁদপুর", "লক্ষ্মীপুর", "ব্রাহ্মণবাড়িয়া", "বান্দরবান", "রাঙ্গামাটি", "খাগড়াছড়ি"],
  "রাজশাহী": ["রাজশাহী", "বগুড়া", "পাবনা", "সিরাজগঞ্জ", "নওগাঁ", "নাটোর", "চাঁপাইনবাবগঞ্জ", "জয়পুরহাট"],
  "খুলনা": ["খুলনা", "যশোর", "সাতক্ষীরা", "কুষ্টিয়া", "বাগেরহাট", "চুয়াডাঙ্গা", "মাগুরা", "মেহেরপুর", "নড়াইল", "ঝিনাইদহ"],
  "বরিশাল": ["বরিশাল", "পটুয়াখালী", "ভোলা", "পিরোজপুর", "বরগুনা", "ঝালকাঠি"],
  "সিলেট": ["সিলেট", "মৌলভীবাজার", "হবিগঞ্জ", "সুনামগঞ্জ"],
  "রংপুর": ["রংপুর", "দিনাজপুর", "কুড়িগ্রাম", "গাইবান্ধা", "লালমনিরহাট", "নীলফামারী", "পঞ্চগড়", "ঠাকুরগাঁও"],
  "ময়মনসিংহ": ["ময়মনসিংহ", "জামালপুর", "নেত্রকোনা", "শেরপুর"],
};

// বাংলা সংখ্যা রূপান্তর
const BN_DIGITS = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
export const toBn = (n: number | string): string =>
  String(n).replace(/\d/g, (d) => BN_DIGITS[Number(d)]);

export const fmtBn = (n: number, decimals = 0): string =>
  toBn(n.toFixed(decimals));

// Slug helper
export const slugify = (s: string): string =>
  s.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^\u0980-\u09FFa-z0-9-]/g, "");

// Outage intensity bucket (0-4)
export const intensityBucket = (avgOutageHours: number): 0 | 1 | 2 | 3 | 4 => {
  if (avgOutageHours < 2) return 0;
  if (avgOutageHours < 5) return 1;
  if (avgOutageHours < 8) return 2;
  if (avgOutageHours < 11) return 3;
  return 4;
};

export const intensityLabel = (b: number): string =>
  ["খুব ভালো", "মোটামুটি", "চিন্তাজনক", "খারাপ", "ভয়াবহ"][b] || "অজানা";

// সময় বাংলায়
export const timeAgoBn = (dateStr: string): string => {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60) return `${toBn(Math.floor(diff))} সেকেন্ড আগে`;
  if (diff < 3600) return `${toBn(Math.floor(diff / 60))} মিনিট আগে`;
  if (diff < 86400) return `${toBn(Math.floor(diff / 3600))} ঘণ্টা আগে`;
  return `${toBn(Math.floor(diff / 86400))} দিন আগে`;
};
