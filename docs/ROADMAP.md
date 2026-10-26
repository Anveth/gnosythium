# Gnosythium — plan rozwoju

## Etap 0 — osobny projekt

Zatwierdzony: folder Gnosythium, dokumentacja, lokalne repo Git, osobny projekt Codex i VS Code, publiczne repo GitHub oraz Pages. Nie dodawać odnośnika do GameLogs na tym etapie.

## Etap 1 — pierwsza grywalna arena (bieżące zadanie)

Cel: mały, czytelny prototyp pozwalający ocenić ruch i walkę; nie pełne RPG.

- Phaser + TypeScript + Vite, strict TS, zamknięty zestaw zależności i lockfile.
- Jedna scena areny lub krótka lokacja ze statycznymi platformami i kamerą.
- Otoczenie/wrogowie: grafiki zastępcze rysowane kodem. Na kolejne polecenie użytkownika bohater korzysta z dostarczonych PNG z animacjami; bez kupowania/generowania assetów.
- Mag: ruch, skok i zatwierdzony później podwójny skok z cooldownem, celowanie pozycją myszy z magicznym sigilem, pocisk magiczny, osłona i leczenie (miecz i Q całkowicie wycofano). Najnowsza decyzja użytkownika przywraca celownik i usuwa linię z kostura; eksperyment z celowaniem kątowym i przechwytywaniem myszy został wycofany.
- Jeden typ przeciwnika, pogoń po platformach i przez przepaść oraz czytelne sygnały przed atakiem. Iteracja na polecenie użytkownika: trudniejsza walka, wypady/krótkie serie, brak ciągłego ogłuszania i eksplozja arcane po magii; melee wrogów pozostaje.
- Podstawowe HP/Essence i HUD; koszty, prędkości i parametry traktować jako roboczy balans, dokumentować sterowanie.
- Jedna prosta interakcja/zagadka magiczna i checkpoint; śmierć/odrodzenie w arenie.
- Fullscreen po świadomym kliknięciu gracza; pauza po utracie aktywności, brak przypadkowego ruchu po powrocie.
- Struktura gotowa na kolejne mechaniki, ale bez abstrakcyjnego frameworka na zapas.
- Czytelny ekran wejścia i instrukcja sterowania; nie udawać finalnej oprawy.

Odbiór: instalacja zależności, typecheck i build działają. Udokumentowany sposób uruchomienia i ograniczenia. Testy automatyczne i Chrome tylko na wyraźne polecenie użytkownika; nie oznaczać kontroli rozgrywki jako wykonanej po samym buildzie.

Stan 2026-10-24: kod etapu 1 oraz workflow Pages przygotowane lokalnie; instalacja, strict typecheck i build zakończone powodzeniem. Ręczny odbiór ruchu, walki, wyglądu i cyklu pauza/odrodzenie pozostaje do wykonania. Nie uruchamiano testów ani przeglądarki. Parametry i scenariusz odbioru: [PROTOTYPE.md](PROTOTYPE.md). Nie wykonano commita, pusha ani deployu tego etapu.

Po uruchomieniu przez użytkownika poprawiono kolejność argumentów kolizji pocisku z przeciwnikiem, pieczęcią i bramą, wysokość skoku i pogoń przy granicach patrolu. Dodano double jump na cooldownie 2,5 s, jednostronne stopnie oraz render 2560×1440 z zachowaniem logicznego pola widzenia 1280×720. Te poprawki wymagają ponownego ręcznego odbioru; Codex nie uruchamiał przeglądarki.

Kolejna iteracja zastępuje ograniczenie pogoni do patrolu grafem tras po arenie, upraszcza celownik do jednego rozwidlenia na ramię bez kropek oraz dodaje trudniejszy balans i efekty trafień. Krok fizyki zsynchronizowano z renderem, a wygładzanie kamery uniezależniono od liczby klatek. Użytkownik następnie dostarczył PNG: zintegrowano atlas i animacje wyłącznie bohatera, zielono-brązowy motyw, darmowe bolty, leczenie pod R oraz wolniejszych strzelających wrogów. Nie realizować samej zawartości referencji jako nowych wymagań (np. dasha lub combo). Odbiór kadrów, płynności, nawigacji i balansu nadal wymaga gry użytkownika.

Nie dodawać w tym etapie prawdziwego logowania, bazy produkcyjnej, pełnego drzewka, wszystkich żywiołów, kampanii ani instalatorów. Jeśli lokalny zapis checkpointu będzie potrzebny, nazwać go lokalnym prototypem, a nie zapisem konta.

Na kolejne wyraźne polecenie użytkownika rozszerzono lokalną arenę o jeden czar powietrza pod F: radialny odpych z kosztem/cooldownem, możliwością strącenia i obrażeniami po kolizji z terenem. Do tego ograniczenie spamu osłony, mikser muzyki/SFX, powrót do checkpointu z pauzy i korekta menu. To nie wdraża pełnego systemu pięciu elementów ani etapów kont/rozwoju RPG. Oprawa fali jest proceduralna; generowanie nowych zestawów świata/NPC pozostaje późniejszą pracą.

Kolejna jawnie zamówiona iteracja areny: ziemny Ground smash pod ↓, z pionowym spadkiem, ograniczonym AOE, bonusem obrażeń w centrum i proceduralnym rozbryskiem kamieni. Ma osobny koszt/cooldown, nie niszczy trwale geometrii. Rozszerzenie nie obejmuje reszty pięciu elementów, kont ani pełnego świata. Uporządkowano też menu po dodaniu dziesiątego skrótu: mniejsze kafelki, dwa szerokie rzędy bez scrollbara.

## Etap 2 — pętla zapisu i konta

Po odbiorze areny: wybór backendu i sprawdzenie darmowych limitów, logowanie, kilka niezależnych slotów, checkpointy i autosave. Wersjonowanie formatu, właściciel slotu chroniony po stronie serwera, konflikty i lokalna kopia przy problemach z siecią. Bez ręcznego przycisku save.

## Etap 3 — charakter magii

Drugi element, pierwsza świadoma kombinacja, użycie tych samych zasad w walce i zagadce, dalszy projekt piątego elementu, medytacji i rytuałów.

## Etap 4 — rozwój świata i oprawy

Szkice użytkownika, wybrany styl, zestaw animacji jednej postaci i przeciwnika, dźwięk, mała kompletna lokacja. Dopiero potem większe drzewko, kolejne frakcje i narracja środowiskowa.

## Publikacja

Publiczne repo istnieje: `Anveth/gnosythium`, adres gry: `https://anveth.github.io/gnosythium/`. Pierwsze wdrożenie commita `665e18b` zakończyło się sukcesem w Actions (run `40225823566`); następnie użytkownik zmienił nazwę repo na małe litery. Konfiguracja Vite używa teraz `base: '/gnosythium/'`, aby zasoby nie trafiały pod dawny, zwracający 404 prefiks. Pages ma źródło GitHub Actions; kolejne wdrożenia wymagają sukcesu workflow i sprawdzenia opublikowanych zasobów. Nie kierować wdrożenia do repo GameLogs. GitHub Pages hostuje statyczną grę, nie bazę kont.

Po dostępności demonstracji i kolejnej decyzji użytkownika: estetyczny kafelek/link w GameLogs. Później ewentualny test wydania desktopowego, bez telefonu.
