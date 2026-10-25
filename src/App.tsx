import { useEffect, useMemo, useRef, useState } from 'react'
import { INGREDIENTS, RECIPES, STOVES, translateHeat, type Recipe, type StoveProfile, type StoveType } from './data'
import {
  ACTIVITY,
  buildShoppingList,
  calcTarget,
  formatAmount,
  formatGrams,
  kcalOf,
  load,
  PASSWORD_SHA256,
  recipeNutritionPerServing,
  renderStep,
  save,
  sha256,
  todayKey,
  type Activity,
  type Profile,
  type ShoppingEntry,
  type TextPart,
} from './logic'

// ───────────── Typen & Speicher-Schlüssel ─────────────

interface LogItem {
  id: string
  title: string
  kcal: number
  recipeId?: string
}
type Log = Record<string, LogItem[]>
interface Cooked {
  recipeId: string
  at: string
}

type View =
  | { name: 'home' }
  | { name: 'recipe'; id: string }
  | { name: 'cook'; id: string; servings: number }
  | { name: 'shop' }
  | { name: 'profile' }

const K = {
  unlocked: 'kochapp.unlocked',
  profile: 'kochapp.profile',
  stove: 'kochapp.stove',
  log: 'kochapp.log',
  shop: 'kochapp.shop',
  checked: 'kochapp.checked',
  cooked: 'kochapp.cooked',
}

function usePersisted<T>(key: string, initial: T) {
  const [v, setV] = useState<T>(() => load(key, initial))
  useEffect(() => {
    save(key, v)
  }, [key, v])
  return [v, setV] as const
}

const uid = () => Math.random().toString(36).slice(2, 10)

// Level-Freischaltung: so viele gekochte Gerichte braucht man pro Level
const LEVEL_UNLOCK: Record<number, number> = { 1: 0, 2: 2, 3: 5 }

// ───────────── App ─────────────

export default function App() {
  const [unlocked, setUnlocked] = usePersisted(K.unlocked, false)
  const [profile, setProfile] = usePersisted<Profile | null>(K.profile, null)
  const [stove, setStove] = usePersisted<StoveProfile | null>(K.stove, null)
  const [log, setLog] = usePersisted<Log>(K.log, {})
  const [shop, setShop] = usePersisted<ShoppingEntry[]>(K.shop, [])
  const [checked, setChecked] = usePersisted<string[]>(K.checked, [])
  const [cooked, setCooked] = usePersisted<Cooked[]>(K.cooked, [])
  const [view, setView] = useState<View>({ name: 'home' })
  const [editOnboarding, setEditOnboarding] = useState(false)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [view])

  if (!unlocked) return <Gate onUnlock={() => setUnlocked(true)} />

  if (!profile || !stove || editOnboarding) {
    return (
      <Onboarding
        initialProfile={profile}
        initialStove={stove}
        onDone={(p, s) => {
          setProfile(p)
          setStove(s)
          setEditOnboarding(false)
          setView({ name: 'home' })
        }}
      />
    )
  }

  const target = calcTarget(profile)
  const today = log[todayKey()] ?? []
  const eaten = today.reduce((s, x) => s + x.kcal, 0)

  const addLog = (item: Omit<LogItem, 'id'>) =>
    setLog((l) => ({ ...l, [todayKey()]: [...(l[todayKey()] ?? []), { ...item, id: uid() }] }))
  const removeLog = (id: string) => setLog((l) => ({ ...l, [todayKey()]: (l[todayKey()] ?? []).filter((x) => x.id !== id) }))

  const addToShop = (recipeId: string, servings: number) =>
    setShop((s) => [...s.filter((e) => e.recipeId !== recipeId), { recipeId, servings }])

  if (view.name === 'cook') {
    const r = RECIPES.find((x) => x.id === view.id)!
    return (
      <CookMode
        recipe={r}
        servings={view.servings}
        stove={stove}
        onClose={() => setView({ name: 'recipe', id: r.id })}
        onFinish={(portion, feedback) => {
          const n = recipeNutritionPerServing(r)
          if (portion > 0) addLog({ title: r.title, kcal: Math.round(n.kcal * portion), recipeId: r.id })
          setCooked((c) => [...c, { recipeId: r.id, at: new Date().toISOString() }])
          if (feedback !== 0) {
            setStove((s) => (s ? { ...s, offset: Math.max(-1, Math.min(1, s.offset + feedback)) as -1 | 0 | 1 } : s))
          }
          setView({ name: 'home' })
        }}
      />
    )
  }

  return (
    <div className="shell">
      <main className="page">
        {view.name === 'home' && (
          <Home
            target={target.target}
            eaten={eaten}
            today={today}
            cookedCount={cooked.length}
            onOpen={(id) => setView({ name: 'recipe', id })}
            onQuickAdd={(kcal) => addLog({ title: 'Snack / Sonstiges', kcal })}
            onRemove={removeLog}
          />
        )}
        {view.name === 'recipe' && (
          <RecipeDetail
            recipe={RECIPES.find((x) => x.id === view.id)!}
            remaining={target.target - eaten}
            stove={stove}
            inShop={shop.some((e) => e.recipeId === view.id)}
            onBack={() => setView({ name: 'home' })}
            onShop={(servings) => addToShop(view.id, servings)}
            onCook={(servings) => setView({ name: 'cook', id: view.id, servings })}
          />
        )}
        {view.name === 'shop' && (
          <Shopping
            entries={shop}
            checked={checked}
            onToggle={(id) => setChecked((c) => (c.includes(id) ? c.filter((x) => x !== id) : [...c, id]))}
            onRemoveRecipe={(id) => setShop((s) => s.filter((e) => e.recipeId !== id))}
            onClear={() => {
              setShop([])
              setChecked([])
            }}
            onOpen={(id) => setView({ name: 'recipe', id })}
          />
        )}
        {view.name === 'profile' && (
          <ProfileView
            profile={profile}
            stove={stove}
            cookedCount={cooked.length}
            onEdit={() => setEditOnboarding(true)}
            onReset={() => {
              if (!confirm('Wirklich alle Daten auf diesem Gerät löschen?')) return
              Object.values(K).forEach((k) => {
                try {
                  localStorage.removeItem(k)
                } catch {
                  /* ignorieren */
                }
              })
              location.reload()
            }}
          />
        )}
      </main>
      <nav className="tabbar">
        <TabBtn active={view.name === 'home' || view.name === 'recipe'} icon="🍽️" label="Heute" onClick={() => setView({ name: 'home' })} />
        <TabBtn
          active={view.name === 'shop'}
          icon="🛒"
          label="Einkauf"
          badge={shop.length || undefined}
          onClick={() => setView({ name: 'shop' })}
        />
        <TabBtn active={view.name === 'profile'} icon="👤" label="Profil" onClick={() => setView({ name: 'profile' })} />
      </nav>
    </div>
  )
}

