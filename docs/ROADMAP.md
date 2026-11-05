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


## Uitvoeringslog 4 november 2026 — PR #71
- Head `fca552a`: map-regression groen ([run 41903083628](https://github.com/waldokolk-dotcom/whatsup-dog/actions/runs/41903083628)); validate en browser-acceptance rood door 14–15 browsercases die de verborgen `#pawInfo` proberen te klikken na de gewijzigde FAB-flow.
- Commit `68d74c7`: vijf tests in `tests/v3.spec.mjs` navigeren voortaan via zichtbare tab Mijn Whatsup → Gebruik & veiligheid (`#myInfoLink`). Nieuwe CI-resultaten afwachten en alle resterende fouten uit logs herstellen.
- Livegang NIET bewezen. Geen productie- of preview-URL geverifieerd. Echte Supabase-upload/verwijderen en fysieke iPhone-acceptatie blijven open.
- Sinds 4 november 2026 is de eigenaar akkoord met autonome productiepublicatie NA groene vereiste tests, beveiligingscontroles, reviews en binnen hostingrechten. Geen kosten, secrets, migraties of productiegegevensmutaties zonder afzonderlijke toestemming. Dit vervangt uitsluitend het oudere verbod op automatische release hierboven.
- Volgende uitvoerder: controleer Actions op head `68d74c7`; herstel resterende testfouten; voer browser-acceptance en mobile viewport-tests uit; maak geautoriseerde bereikbare preview; verifieer live deployment vóór melding van oplevering.

## Kwaliteitscontrole 4 november 2026, 22:56 CET
- Head `916ccca6`: alle vier GitHub Actions-controles groen: [browser-acceptance #41911463226](https://github.com/waldokolk-dotcom/whatsup-dog/actions/runs/41911463226), [validate #41911463220](https://github.com/waldokolk-dotcom/whatsup-dog/actions/runs/41911463220), [map regression #41911463270](https://github.com/waldokolk-dotcom/whatsup-dog/actions/runs/41911463270), [daily quality watch #41911463297](https://github.com/waldokolk-dotcom/whatsup-dog/actions/runs/41911463297).
- PR #71 van draft naar **ready for review** gezet; dit is GEEN merge of deploy.
- Open releasegates: echte backend upload/herladen/verwijderen, geverifieerde iPhone/Android-preview en hosting/deploy-autorisatie/reviews. Niet publiceren totdat die voorwaarden aantoonbaar voldaan zijn.
- Volgende cyclus: zoek bestaande geautoriseerde preview/deployroute, test de bereikbare app, herstel resterende P0 UX-regressies en rond review/release af.

## Uitvoeringscyclus 4 november 2026 — mobiele kaartbediening
- Head vóór wijziging `253b212`: vier Actions groen: [map regression](https://github.com/waldokolk-dotcom/whatsup-dog/actions/runs/41920802816), [browser acceptance](https://github.com/waldokolk-dotcom/whatsup-dog/actions/runs/41920802788), [daily quality watch](https://github.com/waldokolk-dotcom/whatsup-dog/actions/runs/41920803160), [validate](https://github.com/waldokolk-dotcom/whatsup-dog/actions/runs/41920802846).
- Concrete UX-verbetering op dezelfde featurebranch: mobiele kaartfilterrail ondersteunt expliciete horizontale swipe en zichtbare toetsenbordfocus op kaartbediening (`d2c4e95`). HTML en offline PWA-cache zijn samen opgehoogd naar stylesheet `modern-2026.css?v=8`, cache `v106` (`2ce1b62`, `d038ca4`).
- Nieuwe CI voor `d038ca4` nog niet bevestigd bij controle. **Niet mergen of deployen** zonder groene CI, geautoriseerde hosting/reviews en echte mobiele preview-/backendverificatie. Geen productie-URL geclaimd.
- Volgende run: controleer CI van `d038ca4`, herstel eventuele fouten, inspecteer bestaande deploymentconfiguratie en verifieer preview op iPhone-afmetingen; daarna echte opslag/verwijderen en toegestane release.

## Zelfcontrole 5 november 2026, 00:57 CET
- Head `ca04ba3`: vier onafhankelijke GitHub Actions-gates PASS: [validate 41929043843](https://github.com/waldokolk-dotcom/whatsup-dog/actions/runs/41929043843), [browser-acceptance 41929043751](https://github.com/waldokolk-dotcom/whatsup-dog/actions/runs/41929043751), [map regression 41929043949](https://github.com/waldokolk-dotcom/whatsup-dog/actions/runs/41929043949), [quality watch 41929043735](https://github.com/waldokolk-dotcom/whatsup-dog/actions/runs/41929043735).
- PR #71 is open, ready for review, mergeable; GitHub toont nog **geen ingediende reviews**. Deze groene tests bewijzen geen echte hosted backend of iPhone-apparaat.
- README vermeldt GitHub Pages productiepad `https://waldokolk-dotcom.github.io/whatsup-dog/` en bestaande handmatige Pages-publicatie, maar daadwerkelijke HTTP-bereikbaarheid kon vanuit deze run niet worden bevestigd (DNS/netwerk niet beschikbaar). Dit is dus geen geverifieerde preview of live release.
- Release blijft geblokkeerd door ontbrekend bewijs van hosted upload/herladen/eigenaarsverwijdering, apparaatacceptatie, hostingautorisatie en eventuele vereiste review. Geen merge, deploy, migratie of productiegegevensmutatie uitgevoerd.
- Volgende run: inspecteer Pages-workflow en geautoriseerde previewroute; voer echte hosted E2E uit met bestaande beschermde workflow zodra bevoegd, controleer mobiele preview en reviewstatus; pas dan publiceren.


## Zelfcontrole 5 november 2026, 01:52 CET — mobiele regressiedekking
- Head vóór wijziging `513eeb9`: vier Actions geslaagd: [map](https://github.com/waldokolk-dotcom/whatsup-dog/actions/runs/41937783440), [validate](https://github.com/waldokolk-dotcom/whatsup-dog/actions/runs/41937783467), [quality](https://github.com/waldokolk-dotcom/whatsup-dog/actions/runs/41937783434), [browser](https://github.com/waldokolk-dotcom/whatsup-dog/actions/runs/41937783465). Geen ingediende reviews.
- Nieuwe Playwright-regressietest toegevoegd aan `tests/v3.spec.mjs` (commits `40a938b`, `dcb0e72`): controleert op smalle schermen dat gebiedskeuze, losloopknop en filterbalk niet overlappen of buiten viewport vallen en dat de meldingknop boven de ondernavigatie blijft. Dit is testdekking, nog geen bewezen visuele reparatie; nieuwe CI-uitkomst vereist.
- Productie-URL `https://waldokolk-dotcom.github.io/whatsup-dog/` vanaf runner niet bereikbaar: DNS-resolutie mislukt (`curl: Could not resolve host`). Niet als live geverifieerd claimen.
- Release blijft geblokkeerd op hosted backend-E2E, bereikbaarheidscontrole en benodigde reviews/autorisatie. Volgende run: inspecteer nieuwe browseracceptatie; repareer eventuele layoutfailures en herhaal tests.


## Zelfcontrole 5 november 2026, 02:52 CET — nieuwe mobiele layouttest groen
- PR #71 head `0ac5dda5c434431a8f00328b67a88268d03fa223` is open en ready for review.
- Vier controles op deze head zijn geslaagd: [kaartregressie #41944599126](https://github.com/waldokolk-dotcom/whatsup-dog/actions/runs/41944599126), [validate #41944599125](https://github.com/waldokolk-dotcom/whatsup-dog/actions/runs/41944599125), [browseracceptatie #41944599093](https://github.com/waldokolk-dotcom/whatsup-dog/actions/runs/41944599093), [quality watch #41944599191](https://github.com/waldokolk-dotcom/whatsup-dog/actions/runs/41944599191). De nieuwe mobiele layoutregressietest valt binnen browseracceptatie.
- De Pages-workflow `.github/workflows/pages.yml` publiceert uitsluitend vanaf `main` of via handmatige dispatch en voert vooraf validatie en browserjourneys uit. Er is geen automatisch publiek preview-deploypad voor deze featurebranch vastgesteld. Geen productie- of previewpublicatie uitgevoerd.
- Releasevoorwaarden blijven: geautoriseerde merge/reviews volgens branch protection, echte gehoste accountloze upload/herladen/verwijderen en bereikbare mobiele preview/productiecontrole. Simulatie in Playwright is geen bewijs van echte Supabase-persistentie.
- Volgende cyclus: inspecteer review-/branch protection en bestaande deployautorisatie; maak veilige publieke preview waar geautoriseerd; test hosted klantreis, herstel issues, merge/deploy alleen na geslaagde gates.


## Uitvoeringscyclus 5 november 2026, 03:54 CET — mobiele bediening
- Voorafgaande PR-head `eceb2bb`: vier controles geslaagd: [validate](https://github.com/waldokolk-dotcom/whatsup-dog/actions/runs/41951471778), [map regression](https://github.com/waldokolk-dotcom/whatsup-dog/actions/runs/41951471595), [browser acceptance](https://github.com/waldokolk-dotcom/whatsup-dog/actions/runs/41951471593), [quality](https://github.com/waldokolk-dotcom/whatsup-dog/actions/runs/41951471606).
- Concrete verbetering: kaartbediening heeft nu zichtbare focus op meldingenknop, losloopregeling en filters; compactere rijen voor mobiele landscape-schermen met weinig hoogte (`701815b`). Stylesheet v9 en PWA-cache synchroon opgehoogd (`66d785b`, `f90dc27`).
- Direct na commit nog geen CI-runs teruggegeven; groen resultaat van de nieuwe head mag niet worden aangenomen. Geen geautoriseerde publiek bereikbare featurepreview of echte hosted opslag/verwijdertest bewezen; PR #71 niet gemerged of gedeployed.
- Volgende run: controleer CI op nieuwste head, herstel regressies, test gehoste klantreis en verkrijg vereiste releasechecks voordat live wordt gepubliceerd.


## Uitvoeringscyclus 5 november 2026, 04:51 CET — mobiele landscape-aanraakdoelen
- Voorafgaande head `5161be7`: vier GitHub Actions geslaagd (validate, browser acceptance, map regression, quality watch). PR #71 heeft nog geen ingediende reviews.
- Productwijziging: mobiele kaartknoppen in landscape behouden minimaal 44px aanraakhoogte (voorheen 38px/36px); filterrij 6px lager om overlap te voorkomen. Commit `9bd511d`.
- HTML en serviceworker refereren nu aan `modern-2026.css?v=10`; offline cache verhoogd naar v107. Commits `d65536b`, `6900e2e`, `a600815`.
- Nieuwe head vereist opnieuw vier groene CI-controles; gehoste preview, echte backend-persistentie en productie zijn niet geverifieerd. Niet mergen of publiceren vóór vereiste checks en reviews.
- Volgende run: CI-resultaten inspecteren en falende tests herstellen; daarna echte hosted accountloze melding/upload/herladen/eigenaarsverwijdering testen en preview-bereikbaarheid aantonen.
