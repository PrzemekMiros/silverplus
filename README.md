# SilverPlus 2100 — Astro

Migracja statycznego eksportu do Astro. Interaktywna część WebGL jest zachowanym
bundłem produkcyjnym, ponieważ w repozytorium nie ma jej kodu źródłowego.

## Uruchomienie

```bash
npm install
npm run dev
```

Użyj `npm run build` do wygenerowania katalogu `dist/`, a `npm run preview`
do podglądu wersji produkcyjnej. Dowiązania ani ręczne kopiowanie nie są potrzebne.

## Struktura projektu

- `src/` — komponenty Astro, style i metadane strony.
- `public/scripts/` — skrypty WebGL: loader, main i vendors.
- `public/models/kernel/KERNAL.gltf` — model pudełka produktu. Aktualizuj go razem z `silverplus2100.bin` i `etykieta.jpg` w tym samym folderze.
- `public/models/seed/` — oryginalne nasiono wymagane przez inną scenę; to osobny model, nie kopia pudełka.
- `public/models/landing/` — modele pierwszej sceny.
- `public/assets/` — modele doniczek i tła sceny testów.
- `public/images/`, `public/textures/`, `public/compressed/` — obrazy i tekstury WebGL.
- `public/fonts/` — fonty i atlasy tekstu WebGL.
- `public/documents/` — dokumenty PDF.
- `public/favicon/`, `public/svg/`, `public/silverplus-logo.svg` — ikony i logo.
- `dist/` — generowana kopia do publikacji; nie edytuj jej ręcznie.
- `node_modules/`, `.astro/` — zależności i pliki generowane przez narzędzia.

Zasoby edytuj wyłącznie w `public/`. Po zmianie odśwież stronę developerską;
dla wersji produkcyjnej wykonaj ponownie `npm run build`.
Ścieżki prowadzą do lokalnych katalogów, bez dawnego prefiksu domeny CDN.

## Weryfikacja

Tekstury WebGL używają S3TC wyłącznie na urządzeniach obsługujących ten format.
Pozostałe urządzenia pobierają PNG z `public/compressed/png/`. Nie usuwaj tego
katalogu z publikacji. Po zmianie plików KTX odtwórz PNG poleceniem
`python scripts/generate-texture-fallbacks.py` (wymaga Pillow).
Licznik postępu odpowiada ukończonym pobraniom tekstur. Błąd uruchomienia
lub przekroczenie 90 sekund wyświetla komunikat z przyciskiem ponownej próby.
Po zmianie legacy JS zwiększ parametr wersji w komponencie `LegacyExperience.astro`
i w adresie chunków w loaderze, aby ominąć stare pliki w pamięci przeglądarki.

```bash
node scripts/check-assets.mjs
npm run check
npm run build
```

Stare eksporty, duplikaty i błędne pobrania HTML zostały przeniesione poza projekt
do sąsiedniego katalogu `corn-astro-archive-20261125-172309`.
Archiwum nie jest potrzebne do działania strony i nie trafia do `dist/`.
