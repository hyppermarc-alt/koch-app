// ─────────────────────────────────────────────────────────────
// Stammdaten: Zutaten, Herd-Mappings, Rezepte
// Nährwerte pro 100 g sind Durchschnittswerte (Richtwerte für den Prototyp).
// Vor dem Launch durch eine lizenzierte Quelle (z. B. BLS) ersetzen.
// ─────────────────────────────────────────────────────────────

export type Section =
  | 'Obst & Gemüse'
  | 'Kühlregal'
  | 'Fleisch & Fisch'
  | 'Nudeln, Reis & Co.'
  | 'Konserven & Gläser'
  | 'Brot & Frühstück'
  | 'Öl & Gewürze'

export type Unit = 'g' | 'ml' | 'TL' | 'EL' | 'Stück' | 'Zehe' | 'Prise' | 'Scheibe' | 'Filet'

export interface Ingredient {
  id: string
  name: string
  kcal: number // pro 100 g
  protein: number
  fat: number
  carbs: number
  section: Section
  /** Gramm pro Anzeige-Einheit */
  units?: Partial<Record<Unit, number>>
  /** Basics, die die meisten zuhause haben – erscheinen nicht automatisch auf der Einkaufsliste */
  pantry?: boolean
  /** Hinweis bei kalorienreichen Zutaten */
  kcalTip?: string
  pack?: { g: number; label: string }
  hidden?: boolean // z. B. Wasser
}