function TabBtn(props: { active: boolean; icon: string; label: string; badge?: number; onClick: () => void }) {
  return (
    <button className={`tab ${props.active ? 'on' : ''}`} onClick={props.onClick}>
      <span className="tab-icon">
        {props.icon}
        {props.badge ? <span className="badge">{props.badge}</span> : null}
      </span>
      <span>{props.label}</span>
    </button>
  )
}

// ───────────── Passwort-Sperre ─────────────

function Gate({ onUnlock }: { onUnlock: () => void }) {
  const [pw, setPw] = useState('')
  const [err, setErr] = useState(false)
  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const h = await sha256(pw.trim())
    if (h === PASSWORD_SHA256) onUnlock()
    else {
      setErr(true)
      setPw('')
    }
  }
  return (
    <div className="gate">
      <div className="gate-plate">🍳</div>
      <h1 className="display">Löffelchen</h1>
      <p className="muted">Testversion – bitte Passwort eingeben</p>
      <form onSubmit={submit} className="gate-form">
        <input
          type="password"
          autoFocus
          value={pw}
          onChange={(e) => {
            setPw(e.target.value)
            setErr(false)
          }}
          placeholder="Passwort"
          aria-label="Passwort"
        />
        <button className="btn primary big" type="submit">
          Öffnen
        </button>
        {err && <p className="error">Das Passwort stimmt nicht.</p>}
      </form>
    </div>
  )
}

// ───────────── Onboarding ─────────────

const THIS_YEAR = new Date().getFullYear()

