# Grafika bohatera

Oryginalne PNG z przezroczystością, dostarczone przez użytkownika do integracji w tej rozmowie:

- `movement.png` — idle, chód, bieg, skok, drugi skok i lądowanie.
- `combat.png` — źródłowe pozy walki; gra używa bloku, reakcji bez broni i upadku z wyciętą bronią.
- `spells.png` — rzucanie pocisku, leczenie i efekty magii.

Nie zmieniano oryginalnych PNG ani nie generowano zamienników. `src/game/art/mageAtlas.ts` definiuje prostokąty klatek, punkty oparcia postaci oraz kryształ. `mageFrameClip.ts` przycina kontury klatek ruchu w pamięci, ograniczając skraj sąsiednich póz; nie zmienia plików źródłowych. `PlayerVisual.ts` wybiera klatki według stanu gry. Arkusze nie są równą siatką: kadry i zakładki efektów wymagają ręcznego odbioru; dopracowanie eksportu może być potrzebne, jeśli widać skraj sąsiedniej pozy lub artefakty krawędzi źródła.

Od 2026-10-25 przygotowanie obejmuje także skoki, lądowanie, rzut i osłonę. Kontury są w `mageFrameContours.ts`, a `mageFrameIsolation.ts` usuwa odłączone wyspy pikseli, zachowując korpus, kryształ i aurę double jumpa. Klatki rzutu z rozbudowanym ładowaniem pominięto; nie dodawać z powrotem kodowego sigilu/błysku ani łuku osłony. Mnożniki skali klatek są czysto wizualne.

Kolejne polecenia: `mageJumpAura.ts` zmienia magię skoku/double jumpa i resztki aury lądowania na neutralną szarość w kopii klatek. Chroniony obszar kryształu zachowuje zielony lub zapamiętany kolor ostatniego czaru; kostur/szata nie są odbarwiane. Cache klipów ma wersję `v2`, wariantów kolorów `v6`. `HealingAura.ts` dodaje wyłącznie do statycznej fazy leczenia subtelny ruch dwóch świateł na elipsach i sześciu wznoszących się iskier; nie animuje całej sylwetki i nie dodaje drugiego obrazu. Używa czasu gry, respektuje przerwanie/pauzę/reset. Źródłowe PNG pozostają nietknięte; natywny podgląd szarych skoków obejrzano, animacji leczenia nie sprawdzano w przeglądarce.

Nie włączono mechaniki dasha ani animacji przeciwników tylko dlatego, że są pokazane na arkuszach. Praw/licencji do materiałów zewnętrznych nie ustalono niezależnie; dostarczenie plików nie nadaje licencji do pozostałych elementów repozytorium. Miecz, jego mechanika, animacje i Q zostały całkowicie usunięte. Oryginalny arkusz pozostaje nienaruszony.

Korekta odbić bloku: zielono-żółte światło na ręce i udzie było zbyt słabe do poprzedniego progu wykrywania. Osobne strefy w trzech klatkach zmieniają ten zafarb na fiolet zgodny z tarczą, zachowując szczegóły materiału, drewno i oczy. Tarcza/kryształ mają teraz ciemny fiolet z bardzo oszczędnym szaroperłowym akcentem tylko w najjaśniejszych miejscach. Jasne neutralne piksele przedniej tarczy także są mapowane, aby nie zostawiały neonowej bieli. Cache wariantów ma wersję `v5`. Oryginalne PNG bez zmian. Obejrzano natywny podgląd trzech klatek, nie grę w przeglądarce. Dodano minimalne fioletowe halo do 5 px od brzegu tarczy w tej samej teksturze; nie ma dodatkowego sprite'a ani łuku. Odbicia przy ręce i udzie korzystają teraz z tej samej palety fioletu, nie z błękitu.

Nowe referencje kolorystyczne nie zastępują sylwetki ani kostura. `mageMagicColors.ts` mapuje magiczne piksele kopii klatek: fioletowy blok, niebiesko-złoto-białe leczenie i odpowiadający czarowi blask kryształu. Oczy są chronione, brązowe drewno i szata nie są tintowane. `mageMagicTextures.ts` buforuje warianty; oryginalne PNG pozostają nietknięte. `PlayerVisual.ts` zachowuje kolor ostatniego czaru do kolejnego rzutu/bloku/leczenia lub resetu.
