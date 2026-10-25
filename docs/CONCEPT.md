# Gnosythium — pełna koncepcja

Źródło: rozmowa z użytkownikiem w projekcie GameLogs, 2026-10-24. Dokument przenosi wymagania, nie oznacza wykonania wszystkich funkcji. Nazwa robocza: **Gnosythium**.

## Zatwierdzone decyzje organizacyjne i techniczne

- Silnik: **Phaser + TypeScript**, narzędzia deweloperskie i build: **Vite**.
- Gra działa w przeglądarce na komputerze. Użytkownik początkowo rozważał telefon, potem jednoznacznie wycofał ten wymóg: **„jednak bez telefonu”**.
- Klawiatura i mysz; pełny ekran na komputerze. Obsługa pada jest tylko możliwością do późniejszej decyzji.
- Osobny folder i lokalne repo Git, osobny projekt VS Code, osobny projekt Codex oraz nowy czat do implementacji.
- Osobne publiczne repo GitHub i darmowy GitHub Pages, pod ścieżką projektu na tej samej domenie co GameLogs.
- Uzgodniony adres pierwszej publikacji: **https://anveth.github.io/Gnosythium/**, repozytorium pozostaje **Anveth/Gnosythium**. Bez zmiany wielkości liter w nazwie repo, bez ingerencji w hosting/kod GameLogs i bez linku na jego stronie głównej. Zlecenie publikacji dotyczy wyłącznie gry.
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

- Zatwierdzony nowszy balans: **100 Essence**, nie 200/ukryte 200; Blessing of Light 25, Breath of Sylf 18, Terra Strike 24, Arcane Protection 16/s i 20 za trafienie. Cooldowny, obrażenia, regeneracja 12/s po 800 ms i darmowy Spectral Bolt co 600 ms pozostają. Te wartości zastępują starsze koszty opisane w historii iteracji poniżej.
- Zatwierdzona korekta Arcane Protection: natychmiastowy pełny bąbel od pierwszej aktywnej klatki, z krótkim fioletowym pulsem około 100 ms. Bez rozrastania, długiego gestu/pochylania maga i bez przerwania lokomocji. Zachować natychmiastową ochronę przy dostępnej akcji, zasoby, antyspam i przełamanie. Nie przywracać poprzedniej animacji ładowania po samym wyłączeniu próbnych efektów innych czarów.
- Doprecyzowanie oprawy Arcane Protection: oprócz instant bąbla ma być widoczny krótki efekt emisji z kryształu kostura. Obecna odpowiedź: fioletowy błysk, trzy zakrzywione strugi do obrzeża i pięć drobnych iskier, wygaszane w 160 ms; nie są ładowaniem osłony ani opóźnieniem ochrony, nie zmieniają pozy postaci.