function Onboarding(props: {
  initialProfile: Profile | null
  initialStove: StoveProfile | null
  onDone: (p: Profile, s: StoveProfile) => void
}) {
  const [step, setStep] = useState(props.initialProfile ? 1 : 0)
  const [p, setP] = useState<Profile>(
    props.initialProfile ?? {
      sex: 'w',
      birthYear: 1990,
      heightCm: 170,
      weightKg: 80,
      activity: 'sitzend',
      goal: 'abnehmen',
      tempo: 'entspannt',
      pregnant: false,
    },
  )
  const [s, setS] = useState<StoveProfile>(props.initialStove ?? { type: 'induktion', scaleMax: 9, booster: false, offset: 0 })
  const age = THIS_YEAR - p.birthYear
  const bodyValid =
    p.birthYear >= 1920 && p.birthYear <= THIS_YEAR && p.heightCm >= 120 && p.heightCm <= 230 && p.weightKg >= 35 && p.weightKg <= 300
  const target = useMemo(() => calcTarget(p), [p])

  const STEPS = 9
  const next = () => setStep((x) => x + 1)
  const back = () => setStep((x) => Math.max(0, x - 1))

  if (step === 0) {
    return (
      <div className="ob ob-welcome">
        <div className="collage">
          {RECIPES.slice(0, 4).map((r) => (
            <div key={r.id} className="collage-tile" style={dishBg(r)}>
              <span>{r.emoji}</span>
            </div>
          ))}
        </div>
        <h1 className="display">Kochen lernen.<br />Leichter werden.<br />Lecker essen.</h1>
        <p className="lead">Jeder Schritt so klein, dass nichts schiefgehen kann – passend zu deinem Herd und deinem Ziel.</p>
        <button className="btn primary big" onClick={next}>
          Los geht's
        </button>
        <p className="tiny muted">Dauert ca. 2 Minuten. Deine Daten bleiben auf diesem Gerät.</p>
      </div>
    )
  }

  const wrap = (title: string, sub: string | null, body: React.ReactNode, canNext = true, nextLabel = 'Weiter', onNext = next) => (
    <div className="ob">
      <div className="ob-top">
        <button className="icon-btn" onClick={back} aria-label="Zurück">
          ←
        </button>
        <div className="progress">
          <div style={{ width: `${(step / STEPS) * 100}%` }} />
        </div>
      </div>
      <h2 className="display h2">{title}</h2>
      {sub && <p className="muted">{sub}</p>}
      <div className="ob-body">{body}</div>
      <button className="btn primary big sticky" disabled={!canNext} onClick={onNext}>
        {nextLabel}
      </button>
    </div>
  )

  switch (step) {
    case 1:
      return wrap(
        'Was ist dein Ziel?',
        null,
        <div className="choices">
          <Choice active={p.goal === 'abnehmen'} emoji="🌱" title="Gesund abnehmen" desc="Langsam und ohne Hunger" onClick={() => setP({ ...p, goal: 'abnehmen' })} />
          <Choice active={p.goal === 'halten'} emoji="⚖️" title="Gewicht halten" desc="Einfach lecker und bewusst kochen" onClick={() => setP({ ...p, goal: 'halten' })} />
        </div>,
      )
    case 2:
      return wrap(
        'Für deinen Kalorien-Richtwert',
        'Wir rechnen mit der Mifflin-St-Jeor-Formel – dafür brauchen wir ein paar Angaben.',
        <div className="form">
          <label>Geschlecht (für die Formel)</label>
          <div className="seg">
            {(
              [
                ['w', 'weiblich'],
                ['m', 'männlich'],
                ['d', 'divers'],
              ] as const
            ).map(([k, l]) => (
              <button key={k} className={p.sex === k ? 'on' : ''} onClick={() => setP({ ...p, sex: k })}>
                {l}
              </button>
            ))}
          </div>
          <NumField label="Geburtsjahr" value={p.birthYear} onChange={(v) => setP({ ...p, birthYear: v })} />
          <NumField label="Größe" unit="cm" value={p.heightCm} onChange={(v) => setP({ ...p, heightCm: v })} />
          <NumField label="Aktuelles Gewicht" unit="kg" value={p.weightKg} onChange={(v) => setP({ ...p, weightKg: v })} />
        </div>,
        bodyValid,
        'Weiter',
        () => (age < 18 ? setStep(99) : next()),
      )
    case 99:
      return (
        <div className="ob">
          <h2 className="display h2">Diese App ist für Erwachsene</h2>
          <p className="lead">
            Kalorienziele sind für Jugendliche nicht geeignet, weil dein Körper noch wächst. Kochen lernen ist trotzdem eine super Idee – sprich am
            besten mit deinen Eltern oder deiner Ärztin bzw. deinem Arzt, wenn du dir Gedanken um dein Gewicht machst.
          </p>
          <button className="btn ghost" onClick={() => setStep(2)}>
            Geburtsjahr korrigieren
          </button>
        </div>
      )
    case 3:
      return wrap(
        'Wie sieht dein Alltag aus?',
        null,
        <div className="choices">
          {(Object.keys(ACTIVITY) as Activity[]).map((k) => (
            <Choice
              key={k}
              active={p.activity === k}
              emoji={k === 'sitzend' ? '💺' : k === 'leicht' ? '🚶' : '🏃'}
              title={ACTIVITY[k].label}
              desc={ACTIVITY[k].desc}
              onClick={() => setP({ ...p, activity: k })}
            />
          ))}
        </div>,
      )
    case 4:
      return wrap(
        'Bist du schwanger oder stillst du?',
        'Dann rechnen wir ohne Kaloriendefizit.',
        <div className="choices">
          <Choice active={!p.pregnant} emoji="🙂" title="Nein" onClick={() => setP({ ...p, pregnant: false })} />
          <Choice active={p.pregnant} emoji="🤰" title="Ja" onClick={() => setP({ ...p, pregnant: true })} />
        </div>,
        true,
        'Weiter',
        () => setStep(p.goal === 'abnehmen' && !p.pregnant ? 5 : 6),
      )
    case 5:
      return wrap(
        'In welchem Tempo?',
        'Beides ist gesund. Langsamer heißt: mehr Genuss, weniger Verzicht.',
        <div className="choices">
          <Choice
            active={p.tempo === 'entspannt'}
            emoji="🐢"
            title="Entspannt"
            desc={`ca. ${calcTarget({ ...p, tempo: 'entspannt' }).weeklyKg.toString().replace('.', ',')} kg pro Woche`}
            onClick={() => setP({ ...p, tempo: 'entspannt' })}
          />
          <Choice
            active={p.tempo === 'zuegig'}
            emoji="🐇"
            title="Zügig"
            desc={`ca. ${calcTarget({ ...p, tempo: 'zuegig' }).weeklyKg.toString().replace('.', ',')} kg pro Woche`}
            onClick={() => setP({ ...p, tempo: 'zuegig' })}
          />
        </div>,
      )
    case 6:
      return wrap(
        'Dein Tagesbudget',
        null,
        <div className="result">
          <div className="result-num">
            <span className="display">{target.target.toLocaleString('de-DE')}</span>
            <span>kcal pro Tag</span>
          </div>
          <ul className="result-list">
            <li>
              Grundumsatz <b>{target.bmr.toLocaleString('de-DE')} kcal</b>
            </li>
            <li>
              Mit deinem Alltag <b>{target.tdee.toLocaleString('de-DE')} kcal</b>
            </li>
            {target.deficit > 0 && (
              <li>
                <span>
                  Sanftes Minus
                  <br />
                  <small className="muted">≈ {target.weeklyKg.toString().replace('.', ',')} kg pro Woche</small>
                </span>
                <b>−{target.deficit} kcal</b>
              </li>
            )}
          </ul>
          {target.note && <div className="callout info">ℹ️ {target.note}</div>}
          {target.floorApplied && (
            <div className="callout info">ℹ️ Wir gehen bewusst nicht unter {target.target} kcal – darunter wird es ungesund und du hältst nicht durch.</div>
          )}
          <p className="tiny muted">
            Das ist ein Richtwert zur Orientierung, kein medizinischer Rat. Bei Vorerkrankungen sprich bitte vorher mit deiner Ärztin oder deinem Arzt.
          </p>
        </div>,
        true,
        'Passt!',
        () => setStep(7),
      )
    case 7:
      return wrap(
        'Welchen Herd hast du?',
        'Damit wir dir statt „mittlere Hitze“ die genaue Stufe sagen können.',
        <div className="choices">
          {(Object.keys(STOVES) as StoveType[]).map((t) => (
            <Choice
              key={t}
              active={s.type === t}
              emoji={STOVES[t].emoji}
              title={STOVES[t].name}
              desc={STOVES[t].desc}
              onClick={() => setS({ ...s, type: t, booster: t === 'induktion' ? s.booster : false })}
            />
          ))}
          <div className="callout tip">💡 Unsicher, ob Induktion oder Ceran? Halte einen Magneten an deinen Topfboden. Haftet er, und die Platte glüht nie rot – dann ist es Induktion.</div>
        </div>,
        true,
        'Weiter',
        () => (s.type === 'gas' ? setStep(9) : setStep(8)),
      )
    case 8:
      return wrap(
        'Bis zu welcher Zahl geht dein Regler?',
        'Schau kurz auf deinen Herd.',
        <div className="form">
          <div className="seg big">
            {([9, 12] as const).map((n) => (
              <button key={n} className={s.scaleMax === n ? 'on' : ''} onClick={() => setS({ ...s, scaleMax: n })}>
                1 – {n}
              </button>
            ))}
          </div>
          {s.type === 'induktion' && (
            <label className="check">
              <input type="checkbox" checked={s.booster} onChange={(e) => setS({ ...s, booster: e.target.checked })} />
              Mein Herd hat eine Booster-Taste („P“)
            </label>
          )}
          <div className="callout tip">
            So sieht das später aus: „Herd auf <b>{translateHeat(5, s).setting}</b>“ statt „mittlere Hitze“.
          </div>
        </div>,
        true,
        'Weiter',
        () => setStep(9),
      )
    case 9:
      return (
        <div className="ob ob-welcome">
          <div className="big-emoji">🎉</div>
          <h2 className="display h2">Alles bereit!</h2>
          <p className="lead">
            Dein Budget: <b>{target.target.toLocaleString('de-DE')} kcal</b> am Tag. Dein Herd: <b>{STOVES[s.type].name}</b>.
            <br />
            Such dir jetzt dein erstes Gericht aus.
          </p>
          <button className="btn primary big" onClick={() => props.onDone(p, s)}>
            Zu meinen Rezepten
          </button>
        </div>
      )
    default:
      return null
  }
}