export const INGREDIENTS: Record<string, Ingredient> = {
  rapsoel: { id: 'rapsoel', name: 'Rapsöl', kcal: 884, protein: 0, fat: 100, carbs: 0, section: 'Öl & Gewürze', units: { TL: 4.5, EL: 13 }, pantry: true, kcalTip: 'Öl ist die größte Kalorienfalle: immer abmessen, nie „Schuss“ aus der Flasche.' },
  salz: { id: 'salz', name: 'Salz', kcal: 0, protein: 0, fat: 0, carbs: 0, section: 'Öl & Gewürze', units: { Prise: 0.5, TL: 5 }, pantry: true },
  pfeffer: { id: 'pfeffer', name: 'Pfeffer', kcal: 0, protein: 0, fat: 0, carbs: 0, section: 'Öl & Gewürze', units: { Prise: 0.3 }, pantry: true },
  wasser: { id: 'wasser', name: 'Wasser', kcal: 0, protein: 0, fat: 0, carbs: 0, section: 'Öl & Gewürze', units: { ml: 1 }, pantry: true, hidden: true },
  paprikapulver: { id: 'paprikapulver', name: 'Paprikapulver edelsüß', kcal: 0, protein: 0, fat: 0, carbs: 0, section: 'Öl & Gewürze', units: { TL: 2 }, pantry: true },
  kreuzkuemmel: { id: 'kreuzkuemmel', name: 'Kreuzkümmel, gemahlen', kcal: 0, protein: 0, fat: 0, carbs: 0, section: 'Öl & Gewürze', units: { TL: 2 }, pantry: true },
  currypulver: { id: 'currypulver', name: 'Currypulver', kcal: 325, protein: 13, fat: 14, carbs: 25, section: 'Öl & Gewürze', units: { TL: 2 }, pantry: true },
  zimt: { id: 'zimt', name: 'Zimt', kcal: 0, protein: 0, fat: 0, carbs: 0, section: 'Öl & Gewürze', units: { Prise: 0.5 }, pantry: true },
  bruehe: { id: 'bruehe', name: 'Gemüsebrühe (Pulver)', kcal: 200, protein: 8, fat: 8, carbs: 25, section: 'Öl & Gewürze', units: { TL: 5 }, pantry: true },
  sojasauce: { id: 'sojasauce', name: 'Sojasauce', kcal: 60, protein: 8, fat: 0, carbs: 6, section: 'Konserven & Gläser', units: { EL: 16 } },
  honig: { id: 'honig', name: 'Honig', kcal: 304, protein: 0, fat: 0, carbs: 82, section: 'Brot & Frühstück', units: { TL: 7 }, kcalTip: 'Reiner Zucker – 1 TL reicht für den Geschmack.' },

  zwiebel: { id: 'zwiebel', name: 'Zwiebel', kcal: 40, protein: 1.2, fat: 0.1, carbs: 9, section: 'Obst & Gemüse', units: { Stück: 80 } },
  knoblauch: { id: 'knoblauch', name: 'Knoblauch', kcal: 149, protein: 6, fat: 0.5, carbs: 33, section: 'Obst & Gemüse', units: { Zehe: 4 }, pack: { g: 40, label: 'Knolle' } },
  ingwer: { id: 'ingwer', name: 'Ingwer (frisch)', kcal: 80, protein: 1.8, fat: 0.8, carbs: 18, section: 'Obst & Gemüse' },
  paprika: { id: 'paprika', name: 'rote Paprika', kcal: 31, protein: 1, fat: 0.3, carbs: 6, section: 'Obst & Gemüse', units: { Stück: 150 } },
  zucchini: { id: 'zucchini', name: 'Zucchini', kcal: 17, protein: 1.2, fat: 0.3, carbs: 3, section: 'Obst & Gemüse', units: { Stück: 200 } },
  spinat: { id: 'spinat', name: 'Babyspinat', kcal: 23, protein: 2.9, fat: 0.4, carbs: 1.4, section: 'Obst & Gemüse', pack: { g: 125, label: 'Beutel 125 g' } },
  brokkoli: { id: 'brokkoli', name: 'Brokkoli', kcal: 34, protein: 2.8, fat: 0.4, carbs: 7, section: 'Obst & Gemüse' },
  kartoffeln: { id: 'kartoffeln', name: 'Kartoffeln, festkochend', kcal: 77, protein: 2, fat: 0.1, carbs: 17, section: 'Obst & Gemüse', pack: { g: 1000, label: 'Netz 1 kg' } },
  zitrone: { id: 'zitrone', name: 'Zitrone', kcal: 30, protein: 0.7, fat: 0.3, carbs: 9, section: 'Obst & Gemüse', units: { Stück: 100 } },
  petersilie: { id: 'petersilie', name: 'Petersilie', kcal: 36, protein: 3, fat: 0.8, carbs: 6, section: 'Obst & Gemüse' },
  beeren: { id: 'beeren', name: 'Beerenmischung (TK)', kcal: 45, protein: 1, fat: 0.3, carbs: 10, section: 'Obst & Gemüse', pack: { g: 300, label: 'Beutel 300 g' } },

  haehnchen: { id: 'haehnchen', name: 'Hähnchenbrustfilet', kcal: 110, protein: 23, fat: 1.5, carbs: 0, section: 'Fleisch & Fisch' },
  lachs: { id: 'lachs', name: 'Lachsfilet ohne Haut', kcal: 208, protein: 20, fat: 13.5, carbs: 0, section: 'Fleisch & Fisch', units: { Filet: 125 }, kcalTip: 'Lachs hat gesunde Fette – trotzdem bei 125 g pro Person bleiben.' },

  feta: { id: 'feta', name: 'Feta', kcal: 264, protein: 14, fat: 21, carbs: 4, section: 'Kühlregal', pack: { g: 200, label: 'Packung 200 g' }, kcalTip: 'Feta ist würzig – wenig reicht. Rest hält im Kühlschrank in Salzlake ca. 3 Tage.' },
  eier: { id: 'eier', name: 'Eier (Größe M)', kcal: 143, protein: 12.6, fat: 9.5, carbs: 0.7, section: 'Kühlregal', units: { Stück: 60 }, pack: { g: 360, label: '6er-Packung' } },
  magerquark: { id: 'magerquark', name: 'Magerquark', kcal: 67, protein: 12, fat: 0.2, carbs: 4, section: 'Kühlregal', pack: { g: 250, label: 'Becher 250 g' } },
  joghurt: { id: 'joghurt', name: 'Naturjoghurt 1,5 %', kcal: 47, protein: 3.5, fat: 1.5, carbs: 4.5, section: 'Kühlregal', units: { EL: 15 }, pack: { g: 500, label: 'Becher 500 g' } },
  kokosmilch: { id: 'kokosmilch', name: 'Kokosmilch light', kcal: 75, protein: 0.8, fat: 7, carbs: 2, section: 'Konserven & Gläser', pack: { g: 400, label: 'Dose 400 ml' }, kcalTip: 'Unbedingt „light“ nehmen – normale Kokosmilch hat fast das Dreifache.' },

  vollkornnudeln: { id: 'vollkornnudeln', name: 'Vollkorn-Penne', kcal: 350, protein: 13, fat: 2.5, carbs: 64, section: 'Nudeln, Reis & Co.', pack: { g: 500, label: 'Packung 500 g' } },
  reis: { id: 'reis', name: 'Basmatireis', kcal: 350, protein: 8, fat: 0.6, carbs: 78, section: 'Nudeln, Reis & Co.', pack: { g: 500, label: 'Packung 500 g' } },
  linsen: { id: 'linsen', name: 'Rote Linsen', kcal: 340, protein: 24, fat: 1.5, carbs: 50, section: 'Nudeln, Reis & Co.', pack: { g: 500, label: 'Packung 500 g' } },
  haferflocken: { id: 'haferflocken', name: 'Haferflocken (zart)', kcal: 370, protein: 13.5, fat: 7, carbs: 59, section: 'Brot & Frühstück', units: { EL: 10 }, pack: { g: 500, label: 'Packung 500 g' } },
  vollkornbrot: { id: 'vollkornbrot', name: 'Vollkornbrot', kcal: 220, protein: 7, fat: 1.5, carbs: 41, section: 'Brot & Frühstück', units: { Scheibe: 50 } },

  passierte_tomaten: { id: 'passierte_tomaten', name: 'Passierte Tomaten', kcal: 32, protein: 1.4, fat: 0.2, carbs: 5, section: 'Konserven & Gläser', units: { ml: 1 }, pack: { g: 500, label: 'Packung 500 g' } },
  stueckige_tomaten: { id: 'stueckige_tomaten', name: 'Stückige Tomaten (Dose)', kcal: 22, protein: 1.2, fat: 0.2, carbs: 3.5, section: 'Konserven & Gläser', pack: { g: 400, label: 'Dose 400 g' } },
}