- Grafika 2D, platformówka, w miarę dynamiczna, ale techniczna. Walka, eksploracja, zagadki i eksperymentowanie z magią.
- Po pierwszym uruchomieniu prototypu użytkownik zatwierdził dodanie podwójnego skoku z cooldownem. Aktualne 2,5 s i parametry wysokości są roboczym balansem, nie ostateczną decyzją.
- Najnowsza decyzja użytkownika: wrócić do celowania pozycją myszy z magicznym, sigilowym celownikiem i usunąć wskaźnik z kostura. Wycofano eksperyment z zachowywanym kątem, R/F/C i przechwytywaniem myszy. Pociski nadal wylatują z kryształu kostura. Wygląd sigilu pozostaje roboczą oprawą prototypu.
- Referencja użytkownika dla celownika: jego symbol z centralnymi osiami, rozwidleniami skierowanymi do środka i dwiema pionowymi bocznymi liniami zakończonymi zawijasami. Aktualne doprecyzowanie upraszcza znak do jednego rozwidlenia na każdym ramieniu i usuwa kropki. Zachować okrągłe proporcje oraz lustrzany układ; nie obracać zawijasów w cztery strony. Celownik ma być mały, czytelny, z pustym środkiem, bez pentagramu.
- Użytkownik wymaga znacznie trudniejszej walki i mądrzejszych przeciwników, którzy podążają za magiem po całej arenie, również na platformy. Bieżąca implementacja tras, wypadów, dwuciosowych serii i czasowej odporności na ogłuszenie to robocza odpowiedź na wymaganie, nie zatwierdzony finalny balans.
- Efekty trafień: eksplozja arcane po magii, bez mechaniki AOE. Krew pozostaje przy otrzymaniu obrażeń przez maga; jego atak mieczem został całkowicie wycofany. Usunąć wrażenie drżenia/przycinania ruchu maga.
- Kolejna decyzja użytkownika: domyślne bolty nie zużywają Essence; dodać leczenie. Nie wybrano ostatecznego balansu — bieżące 35 HP / 30 Essence / 1,05 s skupienia / cooldown 5 s to parametry prototypu. Wrogowie mają być trochę wolniejsi, ale strzelać. Na tym etapie nowe animacje i oprawa dotyczą tylko bohatera.
- Kolejny odbiór: poprawić blok drugiego ciosu, wibracje postaci i zatrzymywanie regeneracji energii; lekko spowolnić strzelanie **bohatera**, nie wrogów, oraz udostępnić aktualne sprite'y. Roboczy odstęp boltów po najnowszym spowolnieniu wynosi 600 ms (wcześniej 420 ms); ochronę kierunkową zastąpił opisany dalej bąbel 360°.
- Kolejna zamówiona mechanika: dynamiczny obszarowy odpych powietrzem wokół całej postaci, także w skoku i w dół. Ma pomagać na niewielkim dystansie, umożliwiać strącenie w przepaść oraz zadawać znaczące, ale nie przesadne obrażenia po zderzeniu odrzuconego wroga z terenem. Osobny koszt Essence i cooldown, jak przy leczeniu; robocza implementacja pod F: 24 Essence, 4,2 s, promień 185, zderzenie 32 HP. Podstawowy bolt pozostaje wcześniejszym darmowym wyjątkiem. Szary efekt skoku traktujemy tematycznie jako magię powietrza; nie dodaje to kosztu do podstawowego ruchu. Nowa fala jest srebrnoszara z chłodną bielą, proceduralna, bez generowania nowego arkusza bohatera.
- Ograniczyć reakcje na ultraszybki spam bloku, zachowując dynamiczną pierwszą reakcję i płynne animacje. Robocze czasy: podtrzymanie 120 ms, odpoczynek 100 ms i minimum 240 ms pomiędzy podniesieniami osłony.
- Odbiór odpychu: zachować zaakceptowany styl wiatru, ale uczynić go bardziej widocznym i efektownym oraz lekko zwiększyć siłę, szczególnie na cele w powietrzu. Push ma być jednakowy ze wszystkich stron, także w pionie i po skosie. Aktualny roboczy impuls 720, cel w powietrzu +15%, bez osłabienia na obrzeżu; przez 440 ms radialne hamowanie bez grawitacji, po czym wraca naturalny spadek. Koszt, cooldown, promień i obrażenia po zderzeniu bez zmian.
- Odbiór audio Breath of Sylf: obecny charakter dźwięku jest dobry; ma być trochę głośniejszy i wyraźniejszy, odpowiadający mocnemu odpychowi powietrza, bez przesady. Aktualna korekta dotyczy tylko tego czaru: gain 0,95, rate 0,76, bez zmiany innych efektów ani muzyki.
- Nowy zamówiony czar ziemi pod strzałką w dół: szybki pionowy spadek z powietrza, uderzenie o podłoże, niewielki rozbrysk kamieni/obszar obrażeń i dodatkowe obrażenia w centrum lądowania. Oprawa ziemi/natury: kamienie, pył, wizualne pęknięcia i ziemista oliwkowo-mszysta zieleń, inna od miętowego mistycznego bolta. Aktualny roboczy balans: 32 Essence, cooldown 6,2 s, spadek 1300 jednostek/s, promień 125, obrażenia 20 + 24 w centrum (promień 36). Nie zmienia to bolta ani całej palety bohatera; brak trwałego niszczenia geometrii świata.
- Korekta oprawy 2026-10-25: klatki nie mogą pokazywać sąsiednich sprite'ów, także w skoku; bieg ma zachować rozmiar bohatera. Usunąć znak/błysk nakładany przy rzucaniu na postać oraz rysowany łuk osłony. Celownik myszy pozostaje; tarcza i jej początek/reakcja na blok mają pochodzić wyłącznie z klatek PNG, bez dokładania dawnych efektów do nowych animacji.
- Doprecyzowanie: usunąć smugi za postacią przy blokowaniu; zostawić tarczę z pentagramem, bez wstęgi. Skok i pozostałe akcje mają zachować skalę anatomii bohatera; naturalne ugięcie nóg lub pochylenie nie oznacza zmiany jego rozmiaru.
- Łączenie czarów i kombinowanie, nie tylko naciskanie jednego ataku.
- Główne narzędzia to zaklęcia: pociski, czary obszarowe i blokowanie czarem obronnym.
- Zatwierdzona zmiana 2026-10-25: całkowicie usunąć miecz bohatera, jego mechanikę, animacje i przypisanie Q. Mag walczy zaklęciami; ataki wręcz przeciwników pozostają.
- Pięć elementów magii, a nie wyłącznie klasyczne cztery. Piąty może być specjalnym ultem albo mieć zupełnie inną funkcję. Użytkownik nie zatwierdził jeszcze listy elementów ani zasad.
- Rytuały, transformacja i medytacja mają pasować do świata; ich konkretne mechaniki wymagają dalszego projektu.