function Choice(props: { active: boolean; emoji: string; title: string; desc?: string; onClick: () => void }) {
  return (
    <button className={`choice ${props.active ? 'on' : ''}`} onClick={props.onClick}>
      <span className="choice-emoji">{props.emoji}</span>
      <span className="choice-text">
        <b>{props.title}</b>
        {props.desc && <span>{props.desc}</span>}
      </span>
      <span className="choice-dot" />
    </button>
  )
}

function NumField(props: { label: string; unit?: string; value: number; onChange: (v: number) => void }) {
  const [txt, setTxt] = useState(String(props.value))
  return (
    <label className="num">
      <span>{props.label}</span>
      <span className="num-input">
        <input
          inputMode="numeric"
          value={txt}
          onChange={(e) => {
            const v = e.target.value.replace(/[^\d]/g, '')
            setTxt(v)
            props.onChange(Number(v) || 0)
          }}
        />
        {props.unit && <em>{props.unit}</em>}
      </span>
    </label>
  )
}

// ───────────── Startseite ─────────────

function dishBg(r: Recipe): React.CSSProperties {
  return { background: `radial-gradient(circle at 30% 25%, ${r.gradient[0]}, ${r.gradient[1]})` }
}

function DishArt({ recipe, size = 'card' }: { recipe: Recipe; size?: 'card' | 'hero' }) {
  const [imgOk, setImgOk] = useState(true)
  return (
    <div className={`dish dish-${size}`} style={dishBg(recipe)}>
      {imgOk && <img src={`img/${recipe.id}.jpg`} alt="" onError={() => setImgOk(false)} />}
      {!imgOk && (
        <div className="plate">
          <span>{recipe.emoji}</span>
        </div>
      )}
    </div>
  )
}

