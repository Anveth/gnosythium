# Gnosythium — pełna koncepcja

Źródło: rozmowa z użytkownikiem w projekcie GameLogs, 2026-10-24. Dokument przenosi wymagania, nie oznacza wykonania wszystkich funkcji. Nazwa robocza: **Gnosythium**.

## Zatwierdzone decyzje organizacyjne i techniczne

- Silnik: **Phaser + TypeScript**, narzędzia deweloperskie i build: **Vite**.
- Gra działa w przeglądarce na komputerze. Użytkownik początkowo rozważał telefon, potem jednoznacznie wycofał ten wymóg: **„jednak bez telefonu”**.
- Klawiatura i mysz; pełny ekran na komputerze. Obsługa pada jest tylko możliwością do późniejszej decyzji.
- Osobny folder i lokalne repo Git, osobny projekt VS Code, osobny projekt Codex oraz nowy czat do implementacji.
- Osobne publiczne repo GitHub i darmowy GitHub Pages, pod ścieżką projektu na tej samej domenie co GameLogs.
- Ładne podlinkowanie z GameLogs **później, po przygotowaniu demonstracji**. Nie mieszać kodu aplikacji ani wdrożeń.
- Przyszły port desktopowy jest możliwym kierunkiem, nie zadaniem na start. Bez portu mobilnego.
- Start od prostych podstaw i pierwszej areny; duża wizja służy planowaniu dalszego rozwoju.

## Bohater, świat i opowiadanie

- Główny bohater to mag, nie wojownik z kilkoma dodatkowymi czarami.
- Średniowieczne fantasy; magia, elementy okultystyczne, magia ceremonialna, transformacja i medytacja.
- Mroczny, tajemniczy świat. Część fabuły wyjaśniona, część niejednoznaczna. Inspiracją jest sposób odkrywania fabuły w Dark Souls: dużo mystery, śladów i zagadek, bez kopiowania świata lub treści tej serii.
- Docelowi przeciwnicy do dopracowania: mroczni okultyści parający się czarną magią, nieumarli, potwory oraz skorumpowany zakon fikcyjnego fanatycznego kościoła.
- Konkretne postaci, nazwy frakcji, fabuła, układ świata, śmierć i jej konsekwencje pozostają otwarte.

## Gatunek i walka

- Grafika 2D, platformówka, w miarę dynamiczna, ale techniczna. Walka, eksploracja, zagadki i eksperymentowanie z magią.
- Łączenie czarów i kombinowanie, nie tylko naciskanie jednego ataku.
- Główne narzędzia to zaklęcia: pociski, czary obszarowe i blokowanie czarem obronnym.
- Pomocniczy krótki miecz (shortsword): prosty atak wręcz, bez spektakularnego, rozbudowanego systemu broni.
- Pięć elementów magii, a nie wyłącznie klasyczne cztery. Piąty może być specjalnym ultem albo mieć zupełnie inną funkcję. Użytkownik nie zatwierdził jeszcze listy elementów ani zasad.
- Rytuały, transformacja i medytacja mają pasować do świata; ich konkretne mechaniki wymagają dalszego projektu.

## Rozwój postaci i zasoby — wymagania docelowe

- Rozbudowywanie postaci: skill tree, punkty, levelowanie.
- Zdrowie i mana; mikstury zdrowia i many.
- Szczegóły zasobów, kosztów, doświadczenia, balansu, ekwipunku i drzewka są do ustalenia.

## Konta i progres — wymagania docelowe

- Logowanie na konto i trwały progres przypisany do konta.
- Automatyczne zapisy i checkpointy.
- **Brak manualnych save'ów** i ręcznego zapisywania dowolnego momentu gry.
- Możliwość kilku osobnych przejść na jednym koncie: sloty/playthrough saves. Liczba slotów nie została wybrana.
- Nie utożsamiać zapisu progresu z miejscem odrodzenia. Potrzebna późniejsza decyzja, co utrwala się po śmierci.
- Nie zakładać wspólnego konta z GameLogs ani dostępu gry do jego danych.

## Grafika i wkład użytkownika

- Użytkownik nie jest profesjonalnym grafikiem, ale trochę rysuje.
- Może przesyłać skany lub zdjęcia szkiców postaci, czarów, lokacji i projektu do opracowania cyfrowych wersji.
- Rozważa generowanie grafik i wykorzystanie gotowych assetów; nie wybrano jeszcze finalnego stylu ani pakietu.
- Ilustracja koncepcyjna nie jest automatycznie gotowym sprite sheetem. Spójne animacje postaci wymagają kontroli proporcji, klatek i perspektywy.
- Pierwszy prototyp: proste, czytelne grafiki zastępcze, bez uzależniania uruchomienia gry od docelowej oprawy.

## Propozycje asystenta — nie traktować jako zatwierdzonego designu

- Piąty element jako eter/kwintesencja: przemiana właściwości i łączenie żywiołów, nie tylko mocniejszy atak.
- Ogień: podpalanie i aktywowanie palenisk; woda: spowolnienie/zamrażanie i mechanizmy; powietrze: odpychanie/pociski/ruch; ziemia: osłony/przerywanie ataków/obciążanie płyt.
- Czary przydatne zarówno w walce, jak i łamigłówkach. Rytuały jako większe interakcje z otoczeniem, medytacja jako przygotowanie/rozwój/checkpoint.
- Tajemnicza narracja przez inskrypcje, otoczenie i krótkie dialogi; czytelne zasady walki mimo niejasnej fabuły.
- Prototyp w zrujnowanym sanktuarium, mała arena lub lokacja, jeden wróg i prosta zagadka.
- Supabase jest kandydatem do przyszłych kont/zapisów, ale backend nie jest wybrany. Nie zakładać darmowości bez limitów ani użycia produkcyjnego projektu GameLogs.
- Docelowo wersjonowane snapshoty zapisu, lokalna kopia i synchronizacja konta, ochrona przed konfliktem dwóch kart. Nie polegać na zapisie dopiero przy zamknięciu karty.
- Grafika: uproszczona rysowana stylistyka, czytelne sylwetki, ograniczona paleta i mocne efekty magii; to propozycja, nie decyzja o pixel arcie/cutout.
- Ewentualny desktop wrapper, np. Electron, do sprawdzenia później.

## Poza bieżącym zakresem

Telefon, sterowanie dotykowe, multiplayer, monetyzacja, natywne instalatory, pełna kampania, kompletny system pięciu elementów i duże drzewko umiejętności nie są elementami pierwszego prototypu. Multiplayer i monetyzacja nie były zamówione.

## Punkty nadal do ustalenia

Styl i rozdzielczość grafiki, język finalnego UI/fabuły, model celowania, zasady bloku, zestaw aktywnych zaklęć, lista pięciu elementów, rola medytacji/transformacji, liczba slotów, śmierć i utrata zasobów, backend kont, konkretne licencje materiałów.
