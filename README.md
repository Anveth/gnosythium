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

## Status — etap 1

Zaimplementowano pierwszą arenę: ruch, skok i double jump maga, celowanie myszą, darmowy pocisk, osłonę 360°, leczenie, jednego typu wrogów z atakiem wręcz i strzelaniem, HP/Essence, pieczęć/bramę, checkpoint, śmierć i odrodzenie oraz koniec demonstracji. Bohater korzysta z klatek PNG dostarczonych przez użytkownika, w zielono-brązowej stylistyce. Otoczenie i przeciwnicy nadal mają grafikę zastępczą. Angielski interfejs i nazwy lokacji są robocze.

Kontrola typów i build produkcyjny przeszły lokalnie. Rozgrywka i wygląd w przeglądarce oczekują na sprawdzenie na wyraźne polecenie użytkownika. Checkpoint istnieje tylko w pamięci bieżącej sesji: odświeżenie strony zaczyna nowe przejście. Konta i trwałe zapisy pozostają kolejnym etapem.

Workflow Pages jest przygotowany lokalnie. Kod tego etapu nie został zacommitowany ani wypchnięty; nie zaobserwowano pierwszego wdrożenia gry. Istniejące repozytorium i konfiguracja Pages pochodzą z zakończonego setupu.

## Uruchomienie

Zalecany Node.js 24, zapisany w `.nvmrc`; projekt wymaga Node `^22.12.0 || >=24.0.0` i npm. Zależności mają konkretne wersje oraz `package-lock.json`.

```sh
cd Gnosythium
npm ci
npm run dev
```