function Home(props: {
  target: number
  eaten: number
  today: LogItem[]
  cookedCount: number
  onOpen: (id: string) => void
  onQuickAdd: (kcal: number) => void
  onRemove: (id: string) => void
}) {
  const remaining = props.target - props.eaten
  const pct = Math.min(100, (props.eaten / props.target) * 100)
  const hour = new Date().getHours()
  const greet = hour < 11 ? 'Guten Morgen' : hour < 17 ? 'Hallo' : 'Guten Abend'
  const [showQuick, setShowQuick] = useState(false)

  const [kitchen, setKitchen] = useState('Alle')
  const kitchens = ['Alle', ...Array.from(new Set(RECIPES.map((r) => r.cuisine).filter((c): c is string => !!c)))]

  const list = RECIPES.filter((r) => kitchen === 'Alle' || r.cuisine === kitchen).map((r) => ({
    r,
    n: recipeNutritionPerServing(r),
    locked: props.cookedCount < LEVEL_UNLOCK[r.level],
  }))
  const sorted = [...list].sort((a, b) => {
    if (a.locked !== b.locked) return a.locked ? 1 : -1
    const fa = a.n.kcal <= remaining ? 0 : 1
    const fb = b.n.kcal <= remaining ? 0 : 1
    if (fa !== fb) return fa - fb
    // abends Hauptgerichte zuerst, morgens Frühstück
    const wantBreakfast = hour < 11
    const ma = (a.r.meal === 'Frühstück') === wantBreakfast ? 0 : 1
    const mb = (b.r.meal === 'Frühstück') === wantBreakfast ? 0 : 1
    return ma - mb
  })

  return (
    <>
      <header className="home-head">
        <p className="muted">{greet} 👋</p>
        <h1 className="display h1">Worauf hast du heute Appetit?</h1>
      </header>

      <section className="budget">
        <div className="budget-row">
          <div>
            <span className="budget-num">{Math.max(0, remaining).toLocaleString('de-DE')}</span>
            <span className="muted"> kcal übrig</span>
          </div>
          <button className="chip" onClick={() => setShowQuick((x) => !x)}>
            + Eintragen
          </button>
        </div>
        <div className={`bar ${remaining < 0 ? 'over' : ''}`}>
          <div style={{ width: `${pct}%` }} />
        </div>
        <p className="tiny muted">
          {props.eaten.toLocaleString('de-DE')} von {props.target.toLocaleString('de-DE')} kcal
          {remaining < 0 && ' – kein Drama, morgen ist ein neuer Tag.'}
        </p>
        {showQuick && (
          <div className="quick">
            <span className="tiny muted">Etwas anderes gegessen? Grob schätzen reicht:</span>
            <div className="quick-row">
              {[100, 250, 500, 800].map((k) => (
                <button
                  key={k}
                  className="chip"
                  onClick={() => {
                    props.onQuickAdd(k)
                    setShowQuick(false)
                  }}
                >
                  +{k}
                </button>
              ))}
            </div>
          </div>
        )}
        {props.today.length > 0 && (
          <ul className="log">
            {props.today.map((x) => (
              <li key={x.id}>
                <span>{x.title}</span>
                <span>
                  {x.kcal} kcal{' '}
                  <button className="x" onClick={() => props.onRemove(x.id)} aria-label="Eintrag löschen">
                    ×
                  </button>
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {props.cookedCount > 0 && (
        <div className="streak">
          🔥 <b>{props.cookedCount}</b> {props.cookedCount === 1 ? 'Gericht' : 'Gerichte'} selbst gekocht – stark!
        </div>
      )}

      <h2 className="section-title">Für dich ausgesucht</h2>
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 6, marginBottom: 12 }}>
        {kitchens.map((k) => (
          <button
            key={k}
            className="chip"
            onClick={() => setKitchen(k)}
            aria-pressed={kitchen === k}
            style={{
              flex: 'none',
              whiteSpace: 'nowrap',
              ...(kitchen === k ? { background: 'var(--tomato)', borderColor: 'var(--tomato)', color: '#fff' } : {}),
            }}
          >
            {k}
          </button>
        ))}
      </div>
      <div className="cards">
        {sorted.map(({ r, n, locked }) => {
          const fits = n.kcal <= remaining
          const need = LEVEL_UNLOCK[r.level] - props.cookedCount
          return (
            <button key={r.id} className={`card ${locked ? 'locked' : ''}`} onClick={() => !locked && props.onOpen(r.id)} disabled={locked}>
              <DishArt recipe={r} />
              <div className="card-body">
                <div className="card-tags">
                  <span className="tag">Level {r.level}</span>
                  {r.cuisine && kitchen === 'Alle' && <span className="tag">{r.cuisine}</span>}
                  {!locked && <span className={`tag ${fits ? 'ok' : 'warn'}`}>{fits ? '✓ passt rein' : 'heute etwas viel'}</span>}
                </div>
                <h3>{r.title}</h3>
                <p className="muted">{r.subtitle}</p>
                <div className="meta">
                  <span>⏱ {r.minutes} Min</span>
                  <span>🔥 {n.kcal} kcal</span>
                  <span>💪 {n.protein} g Eiweiß</span>
                </div>
              </div>
              {locked && (
                <div className="lock">
                  🔒 Noch {need} {need === 1 ? 'Gericht' : 'Gerichte'} kochen, dann ist Level {r.level} frei
                </div>
              )}
            </button>
          )
        })}
      </div>
    </>
  )
}

// ───────────── Rezept-Detail ─────────────

function RecipeDetail(props: {
  recipe: Recipe
  remaining: number
  stove: StoveProfile
  inShop: boolean
  onBack: () => void
  onShop: (servings: number) => void
  onCook: (servings: number) => void
}) {
  const r = props.recipe
  const [servings, setServings] = useState(r.servings)
  const [added, setAdded] = useState(false)
  const factor = servings / r.servings
  const n = recipeNutritionPerServing(r)
  const heatSteps = r.steps.filter((s) => s.heat != null && s.heat > 0)
  const maxHeat = heatSteps.length ? Math.max(...heatSteps.map((s) => s.heat!)) : 0

  return (
    <div className="detail">
      <div className="hero-wrap">
        <DishArt recipe={r} size="hero" />
        <button className="icon-btn floating" onClick={props.onBack} aria-label="Zurück">
          ←
        </button>
      </div>
      <div className="detail-body">
        <div className="card-tags">
          <span className="tag">Level {r.level}</span>
          {r.tags.map((t) => (
            <span key={t} className="tag">
              {t}
            </span>
          ))}
        </div>
        <h1 className="display h1">{r.title}</h1>
        <p className="muted">{r.subtitle}</p>

        <div className="stats">
          <div>
            <b>{n.kcal}</b>
            <span>kcal / Portion</span>
          </div>
          <div>
            <b>{r.minutes}</b>
            <span>Minuten</span>
          </div>
          <div>
            <b>{n.protein} g</b>
            <span>Eiweiß</span>
          </div>
          <div>
            <b>{r.steps.length}</b>
            <span>Mini-Schritte</span>
          </div>
        </div>
        {n.kcal <= props.remaining ? (
          <div className="callout ok">✓ Passt heute noch in dein Budget – es bleiben danach {props.remaining - n.kcal} kcal.</div>
        ) : (
          <div className="callout info">Heute etwas über dem Budget. Tipp: Halbe Portion essen oder morgen kochen.</div>
        )}

        {maxHeat > 0 && (
          <div className="callout stove">
            {STOVES[props.stove.type].emoji} Angepasst an deinen <b>{STOVES[props.stove.type].name}</b>-Herd – höchste Stufe in diesem Rezept:{' '}
            <b>{translateHeat(maxHeat, props.stove).setting}</b>
          </div>
        )}

        <h2 className="section-title">Du brauchst</h2>
        <ul className="equip">
          {r.equipment.map((e) => (
            <li key={e}>{e}</li>
          ))}
        </ul>

        <div className="row-between">
          <h2 className="section-title">Zutaten</h2>
          <div className="stepper">
            <button onClick={() => setServings((s) => Math.max(1, s - 1))} aria-label="Weniger Portionen">
              −
            </button>
            <span>
              {servings} {servings === 1 ? 'Portion' : 'Portionen'}
            </span>
            <button onClick={() => setServings((s) => Math.min(6, s + 1))} aria-label="Mehr Portionen">
              +
            </button>
          </div>
        </div>
        <ul className="ings">
          {r.ingredients
            .filter((ri) => !INGREDIENTS[ri.ing].hidden)
            .map((ri) => {
              const ing = INGREDIENTS[ri.ing]
              const kcal = Math.round(kcalOf(ri, factor))
              return (
                <li key={ri.key}>
                  <span className="ing-amount">{formatAmount(ri, factor)}</span>
                  <span className="ing-name">
                    {ing.name}
                    {ri.prep && <em>, {ri.prep}</em>}
                    {ri.optional && <em> (optional)</em>}
                    {ing.kcalTip && <small className="ing-tip">💡 {ing.kcalTip}</small>}
                  </span>
                  <span className={`ing-kcal ${kcal >= 100 ? 'hi' : ''}`}>{kcal} kcal</span>
                </li>
              )
            })}
        </ul>
        <p className="tiny muted">Nährwerte sind Richtwerte. Gesamt: {Math.round(n.kcal * servings)} kcal für {servings} {servings === 1 ? 'Portion' : 'Portionen'}.</p>
      </div>

      <div className="actions">
        <button
          className="btn ghost"
          onClick={() => {
            props.onShop(servings)
            setAdded(true)
          }}
        >
          {added || props.inShop ? '✓ Auf der Liste' : '🛒 Einkaufsliste'}
        </button>
        <button className="btn primary" onClick={() => props.onCook(servings)}>
          Jetzt kochen →
        </button>
      </div>
    </div>
  )
}

// ───────────── Koch-Modus ─────────────

interface RunningTimer {
  id: string
  label: string
  endsAt: number
  total: number
  done: boolean
}

function beep() {
  try {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    const ctx = new Ctx()
    ;[0, 0.35, 0.7].forEach((t) => {
      const o = ctx.createOscillator()
      const g = ctx.createGain()
      o.frequency.value = 880
      g.gain.setValueAtTime(0.25, ctx.currentTime + t)
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + t + 0.3)
      o.connect(g).connect(ctx.destination)
      o.start(ctx.currentTime + t)
      o.stop(ctx.currentTime + t + 0.3)
    })
  } catch {
    /* kein Audio */
  }
  try {
    navigator.vibrate?.([300, 150, 300])
  } catch {
    /* kein Vibrieren */
  }
}

const mmss = (sec: number) => `${Math.floor(sec / 60)}:${String(Math.max(0, Math.floor(sec % 60))).padStart(2, '0')}`

function CookMode(props: {
  recipe: Recipe
  servings: number
  stove: StoveProfile
  onClose: () => void
  onFinish: (portion: number, heatFeedback: -1 | 0 | 1) => void
}) {
  const r = props.recipe
  const factor = props.servings / r.servings
  // Phasen: -2 = Geräte-Check, -1 = Mise en place, 0..n-1 = Schritte, n = fertig
  const [idx, setIdx] = useState(-2)
  const [equipOk, setEquipOk] = useState<string[]>([])
  const [miseOk, setMiseOk] = useState<number[]>([])
  const [timers, setTimers] = useState<RunningTimer[]>([])
  const [now, setNow] = useState(Date.now())
  const [feedback, setFeedback] = useState<-1 | 0 | 1 | null>(null)
  const firedRef = useRef<Set<string>>(new Set())
  const total = r.steps.length

  // Bildschirm anlassen
  useEffect(() => {
    let lock: { release: () => Promise<void> } | null = null
    const nav = navigator as Navigator & { wakeLock?: { request: (t: 'screen') => Promise<{ release: () => Promise<void> }> } }
    nav.wakeLock
      ?.request('screen')
      .then((l) => (lock = l))
      .catch(() => {})
    return () => {
      lock?.release().catch(() => {})
    }
  }, [])

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 250)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    timers.forEach((t) => {
      if (!t.done && t.endsAt <= now && !firedRef.current.has(t.id)) {
        firedRef.current.add(t.id)
        beep()
        setTimers((ts) => ts.map((x) => (x.id === t.id ? { ...x, done: true } : x)))
      }
    })
  }, [now, timers])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [idx])

  const startTimer = (label: string, sec: number) =>
    setTimers((ts) => [...ts.filter((x) => x.label !== label), { id: uid(), label, endsAt: Date.now() + sec * 1000, total: sec, done: false }])

  const step = idx >= 0 && idx < total ? r.steps[idx] : null
  const firstHeatIdx = r.steps.findIndex((s) => s.heat != null && s.heat > 0)
  const progress = idx < 0 ? 0 : Math.min(100, (idx / total) * 100)

  return (
    <div className="cook">
      <div className="cook-top">
        <button className="icon-btn" onClick={() => (confirm('Koch-Modus verlassen?') ? props.onClose() : null)} aria-label="Schließen">
          ✕
        </button>
        <div className="cook-title">
          <b>{r.title}</b>
          <span>
            {idx === -2 ? 'Geräte-Check' : idx === -1 ? 'Vorbereitung' : idx < total ? `Schritt ${idx + 1} von ${total}` : 'Geschafft!'}
          </span>
        </div>
        <div className="progress thin">
          <div style={{ width: `${progress}%` }} />
        </div>
      </div>

      {timers.length > 0 && (
        <div className="timers">
          {timers.map((t) => {
            const left = Math.ceil((t.endsAt - now) / 1000)
            return (
              <button
                key={t.id}
                className={`timer-chip ${t.done ? 'done' : ''}`}
                onClick={() => t.done && setTimers((ts) => ts.filter((x) => x.id !== t.id))}
              >
                ⏱ {t.label}: {t.done ? 'Fertig! (antippen)' : mmss(left)}
              </button>
            )
          })}
        </div>
      )}

      <div className="cook-body">
        {idx === -2 && (
          <>
            <h2 className="display h2">Hast du alles griffbereit?</h2>
            <p className="muted">Tipp alles an, was vor dir liegt.</p>
            <div className="checklist">
              {r.equipment.map((e) => (
                <CheckRow key={e} on={equipOk.includes(e)} onClick={() => setEquipOk((x) => (x.includes(e) ? x.filter((y) => y !== e) : [...x, e]))}>
                  {e}
                </CheckRow>
              ))}
            </div>
          </>
        )}

        {idx === -1 && (
          <>
            <h2 className="display h2">Erst schnippeln, dann kochen</h2>
            <p className="muted">Bevor der Herd angeht, bereitest du alles vor. So kommt später kein Stress auf.</p>
            <div className="checklist">
              {r.mise.map((m, i) => (
                <CheckRow key={i} on={miseOk.includes(i)} onClick={() => setMiseOk((x) => (x.includes(i) ? x.filter((y) => y !== i) : [...x, i]))}>
                  {m}
                </CheckRow>
              ))}
            </div>
            <h3 className="section-title">Zutaten für {props.servings} {props.servings === 1 ? 'Portion' : 'Portionen'}</h3>
            <ul className="ings compact">
              {r.ingredients
                .filter((ri) => !INGREDIENTS[ri.ing].hidden)
                .map((ri) => (
                  <li key={ri.key}>
                    <span className="ing-amount">{formatAmount(ri, factor)}</span>
                    <span className="ing-name">{INGREDIENTS[ri.ing].name}</span>
                  </li>
                ))}
            </ul>
          </>
        )}

        {step && (
          <div className="step" key={idx}>
            <div className="step-kind">{kindLabel(step.kind)}</div>
            <h2 className="display h2">{step.title}</h2>

            {step.heat != null && step.kind !== 'oven' && <HeatBadge level={step.heat} stove={props.stove} />}

            <p className="step-text">
              <StepText parts={renderStep(step.text, r, factor, props.stove, step.heat)} />
            </p>

            {idx === firstHeatIdx && (
              <div className="callout stove">
                {STOVES[props.stove.type].emoji} <b>Dein Herd:</b> {STOVES[props.stove.type].preheat} {STOVES[props.stove.type].hint}
              </div>
            )}
            {step.cue && (
              <div className="callout cue">
                <span className="callout-label">👀 Daran erkennst du's</span>
                {step.cue}
              </div>
            )}
            {step.warn && (
              <div className="callout warn">
                <span className="callout-label">⚠️ Achtung</span>
                {step.warn}
              </div>
            )}
            {step.tip && (
              <div className="callout tip">
                <span className="callout-label">💡 Tipp</span>
                {step.tip}
              </div>
            )}
            {step.timer && (
              <button className="btn timer-btn" onClick={() => startTimer(step.title, step.timer!)}>
                ⏱ Timer starten · {mmss(step.timer)}
              </button>
            )}
          </div>
        )}

        {idx === total && (
          <div className="finish">
            <div className="big-emoji">🎉</div>
            <h2 className="display h2">Geschafft – du hast gekocht!</h2>
            <p className="muted">Mach ein Foto, du hast es dir verdient.</p>

            <h3 className="section-title">Wie war die Hitze?</h3>
            <div className="seg">
              {(
                [
                  [-1, '🥵 zu heiß'],
                  [0, '👌 genau richtig'],
                  [1, '🥶 zu schwach'],
                ] as const
              ).map(([v, l]) => (
                <button key={v} className={feedback === v ? 'on' : ''} onClick={() => setFeedback(v)}>
                  {l}
                </button>
              ))}
            </div>
            {feedback !== null && feedback !== 0 && (
              <p className="tiny muted">Danke! Wir passen die Stufen für deinen Herd beim nächsten Mal um 1 an.</p>
            )}

            <h3 className="section-title">Wie viel hast du gegessen?</h3>
            <div className="portion-grid">
              {[0.5, 1, 1.5].map((p) => (
                <button key={p} className="btn ghost" onClick={() => props.onFinish(p, feedback ?? 0)}>
                  {p.toString().replace('.', ',')} Portion
                  <small>{Math.round(recipeNutritionPerServing(r).kcal * p)} kcal</small>
                </button>
              ))}
            </div>
            <button className="btn link" onClick={() => props.onFinish(0, feedback ?? 0)}>
              Nichts eintragen
            </button>
          </div>
        )}
      </div>

      {idx < total && (
        <div className="cook-nav">
          <button className="btn ghost" disabled={idx === -2} onClick={() => setIdx((i) => i - 1)}>
            ← Zurück
          </button>
          <button className="btn primary big" onClick={() => setIdx((i) => i + 1)}>
            {idx === -2 ? 'Alles da' : idx === -1 ? 'Fertig vorbereitet' : idx === total - 1 ? 'Fertig! 🎉' : 'Erledigt – weiter'}
          </button>
        </div>
      )}
    </div>
  )
}

