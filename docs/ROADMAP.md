# Gnosythium — plan rozwoju

## Etap 0 — osobny projekt

Zatwierdzony: folder Gnosythium, dokumentacja, lokalne repo Git, osobny projekt Codex i VS Code, publiczne repo GitHub oraz Pages. Nie dodawać odnośnika do GameLogs na tym etapie.

## Etap 1 — pierwsza grywalna arena (bieżące zadanie)

Cel: mały, czytelny prototyp pozwalający ocenić ruch i walkę; nie pełne RPG.

- Phaser + TypeScript + Vite, strict TS, zamknięty zestaw zależności i lockfile.
- Jedna scena areny lub krótka lokacja ze statycznymi platformami i kamerą.
- Proste własne grafiki zastępcze rysowane kodem, bez kupowania/generowania assetów.
- Mag: ruch, skok, czytelny kierunek/reticle celowania, pocisk magiczny, osłona i prosty atak krótkim mieczem.
- Jeden typ przeciwnika i czytelny sygnał otrzymania obrażeń.
- Podstawowe HP/mana i HUD; koszty, prędkości i parametry traktować jako roboczy balans, dokumentować sterowanie.
- Jedna prosta interakcja/zagadka magiczna i checkpoint; śmierć/odrodzenie w arenie.
- Fullscreen po świadomym kliknięciu gracza; pauza po utracie aktywności, brak przypadkowego ruchu po powrocie.
- Struktura gotowa na kolejne mechaniki, ale bez abstrakcyjnego frameworka na zapas.
- Czytelny ekran wejścia i instrukcja sterowania; nie udawać finalnej oprawy.

Odbiór: instalacja zależności, typecheck i build działają. Udokumentowany sposób uruchomienia i ograniczenia. Testy automatyczne i Chrome tylko na wyraźne polecenie użytkownika; nie oznaczać kontroli rozgrywki jako wykonanej po samym buildzie.

Nie dodawać w tym etapie prawdziwego logowania, bazy produkcyjnej, pełnego drzewka, wszystkich żywiołów, kampanii ani instalatorów. Jeśli lokalny zapis checkpointu będzie potrzebny, nazwać go lokalnym prototypem, a nie zapisem konta.

## Etap 2 — pętla zapisu i konta

Po odbiorze areny: wybór backendu i sprawdzenie darmowych limitów, logowanie, kilka niezależnych slotów, checkpointy i autosave. Wersjonowanie formatu, właściciel slotu chroniony po stronie serwera, konflikty i lokalna kopia przy problemach z siecią. Bez ręcznego przycisku save.

## Etap 3 — charakter magii

Drugi element, pierwsza świadoma kombinacja, użycie tych samych zasad w walce i zagadce, dalszy projekt piątego elementu, medytacji i rytuałów.

## Etap 4 — rozwój świata i oprawy

Szkice użytkownika, wybrany styl, zestaw animacji jednej postaci i przeciwnika, dźwięk, mała kompletna lokacja. Dopiero potem większe drzewko, kolejne frakcje i narracja środowiskowa.

## Publikacja

Publiczne repo planowane `Anveth/Gnosythium`, Pages przez GitHub Actions, Vite `base: '/Gnosythium/'`. Nie kierować wdrożenia do repo GameLogs. GitHub Pages hostuje statyczną grę, nie bazę kont.

Po dostępności demonstracji i kolejnej decyzji użytkownika: estetyczny kafelek/link w GameLogs. Później ewentualny test wydania desktopowego, bez telefonu.
