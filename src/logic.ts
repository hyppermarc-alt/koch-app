import { INGREDIENTS, translateHeat, type Recipe, type RecipeIngredient, type StoveProfile, type Unit } from './data'

// ───────────── Mengen & Nährwerte ─────────────

export function gramsOf(ri: RecipeIngredient, factor = 1): number {
  const ing = INGREDIENTS[ri.ing]
  const amount = ri.amount * factor
  if (ri.unit === 'g' || ri.unit === 'ml') return amount
  const perUnit = ing.units?.[ri.unit]
  if (perUnit == null) {
    console.warn(`Keine Umrechnung für ${ri.unit} bei ${ing.name}`)
    return 0
  }
  return amount * perUnit
}

export function kcalOf(ri: RecipeIngredient, factor = 1): number {
  return (gramsOf(ri, factor) * INGREDIENTS[ri.ing].kcal) / 100
}

export interface Nutrition {
  kcal: number
  protein: number
  fat: number
  carbs: number
}

export function recipeNutritionPerServing(r: Recipe): Nutrition {
  const total = r.ingredients.reduce(
    (acc, ri) => {
      const g = gramsOf(ri)
      const ing = INGREDIENTS[ri.ing]
      acc.kcal += (g * ing.kcal) / 100
      acc.protein += (g * ing.protein) / 100
      acc.fat += (g * ing.fat) / 100
      acc.carbs += (g * ing.carbs) / 100
      return acc
    },
    { kcal: 0, protein: 0, fat: 0, carbs: 0 },
  )
  return {
    kcal: Math.round(total.kcal / r.servings),
    protein: Math.round(total.protein / r.servings),
    fat: Math.round(total.fat / r.servings),
    carbs: Math.round(total.carbs / r.servings),
  }
}

const FRACTIONS: [number, string][] = [
  [0.25, '¼'],
  [0.5, '½'],
  [0.75, '¾'],
  [1 / 3, '⅓'],
  [2 / 3, '⅔'],
]

export function formatNumber(n: number, unit: Unit): string {
  if (unit === 'g' || unit === 'ml') {
    if (n >= 100) return String(Math.round(n / 5) * 5)
    if (n >= 10) return String(Math.round(n))
    return String(Math.round(n * 10) / 10).replace('.', ',')
  }
  const whole = Math.floor(n + 1e-9)
  const rest = n - whole
  if (rest < 0.08) return String(whole)
  if (rest > 0.92) return String(whole + 1)
  const frac = FRACTIONS.reduce((best, f) => (Math.abs(f[0] - rest) < Math.abs(best[0] - rest) ? f : best))
  return whole === 0 ? frac[1] : `${whole} ${frac[1]}`
}

export function formatAmount(ri: RecipeIngredient, factor = 1): string {
  const n = ri.amount * factor
  const num = formatNumber(n, ri.unit)
  if (ri.unit === 'Stück') return num
  if (ri.unit === 'Zehe') return `${num} ${n > 1 ? 'Zehen' : 'Zehe'}`
  if (ri.unit === 'Prise') return `${num} ${n > 1 ? 'Prisen' : 'Prise'}`
  if (ri.unit === 'Scheibe') return `${num} ${n > 1 ? 'Scheiben' : 'Scheibe'}`
  if (ri.unit === 'Filet') return `${num} ${n > 1 ? 'Filets' : 'Filet'}`
  return `${num} ${ri.unit}`
}

export function ingredientLabel(ri: RecipeIngredient, factor = 1): string {
  const ing = INGREDIENTS[ri.ing]
  return `${formatAmount(ri, factor)} ${ing.name}`
}

// ───────────── Schritt-Texte rendern ─────────────

export type TextPart =
  | { t: 'text'; v: string }
  | { t: 'amount'; v: string }
  | { t: 'heat'; v: string; word: string }

export function renderStep(text: string, recipe: Recipe, factor: number, stove: StoveProfile, heat?: number): TextPart[] {
  const parts: TextPart[] = []
  const re = /\[(\w+)(?:\*([\d.]+))?\]|\{hitze\}/g
  let last = 0
  let m: RegExpExecArray | null
  while ((m = re.exec(text))) {
    if (m.index > last) parts.push({ t: 'text', v: text.slice(last, m.index) })
    if (m[0] === '{hitze}') {
      const h = translateHeat(heat ?? 0, stove)
      parts.push({ t: 'heat', v: h.level === 0 ? 'ausschalten' : h.setting, word: h.word })
    } else {
      const ri = recipe.ingredients.find((x) => x.key === m![1])
      if (ri) {
        const f = factor * (m[2] ? Number(m[2]) : 1)
        parts.push({ t: 'amount', v: ingredientLabel(ri, f) })
      } else {
        parts.push({ t: 'text', v: m[0] })
      }
    }
    last = m.index + m[0].length
  }
  if (last < text.length) parts.push({ t: 'text', v: text.slice(last) })
  return parts
}

// ───────────── Kalorienziel ─────────────

export type Sex = 'w' | 'm' | 'd'
export type Activity = 'sitzend' | 'leicht' | 'aktiv'
export type Tempo = 'entspannt' | 'zuegig'