function kindLabel(kind: string) {
  return { prep: 'Vorbereiten', heat: 'Herd', action: 'Machen', oven: 'Ofen', plate: 'Anrichten' }[kind] ?? ''
}

function HeatBadge({ level, stove }: { level: number; stove: StoveProfile }) {
  const h = translateHeat(level, stove)
  const bars = Array.from({ length: 10 }, (_, i) => i < h.level)
  return (
    <div className={`heat ${h.level === 0 ? 'off' : ''}`}>
      <span className="heat-emoji">{h.level === 0 ? '⭕' : STOVES[stove.type].emoji}</span>
      <div className="heat-text">
        <b>{h.level === 0 ? 'Herd ausschalten' : h.setting}</b>
        <span>{h.level === 0 ? 'Kochzone auf 0' : `${h.word} · ${STOVES[stove.type].name}`}</span>
      </div>
      {h.level > 0 && (
        <div className="heat-bars" aria-hidden>
          {bars.map((on, i) => (
            <i key={i} className={on ? 'on' : ''} style={{ height: 6 + i * 2.2 }} />
          ))}
        </div>
      )}
    </div>
  )
}

function StepText({ parts }: { parts: TextPart[] }) {
  return (
    <>
      {parts.map((p, i) =>
        p.t === 'text' ? (
          <span key={i}>{p.v}</span>
        ) : p.t === 'amount' ? (
          <mark key={i} className="amt">
            {p.v}
          </mark>
        ) : (
          <mark key={i} className="hot">
            {p.v}
          </mark>
        ),
      )}
    </>
  )
}