Otwórz [lokalną grę](http://127.0.0.1:5180/Gnosythium/). Gnosythium używa osobnego portu **5180**, aby działać równolegle z GameLogs na 5173. `strictPort` zatrzyma start, jeśli 5180 będzie zajęty, zamiast po cichu zmieniać adres. Po zmianie konfiguracji uruchom ponownie serwer Gnosythium przez `npm run dev`.

Przycisk **Enter in fullscreen** uruchamia pełny ekran, a **Play in window** pozostawia grę w oknie. Przeglądarka może odmówić fullscreen — wtedy gra przechodzi do trybu okna. Źródła uruchamiaj przez Vite, nie przez Live Server ani `file://`. Pauza ma uproszczoną oprawę bez dodatkowego nagłówka i opisu; złotawy znak z referencji tatuażu zastępuje gwiazdkę menu. Celownik gry pozostaje bez zmian.

```sh
npm run typecheck
npm run build
npm run preview
```

Podgląd buildu używa osobnego portu **4180**: [127.0.0.1:4180/Gnosythium/](http://127.0.0.1:4180/Gnosythium/). `build` wykonuje również typecheck. `dist` jest wynikiem budowania i nie trafia do repo. Vite informuje o dużym pliku JavaScript z silnikiem Phaser; nie blokuje to buildu.

## Sterowanie i cel

Zwykły chód/bieg automatycznie obraca bohatera w kierunku ruchu, bez odtwarzania animacji tyłem. Przy rzucaniu nadal liczy się celowanie myszą; z aktywnym bąblem mag zwraca się zgodnie z ruchem; na postoju celownik również ustawia zwrot. Usunięto toasty walki i leczenia, ale pozostają informacje o pieczęci/checkpointach oraz stały HUD.

**Essence** zastępuje manę: neutralna duchowa energia, której mag nadaje formę czarów, osłony i leczenia. Pasek w wybranej turkusowej świetlistej perle (cień `#54A99F`, baza `#92D9CF`, światło `#DFF5EE`) ma delikatny przepływ światła i trzy drobne iskry przy zużyciu. Animacje zatrzymują się podczas pauzy i są wyłączone przy ograniczeniu ruchu w systemie. Kolory czarów pozostają niezależne; podstawowe bolty nadal są darmowe. Pula pozostaje 100, regeneracja 12/s po 800 ms; zatwierdzone niższe koszty podano przy czarach.

| Akcja | Klawisze / mysz |
| --- | --- |
| Ruch | A/D lub strzałki lewo/prawo |
| Skok; przytrzymanie zwiększa wysokość | Spacja, W lub strzałka w górę |
| Drugi skok w powietrzu; cooldown 2,5 s widoczny w HUD | Zwolnij i ponownie naciśnij klawisz skoku |
| Celowanie pociskiem | Mysz; magiczny sigil pokazuje punkt celowania |
| Spectral Bolt — darmowy pocisk; można przytrzymać | LPM lub J |
| Arcane Protection — bąbel ochronny 360°; przytrzymaj | PPM, Shift lub K |
| Blessing of Light — leczenie: 35 HP, 25 Essence, 1,05 s skupienia, cooldown 5 s | R; stój na podłożu |
| Breath of Sylf — odpych: 18 Essence, cooldown 4,2 s; 360° także w skoku | F |
| Terra Strike — ziemny smash: 24 Essence, cooldown 6,2 s; z powietrza | S (główne) lub ↓ |
| Checkpoint / wyjście | E |
| Pauza | Esc, P lub przycisk w HUD; Esc bez wychodzenia z fullscreen wymaga obsługi i zgody na Keyboard Lock |
| Wznowienie | Esc, P lub przycisk w menu |

Wejdź na górne platformy i traf lewitującą pieczęć pociskiem. Stopnie przepuszczają postać od dołu, a podtrzymują przy opadaniu. Podstawowy skok jest wyższy; double jump można wykonać raz na lot i ponownie po upływie 2,5 s oraz lądowaniu. Cooldown nie zatrzymuje się po lądowaniu, ale pauzuje razem z grą. Przeskocz przepaść. Przy kręgu za przepaścią naciśnij E, aby odnowić zasoby i ustawić checkpoint. Przejdź przez otwartą bramę i naciśnij E przy końcowym portalu. Czerwony sygnał nad przeciwnikiem poprzedza jego atak.

Celowanie korzysta z pozycji myszy. Celownik odtwarza uproszczony układ symbolu użytkownika: centralne osie, po jednym rozwidleniu skierowanym do środka na każdym ramieniu i dwie pionowe boczne linie z zawijasami, bez kropek. Proporcje wynoszą 20×20 jednostek. Znak jest lustrzany lewo/prawo i góra/dół, ale bez symetrii obrotowej co 90°. Ma wyraźne kreski i pusty środek, bez pentagramu, poświaty i wypełnionego tła. Nie ma linii kierunku z kostura, przechwytywania myszy ani regulacji R/F/C. Znak zastępuje systemowy kursor nad areną podczas gry; w menu działa zwykły kursor. Brak automatycznego namierzania i losowego rozrzutu.

Wrogowie po wykryciu maga lub trafieniu nie porzucają pogoni na końcu patrolu. Korzystają z tras po platformach i przeskakują przepaść. Na kolejne polecenie użytkownika spowolniono pogoń do 240 i wypad do 390 jednostek/s. Z dystansu strzelają wolniejszym, miedziano-czerwonym pociskiem: 18 obrażeń, prędkość 360, przygotowanie 650 ms, przerwa 1,9 s. Kierunek zostaje ustalony przy rozpoczęciu przygotowania; nie śledzi gracza po wystrzale. Platformy niszczą pociski, a zamknięta brama je wygasza. Osłona może blokować pociski. Nie dodano animacji ani nowej grafiki wrogów.

Pozostały sygnalizowane wypady, drugi cios i odporność na stałe ogłuszanie (złota kreska nad HP, nie odporność na obrażenia). Mag nie ma już miecza, Q ani blokad innych akcji związanych z jego cooldownem. Krew pozostaje przy obrażeniach maga, a pocisk daje zieloną eksplozję arcane, bez obrażeń obszarowych. Zwykłe bolty kosztują **0 Essence** i nie opóźniają jej regeneracji; mają 130 ms przygotowania zsynchronizowanego z klatką wypuszczenia pocisku z kostura. Odstęp między strzałami bohatera wynosi 600 ms (wcześniej 420 ms), a animacja i blokada osłony nadal 320 ms; nie zmieniono prędkości pocisków ani tempa ostrzału wrogów.

Udany blok zatrzymuje wypad wroga, ale pozostawia drugi cios. Arcane Protection otacza całą postać półprzezroczystym ciemnofioletowym bąblem, bez pentagramu, od razu w pełnym rozmiarze i z krótkim pulsem 100 ms. Zużywa 16 Essence/s oraz 20 za zablokowany atak. Blokuje melee i pociski z każdej strony, niezależnie od celownika, ale nie chroni przed przepaścią. Trafienia tworzą krótkie fale na obrzeżu, a mag zachowuje zwykły ruch/skok bez starych klatek przedniej tarczy. Do jej podniesienia potrzeba energii na jeden blok i bieżący drenaż; po przełamaniu puść i naciśnij przycisk ponownie, najwcześniej po 850 ms. Zapobiega to pętli automatycznego podnoszenia pustej tarczy i odkładania regeneracji Essence.

Pierwszy blok reaguje natychmiast, ale krótkie kliknięcie podtrzymuje gardę przez 120 ms. Po opuszczeniu obowiązuje minimum 100 ms odpoczynku, a podniesienia dzieli co najmniej 240 ms. Ultraszybkie kliknięcia nie kolejkują osobnych animacji. Obrażenia i przełamanie nadal przerywają osłonę od razu.

**R — Blessing of Light (leczenie):** 35 HP za 25 Essence po 1,05 s stania na podłożu. Ruch, skok, atak, osłona lub otrzymane obrażenia przerywają skupienie. Energia Essence pobierana jest na początku i nie wraca po przerwaniu; cooldown 5 s również liczy się od rozpoczęcia. Nie ma darmowej nietykalności ani leczenia ponad maksimum HP. Przy pełnym zdrowiu akcja nie pobiera Essence. HUD pokazuje czas skupienia, cooldown i brak Essence. Parametry są robocze.

Oprawa leczenia jest hybrydowa: zachowane pozy i malowane światło z PNG, a w Phaserze animowane błękitno-złote pierścienie, spiralne wstęgi i białe iskry. Bez drugiego obrazu postaci i zmiany jej skali; przerwanie usuwa efekt, pauza zamraża ruch. Pełne zastąpienie namalowanej aury wymaga czystych póz bez VFX; obecna wersja nie wycina części stroju.

**F — Breath of Sylf:** dynamiczna srebrnoszara fala wokół środka postaci, promień 185, koszt 18 Essence, cooldown 4,2 s. Działa w każdą stronę, również w dół podczas skoku, bez celowania myszą. Impuls zwiększono z 650 do 720, bez osłabiania na obrzeżu; cel w powietrzu dostaje dodatkowe 15%. Podczas 440 ms odpychu grawitacja wroga jest wyłączona, a obie osie hamowane proporcjonalnie, aby uzyskać ten sam push z każdej strony; teren nadal zatrzymuje ruch. Potem wraca zwykła grawitacja. Przerywa atak wroga i odrzuca go na krótki dystans; wróg może wpaść w przepaść i zginąć. Mocne uderzenie odrzuconego wroga o teren daje 32 obrażenia, maksymalnie raz na odpych; sam czar nie zadaje bezpośrednich obrażeń. Przeszkody/brama zasłaniają falę. Przygotowanie 90 ms można przerwać obrażeniami bez zwrotu kosztu; akcja trwa 300 ms, ruch/skok pozostają dostępne. F przerywa leczenie. HUD pokazuje cooldown/brak Essence, czas nie mija podczas pauzy. Jaśniejsze warstwowe łuki, dłuższe zakrzywione smugi i drobiny utrzymują efekt przez 620 ms, bez pełnej zasłony na postaci. Efekt jest rysowany kodem, a mag używa czystych istniejących póz z atlasu i srebrnego kryształu; bez nowych generowanych obrazów. Podstawowe bolty pozostają darmowe.

W menu i pauzie są osobne suwaki oraz wyciszenie muzyki i wszystkich SFX. Domyślnie muzyka ma 30%, efekty 100% wcześniejszego miksu. Ustawienia są zachowane do przeładowania strony, także przy nowym runie, bez trwałego zapisu. Z pauzy można wybrać **Restart from checkpoint**: wracają zasoby, wrogowie i stan pieczęci z ostatniego dostrojenia; bez checkpointu powrót na początek. Symbol menu jest większy, instrukcje mają mniejsze osobne keycapy w pięciu kolumnach i dwóch rzędach na 92% szerokości obrazu, bez scrollbara, a „WORK IN PROGRESS” znajduje się pod nimi.

**S / ↓ — Terra Strike:** naciśnij S (lub ↓) w powietrzu, aby błyskawicznie spaść pionowo i uderzyć w pierwszą platformę/podłoże. Koszt 24 Essence, cooldown 6,2 s, po trafieniu 240 ms odpoczynku. Rozbrysk kamieni zadaje 20 obrażeń do 125 jednostek od uderzenia i dodatkowe 24 w centrum 36 (łącznie 44, raz na wroga). Wysokość i przeszkody ograniczają obszar; nie rani przez zamkniętą bramę ani odległe platformy. Nie ma nietykalności: obrażenia przerywają spadek bez zwrotu Essence. W czasie spadku nie można kierować ruchem ani używać innych czarów/skoku. W przepaści nadal można zginąć. Pęknięcia, pył i odłamki są wizualne, bez trwałego niszczenia świata. Kolor ziemi/natury jest oliwkowo-mszysty z brązem kamieni, inny od miętowej magii bolta; kryształ pamięta ten kolor. HUD pokazuje gotowość/cooldown i potrzebę skoku. Pauza zamraża czar, restart checkpointu resetuje jego stan.

Spectral Bolt wylatuje z kryształu w aktualnej klatce animacji, również przy odbiciu postaci w lewo, i zmierza do sigilu. Pociski maga i przeciwników niszczą się przy pierwszym kontakcie z podłogą lub platformą, również od spodu i z boku, z krótkim błyskiem/dźwiękiem bez AOE. Nie odbijają się. Postacie nadal mogą wskakiwać przez jednostronne stopnie; pełne collidery kontaktu dotyczą tylko pocisków. Zamknięta bariera zajmuje całą wysokość świata — najpierw trzeba trafić lewitującą pieczęć, aby ją rozproszyć.

Render ma rozdzielczość 2560×1440 przy logicznym polu widzenia 1280×720. Bohater używa oryginalnych przezroczystych arkuszy użytkownika: idle, chód/bieg, skok, double jump, lądowanie, osłona/reakcja na blok, otrzymanie obrażeń, rzucanie i leczenie. Arkusze są kadrowane przez atlas z osobnymi punktami oparcia i pozycjami kryształu; fizyczne ciało nie zmienia rozmiaru przy zmianie klatki. Fizyka i kamera zachowują poprawki płynności. Klipy i krawędzie grafik wymagają wizualnego odbioru — źródłowe pozy/efekty miejscami nachodzą na sąsiednie kadry. Nie uruchamiano przeglądarki.

Korekta animacji 2026-10-25: osobne kontury i izolacja sylwetki usuwają fragmenty sąsiednich póz, również w skoku. Bieg/chód mają wyrównaną skalę względem idle, bez zmiany collidera. Nowa akcja wygasza poprzednią. Usunięto dodatkowy znak przy strzelaniu i rysowany łuk osłony — celownik myszy zostaje, dawną tarczę i jej pozę guard zastąpił teraz proceduralny bąbel Arcane Protection, bez pentagramu.

`mageCombatContours.ts` zachowuje maski korpusu/przedniej tarczy oraz wycina broń z pozy upadku. Usunięto klatki i kontury ataków mieczem. Reakcja na obrażenia korzysta z pozy bez broni. Maski są sumowane bez dziur; dawne klatki guard z pentagramem nie są już wybierane przez PlayerVisual. Arcane Protection jest proceduralnym bąblem 360°, bez pentagramu i bez drugiej sylwetki; reakcja na trafienie nie resetuje fazy chodu. Skok ma skalę 1,12, double jump 1,10; pozostałe grupy mają kalibrację względem idle. Oryginały PNG i collider pozostają nietknięte. Obejrzano natywny podgląd klatek, nie grę w przeglądarce.

Kolory magii według nowych referencji: ciemnofioletowy bąbel Arcane Protection, leczenie z niebieską aurą, złoto-żółtymi runami i białym światłem. Kryształ kostura pamięta kolor ostatniego czaru również podczas ruchu: fiolet po bloku, złoto/biel po leczeniu, zieleń po bolcie. Odrodzenie przywraca zieleń. Zmieniają się tylko magiczne piksele, nie kształt/drewno/owijki kostura ani oczy i szata bohatera. Oryginalne PNG, mechaniki i pasek Essence pozostają bez zmian.

Historyczna korekta dawnych klatek bloku (zastąpionych teraz bąblem): zielono-żółte światło na ręce i udzie było zbyt słabe do poprzedniego progu wykrywania. Osobne strefy w trzech klatkach zmieniają ten zafarb na fiolet zgodny z tarczą, zachowując szczegóły materiału, drewno i oczy. Tarcza/kryształ mają teraz ciemny fiolet z bardzo oszczędnym szaroperłowym akcentem tylko w najjaśniejszych miejscach. Jasne neutralne piksele przedniej tarczy także są mapowane, aby nie zostawiały neonowej bieli. Cache wariantów ma wersję `v5`. Oryginalne PNG bez zmian. Obejrzano natywny podgląd trzech klatek, nie grę w przeglądarce. Dodano minimalne fioletowe halo do 5 px od brzegu tarczy w tej samej teksturze; nie ma dodatkowego sprite'a ani łuku. Odbicia przy ręce i udzie korzystają teraz z tej samej palety fioletu, nie z błękitu.

Utrata aktywności karty/okna i wyjście z fullscreen zatrzymują grę. Powrót nie wznawia jej automatycznie; przytrzymane akcje trzeba zwolnić i nacisnąć ponownie. Przy wejściu w fullscreen gra próbuje przechwycić tylko krótkie Esc przez Keyboard Lock. Jeśli przeglądarka nie wspiera API lub odmówisz zgody, używaj P. Długie Esc i przycisk „Exit fullscreen” w pauzie nadal pozwalają wyjść; nie ma gwarancji przechwycenia Esc na każdej przeglądarce.

Muzyka w tle: dostarczony utwór **Astral Ritual**, zapętlony przy głośności 30%. Startuje po wejściu do gry, pauzuje razem z nią i kontynuuje po wznowieniu. Jeśli przeglądarka zablokuje dźwięk, kliknij arenę lub naciśnij klawisz podczas gry. MP3 jest lokalnym assetem importowanym przez Vite, z zachowaniem bazy `/Gnosythium/`.

## Kod i dalsza praca

Arcane Protection: przy instant pojawieniu pełnego bąbla kryształ kostura błyska fioletem i wysyła trzy krótkie strugi do obrzeża oraz drobiny (160 ms). To tylko oprawa — nie opóźnia ochrony ani nie zmienia pozy maga; puls obrzeża 100 ms pozostaje. Audio i koszty bez zmian.

Próbna oprawa czarowania: Sylf ma cztery fazy ruchu kostura, Terra Strike podkurczenie/przejście do spadku i dodatkowe fale, większe odłamki, unoszone płyty oraz pył. Arcane Protection jest natychmiastowym pełnym bąblem z fioletowym pulsem 100 ms, bez gestu, rozrastania ani przerywania lokomocji. Audio, zasięg, obrażenia i collidery bez zmian. W `src/game/art/spellPresentation.ts` flagi `casting` i `terraImpact` pozwalają cofnąć tylko próbną oprawę Sylf/Terra Strike; nie cofają zatwierdzonego instant bąbla, kosztów ani odstępu Spectral Bolt. Wygląd wymaga odbioru w grze.

Dodano osiem SFX z paczki użytkownika: bolt/uderzenie magii, leczenie, tarcza, skok i zapętlone kroki. Kroki grają tylko przy przemieszczaniu się po podłożu, nie w powietrzu ani przy ścianie. Zamach miecza jest wyłącznie dla ataku wroga; „sword hit blood” odtwarza się przy rzeczywistych obrażeniach bohatera, również od pocisku. Nie przywrócono miecza/Q. Leczenie ma poziom 1,0, tarcza 0,62; leczenie wróciło do oryginalnego nagrania, a tarcza ma lżejszy wariant z harmonicznymi i tłumionym pogłosem. Oryginalne MP3 pozostają nietknięte. Wariant tarczy jest przygotowywany raz w Web Audio, nie podczas każdej akcji; leczenie nie ma już dodanych dzwonków ani obróbki. Efekty respektują pauzę i reset sesji, nie tworzą nieograniczonych kopii. Breath of Sylf ma osobny mocniejszy bufor wind: zachowany motyw, przytłumione wysokie pasmo, krótki podmuch i opadający impuls ciśnienia zamiast długiego syczenia, z ograniczeniem szczytu do 0,9 i głośnością 0,7. Nie jest ucinany przez zwykły skok; skok i pozostałe SFX nie są podgłośnione. [Mapa plików i szczegóły audio](src/assets/audio/README.md). Miks wymaga odsłuchu w grze; nie sprawdzano przeglądarki.

- `src/game/scenes/ArenaScene.ts` — składanie areny i pętla sceny.
- `src/game/input/` — akcje i niezależne przypisania klawiszy.
- `src/game/player/`, `combat/`, `enemies/` — ruch, zasoby, walka i zachowanie wroga.
- `src/assets/mage/`, `src/game/art/mageAtlas.ts`, `src/game/player/PlayerVisual.ts` — PNG użytkownika, atlas i animacje; `Healing.ts` i `EnemyProjectiles.ts` — leczenie i ostrzał wrogów.
- `src/game/enemies/PlatformNavigation.ts` — graf połączeń platform i planowanie skoków; `src/game/combat/HitEffects.ts` — osobne animowane efekty trafień.
- `src/game/world/`, `art/` — układ areny, interakcje, pieczęć i grafika zastępcza.
- `src/game/state/CheckpointState.ts` — snapshot checkpointu w pamięci, bez warstwy trwałego zapisu.
- `src/ui/` i `src/game/GameSession.ts` — HUD, menu i cykl sesji.
- [Parametry prototypu i scenariusz ręcznego odbioru](docs/PROTOTYPE.md).

Wdrożenie przygotowuje `.github/workflows/deploy.yml`: PR sprawdza build, a push na `main` buduje i publikuje `dist`. Wymaga istniejącego ustawienia Pages → Source: GitHub Actions. Vite ma `base: '/Gnosythium/'`; PNG bohatera są importowane przez Vite, więc zachowują prefiks projektu również po buildzie. Trzy arkusze zajmują razem około 6,45 MB przed transportem.

## Prawa i materiały

Kod i materiały umieszczone w publicznym repozytorium są widoczne publicznie. Nie dodano jeszcze licencji udzielającej praw do ponownego wykorzystania całego projektu. Licencje zewnętrznych zależności i assetów są odrębne. Nie commitować sekretów, plików `.env`, danych kont, save'ów użytkowników, `node_modules` ani `dist`.
