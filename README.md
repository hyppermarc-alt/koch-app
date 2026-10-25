# Löffelchen – Koch-App für Anfänger (Testversion)

Klickbarer MVP-Prototyp einer Koch-App für absolute Anfänger, die gesund abnehmen wollen.
Läuft als Web-App im Browser (Handy & PC) und ist mit einem Test-Passwort geschützt.

**Test-Passwort:** `voll-werbung`

## Was drin ist

- **Onboarding:** Ziel, Körperdaten, Alltag → Kalorien-Richtwert (Mifflin-St-Jeor, sanftes Defizit, feste Untergrenzen, ab 18 Jahren)
- **Herd-Matching:** Induktion / Ceran / Gas, Reglerskala 1–9 oder 1–12, Booster. Rezepte speichern Hitze abstrakt (0–10) und werden live übersetzt („Stufe 5 von 9“, „mittlere Flamme“). Nach dem Kochen lässt sich die Hitze per Feedback um ±1 kalibrieren.
- **Feed:** 6 Beispielrezepte, sortiert nach Restbudget und Tageszeit; Level 2 wird nach 2 gekochten Gerichten freigeschaltet
- **Rezept-Detail:** Geräte-Liste, Portionsregler, kcal pro Zutat, Kalorienfallen-Tipps
- **Koch-Modus:** Geräte-Check → Mise en place → ein Mikro-Schritt pro Screen mit Herdstufe, „Daran erkennst du's“, Warnhinweisen, Tipps und parallel laufenden Timern (Ton + Vibration). Bildschirm bleibt an.
- **Einkaufsliste:** Zutaten mehrerer Rezepte zusammengefasst, nach Supermarkt-Bereich sortiert, mit Packungsgrößen und kcal pro Position
- **Tagesbudget:** Gekochtes mit einem Tap eintragen, Schnelleinträge für Snacks

Alle Daten bleiben im Browser (localStorage). Es gibt noch kein Backend.

## Lokal starten

```bash
npm install
npm run dev
```

## Veröffentlichen (GitHub Pages)

1. Repository auf GitHub → **Settings → Pages → Source: „GitHub Actions“** einstellen.
2. Auf `main` pushen – der Workflow `.github/workflows/deploy.yml` baut und veröffentlicht automatisch.
3. Die App ist dann unter `https://<benutzer>.github.io/<repo>/` erreichbar.

## Eigene Foodfotos einbauen

Fotos als JPG in `public/img/` legen, Dateiname = Rezept-ID, z. B.:

- `public/img/tomaten-feta-pasta.jpg`
- `public/img/haehnchen-gemuese-pfanne.jpg`
- `public/img/shakshuka.jpg`
- `public/img/linsen-curry.jpg`
- `public/img/ofen-lachs.jpg`
- `public/img/beeren-quark-bowl.jpg`

Fehlt ein Foto, zeigt die App automatisch die illustrierte Teller-Grafik.

## Wichtig zur Passwort-Sperre

Die Sperre ist nur ein **leichter Sichtschutz für Tests**: Sie läuft im Browser, das Passwort ist als SHA-256-Hash im Code (`src/logic.ts`, `PASSWORD_SHA256`). Wer den Code liest, kommt drum herum. Für echten Schutz braucht es ein Backend mit Login oder ein privates Hosting. Ist das Repository öffentlich, ist auch der Quellcode öffentlich.

Passwort ändern: neuen Hash erzeugen und in `src/logic.ts` eintragen:

```bash
node -e "crypto.subtle.digest('SHA-256',new TextEncoder().encode('NEUES-PASSWORT')).then(b=>console.log(Buffer.from(b).toString('hex')))"
```

## Struktur

| Datei | Inhalt |
| --- | --- |
| `src/data.ts` | Zutaten mit Nährwerten pro 100 g, Herd-Mappings, Rezepte mit Mikro-Schritten |
| `src/logic.ts` | Kalorienberechnung, Mengen-Umrechnung, Schritt-Texte, Einkaufsliste |
| `src/App.tsx` | Alle Screens |
| `src/index.css` | Design |

Nährwerte sind Durchschnittswerte für den Prototyp – vor einem Launch durch eine lizenzierte Quelle (z. B. BLS) ersetzen. Kalorienangaben sind Richtwerte, kein medizinischer Rat.