export interface Profile {
  sex: Sex
  birthYear: number
  heightCm: number
  weightKg: number
  activity: Activity
  goal: 'abnehmen' | 'halten'
  tempo: Tempo
  pregnant: boolean
}

export const ACTIVITY: Record<Activity, { factor: number; label: string; desc: string }> = {
  sitzend: { factor: 1.2, label: 'Meistens sitzend', desc: 'Bürojob, kaum Sport' },
  leicht: { factor: 1.375, label: 'Etwas Bewegung', desc: 'Viel zu Fuß oder 1–2× Sport pro Woche' },
  aktiv: { factor: 1.55, label: 'Viel Bewegung', desc: 'Körperliche Arbeit oder 3–5× Sport pro Woche' },
}

export interface Target {
  bmr: number
  tdee: number
  target: number
  deficit: number
  floorApplied: boolean
  bmi: number
  note?: string
  weeklyKg: number
}

export function calcTarget(p: Profile, year = new Date().getFullYear()): Target {
  const age = year - p.birthYear
  // Mifflin-St Jeor
  const base = 10 * p.weightKg + 6.25 * p.heightCm - 5 * age
  const bmr = p.sex === 'm' ? base + 5 : p.sex === 'w' ? base - 161 : base - 78
  const tdee = bmr * ACTIVITY[p.activity].factor
  const bmi = p.weightKg / (p.heightCm / 100) ** 2
  const floor = p.sex === 'm' ? 1500 : p.sex === 'w' ? 1200 : 1350

  let deficit = 0
  let note: string | undefined
  if (p.pregnant) {
    note = 'In Schwangerschaft und Stillzeit rechnen wir ohne Defizit. Bitte sprich Abnehmpläne mit deiner Ärztin oder deinem Arzt ab.'
  } else if (bmi < 18.5) {
    note = 'Dein Gewicht liegt bereits im unteren Bereich. Wir zeigen dir deshalb nur einen Richtwert zum Halten.'
  } else if (p.goal === 'abnehmen') {
    deficit = p.tempo === 'zuegig' ? 500 : 300
    deficit = Math.min(deficit, tdee * 0.2)
  }

  let target = tdee - deficit
  let floorApplied = false
  if (target < floor && deficit > 0) {
    target = Math.min(tdee, floor)
    floorApplied = true
    deficit = Math.max(0, tdee - target)
  }
  target = Math.round(target / 10) * 10
  // 7.000 kcal ≈ 1 kg Körperfett (grobe Faustregel)
  const weeklyKg = Math.round(((deficit * 7) / 7000) * 10) / 10
  return { bmr: Math.round(bmr), tdee: Math.round(tdee), target, deficit: Math.round(deficit), floorApplied, bmi: Math.round(bmi * 10) / 10, note, weeklyKg }
}

// ───────────── Einkaufsliste ─────────────

export interface ShoppingEntry {
  recipeId: string
  servings: number
}

export interface ShoppingLine {
  ingId: string
  name: string
  grams: number
  kcal: number
  section: string
  pantry: boolean
  packHint?: string
  kcalTip?: string
  recipes: string[]
}

export function buildShoppingList(entries: ShoppingEntry[], recipes: Recipe[]): ShoppingLine[] {
  const map = new Map<string, ShoppingLine>()
  for (const e of entries) {
    const r = recipes.find((x) => x.id === e.recipeId)
    if (!r) continue
    const factor = e.servings / r.servings
    for (const ri of r.ingredients) {
      const ing = INGREDIENTS[ri.ing]
      if (ing.hidden) continue
      const g = gramsOf(ri, factor)
      const line = map.get(ing.id) ?? {
        ingId: ing.id,
        name: ing.name,
        grams: 0,
        kcal: 0,
        section: ing.section,
        pantry: !!ing.pantry,
        kcalTip: ing.kcalTip,
        recipes: [],
      }
      line.grams += g
      line.kcal += (g * ing.kcal) / 100
      if (!line.recipes.includes(r.title)) line.recipes.push(r.title)
      map.set(ing.id, line)
    }
  }
  for (const line of map.values()) {
    const ing = INGREDIENTS[line.ingId]
    if (ing.pack) {
      const n = Math.ceil(line.grams / ing.pack.g)
      line.packHint = `${n}× ${ing.pack.label}`
    } else if (ing.units?.Stück) {
      const n = Math.ceil(line.grams / ing.units.Stück - 0.05)
      line.packHint = `${n} Stück`
    }
    line.kcal = Math.round(line.kcal)
  }
  return [...map.values()]
}

export function formatGrams(g: number): string {
  if (g >= 1000) return `${(Math.round(g / 100) / 10).toString().replace('.', ',')} kg`
  if (g >= 10) return `${Math.round(g)} g`
  return `${Math.round(g * 10) / 10} g`.replace('.', ',')
}

// ───────────── Speicher ─────────────

export function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

export function save(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* privates Fenster o. Ä. */
  }
}

export function todayKey(d = new Date()): string {
  return d.toISOString().slice(0, 10)
}

// ───────────── Passwort-Sperre ─────────────
// Achtung: Das ist nur eine leichte Test-Sperre im Browser, kein echter Schutz.
export const PASSWORD_SHA256 = 'ee631abba379d5ec8b285a199a7b47b193aefeb4433ffed88dea442aef4715de'

export async function sha256(text: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('')
}
