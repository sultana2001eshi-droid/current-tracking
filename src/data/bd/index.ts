// বাংলাদেশের প্রশাসনিক লোকেশন ডেটা — curated dataset
// Source: github.com/nuhil/bangladesh-geocode (open data, normalized)
// 8 divisions / 64 districts / 494 upazilas / 4540 unions
// গ্রাম/এলাকা = free text (no official complete dataset exists)

import divisions from "./divisions.json";
import districts from "./districts.json";
import upazilas from "./upazilas.json";

export interface BdDivision {
  id: string;
  bn: string;
  en: string;
}
export interface BdDistrict extends BdDivision {
  division_id: string;
}
export interface BdUpazila extends BdDivision {
  district_id: string;
}
export interface BdUnion extends BdDivision {
  upazila_id: string;
}

export const BD_DIVISIONS = divisions as BdDivision[];
export const BD_DISTRICTS = districts as BdDistrict[];
export const BD_UPAZILAS = upazilas as BdUpazila[];

// Lazy-load unions (~360KB) — only fetched when an upazila is selected
let _unionsCache: BdUnion[] | null = null;
let _unionsPromise: Promise<BdUnion[]> | null = null;

export const loadUnions = async (): Promise<BdUnion[]> => {
  if (_unionsCache) return _unionsCache;
  if (!_unionsPromise) {
    _unionsPromise = import("./unions.json").then((m) => {
      _unionsCache = m.default as BdUnion[];
      return _unionsCache;
    });
  }
  return _unionsPromise;
};

// Helpers
export const getDistrictsByDivision = (divisionId: string): BdDistrict[] =>
  BD_DISTRICTS.filter((d) => d.division_id === divisionId);

export const getUpazilasByDistrict = (districtId: string): BdUpazila[] =>
  BD_UPAZILAS.filter((u) => u.district_id === districtId);

export const getUnionsByUpazila = async (upazilaId: string): Promise<BdUnion[]> => {
  const all = await loadUnions();
  return all.filter((u) => u.upazila_id === upazilaId);
};