- Odbiór 2026-10-25: bez zwykłego biegu tyłem — postać ma obracać się zgodnie z ruchem. Celowanie myszą pozostaje; podczas czarowania/bloku orientacja nadal odpowiada akcji. Usunąć rozpraszające komunikaty walki typu „Attack blocked”, lekko ściszyć osłonę, skok i otrzymanie obrażeń.
- Po kolejnej decyzji pauza/wznowienie są pod Esc i P. W pełnym ekranie próbujemy Keyboard Lock wyłącznie dla Escape; brak wsparcia lub odmowa pozostawiają P jako niezawodny skrót gry. Nie blokować awaryjnego wyjścia przeglądarki przez długie Esc; w pauzie dostępny przycisk wyjścia z fullscreen. Automatyczna pauza po opuszczeniu fullscreen lub utracie aktywności pozostaje zabezpieczeniem.
- S jest głównym przypisaniem ziemnego smasha, strzałka w dół zostaje alternatywą. Zatwierdzony komplet nazw: **Spectral Bolt** (pocisk), **Arcane Protection** (osłona), **Blessing of Light** (leczenie), **Terra Strike** (ziemia), **Breath of Sylf** (powietrze). Zachować pisownię „Sylf” użytkownika, nie podmieniać samodzielnie na „Sylph” ani wcześniejsze propozycje.
- Najnowsza decyzja wycofuje rykoszety: pociski maga i przeciwników mają niszczyć się przy kontakcie z podłogą oraz dowolną stroną platformy. Krótki błysk/dźwięk kontaktu zostaje, bez obrażeń obszarowych. Jednostronność stopni dla postaci pozostaje; pełne powierzchnie góra/dół/boki dotyczą wyłącznie pocisków. Brama i trafienie celu/wroga/maga zachowują wcześniejsze zasady.

## Rozwój postaci i zasoby — wymagania docelowe

- Zatwierdzona zmiana 2026-10-25: zamiast many zasób **Essence**, duchowa energia bez przypisanego żywiołu. Mag nadaje jej formę zaklęć, osłony, leczenia i docelowo magii żywiołów. Kolory poszczególnych czarów pozostają niezależne od koloru zasobu. Po porównaniu wariantów użytkownik ostatecznie wybrał turkusową świetlistą perłę: cień `#54A99F`, baza `#92D9CF`, światło `#DFF5EE`, ze spokojnym przepływem światła i drobnymi iskrami przy wydawaniu energii. To nie dodaje jeszcze nowych żywiołów ani systemu przekształcania czarów.
- Rozbudowywanie postaci: skill tree, punkty, levelowanie.
- Zdrowie i Essence; docelowo mikstury zdrowia i odnowy energii.
- Szczegóły zasobów, kosztów, doświadczenia, balansu, ekwipunku i drzewka są do ustalenia.

## Konta i progres — wymagania docelowe

- Logowanie na konto i trwały progres przypisany do konta.
- Automatyczne zapisy i checkpointy.
- **Brak manualnych save'ów** i ręcznego zapisywania dowolnego momentu gry.
- Możliwość kilku osobnych przejść na jednym koncie: sloty/playthrough saves. Liczba slotów nie została wybrana.
- Nie utożsamiać zapisu progresu z miejscem odrodzenia. Potrzebna późniejsza decyzja, co utrwala się po śmierci.
- Nie zakładać wspólnego konta z GameLogs ani dostępu gry do jego danych.

## Grafika i wkład użytkownika

- Odbiór Arcane Protection: animacja przywołania była niewidoczna/zbyt subtelna. Wzmocnić czytelność gestu i formowania bąbla; aktualna próba ma cztery fazy przez 420 ms oraz wyraźne fioletowe wstęgi na obrzeżu, widoczne także w ruchu/skoku. Nie opóźniać mechanicznej ochrony ani zmieniać audio, kosztów i antyspamu.