function CheckRow(props: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button className={`checkrow ${props.on ? 'on' : ''}`} onClick={props.onClick}>
      <span className="box">{props.on ? '✓' : ''}</span>
      <span>{props.children}</span>
    </button>
  )
}

// ───────────── Einkaufsliste ─────────────

function Shopping(props: {
  entries: ShoppingEntry[]
  checked: string[]
  onToggle: (id: string) => void
  onRemoveRecipe: (id: string) => void
  onClear: () => void
  onOpen: (id: string) => void
}) {
  const [showPantry, setShowPantry] = useState(false)
  const lines = buildShoppingList(props.entries, RECIPES)
  const main = lines.filter((l) => !l.pantry)
  const pantry = lines.filter((l) => l.pantry)
  const sections = [...new Set(main.map((l) => l.section))]
  const totalKcal = lines.reduce((s, l) => s + l.kcal, 0)

  if (props.entries.length === 0) {
    return (
      <div className="empty">
        <div className="big-emoji">🛒</div>
        <h1 className="display h1">Deine Einkaufsliste ist leer</h1>
        <p className="muted">Öffne ein Rezept und tippe auf „Einkaufsliste“. Die Zutaten werden automatisch zusammengefasst.</p>
      </div>
    )
  }

  return (
    <>
      <header className="home-head">
        <h1 className="display h1">Einkaufsliste</h1>
        <p className="muted">Nach Supermarkt-Bereich sortiert · mit Kalorien pro Zutat</p>
      </header>
      <div className="recipe-chips">
        {props.entries.map((e) => {
          const r = RECIPES.find((x) => x.id === e.recipeId)
          if (!r) return null
          return (
            <span key={e.recipeId} className="rchip">
              <button onClick={() => props.onOpen(r.id)}>
                {r.emoji} {r.title} · {e.servings} P.
              </button>
              <button className="x" onClick={() => props.onRemoveRecipe(r.id)} aria-label="Rezept entfernen">
                ×
              </button>
            </span>
          )
        })}
      </div>

      {sections.map((sec) => (
        <section key={sec} className="shop-sec">
          <h2 className="section-title">{sec}</h2>
          {main
            .filter((l) => l.section === sec)
            .map((l) => (
              <ShopRow key={l.ingId} line={l} on={props.checked.includes(l.ingId)} onToggle={() => props.onToggle(l.ingId)} />
            ))}
        </section>
      ))}

      {pantry.length > 0 && (
        <section className="shop-sec">
          <button className="btn link" onClick={() => setShowPantry((x) => !x)}>
            {showPantry ? '▾' : '▸'} Basics, die du wahrscheinlich hast ({pantry.length})
          </button>
          {showPantry &&
            pantry.map((l) => <ShopRow key={l.ingId} line={l} on={props.checked.includes(l.ingId)} onToggle={() => props.onToggle(l.ingId)} />)}
        </section>
      )}

      <p className="tiny muted center">Alles zusammen: ca. {totalKcal.toLocaleString('de-DE')} kcal</p>
      <button className="btn ghost wide" onClick={() => confirm('Einkaufsliste leeren?') && props.onClear()}>
        Liste leeren
      </button>
    </>
  )
}

