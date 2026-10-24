# Gnosythium

Roboczy tytuł autorskiej platformowej gry akcji 2D o magu. Mroczne średniowieczne fantasy, techniczna walka zaklęciami, zagadki i odkrywanie tajemnic świata.

## Zatwierdzony kierunek

- Phaser + TypeScript + Vite.
- Przeglądarka na komputerze, klawiatura i mysz, pełny ekran.
- Bez wersji telefonicznej i sterowania dotykowego.
- Osobne repozytorium, projekt VS Code i projekt Codex; niezależne od GameLogs.
- Docelowy darmowy hosting: GitHub Pages z osobnego publicznego repozytorium.
- Publiczne repozytorium: [Anveth/Gnosythium](https://github.com/Anveth/Gnosythium); docelowy adres po pierwszym wdrożeniu: `https://anveth.github.io/Gnosythium/`.
- Odnośnik w GameLogs dopiero po przygotowaniu demonstracji.
- Ewentualna aplikacja desktopowa w przyszłości, nie w pierwszym etapie.

## Dokumentacja

- [Pełna koncepcja i zakres decyzji](docs/CONCEPT.md)
- [Plan etapów i kryteria pierwszego prototypu](docs/ROADMAP.md)
- [Przekazanie kontekstu do nowego czatu](docs/HANDOFF.md)
- [Zasady pracy dla Codexa](AGENTS.md)

## Status

Utworzono dokumentację startową, lokalne repo Git na `main` i zdalne repozytorium. Dokumentacja została wysłana na GitHub; Pages ma zapisane źródło **GitHub Actions**. Kod areny i workflow budowania nie zostały jeszcze utworzone — nie ma jeszcze działającego wdrożenia gry.

Folder otwarto w osobnym oknie VS Code. Nowy czat implementacyjny oczekuje na dodanie folderu jako osobnego projektu w Codexie. Samo istnienie dokumentacji nie oznacza, że gra, logowanie lub zapisy chmurowe już działają.

Nowy czat powinien uzupełnić instrukcje instalacji i uruchamiania po skonfigurowaniu projektu. Nie korzystaj z Live Server do uruchamiania źródeł TypeScript; używaj serwera Vite.

## Prawa i materiały

Kod i materiały umieszczone w publicznym repozytorium są widoczne publicznie. Nie dodano jeszcze licencji udzielającej praw do ponownego wykorzystania całego projektu. Licencje zewnętrznych zależności i assetów są odrębne. Nie commitować sekretów, plików `.env`, danych kont, save'ów użytkowników, `node_modules` ani `dist`.