- Ekran śmierci: tytuł **You have fallen** zamiast Return, przycisk **Revive** zamiast Return to checkpoint. To zmiana tekstów, nie zasad odrodzenia lub osobnego restartu checkpointu w pauzie.

- Iteracja próbna na polecenie użytkownika: animacje rzucania Terra Strike, Breath of Sylf i Arcane Protection z istniejących czystych póz plus efekty Phasera; mocniejsza wizualna Terra Strike. Audio zostaje, podobnie koszty, zasięg, obrażenia i czas wykonania tych trzech czarów. To wariant do odbioru, nie zatwierdzony ostateczny styl; poprzednia oprawa pozostaje dostępna przez przełączniki. Osobna decyzja balansu: większe odstępy darmowego Spectral Bolt, aktualnie 600 ms zamiast 420 ms, bez zmiany prędkości pocisku/animacji lub tempa wrogów.

- Użytkownik rozważa proceduralne leczenie w Phaserze, ale chce zachować lubiane pozy i niebiańskie błękitno-złoto-białe kolory. Obecna odpowiedź jest hybrydowa: oryginalna postać/malowane światło plus ruchome pierścienie, wstęgi i iskry. Pełna podmiana VFX bez utraty stroju wymaga czystych póz; nie uznawać jej za już wykonaną ani za zatwierdzenie generowania nowych obrazów. Breath of Sylf ma brzmieć bardziej jak krótki wybuch wiatru, mniej jak syk; korekta dotyczy wyłącznie jego bufora, bez zmiany pozostałego miksu.

- Poświata/skrawki magii przy skoku i double jumpie mają być szare, bez zmiany koloru kostura, kryształu ani całej postaci. Skok nie jest nową paletą czaru i nie zmienia zapamiętanego koloru ostatniego zaklęcia.
- Podczas nieruchomej fazy leczenia dodać oszczędny, ale widoczny ruch samej magii: krążące światło i unoszące się drobiny. Nie poruszać całym obrazem bohatera ani nie nakładać drugiej sylwetki. Mechanika i dźwięk leczenia bez zmian.