// ─────────────────────────────────────────────────────────────
// Herd-Matching
// Rezepte speichern Hitze abstrakt (0–10). Diese Tabelle übersetzt.
// ─────────────────────────────────────────────────────────────

export type StoveType = 'induktion' | 'ceran' | 'gas'

export interface StoveProfile {
  type: StoveType
  scaleMax: 9 | 12 // bei Gas ignoriert
  booster: boolean
  offset: -1 | 0 | 1 // Kalibrierung aus Feedback
}

export const STOVES: Record<StoveType, { name: string; emoji: string; desc: string; preheat: string; hint: string }> = {
  induktion: {
    name: 'Induktion',
    emoji: '⚡',
    desc: 'Glatte Glasfläche, wird nur dort warm, wo der Topf steht. Ein Magnet bleibt am Topfboden haften.',
    preheat: 'Induktion ist blitzschnell: Pfanne braucht nur ca. 1 Min.',
    hint: 'Induktion reagiert sofort – wenn es zu heiß wird, einfach 1 Stufe runter.',
  },
  ceran: {
    name: 'Ceran / Glaskeramik',
    emoji: '🔴',
    desc: 'Glatte Glasfläche, die Kochzone glüht rot und bleibt lange heiß.',
    preheat: 'Ceran ist träge: Pfanne ca. 2–3 Min vorheizen.',
    hint: 'Ceran kühlt langsam ab – zum Runterschalten lieber 1 Min früher drehen.',
  },
  gas: {
    name: 'Gas',
    emoji: '🔥',
    desc: 'Offene Flamme, Regler mit Flammensymbolen statt Zahlen.',
    preheat: 'Gas ist sofort heiß: Pfanne ca. 1 Min vorheizen.',
    hint: 'Die Flamme darf nie über den Pfannenboden hinausragen.',
  },
}

export const HEAT_WORDS: Record<number, string> = {
  0: 'aus',
  1: 'ganz niedrig',
  2: 'niedrig',
  3: 'niedrig',
  4: 'mittel-niedrig',
  5: 'mittel',
  6: 'mittel',
  7: 'mittel-hoch',
  8: 'hoch',
  9: 'hoch',
  10: 'höchste Stufe',
}

export interface HeatLabel {
  /** z. B. "6 von 9" oder "mittlere Flamme" */
  setting: string
  /** Allgemeine Beschreibung, z. B. "mittel-hoch" */
  word: string
  level: number
}

export function translateHeat(level: number, stove: StoveProfile): HeatLabel {
  const l = Math.max(0, Math.min(10, level === 0 ? 0 : level + stove.offset))
  const word = HEAT_WORDS[l]
  if (l === 0) return { setting: 'Herd aus', word, level: 0 }
  if (stove.type === 'gas') {
    const flame = l <= 3 ? 'kleine Flamme' : l <= 6 ? 'mittlere Flamme' : l <= 8 ? 'mittelgroße Flamme' : 'große Flamme'
    return { setting: flame, word, level: l }
  }
  const max = stove.scaleMax
  if (l === 10 && stove.type === 'induktion' && stove.booster) {
    return { setting: 'Booster (P)', word, level: l }
  }
  const step = Math.max(1, Math.round((l / 10) * max))
  return { setting: `Stufe ${step} von ${max}`, word, level: l }
}

// ─────────────────────────────────────────────────────────────
// Rezepte
// Schritt-Texte: [zutat] wird durch die skalierte Menge + Name ersetzt,
// [zutat*0.5] durch die halbe Menge. {hitze} durch die Herd-Stufe.
// ─────────────────────────────────────────────────────────────

export interface RecipeIngredient {
  key: string // eindeutiger Schlüssel im Rezept
  ing: string // Zutaten-ID
  amount: number
  unit: Unit
  prep?: string // „fein gewürfelt“
  optional?: boolean
}

export type StepKind = 'prep' | 'heat' | 'action' | 'oven' | 'plate'

export interface Step {
  kind: StepKind
  title: string
  text: string
  heat?: number // 0–10
  timer?: number // Sekunden
  cue?: string // Woran erkenne ich, dass es fertig ist?
  warn?: string // Achtung!
  tip?: string // Kleiner Tipp
}

