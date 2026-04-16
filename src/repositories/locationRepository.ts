// Location repository — reads from local curated BD dataset.
// Future-safe: swap internals here to call Supabase/API without touching UI.
import {
  BD_DIVISIONS,
  BD_DISTRICTS,
  BD_UPAZILAS,
  getDistrictsByDivision,
  getUpazilasByDistrict,
  getUnionsByUpazila,
  type BdDivision,
  type BdDistrict,
  type BdUpazila,
  type BdUnion,
} from "@/data/bd";

export const locationRepository = {
  divisions: (): BdDivision[] => BD_DIVISIONS,
  districts: (divisionId: string): BdDistrict[] => getDistrictsByDivision(divisionId),
  upazilas: (districtId: string): BdUpazila[] => getUpazilasByDistrict(districtId),
  unions: (upazilaId: string): Promise<BdUnion[]> => getUnionsByUpazila(upazilaId),
  findDivisionByBn: (bn: string) => BD_DIVISIONS.find((d) => d.bn === bn),
  findDistrictByBn: (bn: string) => BD_DISTRICTS.find((d) => d.bn === bn),
  findUpazilaByBn: (bn: string) => BD_UPAZILAS.find((u) => u.bn === bn),
};

// Recently selected village shortcuts (localStorage)
const RECENT_KEY = "bd-recent-villages";
const MAX_RECENT = 5;

export const recentVillages = {
  list: (): string[] => {
    try {
      return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
    } catch {
      return [];
    }
  },
  add: (village: string) => {
    if (!village.trim()) return;
    const list = recentVillages.list().filter((v) => v !== village);
    list.unshift(village);
    localStorage.setItem(RECENT_KEY, JSON.stringify(list.slice(0, MAX_RECENT)));
  },
};
