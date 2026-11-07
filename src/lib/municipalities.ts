import { PREFECTURES } from "@/lib/prefectures";

/**
 * Cities, wards, towns and villages of Japan (全国地方公共団体コード), one file per prefecture.
 * `c` is the 5-digit code, `ja` the Japanese name, `en` the English name.
 * Files load on demand, so the profile form only fetches the prefecture the creator picked.
 * Regenerate with scripts/generate-municipalities.mjs.
 */
export interface Municipality {
  c: string;
  ja: string;
  en: string;
}

const LOADERS: Record<string, () => Promise<{ default: Municipality[] }>> = {
  "01": () => import("@/data/municipalities/01.json"),
  "02": () => import("@/data/municipalities/02.json"),
  "03": () => import("@/data/municipalities/03.json"),
  "04": () => import("@/data/municipalities/04.json"),
  "05": () => import("@/data/municipalities/05.json"),
  "06": () => import("@/data/municipalities/06.json"),
  "07": () => import("@/data/municipalities/07.json"),
  "08": () => import("@/data/municipalities/08.json"),
  "09": () => import("@/data/municipalities/09.json"),
  "10": () => import("@/data/municipalities/10.json"),
  "11": () => import("@/data/municipalities/11.json"),
  "12": () => import("@/data/municipalities/12.json"),
  "13": () => import("@/data/municipalities/13.json"),
  "14": () => import("@/data/municipalities/14.json"),
  "15": () => import("@/data/municipalities/15.json"),
  "16": () => import("@/data/municipalities/16.json"),
  "17": () => import("@/data/municipalities/17.json"),
  "18": () => import("@/data/municipalities/18.json"),
  "19": () => import("@/data/municipalities/19.json"),
  "20": () => import("@/data/municipalities/20.json"),
  "21": () => import("@/data/municipalities/21.json"),
  "22": () => import("@/data/municipalities/22.json"),
  "23": () => import("@/data/municipalities/23.json"),
  "24": () => import("@/data/municipalities/24.json"),
  "25": () => import("@/data/municipalities/25.json"),
  "26": () => import("@/data/municipalities/26.json"),
  "27": () => import("@/data/municipalities/27.json"),
  "28": () => import("@/data/municipalities/28.json"),
  "29": () => import("@/data/municipalities/29.json"),
  "30": () => import("@/data/municipalities/30.json"),
  "31": () => import("@/data/municipalities/31.json"),
  "32": () => import("@/data/municipalities/32.json"),
  "33": () => import("@/data/municipalities/33.json"),
  "34": () => import("@/data/municipalities/34.json"),
  "35": () => import("@/data/municipalities/35.json"),
  "36": () => import("@/data/municipalities/36.json"),
  "37": () => import("@/data/municipalities/37.json"),
  "38": () => import("@/data/municipalities/38.json"),
  "39": () => import("@/data/municipalities/39.json"),
  "40": () => import("@/data/municipalities/40.json"),
  "41": () => import("@/data/municipalities/41.json"),
  "42": () => import("@/data/municipalities/42.json"),
  "43": () => import("@/data/municipalities/43.json"),
  "44": () => import("@/data/municipalities/44.json"),
  "45": () => import("@/data/municipalities/45.json"),
  "46": () => import("@/data/municipalities/46.json"),
  "47": () => import("@/data/municipalities/47.json"),
};

/** JIS prefecture code ("13" for Tokyo). PREFECTURES is in JIS order. */
export function prefectureCode(prefecture: string): string | null {
  const index = PREFECTURES.indexOf(prefecture);
  return index < 0 ? null : String(index + 1).padStart(2, "0");
}

export async function loadMunicipalities(prefecture: string): Promise<Municipality[]> {
  const code = prefectureCode(prefecture);
  return code ? (await LOADERS[code]()).default : [];
}

/** The municipality with this code, or null when the code is unknown. */
export async function findMunicipality(code: string): Promise<Municipality | null> {
  const loader = LOADERS[code.slice(0, 2)];
  if (!loader) return null;
  return (await loader()).default.find((m) => m.c === code) ?? null;
}

export const municipalityLabel = (municipality: Municipality, locale: string) =>
  locale === "ja" ? municipality.ja : municipality.en;
