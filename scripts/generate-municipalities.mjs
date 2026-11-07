/**
 * Regenerates src/data/municipalities/<prefecture code>.json (cities, wards, towns and villages
 * with their official 5-digit code, Japanese name and English name).
 *
 *   npm i --no-save jp-local-gov wanakana
 *   node scripts/generate-municipalities.mjs
 *
 * Source: 全国地方公共団体コード (MIC, via the MIT-licensed jp-local-gov package, data of 2024-01-01).
 * English names are Hepburn romaji of the official readings, written without macrons
 * (Tokyo, Osaka, Chuo). The 6 Northern Territories villages are left out, and so are the
 * designated cities themselves (Yokohama...): people pick their ward instead.
 */
import { toRomaji } from "wanakana";
import fs from "node:fs";
import { findByCode } from "jp-local-gov";
const raw = [];
for (let p = 1; p <= 47; p++) {
  const pp = String(p).padStart(2, "0");
  for (let n = 1; n <= 999; n++) {
    const code = pp + String(n).padStart(3, "0");
    const e = findByCode(code);
    if (e && e.type !== "prefecture") raw.push({ code, ...e });
  }
}

const code5 = (e) => e.code.slice(0,5);
// Northern Territories (not administered by Japan): codes 01695–01700.
const entries = raw.filter((e) => !(code5(e) >= "01695" && code5(e) <= "01700"));

const SUFFIX = { "市":"City", "区":"Ward", "町":"Town", "村":"Village" };
const SUFFIX_KANA = { "市":["し"], "区":["く"], "町":["ちょう","まち"], "村":["そん","むら"] };

const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const SMALL = { "や":"ゃ", "ゆ":"ゅ", "よ":"ょ" };
/* The official readings often write ゃゅょ full-size ("ほんじよう" for Honjō). Fix the clear cases;
   the few real "Chiyo / Kiyo / Miya" syllables stay as they are. */
function fixKana(k) {
  return k
    .replace(/([きしちにひみりぎじぢびぴ])([やゆよ])う/g, (_, a, b) => a + SMALL[b] + "う")
    .replace(/([ぎびぴ])([やゆよ])/g, (_, a, b) => a + SMALL[b]);
}
function romaji(kana) {
  let r = toRomaji(fixKana(kana)).replace(/'/g, "");
  r = r.replace(/oo|ou/g, "o").replace(/uu/g, "u"); // no macrons: Tokyo, Osaka, Chuo
  return cap(r);
}
function stem(kanji, ruby) {
  const last = kanji.slice(-1);
  const kanas = SUFFIX_KANA[last];
  if (!kanas) return { kanji, ruby, type: null };
  const k = kanas.find((s) => ruby.endsWith(s));
  return { kanji: kanji.slice(0,-1), ruby: k ? ruby.slice(0,-k.length) : ruby, type: last };
}

const parents = new Map(); // municipality name -> ruby (designated cities)
for (const e of entries) if (e.type==="municipality") parents.set(e.prefectureName+e.municipalityName, e.municipalityRuby);
const wardParents = new Set(entries.filter(e=>e.type==="designated-city-ward").map(e=>e.prefectureName+e.municipalityName));

const OVERRIDES = { "12443": "Onjuku", "12463": "Kyonan", "33208": "Soja", "47326": "Chatan" };
const byPref = {};
for (const e of entries) {
  const pref = e.code.slice(0,2);
  let item;
  if (e.type === "designated-city-ward") {
    const parentRuby = parents.get(e.prefectureName+e.municipalityName) ?? "";
    const wardKanji = e.cityName.slice(e.municipalityName.length);
    const wardRuby = e.cityRuby.startsWith(parentRuby) ? e.cityRuby.slice(parentRuby.length) : e.cityRuby;
    const w = stem(wardKanji, wardRuby);
    const c = stem(e.municipalityName, parentRuby);
    item = { c: code5(e), ja: e.cityName, en: `${romaji(w.ruby)} Ward, ${romaji(c.ruby)}` };
  } else {
    if (wardParents.has(e.prefectureName+e.municipalityName)) continue; // pick a ward instead
    const s = stem(e.municipalityName, e.municipalityRuby);
    item = { c: code5(e), ja: e.municipalityName, en: romaji(s.ruby), _type: s.type };
  }
  if (OVERRIDES[item.c]) item.en = OVERRIDES[item.c];
  (byPref[pref] ??= []).push(item);
}
// Disambiguate English names that collide inside one prefecture (e.g. Fuchu City / Fuchu Town).
let collisions = 0;
for (const list of Object.values(byPref)) {
  const count = {};
  list.forEach((i) => (count[i.en] = (count[i.en] || 0) + 1));
  for (const i of list) if (count[i.en] > 1 && i._type) { i.en += " " + SUFFIX[i._type]; collisions++; }
  list.forEach((i) => delete i._type);
  list.sort((a, b) => a.c.localeCompare(b.c));
}
const OUT = process.argv[2] ?? "src/data/municipalities";
fs.mkdirSync(OUT, { recursive: true });
for (const [p,list] of Object.entries(byPref)) fs.writeFileSync(`${OUT}/${p}.json`, JSON.stringify(list,null,0).replace(/\},\{/g,"},\n{").replace(/^\[/,"[\n").replace(/\]$/,"\n]")+"\n");
console.log(Object.keys(byPref).length,"files");
