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


## Uitvoeringscyclus 5 november 2026, 05:56 CET — compacte landscape-kaart
- Vorige head `9f7eb70`: vier CI-workflows groen: validate [41964230801](https://github.com/waldokolk-dotcom/whatsup-dog/actions/runs/41964230801), browseracceptatie [41964230814](https://github.com/waldokolk-dotcom/whatsup-dog/actions/runs/41964230814), kwaliteitscontrole [41964230806](https://github.com/waldokolk-dotcom/whatsup-dog/actions/runs/41964230806), kaartregressie [41964230812](https://github.com/waldokolk-dotcom/whatsup-dog/actions/runs/41964230812). Geen PR-reviews ingediend.
- Nieuwe productwijziging `2a05b65`: ook liggende telefoons van 601–839 CSS-pixels breed en maximaal 440 hoog krijgen een gescheiden kopregel, gebied/loslooprij en horizontaal schuivende filters; minimaal 44px aanraakdoelen. CSS-cache v11 en serviceworker-cache v108 via `fe523d7`, `38b9c14`.
- CI op nieuwe head moet opnieuw slagen; hosted preview, echte accountloze backend-persistentie en eigenaarverwijdering zijn niet geverifieerd. Geen merge of productiepublicatie uitgevoerd.
- Volgende cyclus: browseracceptatie inclusief landscape viewport controleren; indien fout joblogs lezen en repareren; geautoriseerde hosted preview en backend-E2E blijft P0.


## Uitvoeringscyclus 5 november 2026, 06:49 CET — landscape browserregressie
- Head `b57873b`: alle vier Actions geslaagd: [map 41970951359](https://github.com/waldokolk-dotcom/whatsup-dog/actions/runs/41970951359), [validate 41970951364](https://github.com/waldokolk-dotcom/whatsup-dog/actions/runs/41970951364), [browser 41970951435](https://github.com/waldokolk-dotcom/whatsup-dog/actions/runs/41970951435), [quality 41970951380](https://github.com/waldokolk-dotcom/whatsup-dog/actions/runs/41970951380).
- Commit `56ddc66`: Playwright-test voor compacte landscape-viewports 667×375 en 812×375 toegevoegd. Controleert dat kaartmerk, gebiedskeuze, losloopregeling en filterbalk binnen viewport liggen en elkaar niet overlappen; meldknop zichtbaar. Hiermee wordt de nieuwe landscape-CSS ook bij volgende wijzigingen afgedwongen.
- Bij directe controle nog geen workflowruns gekoppeld aan nieuwe commit; testuitkomst is dus **onbevestigd**. Volgende run: CI inspecteren, bij falen joblogs lezen en oorzaak repareren. Geen preview of hosted backendpersistentie bewezen, geen productiepublicatie.


## Uitvoeringscyclus 5 november 2026, 07:50 CET — falende landscape-acceptatie hersteld
- PR #71 head `057b921`: map regression groen, maar validate, browser-acceptance en quality rood. De concrete Playwright-fout op 667×375 is `.map-brand overlaps #areaPill`; 168 van 171 tests slaagden in validate/browser, drie viewport-projecten faalden op dezelfde testcase. [Validate](https://github.com/waldokolk-dotcom/whatsup-dog/actions/runs/41976557200), [browser](https://github.com/waldokolk-dotcom/whatsup-dog/actions/runs/41976557305).
- Gerichte CSS-reparatie op dezelfde PR-branch: `.map-brand` in compacte landscape krijgt expliciet `bottom:auto`, intrinsieke hoogte en begrensde headerhoogte om overerving van de map-shell niet tot overlap te laten leiden. Commit `f21e05c`.
- Resultaat van nieuwe GitHub Actions nog niet bevestigd. Geen merge of productiepublicatie zolang de layouttest rood blijft; hosted preview en backend-E2E blijven onbewezen.

## Uitvoeringscyclus 5 november 2026, 08:56 CET — iPhone safe areas
- PR #71 head bij start: `ccf3058`, open, mergeable, ready for review, 0 ingediende reviews.
- Vier Actions op die head succesvol: map regression #41983219264, daily quality #41983219394, browser acceptance #41983219405, validate #41983219346.
- Mobiele kaartbediening aangepast voor linker/rechter iPhone-safe-area bij smalle viewports: kaarttitel, waarschuwingen, gebiedskeuze, losloopknop, filterrail en locatieknop respecteren de uitsparing; filters minimaal 44px hoog. Commit `3c97e3c`.
- CSS-cache in index.html verhoogd naar v12 (`ccf8dc9`); PWA serviceworker verhoogd naar v108 en stylesheet v12 (`0200278`).
- Nieuwe Actions voor head `0200278` moeten nog slagen; dit is geen bevestigde browser- of toestelacceptatie. Geen live- of previewdeployment uitgevoerd. Echte hosted opslag, herladen, eigenaarsverwijdering en vereiste reviews blijven open.
- Volgende cyclus: controleer CI van `0200278`, herstel failures, test iPhone-landscape met safe-area in browser en controleer geautoriseerde preview/publicatieroute. Geen nieuwe branch aanmaken.


## 5 november 2026 — kaarttoegankelijkheid en CI-status
- Vier checks op voorgaande head `c8928a0` bevestigd groen: [map regression](https://github.com/waldokolk-dotcom/whatsup-dog/actions/runs/41990917723), [validate](https://github.com/waldokolk-dotcom/whatsup-dog/actions/runs/41990917834), [browser acceptance](https://github.com/waldokolk-dotcom/whatsup-dog/actions/runs/41990917732), [quality watch](https://github.com/waldokolk-dotcom/whatsup-dog/actions/runs/41990917819).
- Productwijziging `1fbf1ed`: interactieve kaart is nu een benoemde toegankelijke regio; kaartfilters zijn expliciete `type=button` bedieningselementen zodat zij niet onbedoeld een formulier indienen. Bestaande kaart- en filterhandlers blijven behouden.
- Direct na commit waren nog geen GitHub Actions-runs beschikbaar. Deze wijziging is daarom nog niet als getest aangemerkt.
- Open: publiek bereikbare preview, echte backend opslag/verwijdering, fysieke iPhone-proef en vereiste PR-review; geen productiepublicatie uitgevoerd.


## Zelfcontrole 5 november 2026, 10:52 CET — kaartknoppen
- Head `d4a5f241`: vier GitHub Actions geslaagd: [map regression](https://github.com/waldokolk-dotcom/whatsup-dog/actions/runs/41998756873), [browser acceptance](https://github.com/waldokolk-dotcom/whatsup-dog/actions/runs/41998756980), [validate](https://github.com/waldokolk-dotcom/whatsup-dog/actions/runs/41998756930), [quality watch](https://github.com/waldokolk-dotcom/whatsup-dog/actions/runs/41998756876). PR #71 heeft nog geen ingediende reviews.
- Nieuwe codewijziging `35f60b3`: kaartgebiedkeuze, meldingenknop en locatieknop hebben expliciet `type=button` gekregen, zodat deze bedieningselementen geen formulier kunnen indienen. Zelfde featurebranch, geen nieuwe PR.
- Direct na de wijziging waren nog geen Actions-runs beschikbaar; de nieuwe commit is niet groen verklaard. Hosted preview, fysieke iPhone/Android-test, echte backend-opslag/herladen/eigenaarsverwijdering en review blijven open. Geen merge of deploy uitgevoerd.
- Volgende cyclus: CI voor `35f60b3` inspecteren, bij failures logs herstellen; geautoriseerde publieke preview en echte backend-E2E verifiëren vóór productie.


## Uitvoeringscyclus 5 november 2026 — toegankelijke actuele inhoud
- Commit `3cd39df`: de dynamisch geladen buurtmeldingen op startscherm en meldingenoverzicht, plus de weggeefhoek, melden inhoudswijzigingen nu aan ondersteunende technologie via `aria-live=polite`; het meldingenoverzicht gebruikt ook `role=status`. Geen nieuwe backendclaims.
- Controleer de Actions op deze nieuwe head, inclusief mobiele browseracceptatie; groene resultaten van oudere commits tellen niet als vrijgave van deze wijziging.
- Productie niet uitgerold: een afzonderlijk bereikbare preview, echte backend-E2E (plaatsen/herladen/eigen verwijderen), mobiele apparaatacceptatie en eventuele vereiste reviews blijven te verifiëren. Bestaande releasebeveiliging niet omzeilen.


## Zelfcontrole 5 november 2026, 12:50 CET — dynamische meldingen
- De vier CI-controles voor head `43e1047` zijn groen: [kaartregressie](https://github.com/waldokolk-dotcom/whatsup-dog/actions/runs/42014165157), [validate](https://github.com/waldokolk-dotcom/whatsup-dog/actions/runs/42014165179), [mobiele browseracceptatie](https://github.com/waldokolk-dotcom/whatsup-dog/actions/runs/42014165177) en [quality watch](https://github.com/waldokolk-dotcom/whatsup-dog/actions/runs/42014165240).
- Extra browseracceptatietest toegevoegd op dezelfde PR-branch voor `aria-live=polite` en `aria-relevant=additions text` op startscherm, meldingenoverzicht en weggeefhoek; controleert tevens `role=status` voor meldingen. Commits `2f79c5e`, `b124e3d` (correcte navigatieroute `giveaway`).
- Nieuwe head nog niet groen bevestigd. Geen publieke preview, echte Supabase-E2E of productie-deploy bewezen; eerst nieuwe CI en toegestane releasegates controleren.


## Zelfcontrole 5 november 2026, 13:56 CET — portrait-meldknop
- PR #71 head `dd209a8`: alle vier GitHub Actions groen: map regression #42022226448, quality #42022226677, browser acceptance #42022226598, validate #42022226614. Reviews: 0.
- Commit `fc4f21d` voegt mobiele Playwright-regressie toe voor de centrale meldknop op 320×568, 375×667 en 390×844: zichtbaarheid, minimaal 44×44 aanraakvlak, binnen viewport en klikbaarheid. Dit is testdekking, geen nieuw opgeleverde productfunctie.
- CI op `fc4f21d` nog niet bevestigd. Hosted preview, echte backend-opslag/herladen/eigenaarsverwijdering en productieacceptatie blijven onbewezen. Niet mergen of publiceren zonder actuele groene checks en toepasselijke releasevoorwaarden.


## Zelfcontrole 5 november 2026, 14:53 CET — snelkoppelingen startscherm
- Head `0bf6010`: vier GitHub Actions geslaagd: [validate #42031570110](https://github.com/waldokolk-dotcom/whatsup-dog/actions/runs/42031570110), [kaartregressie #42031570005](https://github.com/waldokolk-dotcom/whatsup-dog/actions/runs/42031570005), [browseracceptatie #42031569950](https://github.com/waldokolk-dotcom/whatsup-dog/actions/runs/42031569950), [quality watch #42031569825](https://github.com/waldokolk-dotcom/whatsup-dog/actions/runs/42031569825). Reviews: geen.
- Concrete codewijziging `17da5e4`: drie startscherm-snelkoppelingen (Waarschuwingen, Vermist, Losloopplekken) hebben expliciet `type=button`, zodat zij nooit onbedoeld een formulier indienen. Bestaande eventhandlers behouden.
- Nieuwe CI op gewijzigde head nog te verifiëren. Hosted preview, fysieke toestelacceptatie, echte backendpersistentie en eigenaarsverwijdering blijven onbewezen. Geen merge/deploy. Volgende cyclus: CI op deze head controleren; daarna prioriteit aan gehoste end-to-end meldroute en bereikbare preview.


## Zelfcontrole 5 november 2026, 15:51 CET — productiecontrole toegevoegd
- Voorafgaande head `def25c1`: vier Actions groen: [map regression](https://github.com/waldokolk-dotcom/whatsup-dog/actions/runs/42039922742), [browser acceptance](https://github.com/waldokolk-dotcom/whatsup-dog/actions/runs/42039922673), [validate](https://github.com/waldokolk-dotcom/whatsup-dog/actions/runs/42039922738), [quality watch](https://github.com/waldokolk-dotcom/whatsup-dog/actions/runs/42039922791). PR #71 open, mergeable, 0 ingediende reviews. GitHub repo push/admin rechten aanwezig.
- Commit `8e79456`: bestaande Pages-publicatieworkflow controleert voortaan na deployment de daadwerkelijke gepubliceerde URL op HTTP-bereikbaarheid en app-identiteit, plus drie essentiële assets; retries vangen Pages-propagatie op. Dit is een releasecontrole, geen bewijs dat al gedeployed is.
- Workflow draait pas bij merge/push op main of handmatige workflow_dispatch volgens bestaande rechten. Nieuwe CI voor deze head nog te verifiëren. Hosted accountloze meldroute (plaatsen, herladen, eigenaarsverwijderen), fysieke mobiele test en vereiste reviews niet bewezen. Geen productiepublicatie.
- Volgende run: controleer nieuwe CI, inspecteer Pages-omgeving en bestaande productie-URL; verifieer hosted backend-E2E met veilige testidentiteiten zonder productiegegevens te wijzigen, of documenteer concrete blokkade.


## Zelfcontrole 5 november 2026, 16:53 CET — verificatie van gepubliceerde assets
- Vorige head `cab16ef`: vier controles geslaagd: [kaartregressie](https://github.com/waldokolk-dotcom/whatsup-dog/actions/runs/42049360308), [validate](https://github.com/waldokolk-dotcom/whatsup-dog/actions/runs/42049359979), [browseracceptatie](https://github.com/waldokolk-dotcom/whatsup-dog/actions/runs/42049359983), [quality](https://github.com/waldokolk-dotcom/whatsup-dog/actions/runs/42049359955). Geen ingediende reviews.
- Productiecontrole verbeterd in `c2dfecb` en regex gecorrigeerd in `8912e5a`: na Pages-deploy vergelijkt de workflow nu de gehoste HTML-stylesheetversie met de bronversie en verifieert vier niet-lege kernassets. Dit voorkomt dat een HTTP-200 op oude HTML als actuele publicatie wordt beschouwd.
- De Pages-workflow draait alleen vanaf main/handmatige dispatch; de nieuwe controle is nog NIET in een echte deployment uitgevoerd en er waren direct na de commit nog geen PR-CI-runs. Geen productie- of previewclaim.
- P0 blijft geblokkeerd op hosted backend-E2E (plaatsen/herladen/eigen verwijderen), bereikbare mobiele preview en toepasselijke reviews. Volgende cyclus: verifieer CI op `8912e5a`, herstel fouten en richt werk op geautoriseerde testpreview en echte accountloze klantreis. Geen productiegegevensmutaties of release uitgevoerd.


## Zelfcontrole 5 november 2026, 17:56 CET — exacte productieassetcontrole
- Vorige head `ff07b9e`: vier GitHub Actions geslaagd: [kaartregressie](https://github.com/waldokolk-dotcom/whatsup-dog/actions/runs/42059687161), [kwaliteit](https://github.com/waldokolk-dotcom/whatsup-dog/actions/runs/42059686851), [browseracceptatie](https://github.com/waldokolk-dotcom/whatsup-dog/actions/runs/42059686923), [validate](https://github.com/waldokolk-dotcom/whatsup-dog/actions/runs/42059686865).
- Commit `420946ac`: Pages-deploy controleert nu niet alleen dat vier gehoste assets bestaan, maar vergelijkt de daadwerkelijke bytes met de build via `cmp`. Een oude CSS/JS/backend-config bij HTTP 200 kan hierdoor niet meer stilzwijgend als geslaagde publicatie gelden.
- Nieuwe head moet opnieuw door CI; de post-deployvergelijking is nog niet in een daadwerkelijke deployment bewezen. Geen merge/deploy uitgevoerd.
- Openstaande P0-releasevoorwaarden: publiek bereikbare featurepreview, echte hosted accountloze upload/herladen/eigen verwijdering, mobiele toestelacceptatie en eventuele verplichte review. Volgende run: controleer CI voor deze head; richt daarna inspanning op echte preview en hosted E2E in plaats van aanvullende cosmetische controles.

## Uitvoeringscyclus 5 november 2026, 19:53 CET — korte landscape-schermen
- Op PR #71 zijn de map-controls op liggende telefoons met maximaal 440px schermhoogte compacter geplaatst: gebied/losloop op 43px, filters op 92px en locatietoets hoger in het bruikbare kaartgebied; filters ondersteunen scroll snap. Product-CSS commit `337ea75`.
- HTML stylesheetversie `v13` en serviceworker-cache `v109` zijn synchroon bijgewerkt (`cd2c34f`, `f1e1245`).
- Direct na laatste commit gaf de commit-workflow-API nog geen runs terug; **geen groene tests voor deze wijziging bevestigd**. PR #71 heeft geen ingediende reviews.
- Geen publieke preview of hosted backend-E2E bewezen. Niet gemerged of naar productie gepubliceerd. Volgende run: Actions voor head `f1e1245` controleren, mobiele landscape-regressie inclusief echte browserpreview verifiëren, daarna geïsoleerde hosted meldroute toetsen.

## Uitvoeringscyclus 5 november 2026, 20:52 CET — landscape safe-area
- PR #71 / bestaande branch `feature/map-first-mobile-20261030`: CSS-fix `70644a4` voorkomt dat de gebiedskeuze en losloopknop op iPhones in landscape met notch buiten de veilige schermbreedte vallen of elkaar overlappen. De breedte houdt nu rekening met linker- en rechter-safe-area; lange labels worden afgekapt.
- Cache-busting in `index.html` (`2d172c2`) en serviceworker (`e8e7b78`): stylesheet v14, PWA-cache v110.
- Directe workflowquery voor `e8e7b78` leverde nog geen runs op. Geen groene CI, fysieke iPhone-acceptatie, publiek bereikbare preview of echte backend-E2E voor deze head geverifieerd. Geen merge of productiepublicatie uitgevoerd.
- Volgende cyclus: controleer actuele CI, inspecteer iPhone landscape (incl. notch), publiceer uitsluitend na vereiste reviews en bewezen gehoste accountloze meldroute.