- Nowa oprawa magii według referencji użytkownika: tarcza z pentagramem ma być fioletowa; leczenie bardziej niebiańskie, z niebieską aurą, żółto-złotymi runami i białymi iskrami. Kryształ/blask kostura ma odpowiadać ostatnio użytemu czarowi, bez podmiany kształtu, drewna ani okuć. Podstawowy bolt pozostaje zielony. To zmiana kolorów istniejących akcji, nie nowe żywioły lub zaklęcia.
- Doprecyzowanie po odbiorze: obce palety nie mogą zachowywać zielonych prześwitów ani obwódek, również w kryształku i jego poświacie. Fiolet, błękit i złoto mają być wyraźniejsze; zachować materiał i konstrukcję kostura, oryginalne oczy oraz zieloną magię podstawową. Także odbicia magii na postaci i za plecami podczas bloku mają być fioletowe albo usunięte. Najnowsza korekta: tarcza ma być ciemnofioletowa, mistyczna, tylko z minimalnym szaro-białym akcentem; odbicie przy ręce i udzie ma być fioletowe, zgodne z tarczą.
- Najnowszy odbiór menu: w pauzie usunąć „THE JOURNEY IS PAUSED” i cały opis zaczynający się od „Take a breath”. Zachować tytuł, przyciski i sterowanie. Ozdobną gwiazdkę zastąpić pełnym wzorem tatuażu użytkownika, odtworzonym wektorowo w złotawym kolorze starej ozdoby; nie zmieniać uproszczonego celownika.
- Kolejne uproszczenie wejścia: usunąć nadtytuł „A DARK FANTASY / PLAYABLE STUDY” oraz cały opis pod tytułem. Zachować Gnosythium i symbol; oba przyciski startowe większe i bliżej tytułu, „Play in window” z obramowaniem. Z noty prototypu zostaje tylko wyśrodkowane „WORK IN PROGRESS”, bliżej środka pod przyciskami, bez „FIRST ARENA” i informacji Desktop/sterowaniu/zapisie w tej nocie. Osobna lista klawiszy pozostaje.
- Najnowsza korekta menu: powiększyć charakterystyczny symbol użytkownika; „WORK IN PROGRESS” umieścić na dole, już pod instrukcjami. Klawisze pokazać czytelniej. Dodać osobne suwaki głośności i wyciszenie muzyki/SFX oraz restart do ostatniego checkpointu dostępny podczas pauzy. Ustawienia audio są w pamięci bieżącej strony, nie stanowią zapisu konta.
- Użytkownik zatwierdził finalny pełny wzór symbolu z ostatniej referencji: wydłużona pionowa oś, dwie boczne linie z zawijasami, cztery kropki i po dwa rozwidlenia na każdym ramieniu skierowane do środka. To wzorzec znaku głównego, nie polecenie zmiany uproszczonego celownika. W menu zachować złoto i ponownie powiększony rozmiar 6,4 × 10cqw; nie upraszczać ani nie obracać elementów znaku bez kolejnej decyzji użytkownika.
- Po dodaniu kolejnego skrótu użytkownik zgłosił pionowy pasek przewijania menu: instrukcje mają być mniejsze i zajmować prawie całą szerokość obrazu. Obecny układ: 92cqw, pięć kolumn/dwa rzędy dziesięciu instrukcji, bez przewijania; symbol pozostaje duży, WIP pod instrukcjami.
- Dalszy kierunek oprawy: kolejne czary, później tła, platformy, świat, przeciwnicy/NPC i efekty mają pasować do dostarczonego maga i jego magii. To przyszłe prace partiami, nie polecenie wygenerowania całego świata w tej iteracji.
- Muzyka zatwierdzona 2026-10-25: dostarczony przez użytkownika utwór „Astral Ritual” ma grać w tle w pętli.
- Efekty zatwierdzone 2026-10-25: użyć dostarczonych ośmiu MP3 z paczki SFX V6, dopasowując je do obecnych akcji. Wystrzał/trafienie magii, leczenie, tarcza, skok i kroki otrzymują własne nagrania. Dźwięk zamachu dotyczy tylko przeciwników; „sword hit blood” ma towarzyszyć rzeczywistym obrażeniom bohatera niezależnie od źródła. Leczenie ma być wyraźniej słyszalne. Nie przywraca to miecza/Q ani nie dodaje nowych czarów.
- Aktualny odbiór audio: leczenie wraca do oryginalnego nagrania, bo dodane dzwonki mniej pasują użytkownikowi. Tarcza ma być trochę mniej basowa, bardziej atmosferyczna i magiczna; pozostałe poziomy oraz mechaniki zachować.
- Nowy koncept Arcane Protection: zamiast przedniej tarczy z pentagramem bąbel obejmujący całą postać, w podobnym ciemnofioletowym, mistycznym stylu, bez pentagramu. Implementacja proceduralna, bez potrzeby generowania nowego sprite'a. Ochrona obejmuje wszystkie strony, a animacje ruchu/skoku pozostają widoczne; dotychczasowe koszty, przełamanie i ograniczenie spamu zostają. Nie usuwa pentagramów pieczęci/otoczenia.
- Kolejny odbiór Breath of Sylf: samo podgłośnienie nadal jest zbyt mało wyraziste; spróbować mocniejszego podmuchu. Nowy roboczy wariant dźwięku buduje na dotychczasowej próbce, dodając krótki szumowy atak powietrza i umiarkowany impuls ciśnienia, bez zmiany skoku, innych czarów lub muzyki. Parametry pozostają do odsłuchu i odbioru w grze.

- Użytkownik nie jest profesjonalnym grafikiem, ale trochę rysuje.
- Może przesyłać skany lub zdjęcia szkiców postaci, czarów, lokacji i projektu do opracowania cyfrowych wersji.
- Rozważa generowanie grafik i wykorzystanie gotowych assetów; nie wybrano jeszcze finalnego stylu ani pakietu.
- Ilustracja koncepcyjna nie jest automatycznie gotowym sprite sheetem. Spójne animacje postaci wymagają kontroli proporcji, klatek i perspektywy.
- Pierwszy prototyp: proste, czytelne grafiki zastępcze, bez uzależniania uruchomienia gry od docelowej oprawy.
- Użytkownik dostarczył arkusze koncepcyjne, następnie PNG z wyciętymi pozami/efektami. Do bohatera włączono oryginalne arkusze ruchu, walki i czarów; nie wygenerowano wektorowego zamiennika. Kierunek: oliwkowo-zielona szata i kaptur, beżowy szal, brązowe skórzane dodatki, drewniany kostur z zielonym kryształem i bardziej zielona magia. Integracja używa atlasu z indywidualnymi punktami oparcia; nie oznacza zatwierdzenia finalnej jakości animacji ani licencji zewnętrznych materiałów.

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
