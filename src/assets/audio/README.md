# Audio dostarczone przez użytkownika

`astral-ritual.mp3` jest zapętloną muzyką tła. Folder `sfx/` zawiera osiem oryginalnych MP3 z paczki **Gnosythium SFX V6 — Mystic Occult**. Pliki skopiowano bez zmiany brzmienia i bez zewnętrznych usług lub nowych zależności.

| Plik SFX | Zdarzenie w grze |
| --- | --- |
| `01_arcane_projectile_cast.mp3` | Emisja bolta z kostura; ciszej przy strzale wroga |
| `02_sword_swing.mp3` | Początek aktywnego wypadu przeciwnika, także nietrafionego |
| `03_sword_hit_blood.mp3` | Rzeczywiste obrażenia bohatera, od melee i pocisku; nie sam kontakt podczas nietykalności |
| `04_arcane_projectile_impact.mp3` | Trafienie boltem wroga/pieczęci/platformy/bramy; ciszej przy uderzeniu obcego pocisku lub wroga odrzuconego powietrzem w otoczenie |
| `05_heavenly_heal.mp3` | Rozpoczęcie dozwolonego leczenia; przerywane razem ze skupieniem |
| `06_protective_shield.mp3` | Przywołanie tarczy i udany blok; puszczenie/przełamanie zatrzymuje dźwięk |
| `07_character_jump.mp3` | Rzeczywisty skok i double jump; źródło osobnego bufora/głosu wind dla Breath of Sylf |
| `08_running_footsteps_loop.mp3` | Jedna pętla przy rzeczywistym ruchu po podłożu; wolniej i ciszej podczas chodu z osłoną |

`SoundEffects.ts` ustala osobne poziomy, maksymalnie 17 głosów (osobny wind i ograniczone pule pozostałych efektów) i obsługuje cykl sesji. Po kolejnej korekcie leczenie ma poziom 1,0 (wcześniej 0,8), a tarcza 0,62 (wcześniej 0,35). Nie zmieniono kosztu/czasu leczenia; po jego ukończeniu nagranie naturalnie wybrzmiewa. Pauza zamraża aktywne efekty, zatrzymując kroki/osłonę; śmierć, koniec i odrodzenie czyszczą dźwięki, a restart usuwa stare głosy. Zablokowane audio nie kolejkuje zaległych akcji. URL-e importuje Vite z bazą Pages. Ostatnia korekta miksu ustawia skok na 0,52 zamiast 0,65, obrażenia na 0,32 zamiast 0,4; leczenie używa oryginału, a przetwarzanie dotyczy tarczy oraz osobnego wariantu wiatru; leczenie pozostaje oryginalne.

## Przetwarzanie i miks

Najnowszy Breath of Sylf ma dedykowaną pulę wind (jeden głos, volume 0,7), aby skoki go nie przerywały. Web Audio tworzy raz bufor `sylf-gust-v2` w `sylfGust.ts`: zachowana próbka jump przy wbudowanym rate 0,76, ale zamiast podbijania syczącego pasma dwukrotny low-pass 2400 Hz i skrócony ogon. Szum jest krótkim podmuchem (zanik 65 ms, low-pass opada z 2150 do 650 Hz, high-pass 180 Hz), nie ciągłym wysokim sykiem. Krótki impuls ciśnienia opada z około 305 do 125 Hz z lekką harmoniczną, bez subbasu. Miękkie nasycenie, fade i maksymalny szczyt bufora 0,9; odtwarzanie przetworzonego bufora przy rate 1. HTML5 fallback nadal używa oryginału przy rate 0,76 i volume 0,7, bez tej obróbki. Nie dodano MP3 ani zewnętrznych usług. Zwykły skok, Terra Strike, tarcza, leczenie i muzyka bez zmian; pauza/reset/suwak/mute obejmują cały wind. Nowy miks wymaga odsłuchu w grze; nie wykonano kontroli przeglądarkowej.

Ground smash współdzieli dotychczasowe pule: początek spadku używa jump przy gain 0,45/rate 0,65, a pojedyncze lądowanie impact przy gain 0,95/rate 0,65. To warianty odtwarzania istniejących nagrań, nie nowe MP3 ani nowe głosy; podlegają głośności/mute efektów i cyklowi pauzy/resetu.

Menu i pauza pozwalają niezależnie regulować oraz wyciszać muzykę i wszystkie SFX. SFX mnożą dotychczasowy miks przez ustawienie 0–100% na menedżerze Phasera; muzyka ma własny HTML Audio i suwak z domyślnym 30%. Domyślne 100% efektów zachowuje opisany miks, nie zwiększa wszystkich nagrań do maksymalnej głośności. Ustawienia pozostają w pamięci strony, także po nowym runie; nie ma localStorage. Pule są ograniczone do 17 głosów; cykl pauzy bez zmian. Kontrola bloku ogranicza ponowne przywołania do jednego na minimum 240 ms, bez kolejki dźwięków od każdego kliknięcia.

Po odbiorze użytkownika leczenie wróciło do oryginalnego nagrania, bez dodatkowych dzwonków/pogłosu/normalizacji; zachowano poziom 1,0. `mysticSpell.ts` przetwarza już tylko tarczę, bez zmiany jej MP3. Dwie kaskadowe sekcje górnoprzepustowe 160 Hz usuwają nadmiar basu ze źródła, bez obejścia suchym basem. Root przeniesiono z D3 do D4, dodane tony są wyższe i subtelniejsze; zostają przestrzenne harmoniczne i krótkie tłumione odbicia. To robocza oprawa magiczna, nie rekonstrukcja historycznej muzyki.

Łagodna kompresja i normalizacja szczytu wariantu tarczy do maksymalnie 0,88 ograniczają przesterowanie samego bufora; głośność tarczy pozostaje 0,62. Zachowano długość i początek akcji, końcówka ma krótki fade-out. Przetwarzanie odbywa się raz przy wczytaniu, cache `mystic-v2`, nie w pętli gry. Harmoniczne i pogłos są częścią tego samego bufora i podlegają zatrzymaniu/pauzie/resetowi. HTML5 Audio używa oryginału. Pozostałe SFX i muzyka pozostają bez zmian; miks wymaga odsłuchu w grze.

Mimo nazw dwóch plików z `sword` bohater nadal nie ma miecza ani Q. Nie dodano nowych mechanik tylko na podstawie zawartości paczki. Materiały dostarczył użytkownik; ich prawa/licencja nie zostały niezależnie zweryfikowane i nie nadają licencji całemu repozytorium. Miks i synchronizacja wymagają odsłuchu w grze; nie wykonano kontroli w przeglądarce.