export interface Recipe {
  id: string
  title: string
  subtitle: string
  emoji: string
  gradient: [string, string]
  level: 1 | 2 | 3
  minutes: number
  servings: number
  meal: 'Frühstück' | 'Mittag & Abend'
  tags: string[]
  equipment: string[]
  ingredients: RecipeIngredient[]
  mise: string[] // Vorbereitung vor dem ersten Hitzeschritt
  steps: Step[]
}

export const RECIPES: Recipe[] = [
  {
    id: 'tomaten-feta-pasta',
    title: 'Cremige Tomaten-Feta-Pasta',
    subtitle: 'mit Babyspinat – in 25 Minuten auf dem Teller',
    emoji: '🍝',
    gradient: ['#F26B3A', '#B5301B'],
    level: 1,
    minutes: 25,
    servings: 2,
    meal: 'Mittag & Abend',
    tags: ['vegetarisch', 'Klassiker'],
    equipment: ['1 großer Topf mit Deckel', '1 Pfanne (ca. 28 cm)', '1 Sieb', '1 Schneidebrett', '1 Messer', '1 Kochlöffel'],
    ingredients: [
      { key: 'nudeln', ing: 'vollkornnudeln', amount: 160, unit: 'g' },
      { key: 'zwiebel', ing: 'zwiebel', amount: 1, unit: 'Stück', prep: 'fein gewürfelt' },
      { key: 'knoblauch', ing: 'knoblauch', amount: 1, unit: 'Zehe', prep: 'fein gehackt' },
      { key: 'oel', ing: 'rapsoel', amount: 1, unit: 'TL' },
      { key: 'tomaten', ing: 'passierte_tomaten', amount: 400, unit: 'ml' },
      { key: 'spinat', ing: 'spinat', amount: 100, unit: 'g' },
      { key: 'feta', ing: 'feta', amount: 60, unit: 'g', prep: 'zerbröselt' },
      { key: 'salz', ing: 'salz', amount: 1, unit: 'TL' },
      { key: 'pfeffer', ing: 'pfeffer', amount: 1, unit: 'Prise' },
    ],
    mise: [
      'Zwiebel schälen und in kleine Würfel schneiden (so groß wie eine Erbse).',
      'Knoblauchzehe schälen und so fein wie möglich hacken.',
      'Spinat in einem Sieb kurz abspülen und abtropfen lassen.',
      'Feta mit den Fingern in eine kleine Schüssel bröseln.',
      'Passierte Tomaten öffnen und bereitstellen.',
    ],
    steps: [
      { kind: 'heat', title: 'Nudelwasser aufsetzen', text: 'Großen Topf zu ¾ mit Wasser füllen und Deckel drauf. Herd auf {hitze}.', heat: 10, cue: 'Das Wasser blubbert kräftig (ca. 8 Min).', tip: 'Mit Deckel kocht Wasser deutlich schneller – das spart Zeit und Strom.' },
      { kind: 'action', title: 'Nudeln ins Wasser', text: 'Deckel ab. [salz] ins Wasser streuen, dann [nudeln] hineingeben und einmal umrühren.', warn: 'Deckel vorsichtig zu dir hin kippen – der Dampf ist sehr heiß.' },
      { kind: 'heat', title: 'Nudeln kochen lassen', text: 'Herd auf {hitze} stellen. Nudeln OHNE Deckel kochen. Starte den Timer – er läuft weiter, während du die Sauce machst.', heat: 7, timer: 600, cue: 'Nudeln sind weich, haben aber innen noch etwas Biss.', warn: 'Ohne Deckel! Sonst kocht der Topf über.' },
      { kind: 'heat', title: 'Pfanne vorheizen', text: 'Pfanne auf eine zweite Kochzone. [oel] hineingeben. Herd auf {hitze}.', heat: 5, timer: 60, cue: 'Das Öl wird dünnflüssig und glänzt.' },
      { kind: 'action', title: 'Zwiebeln andünsten', text: '[zwiebel] in die Pfanne geben. Alle 30 Sekunden umrühren.', timer: 240, cue: 'Die Zwiebeln sind glasig (durchsichtig), aber noch nicht braun.' },
      { kind: 'action', title: 'Knoblauch dazu', text: '[knoblauch] dazugeben und 1 Minute ständig rühren.', timer: 60, warn: 'Knoblauch verbrennt schnell und wird dann bitter – nicht weggehen!' },
      { kind: 'action', title: 'Tomaten rein', text: '[tomaten] in die Pfanne gießen. [pfeffer] und eine Prise Salz dazu. Herd auf {hitze}.', heat: 4, timer: 300, cue: 'Die Sauce blubbert leicht und wird etwas dicker.', tip: 'Spritzt es? Dann eine Stufe runter.' },
      { kind: 'action', title: 'Spinat unterheben', text: '[spinat] auf die Sauce legen und unterrühren.', timer: 60, cue: 'Der Spinat ist zusammengefallen und dunkelgrün.' },
      { kind: 'action', title: 'Nudeln abgießen', text: 'Sieb ins Spülbecken stellen. Topf mit Topflappen greifen und Nudeln ins Sieb schütten.', warn: 'Topf immer vom Körper weg kippen – Dampf!' },
      { kind: 'heat', title: 'Alles vermengen', text: 'Nudeln in die Pfanne geben und mit der Sauce mischen. Herd {hitze}.', heat: 0 },
      { kind: 'plate', title: 'Anrichten', text: 'Auf 2 Teller verteilen und [feta] darüberstreuen. Fertig!', tip: 'Ein Foto machen lohnt sich – das hast du selbst gekocht!' },
    ],
  },
  {
    id: 'haehnchen-gemuese-pfanne',
    title: 'Honig-Soja-Hähnchenpfanne',
    subtitle: 'mit Paprika, Zucchini und Basmatireis',
    emoji: '🍗',
    gradient: ['#E9A23B', '#A4561A'],
    level: 1,
    minutes: 30,
    servings: 2,
    meal: 'Mittag & Abend',
    tags: ['proteinreich'],
    equipment: ['1 kleiner Topf mit Deckel', '1 große Pfanne', '1 Sieb', '2 Schneidebretter (eins nur fürs Fleisch)', '1 Messer', '1 Pfannenwender', '1 Teller'],
    ingredients: [
      { key: 'reis', ing: 'reis', amount: 120, unit: 'g' },
      { key: 'wasser', ing: 'wasser', amount: 240, unit: 'ml' },
      { key: 'haehnchen', ing: 'haehnchen', amount: 250, unit: 'g', prep: 'in Streifen' },
      { key: 'paprika', ing: 'paprika', amount: 1, unit: 'Stück', prep: 'in Streifen' },
      { key: 'zucchini', ing: 'zucchini', amount: 1, unit: 'Stück', prep: 'in Halbmonden' },
      { key: 'zwiebel', ing: 'zwiebel', amount: 1, unit: 'Stück', prep: 'in Streifen' },
      { key: 'oel', ing: 'rapsoel', amount: 2, unit: 'TL' },
      { key: 'soja', ing: 'sojasauce', amount: 2, unit: 'EL' },
      { key: 'honig', ing: 'honig', amount: 1, unit: 'TL' },
      { key: 'salz', ing: 'salz', amount: 1, unit: 'Prise' },
      { key: 'pfeffer', ing: 'pfeffer', amount: 1, unit: 'Prise' },
    ],
    mise: [
      'ERST das Gemüse: Paprika halbieren, Kerne raus, in fingerdicke Streifen schneiden.',
      'Zucchini längs halbieren, dann in 1 cm dicke Halbmonde schneiden.',
      'Zwiebel schälen, halbieren und in Streifen schneiden.',
      'DANN das Fleisch auf dem zweiten Brett: Hähnchen in fingerdicke Streifen schneiden.',
      'Hände und Messer gründlich mit Seife waschen.',
      'Sojasauce und Honig in einer Tasse verrühren.',
    ],
    steps: [
      { kind: 'action', title: 'Reis waschen', text: '[reis] in ein Sieb geben und unter kaltem Wasser abspülen, bis das Wasser fast klar ist.', tip: 'So klebt der Reis später nicht.' },
      { kind: 'heat', title: 'Reis aufkochen', text: 'Reis mit [wasser] und einer Prise Salz in den kleinen Topf. Herd auf {hitze}, ohne Deckel.', heat: 9, cue: 'Das Wasser kocht sprudelnd (ca. 3–4 Min).' },
      { kind: 'heat', title: 'Reis quellen lassen', text: 'Deckel drauf, Herd auf {hitze}. Starte den Timer und lass den Deckel zu – nicht reinschauen!', heat: 2, timer: 720, cue: 'Das Wasser ist komplett aufgesogen.', tip: 'Der Timer läuft weiter, während du das Hähnchen brätst.' },
      { kind: 'heat', title: 'Pfanne heiß machen', text: '[oel*0.5] in die große Pfanne. Herd auf {hitze}.', heat: 7, timer: 90, cue: 'Ein Tropfen Wasser zischt sofort, wenn er in die Pfanne fällt.' },
      { kind: 'action', title: 'Hähnchen anbraten', text: '[haehnchen] in die Pfanne legen, nebeneinander. 2 Min NICHT bewegen, dann wenden.', timer: 300, cue: 'Außen goldbraun, innen nicht mehr rosa (ein Stück zum Testen aufschneiden).', warn: 'Hähnchen muss komplett durch sein – innen weiß, kein rosa.' },
      { kind: 'action', title: 'Hähnchen parken', text: 'Hähnchen mit dem Pfannenwender auf einen Teller legen.' },
      { kind: 'action', title: 'Gemüse braten', text: '[oel*0.5] in die Pfanne. [zwiebel], [paprika] und [zucchini] hinein. Alle 1 Min umrühren.', timer: 300, cue: 'Gemüse hat braune Stellen, ist aber noch bissfest.' },
      { kind: 'action', title: 'Alles zusammen', text: 'Hähnchen zurück in die Pfanne. Soja-Honig-Mischung darübergießen ([soja], [honig]). Herd auf {hitze}.', heat: 4, timer: 60, cue: 'Die Sauce glänzt und überzieht alles.' },
      { kind: 'heat', title: 'Herd aus', text: 'Herd {hitze}. [pfeffer] darüber.', heat: 0 },
      { kind: 'plate', title: 'Anrichten', text: 'Reis mit einer Gabel auflockern, auf 2 Teller verteilen, Hähnchenpfanne daneben geben.' },
    ],
  },
  {
    id: 'shakshuka',
    title: 'Shakshuka',
    subtitle: 'Eier in würziger Paprika-Tomatensauce',
    emoji: '🍳',
    gradient: ['#E8553A', '#7C2D12'],
    level: 1,
    minutes: 25,
    servings: 2,
    meal: 'Mittag & Abend',
    tags: ['vegetarisch', 'eine Pfanne'],
    equipment: ['1 Pfanne mit Deckel', '1 Schneidebrett', '1 Messer', '1 Kochlöffel', '1 Tasse'],
    ingredients: [
      { key: 'oel', ing: 'rapsoel', amount: 1, unit: 'TL' },
      { key: 'zwiebel', ing: 'zwiebel', amount: 1, unit: 'Stück', prep: 'gewürfelt' },
      { key: 'paprika', ing: 'paprika', amount: 1, unit: 'Stück', prep: 'gewürfelt' },
      { key: 'knoblauch', ing: 'knoblauch', amount: 1, unit: 'Zehe', prep: 'fein gehackt' },
      { key: 'kreuzkuemmel', ing: 'kreuzkuemmel', amount: 1, unit: 'TL' },
      { key: 'paprikapulver', ing: 'paprikapulver', amount: 1, unit: 'TL' },
      { key: 'tomaten', ing: 'passierte_tomaten', amount: 400, unit: 'ml' },
      { key: 'eier', ing: 'eier', amount: 4, unit: 'Stück' },
      { key: 'feta', ing: 'feta', amount: 40, unit: 'g', prep: 'zerbröselt' },
      { key: 'petersilie', ing: 'petersilie', amount: 5, unit: 'g', optional: true },
      { key: 'brot', ing: 'vollkornbrot', amount: 2, unit: 'Scheibe' },
      { key: 'salz', ing: 'salz', amount: 1, unit: 'Prise' },
    ],
    mise: [
      'Zwiebel schälen und würfeln.',
      'Paprika halbieren, Kerne raus, in kleine Würfel schneiden.',
      'Knoblauch schälen und fein hacken.',
      'Kreuzkümmel und Paprikapulver in eine Tasse geben.',
      'Feta zerbröseln, Petersilie grob zupfen (falls du welche hast).',
    ],
    steps: [
      { kind: 'heat', title: 'Pfanne vorheizen', text: '[oel] in die Pfanne. Herd auf {hitze}.', heat: 5, timer: 60, cue: 'Das Öl glänzt und wird dünnflüssig.' },
      { kind: 'action', title: 'Gemüse andünsten', text: '[zwiebel] und [paprika] in die Pfanne. Ab und zu umrühren.', timer: 300, cue: 'Die Paprika ist weich, die Zwiebeln glasig.' },
      { kind: 'action', title: 'Würzen', text: '[knoblauch] und die Gewürze ([kreuzkuemmel], [paprikapulver]) dazu. 30 Sekunden rühren.', timer: 30, cue: 'Es duftet richtig gut.', warn: 'Gewürze und Knoblauch verbrennen schnell – ständig rühren!' },
      { kind: 'action', title: 'Sauce köcheln', text: '[tomaten] und [salz] dazu, umrühren. Herd auf {hitze}.', heat: 4, timer: 300, cue: 'Die Sauce ist etwas eingedickt.' },
      { kind: 'action', title: 'Mulden machen', text: 'Mit dem Kochlöffel 4 kleine Mulden in die Sauce drücken.' },
      { kind: 'action', title: 'Eier hinein', text: 'Je 1 Ei erst in eine Tasse aufschlagen, dann vorsichtig in eine Mulde gleiten lassen. So mit allen [eier].', tip: 'Mit der Tasse landet keine Schale in der Pfanne – und das Eigelb bleibt ganz.' },
      { kind: 'heat', title: 'Eier stocken lassen', text: 'Deckel drauf. Herd auf {hitze}.', heat: 3, timer: 420, cue: 'Das Eiweiß ist komplett weiß, das Eigelb glänzt noch.' },
      { kind: 'heat', title: 'Herd aus', text: 'Herd {hitze}. [feta] und [petersilie] darüberstreuen.', heat: 0 },
      { kind: 'plate', title: 'Servieren', text: 'Direkt aus der Pfanne essen – mit [brot] zum Tunken.' },
    ],
  },
  {
    id: 'linsen-curry',
    title: 'Rote-Linsen-Curry',
    subtitle: 'cremig, sättigend und voller Eiweiß',
    emoji: '🍛',
    gradient: ['#F2B134', '#B9561C'],
    level: 2,
    minutes: 30,
    servings: 2,
    meal: 'Mittag & Abend',
    tags: ['vegan', 'Meal-Prep'],
    equipment: ['1 mittelgroßer Topf', '1 Schneidebrett', '1 Messer', '1 Teelöffel (zum Ingwer schälen)', '1 Kochlöffel', '1 Messbecher'],
    ingredients: [
      { key: 'oel', ing: 'rapsoel', amount: 1, unit: 'TL' },
      { key: 'zwiebel', ing: 'zwiebel', amount: 1, unit: 'Stück', prep: 'gewürfelt' },
      { key: 'knoblauch', ing: 'knoblauch', amount: 1, unit: 'Zehe', prep: 'fein gehackt' },
      { key: 'ingwer', ing: 'ingwer', amount: 10, unit: 'g', prep: 'fein gehackt' },
      { key: 'curry', ing: 'currypulver', amount: 2, unit: 'TL' },
      { key: 'linsen', ing: 'linsen', amount: 120, unit: 'g' },
      { key: 'tomaten', ing: 'stueckige_tomaten', amount: 400, unit: 'g' },
      { key: 'kokos', ing: 'kokosmilch', amount: 200, unit: 'ml' },
      { key: 'bruehe', ing: 'bruehe', amount: 1, unit: 'TL' },
      { key: 'wasser', ing: 'wasser', amount: 300, unit: 'ml' },
      { key: 'spinat', ing: 'spinat', amount: 100, unit: 'g' },
      { key: 'zitrone', ing: 'zitrone', amount: 0.5, unit: 'Stück' },
    ],
    mise: [
      'Zwiebel schälen und würfeln.',
      'Knoblauch schälen und fein hacken.',
      'Ingwer mit dem Rand eines Teelöffels schälen (geht leichter als mit dem Messer), dann fein hacken.',
      'Linsen in einem Sieb abspülen.',
      'Brühpulver in 300 ml heißem Wasser auflösen.',
    ],
    steps: [
      { kind: 'heat', title: 'Topf vorheizen', text: '[oel] in den Topf. Herd auf {hitze}.', heat: 5, timer: 60, cue: 'Das Öl glänzt.' },
      { kind: 'action', title: 'Zwiebeln andünsten', text: '[zwiebel] in den Topf, gelegentlich rühren.', timer: 180, cue: 'Glasig, nicht braun.' },
      { kind: 'action', title: 'Aromen rösten', text: '[knoblauch], [ingwer] und [curry] dazu, 30 Sekunden rühren.', timer: 30, cue: 'Es duftet intensiv nach Curry.', warn: 'Currypulver brennt schnell an – sofort weiter zum nächsten Schritt.' },
      { kind: 'action', title: 'Ablöschen', text: '[linsen], [tomaten], [kokos] und die Brühe ([wasser]) in den Topf. Gut umrühren.' },
      { kind: 'heat', title: 'Aufkochen', text: 'Herd auf {hitze}.', heat: 8, cue: 'Es blubbert am Rand.' },
      { kind: 'heat', title: 'Köcheln lassen', text: 'Herd auf {hitze}. Ohne Deckel köcheln, alle 3 Min umrühren.', heat: 3, timer: 900, cue: 'Die Linsen sind zerfallen, das Curry ist cremig.', warn: 'Linsen setzen gern am Boden an – umrühren nicht vergessen.' },
      { kind: 'action', title: 'Spinat unterheben', text: '[spinat] unterrühren.', timer: 60, cue: 'Spinat ist zusammengefallen.' },
      { kind: 'heat', title: 'Abschmecken', text: 'Herd {hitze}. [zitrone] darüber auspressen, probieren, ggf. Salz nachgeben.', heat: 0, tip: 'Zitrone macht den Geschmack frisch – das ist der Profi-Trick.' },
      { kind: 'plate', title: 'Anrichten', text: 'In 2 Schalen füllen. Reste halten im Kühlschrank 3 Tage.' },
    ],
  },
  {
    id: 'ofen-lachs',
    title: 'Ofen-Lachs mit Kartoffeln',
    subtitle: 'und Brokkoli vom Blech – fast ohne Abwasch',
    emoji: '🐟',
    gradient: ['#F08A5D', '#2F6F5E'],
    level: 2,
    minutes: 40,
    servings: 2,
    meal: 'Mittag & Abend',
    tags: ['Omega-3', 'ein Blech'],
    equipment: ['1 Backblech', 'Backpapier', '1 Schneidebrett', '1 Messer', '1 große Schüssel', '1 kleine Schüssel', 'Topflappen'],
    ingredients: [
      { key: 'kartoffeln', ing: 'kartoffeln', amount: 500, unit: 'g', prep: 'geviertelt' },
      { key: 'brokkoli', ing: 'brokkoli', amount: 300, unit: 'g', prep: 'in Röschen' },
      { key: 'lachs', ing: 'lachs', amount: 2, unit: 'Filet' },
      { key: 'oel', ing: 'rapsoel', amount: 2, unit: 'TL' },
      { key: 'zitrone', ing: 'zitrone', amount: 0.5, unit: 'Stück' },
      { key: 'joghurt', ing: 'joghurt', amount: 150, unit: 'g' },
      { key: 'knoblauch', ing: 'knoblauch', amount: 0.5, unit: 'Zehe', prep: 'fein gerieben' },
      { key: 'salz', ing: 'salz', amount: 2, unit: 'Prise' },
      { key: 'pfeffer', ing: 'pfeffer', amount: 2, unit: 'Prise' },
    ],
    mise: [
      'Kartoffeln gründlich waschen (schälen nicht nötig) und vierteln.',
      'Brokkoli in kleine Röschen schneiden, den Strunk schälen und in Scheiben schneiden.',
      'Backblech mit Backpapier auslegen.',
    ],
    steps: [
      { kind: 'oven', title: 'Ofen vorheizen', text: 'Ofen auf 200 °C Ober-/Unterhitze stellen (oder 180 °C Umluft).', timer: 600, cue: 'Die Ofenlampe/-anzeige meldet: Temperatur erreicht.' },
      { kind: 'action', title: 'Kartoffeln würzen', text: 'Kartoffeln in der großen Schüssel mit [oel*0.5] und einer Prise Salz mischen.' },
      { kind: 'oven', title: 'Kartoffeln in den Ofen', text: 'Kartoffeln mit der Schnittfläche nach unten aufs Blech legen. Blech auf die mittlere Schiene.', timer: 1200, cue: 'Kartoffeln sind an der Unterseite goldbraun.', warn: 'Topflappen benutzen – das Blech wird sehr heiß.' },
      { kind: 'action', title: 'Dip anrühren', text: 'Während die Kartoffeln garen: [joghurt] mit [knoblauch], Salz, Pfeffer und ein paar Tropfen Zitrone verrühren.' },
      { kind: 'action', title: 'Brokkoli vorbereiten', text: 'Brokkoli in der großen Schüssel mit [oel*0.5] und einer Prise Salz mischen.' },
      { kind: 'oven', title: 'Lachs & Brokkoli dazu', text: 'Blech rausholen. Kartoffeln zur Seite schieben, [brokkoli] und [lachs] aufs Blech legen. Lachs salzen und pfeffern. Wieder in den Ofen.', timer: 780, cue: 'Der Lachs lässt sich mit einer Gabel leicht zerteilen und ist innen hellrosa.' },
      { kind: 'plate', title: 'Anrichten', text: 'Ofen aus. Alles auf 2 Teller, [zitrone] darüber auspressen, Dip daneben.' },
    ],
  },
  {
    id: 'beeren-quark-bowl',
    title: 'Beeren-Quark-Bowl',
    subtitle: 'Frühstück, das bis mittags satt macht',
    emoji: '🫐',
    gradient: ['#B84A8A', '#4B2A7B'],
    level: 1,
    minutes: 5,
    servings: 1,
    meal: 'Frühstück',
    tags: ['kein Herd', 'proteinreich'],
    equipment: ['1 Schüssel', '1 Löffel'],
    ingredients: [
      { key: 'quark', ing: 'magerquark', amount: 200, unit: 'g' },
      { key: 'wasser', ing: 'wasser', amount: 30, unit: 'ml' },
      { key: 'beeren', ing: 'beeren', amount: 100, unit: 'g' },
      { key: 'hafer', ing: 'haferflocken', amount: 3, unit: 'EL' },
      { key: 'honig', ing: 'honig', amount: 1, unit: 'TL' },
      { key: 'zimt', ing: 'zimt', amount: 1, unit: 'Prise' },
    ],
    mise: ['TK-Beeren am Vorabend in den Kühlschrank legen – dann sind sie morgens aufgetaut (oder 1 Min in die Mikrowelle).'],
    steps: [
      { kind: 'action', title: 'Quark cremig rühren', text: '[quark] in die Schüssel, [wasser] dazu und glatt rühren.', cue: 'Der Quark ist cremig wie Joghurt.' },
      { kind: 'action', title: 'Toppings drauf', text: '[beeren] und [hafer] auf den Quark geben.' },
      { kind: 'plate', title: 'Verfeinern', text: '[honig] darüberträufeln und [zimt] drüberstreuen. Guten Appetit!' },
    ],
  },
]