function ShopRow(props: { line: ReturnType<typeof buildShoppingList>[number]; on: boolean; onToggle: () => void }) {
  const l = props.line
  return (
    <button className={`shoprow ${props.on ? 'on' : ''}`} onClick={props.onToggle}>
      <span className="box">{props.on ? '✓' : ''}</span>
      <span className="shop-main">
        <b>{l.name}</b>
        <span className="tiny muted">
          {formatGrams(l.grams)}
          {l.packHint && ` → ${l.packHint}`}
        </span>
        {l.kcalTip && !props.on && <span className="tiny tipline">💡 {l.kcalTip}</span>}
      </span>
      <span className={`ing-kcal ${l.kcal >= 150 ? 'hi' : ''}`}>{l.kcal} kcal</span>
    </button>
  )
}

// ───────────── Profil ─────────────

function ProfileView(props: { profile: Profile; stove: StoveProfile; cookedCount: number; onEdit: () => void; onReset: () => void }) {
  const t = calcTarget(props.profile)
  return (
    <>
      <header className="home-head">
        <h1 className="display h1">Dein Profil</h1>
      </header>
      <section className="budget">
        <div className="kv">
          <span>Tagesbudget</span>
          <b>{t.target.toLocaleString('de-DE')} kcal</b>
        </div>
        <div className="kv">
          <span>Grundumsatz / Gesamtbedarf</span>
          <b>
            {t.bmr.toLocaleString('de-DE')} / {t.tdee.toLocaleString('de-DE')} kcal
          </b>
        </div>
        <div className="kv">
          <span>Ziel</span>
          <b>{props.profile.goal === 'abnehmen' ? `Abnehmen (ca. ${t.weeklyKg.toString().replace('.', ',')} kg/Woche)` : 'Gewicht halten'}</b>
        </div>
        <div className="kv">
          <span>Herd</span>
          <b>
            {STOVES[props.stove.type].emoji} {STOVES[props.stove.type].name}
            {props.stove.type !== 'gas' && ` (1–${props.stove.scaleMax})`}
          </b>
        </div>
        <div className="kv">
          <span>Hitze-Kalibrierung</span>
          <b>{props.stove.offset === 0 ? 'Standard' : props.stove.offset > 0 ? '+1 Stufe' : '−1 Stufe'}</b>
        </div>
        <div className="kv">
          <span>Selbst gekocht</span>
          <b>{props.cookedCount}</b>
        </div>
      </section>
      <button className="btn ghost wide" onClick={props.onEdit}>
        Angaben & Herd ändern
      </button>
      <div className="callout info">
        ℹ️ Testversion: Alle Daten liegen nur in diesem Browser. Kalorienangaben sind Richtwerte und kein medizinischer Rat.
      </div>
      <button className="btn link danger" onClick={props.onReset}>
        Alle Daten löschen
      </button>
    </>
  )
}
