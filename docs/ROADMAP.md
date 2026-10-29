# WhatsUp Dog — productvisie en ontwikkelplan
Status: leidend productkader, versie 1.0 — 29 oktober 2026

## Productdoel
WhatsUp Dog wordt het eenvoudigste lokale platform waarmee hondenbezitters elkaar helpen om veiliger, prettiger en gemakkelijker buiten te wandelen. Start in Nijkerk, bewijs gebruikerswaarde, schaal daarna pas op. De **kaart opent direct** en is het primaire scherm. Geen accountplicht voor het melden.

## Voor wie en welk probleem?
Hondenbezitters missen één laagdrempelige plek voor actuele lokale gevaren (glas, grasaren, afval, obstakels), praktische wandelinformatie en hulp van anderen. Een melding moet binnen seconden te maken en te begrijpen zijn.

## Productprincipes
1. Kaart eerst; mobiel en éénhandig te bedienen.
2. Melden zonder e-mailadres of wachtwoord; technische anonieme identiteit mag alleen onzichtbaar worden gebruikt indien noodzakelijk voor veilige eigenaarsrechten.
3. Minimaal drie stappen: locatie/foto, categorie/toelichting, publiceren.
4. Privacy by design: geen openbare thuislocatie, geen overbodige profielen; melder kan eigen melding verwijderen.
5. Duidelijke status: nieuw, actief, opgelost; geen misleidende live-data of ongeverifieerde AI-claims.
6. Toegankelijk: voldoende contrast, duidelijke teksten, toetsenbord-/schermlezerondersteuning waar toepasbaar.
7. Geen extra kosten, nieuwe accountkoppelingen, productiedatamigraties of publieke release zonder expliciete toestemming.
8. Behoud bestaande privacy- en veiligheidscontroles tijdens vereenvoudiging.

## Afbakening
**P0 — betrouwbare basis Nijkerk:** kaart direct zichtbaar; stabiele kaartlagen en markers; melding met foto, automatische locatie en categorie; betrouwbare opslag en herladen; eigen melding verwijderen; duidelijke lege/toestand- en foutmeldingen; iPhone/PWA-regressie; geen accountdrempel.
**P1 — dagelijkse waarde:** losloopgebieden, filters, actuele meldingen, veilige opt-in buurtwaarschuwingen en transparante vervaldatum/status.
**P2 — gemeenschap:** lokale weggeef-/ruilhoek zonder verplicht profiel; delen; samenwerking met verenigingen.
**P3 — pas na bewezen vraag:** chat, uitgebreide profielen, AI-fotoherkenning en landelijke uitrol. Geen sociale feed als uitgangspunt.

## Roadmap en kwaliteitsgates
### Fase 0 — nulmeting en herstel (eerste iteratie)
- Inventariseer main, open PR's, Actions, Pages, backend, meldroute, privacy en mobiele PWA.
- Leg vast welke paden daadwerkelijk werken en welke niet; geen ongefundeerde 'groene' status.
- Werk bestaande issues af op gebruikerswaarde; voorkom dubbele backlog.
- Acceptatie: onafhankelijke validate- en browser-acceptance-gates slagen; handmatige rooktest op echte telefoon; productie blijft onveranderd tot releasegoedkeuring.

### Fase 1 — Nijkerk pilot (8 weken na stabiele start)
- P0 volledig beschikbaar en veilig; instrumenteer privacyvriendelijke geaggregeerde gebruiksmetingen.
- Pilotdoelen (hypothesen, nog geen gemeten feiten): >=95% succesvolle meldpogingen; mediane meldingstijd <=30 sec; nul kritieke releasefouten; 100 wekelijkse actieve gebruikers aan eind pilot; 50 nuttige meldingen in 8 weken; >=25% 30-dagen terugkeer.
- Definieer eerst de meetmethode en toestemming voor analytics; geen persoonsgerichte tracking zonder noodzaak.

### Fase 2 — terugkeerwaarde
- P1 prioriteren op basis van pilotfeedback, niet op basis van technische nieuwigheid.
- Acceptatie: terugkerende gebruikers kunnen binnen twee tikken relevante lokale informatie vinden.

### Fase 3 — gecontroleerde uitbreiding
- P2 waar gebruikersvraag is aangetoond; nieuwe plaats alleen als veiligheid, beheer en datakwaliteit herhaalbaar zijn.

## Ontwikkelregels voor Dirigent / AI-agenten
- Elk issue bevat: gebruikersprobleem, gewenste verandering, niet-doen, acceptatiecriteria, tests, risico en kostenimpact.
- Werk op aparte featurebranch, lever draft-PR, commit-SHA, testbewijs en korte release-notities.
- Geen automatische merge, productiedeploy, secretwijziging, database-reset/migratie of gebruikersdatamutatie.
- Bestaande workflows validate.yml, browser-acceptance.yml en dirigent.yml blijven leidend; breid pas uit na bewezen tekort.
- Hergebruik lessons learned in AI Skill Center/Notion; elke wijziging moet het productdoel dienen.

## Eerste ontwikkelvolgorde
1. Nulmeting huidige code, Actions, open PR's, live-versie en mobiele meldroute.
2. Los concrete fouten in P0 op, te beginnen bij kaart, meldingen en eigenaarsrechten.
3. Werk issue #55 alleen af indien de wijziging nog relevant is en tests slagen.
4. Beoordeel issue #51 pas nadat de bestaande autonome ontwikkelcyclus aantoonbaar stabiel is.
5. Start de 8-weekse Nijkerk-pilot pas na expliciete release- en meetgoedkeuring.

## Beslisregel
Een feature gaat alleen door als deze een concreet gebruikersprobleem oplost, eenvoud behoudt, aantoonbaar getest kan worden en geen onaanvaardbare privacy-/kostenimpact heeft.
