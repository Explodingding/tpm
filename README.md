# TPM — Plan wdrożenia

Statyczna strona z mapą kompetencji, planem rozwoju na 90 dni i checklistą gotowości pilota TPM. Przeznaczona do publikacji na **GitHub Pages**.

## Zawartość

- **Start** — przegląd modelu T-shaped i założeń pilota
- **Role** — struktura zespołu, macierz szkoleń, plan godzin
- **Kompetencje** — mapa L1/L2/L3 z filtrami
- **Plan 90 dni** — harmonogram tygodniowy w 3 fazach
- **KPI** — cele mierzalne per faza
- **Checklist** — gotowość do skalowania (zapis w localStorage)

## Struktura projektu

```
tpm/
├── index.html          # Główna strona (SPA)
├── css/
│   └── styles.css
├── js/
│   ├── app.js          # Logika UI i nawigacja
│   └── data/
│       └── content.js  # ← edytuj treść tutaj
├── .nojekyll           # Wymagane dla GitHub Pages
└── README.md
```

## Rozwój lokalny

Strona nie wymaga build stepu — czysty HTML/CSS/JS (ES modules).

```bash
# Python
python -m http.server 8080

# Node (npx)
npx serve .

# Lub VS Code / Cursor: Live Server
```

Otwórz: `http://localhost:8080`

> **Uwaga:** ES modules wymagają serwera HTTP — plik otwarty bezpośrednio (`file://`) może nie działać.

## Publikacja na GitHub Pages

### Opcja A — strona projektu (`username.github.io/tpm/`)

1. Utwórz repozytorium `tpm` na GitHubie
2. Wypchnij ten projekt:

```bash
git init
git add .
git commit -m "Initial TPM plan site"
git branch -M main
git remote add origin https://github.com/TWOJ-USER/tpm.git
git push -u origin main
```

3. W repozytorium: **Settings → Pages**
4. **Source:** Deploy from branch
5. **Branch:** `main` / folder `/ (root)`
6. Zapisz — po ~1–2 min strona będzie pod:
   [https://explodingding.github.io/tpm/](https://explodingding.github.io/tpm/)

### Opcja B — strona użytkownika (`username.github.io`)

Jeśli repo nazywa się **`username.github.io`**, strona będzie pod rootem:
`https://TWOJ-USER.github.io/`

### Custom domain (opcjonalnie)

W Settings → Pages ustaw custom domain i dodaj plik `CNAME` w root repozytorium.

## Jak edytować treść

Dane w dwóch językach:

| Plik | Język |
|------|-------|
| `js/data/locales/pl.js` | Polski |
| `js/data/locales/en.js` | English |

Każdy plik zawiera UI (`ui`) i treść merytoryczną (role, kompetencje, plan 90 dni itd.).

Po zmianie wersji zaktualizuj `config.version` w obu plikach locale.

## Języki

Przycisk **English** / **Polski** w nagłówku przełącza całą stronę. Wybór jest zapisywany w `localStorage` (`tpm-locale`).

## Planowany rozwój

- **v1.1** — edycja baseline OEE w localStorage
- **v1.2** — macierz indywidualna pracowników (CSV)
- **v2.0** — śledzenie postępu tygodni
- **v2.1** — wersja EN
- **v3.0** — wiele linii / zakładów

## Licencja

MIT — używaj i modyfikuj według potrzeb organizacji.
