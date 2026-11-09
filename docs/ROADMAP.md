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


## Uitvoeringscyclus 5 november 2026, 21:56 CET — landscape mapruimte
- Voorafgaande head `3142a58`: vier Actions geslaagd (validate, browser-acceptance, map regression, daily quality); geen ingediende PR-reviews.
- Productwijziging `5919ea4`: op liggende telefoons tot 440px hoogte vervalt alleen de decoratieve merkregel op de kaart. Gebiedskeuze, losloopbediening en meldingenknop staan in één compacte bovenste rij; filters schuiven omhoog. Dit wint circa 36px kaartoppervlak terug zonder primaire bediening te verbergen.
- `7c880f0` en `e724904`: stylesheet v15 en offline cache v111. CI voor nieuwe head en echte mobiele visuele verificatie nog vereist.
- Geen productiepublicatie of publieke branchpreview geclaimd. Hosted accountloze melding plaatsen/herladen/eigen melding verwijderen blijft onbewezen; geen productiegegevens gemuteerd.
- Volgende run: inspecteer Actions voor head, herstel eventuele failures, verifieer een geautoriseerde publieke featurepreview en echte geïsoleerde backend-E2E. Publiceer uitsluitend na releasegates en vereiste reviews.

### 2026-11-05 — landscape iPhone XL
- CSS compact-landscape grens uitgebreid van 839 naar 950px; behoudt kaartbediening op bredere liggende iPhones. Stylesheet v16, PWA cache v112.
- Playwright browseracceptatie uitgebreid met 844×390 en 932×390, inclusief controle dat gebiedskeuze, losloopknop, meldknop en filters niet overlappen. Testcommit `fdef490`.
- Eerste CI-peiling op `fdef490`: map regression geslaagd; validate en browseracceptatie nog actief, daily quality wachtend. Geen groene volledige suite geclaimd.
- Nog geen publieke preview of backend-E2E bewezen; geen productiepublicatie. Volgende run: CI-failures herstellen en preview/backend daadwerkelijk valideren.

### 2026-11-05 23:50 CET — CI-regressie hersteld
- Geconstateerd op head `f4a3c46`: map regression groen; validate, browser acceptance en daily quality rood. Uit joblogs blijkt dat de compacte-landscape-test `.map-brand` zichtbaar verwachtte, terwijl de bewust verbeterde map-first CSS deze decoratieve regel op korte landscape-schermen verbergt. Dezelfde fout veroorzaakte drie viewport-failures (180/183 overige browserchecks groen).
- Test `tests/v3.spec.mjs` aangepast in `eaa00a5`: verifieert nu expliciet dat decoratieve branding verborgen is, en controleert juist de zichtbare meldknop, gebiedskeuze, losloopbediening en filters op schermgrenzen en onderlinge overlap. Product-CSS ongewijzigd.
- Nieuwe CI voor `eaa00a5` moet groen worden bevestigd; geen hosted backend-E2E of publieke featurepreview bewezen, geen release. Eerst nieuwe Actions en eventuele aanvullende failures afhandelen.


### 2026-11-06 00:53 CET — CI groen en portrait-regressie toegevoegd
- Head `0d97e62` gecontroleerd: alle vier Actions geslaagd (validate, browser acceptance, map regression, daily quality). De eerder herstelde landscape-regressie is dus door CI bevestigd.
- Nieuwe testcommit `b24e47e` op dezelfde PR #71: Playwright controleert op 375×667 en 390×844 dat gebiedskeuze, meldingen, losloopbediening, filters en meldknop binnen het viewport blijven en de meldknop niet afdekken. Nieuwe commit moet nog door CI; geen groen resultaat voor deze test geclaimd.
- Publieke featurepreview en echte gehoste plaatsing → herladen → veilige eigenaarsverwijdering blijven niet aangetoond. Geen productiepublicatie; geen productiegegevensmutatie. Prioriteit: geautoriseerde featurepreview en geïsoleerde backend-E2E, niet meer releaseworkflow-cosmetica.

## Zelfcontrole 6 november 2026, 01:54 CET — compacte portraittelefoons
- Head `2c7112d`: vier GitHub Actions succesvol: [map regression](https://github.com/waldokolk-dotcom/whatsup-dog/actions/runs/42132951105), [browser acceptance](https://github.com/waldokolk-dotcom/whatsup-dog/actions/runs/42132951083), [quality](https://github.com/waldokolk-dotcom/whatsup-dog/actions/runs/42132951079), [validate](https://github.com/waldokolk-dotcom/whatsup-dog/actions/runs/42132951088). PR #71 heeft geen ingediende reviews.
- Productwijziging `cb7ed8e`: op portraittelefoons met schermhoogte tot 700px de locatieknop hoger geplaatst zodat hij de centrale meldactie niet bedekt; filterrail krijgt scroll snap. `92469e2` verhoogt stylesheetquery naar v17.
- Nieuwe CI voor head `92469e2` nog niet zichtbaar bij directe controle; wijziging dus niet bewezen door browseracceptatie. Preview en echte backend-E2E blijven onbewezen. Geen deploy of merge uitgevoerd.
- Volgende cyclus: verifieer de actuele CI, inspecteer daadwerkelijke layout op 375×667 en 390×844, bevestig PWA-cacheverversing, realiseer geautoriseerde preview en test echte accountloze opslag/herladen/eigenaarsverwijdering.

## Zelfcontrole 6 november 2026, 02:49 CET — PWA-cache/CI gerepareerd
- PR #71 head `e88e88c`: browseracceptatie groen; validate, map regression en daily quality rood. Joblogs bevestigen dezelfde oorzaak: `Offline cache must include the current mobile stylesheet version` in `scripts/validate.mjs:98`.
- Oorzaak: `index.html` verwijst naar `modern-2026.css?v=17`, maar `sw.js` pre-cachete nog `v=16` en gebruikte cache `v112`.
- Fix `6051d8f`: `sw.js` cachet nu stylesheet v17 en gebruikt cache v113, zodat nieuwe PWA-installaties de actuele mobile CSS ontvangen. CI voor deze nieuwe commit moet nog bevestigd worden.
- Geen productie-deploy; publiek bereikbare featurepreview en echte gehoste accountloze backend-E2E blijven onbewezen. Volgende run: controleer CI voor `6051d8f`, inspecteer logs bij failures en werk aan preview/hosted klantreis zonder productiegegevens te muteren.

## Zelfcontrole 6 november 2026, 04:54 CET — actuele releasegates
- Head `e85b70fd4667d31ac49c89d3c87a61cf538d789e`: vier Actions bevestigd **success**: map regression, validate accountless V3, browser accountless V3 acceptance, daily quality watch. De stylesheet-v17/PWA-cache-v113 reparatie is daarmee door CI gevalideerd.
- `.github/workflows/pages.yml` gecontroleerd: Pages deployt alleen vanuit `main` of via `workflow_dispatch`; er is geen branch-previewdeploy in deze workflow. Niet handmatig naar productie dispatchen zonder gehoste backend-E2E en vereiste reviews.
- Browseracceptatie blijft een gesimuleerde backend; echte accountloze melding plaatsen → herladen → eigenaarsverwijdering op een geïsoleerde publieke host is nog niet aangetoond. Geen productiegegevens muteren om dit te testen.
- Geen productiepublicatie of publiek bereikbare featurepreview geclaimd. Volgende productstap: geautoriseerde afgescheiden preview en echte E2E; pas daarna release.

## Zelfcontrole 6 november 2026, 06:51 CET — horizontale mobiele overflow
- PR #71 op bestaande branch: vorige head `8ba68e1` had vier geslaagde workflows: [map](https://github.com/waldokolk-dotcom/whatsup-dog/actions/runs/42159399099), [browser](https://github.com/waldokolk-dotcom/whatsup-dog/actions/runs/42159399132), [validate](https://github.com/waldokolk-dotcom/whatsup-dog/actions/runs/42159399063), [quality](https://github.com/waldokolk-dotcom/whatsup-dog/actions/runs/42159399058).
- Commit `6737185`: Playwright-regressie toegevoegd die horizontale pagina-overflow controleert op mobiele viewports, zowel op de kaart als na openen van het meldformulier. Dit is testdekking; geen productfix of bewezen apparaatacceptatie.
- Bij onmiddellijke controle waren nog geen workflowruns beschikbaar voor `6737185`. Volgende uitvoerder moet nieuwe head en vier CI-checks controleren, fouten uit logs herstellen, en pas daarna verdergaan.
- `scripts/verify-hosted-release.mjs` verifieert alleen een Supabase-release-marker, geen echte opslag/herladen/eigenaarsverwijdering. Pages publiceert vanuit main/dispatch naar productie, niet naar een geïsoleerde featurepreview. Geen hosted E2E, publiek bereikbare preview of productiepublicatie bewezen. Geen productiegegevens gemuteerd.

## Zelfcontrole 6 november 2026, 07:53 CET
- Voorafgaande head `d32e6d2`: vier Actions groen: [map regression](https://github.com/waldokolk-dotcom/whatsup-dog/actions/runs/42170915032), [browser acceptance](https://github.com/waldokolk-dotcom/whatsup-dog/actions/runs/42170915038), [daily quality](https://github.com/waldokolk-dotcom/whatsup-dog/actions/runs/42170915058), [validate](https://github.com/waldokolk-dotcom/whatsup-dog/actions/runs/42170915143).
- Op bestaande PR #71 een extra Playwright-test voor horizontale pagina-overflow bij 320x568, 375x667 en 390x844 toegevoegd: commit `59d512a`. Deze nieuwe test is nog NIET groen bewezen; bij directe check nog geen workflowruns gevonden.
- PR heeft nog geen reviews; publieke featurepreview en echte gehoste accountloze create/reload/owner-delete blijven onbewezen. Geen merge/deploy. Volgende cyclus: nieuwe CI beoordelen en falende viewporttest zo nodig met CSS-fix herstellen; vervolgens geïsoleerde backend-E2E en preview realiseren.


## Uitvoeringscyclus 6 november 2026, 14:53 CET — PWA cache-regressie hersteld
- CI op head `529134d` had browseracceptatie groen, maar validate, map regression en daily quality rood. De joblogs tonen één gedeelde oorzaak: `Offline cache must include the current mobile stylesheet version` (`scripts/validate.mjs:98`).
- `index.html` verwijst naar `modern-2026.css?v=27`, terwijl `sw.js` nog `v=17` cachete. In commit `1bc2710` is de serviceworker aangepast naar stylesheet v27 en cache v114. Geen productiedata, secrets of migraties gewijzigd.
- Direct na de fix waren er nog geen workflowruns voor commit `1bc2710`; geen groen resultaat of release geclaimd. Volgende run: vier Actions voor de actuele head controleren en eventuele fouten uit joblogs herstellen.
- Pages publiceert alleen main/handmatige dispatch; geïsoleerde publieke featurepreview en echte gehoste accountloze create/reload/owner-delete zijn niet bewezen. Geen merge of productiepublicatie tot releasegates zijn gehaald.

## Uitvoeringscyclus 6 november 2026 — compacte mobiele kaart
- Productcode commit `3aade087`: in portretweergave verdwijnt de decoratieve kaartkop; meldingenactie, gebied/losloopbediening en filterrail staan op compacte, veilige schermposities. Meer kaartoppervlak zonder verlies van knoppen.
- PWA-cache: `11e385d` laadt stylesheet v28, `34ccfee` cachet v28 met cache v115.
- Vorige head `6b4efe2`: validate, browser acceptance, map regression en quality watch groen; CI voor nieuwe head `34ccfee` opnieuw verifiëren. Geen live release geclaimd.
- Releasegates blijven: publiek bereikbare featurepreview, echte geïsoleerde backend-E2E met eigenaarsverwijdering, vereiste review/hostingautorisatie en actuele groene checks. Geen productiedata gebruikt.

## Uitvoeringscyclus 6 november 2026, 21:52 CET — bevestigde publicatie in de kaart
- Actuele PR #71 had op head `d64211f` vier groene GitHub Actions: map regression, daily quality watch, validate en browser acceptance. Dit is CI-bewijs, geen gehoste backend-E2E.
- Productcode commit `3816e4a`: na succesvolle insert controleert de app of de melding werkelijk als actieve rij via de backend terug te lezen is. Alleen dan toont hij direct een bevestigde marker en de melding `Melding staat op de kaart`. Als teruglezen niet bevestigd kan worden, meldt de app eerlijk dat zichtbaarheid nog niet bevestigd is. Dit voorkomt een misleidende optimistische succesweergave.
- CI voor nieuwe head nog controleren; publieke featurepreview en geïsoleerde gehoste backend-E2E zijn niet bewezen. Geen merge of productiepublicatie. Volgende cyclus: CI-fouten herstellen en via toegestane hosting een echte mobiele preview plus geïsoleerde create/reload/owner-delete verificatie realiseren.

## Uitvoeringscyclus 6 november 2026, 22:53 CET — herstel echte publicatiecontrole
- Actuele head `90aa9c7`: kaartregressie groen, maar browseracceptatie, validate en quality rood. Joblogs tonen zes falende browsergevallen omdat de oude Supabase-teststub inserts niet opsloeg en bij teruglezen altijd `null` gaf. Dit is een mockcontract-fout na de nieuwe serverbevestiging, geen bewijs van een productiebackendfout.
- Productcode `dc16c5c`: na een directe leescontrole gebruikt de app ook de ververste actieve serverfeed als bevestigingsroute voor een nieuwe melding. Daarmee is publicatie robuuster bij vertraagde leesbaarheid.
- Browseracceptatie-stub `f418077`: schrijft ingevoegde meldingen nu naar de geïsoleerde testdataset en kan ze via `maybeSingle()` opnieuw lezen; geen echte backenddata gewijzigd.
- Nieuwste CI, publieke featurepreview en echte gehoste backend-E2E zijn nog niet bewezen. Volgende run: nieuwe Actions afwachten, resterende logs herstellen en een geautoriseerde preview realiseren. Geen productiepublicatie.

## Uitvoeringscyclus 6 november 2026, 23:50 CET — dubbele publicatie en ongeldige locatie geblokkeerd
- Voorafgaande head `76ef14f`: alle vier GitHub Actions groen (validate, browseracceptatie, kaartregressie en kwaliteitscontrole). Deze checks gebruiken geen bewezen publieke featurepreview of echte backend-E2E.
- Productcode commit `5fc060d`: het meldformulier negeert een tweede submit zolang de eerste bezig is, markeert de knop `aria-busy`, en valideert GPS/kaartcoördinaten vóór foto-upload en database-insert. Ongeldige locatie leidt naar de bestaande handmatige kaartkeuze, met behoud van concept.
- Publieke PR-featurepreview ontbreekt; Pages-workflow publiceert alleen `main` en handmatige dispatch zou bestaande Pages-productie kunnen vervangen. Niet uitgevoerd. Review, gehoste backend-E2E en gecontroleerde release blijven open.
- Volgende run: CI op nieuwe head controleren, daarna veilige previewroute of geautoriseerde merge met echte geïsoleerde backendtest en eigenaarsrechten aantonen.

## Uitvoeringscyclus 7 november 2026, 00:59 CET — push alleen na bevestigde publicatie
- Voorafgaande head `e497df9`: alle vier GitHub Actions groen (validate, browseracceptatie, kaartregressie, kwaliteitscontrole). Geen gehoste backend-E2E bewezen.
- Productcommit `9e75344`: buurtpush wordt alleen aangeroepen nadat de opgeslagen melding werkelijk actief en leesbaar is bevestigd. Onbevestigde meldingen veroorzaken geen potentieel misleidende pushnotificatie.
- Nieuwe CI voor productcommit nog controleren. Featurepreview ontbreekt: bestaande Pages-workflow deployt naar de productieomgeving en mag niet voor een branch-preview worden misbruikt. Geen merge of productiegegevens gewijzigd.
- Volgende: nieuwe CI en hostingrechten controleren; geïsoleerde echte backend-create/reload/owner-delete-test en publieke featurepreview via afzonderlijke geautoriseerde hosting.

## Uitvoeringscyclus 7 november 2026, 01:50 CET — dubbele kaartpin voorkomen
- Voorafgaande head `af1d48f`: vier GitHub Actions groen (validate, browseracceptatie, kaartregressie, kwaliteitscontrole).
- Productcommit `9deb226`: na succesvolle publicatie wordt niet langer een losse marker toegevoegd vlak voordat `refreshReports()` de volledige serverfeed rendert. Daarmee blijft de serverfeed de enige bron voor kaartpins en ontstaan geen dubbele markers bij publiceren.
- Publieke featurepreview en echte gehoste backend-E2E zijn nog niet aangetoond; GitHub Pages deployt alleen via main/handmatige dispatch naar de bestaande Pages-omgeving. Geen productiepublicatie of productiedatawijziging.
- Volgende run: CI voor `9deb226` verifiëren, een afzonderlijke geautoriseerde HTTPS-preview vinden en geïsoleerde create/reload/owner-delete-backendtest uitvoeren.

## Uitvoeringscyclus 7 november 2026, 02:50 CET — oplossen serverbevestigd
- Voorafgaande head `2cbb205`: vier Actions groen (validate, browseracceptatie, kaartregressie en kwaliteitscontrole).
- Productcode `b8113d1`: 'opgelost' markeren controleert nu sessie-eigendom en leest de serverstatus terug vóór de kaartpin wordt verwijderd en een succesmelding verschijnt. Foutieve lokale succesweergave bij mislukte RPC wordt voorkomen.
- Nieuwe CI moet nog groen worden. Geen afzonderlijke publieke HTTPS-preview of echte gehoste backend-E2E bewezen; Pages-deploy naar productie niet gestart.

## Uitvoeringscyclus 7 november 2026, 03:55 CET — GPS-kaartactie robuuster
- Voorafgaande head `5765249`: vier GitHub Actions groen (map regression, browser acceptance, quality watch, validate).
- Productcode `9df4242`: GPS-knop voorkomt dubbele aanvragen, controleert ook geografische coördinaten buiten geldige grenzen, herstelt de knop na uitzonderingen bij kaartweergave en geeft een handmatige gebiedsfallback. Geen echte gebruikersdata gewijzigd.
- Nieuwe head CI moet opnieuw groen bevestigd worden; publieke featurepreview en echte geïsoleerde backend-E2E blijven onbewezen. Bestaande Pages-workflow raakt productie; geen Pages-preview of merge gestart.

## Uitvoeringscyclus 7 november 2026, 04:57 CET — verlopen kaartlinks afgehandeld
- Productcommit `fa53edf`: openen van een melding via een directe kaartlink controleert nu serverfouten, actieve status en geldige coördinaten. Verlopen/verwijderde meldingen geven een duidelijke melding en verversen de kaart in plaats van een lege of kapotte detailweergave.
- CI voor de nieuwe productcommit is direct bevraagd: nog geen workflowruns teruggegeven. Groen testen is daarom niet geclaimd.
- Publieke featurepreview en echte geïsoleerde backendacceptatie blijven onbewezen. Bestaande Pages-productie niet gewijzigd. Volgende run: CI hercontroleren en geautoriseerde HTTPS-preview realiseren.


### Uitvoeringscontrole 7 november 2026 — mobiele feedback
- Productcommit `0a541d192e88e743bae8d9f28117ee1ca9f68522`: statusmeldingen toegankelijk voor schermlezers (`role=status`, `aria-live=polite`); sluitknop van meldvenster heeft expliciet toegankelijk label.
- Publieke featurepreview en geïsoleerde backendacceptatie blijven releasegates; geen productiedeploy uitgevoerd.

## Uitvoeringsrun 7 november 2026 — GPS-fallback naar gebiedskeuze
- Productcommit `28a35dc7f4162a7f96d0944e8d76b7775e32aeab`: mobiele kaart-GPS opent bij ontbrekende geolocatie of GPS-fout direct de bestaande handmatige gebiedskeuze; geen backend, gebruikersdata of productie gewijzigd.
- Branch-preview via GitHub Pages blijft niet geautoriseerd: `pages.yml` deployt naar `github-pages` op `main`; niet vanuit deze featurebranch uitvoeren.
- Releasegate: CI op nieuwe head, gehoste mobiele klantreis en geïsoleerde backend-eigenaarscontrole moeten nog worden bewezen. Geen liveclaim.

## Uitvoeringscyclus 7 november 2026, 07:59 CET — geïsoleerd preview-buildartefact
- Voorafgaande PR-head `6ad470f`: vier GitHub Actions geslaagd (map #42344483253, validate #42344483263, browser #42344483219, quality #42344483250).
- Commit `44d40eba`: nieuwe `.github/workflows/pr-preview-artifact.yml` bouwt op PR #71 een afzonderlijk downloadbaar statisch PWA-bundelartefact, valideert bron/bundel en weigert herkenbare gevoelige bestanden. Productie-Pages wordt niet aangeraakt; geen secrets of kosten toegevoegd.
- Direct na commit waren nog geen nieuwe workflowruns zichtbaar; de previewbundle is dus nog niet groen bewezen. Dit is expliciet GEEN publieke HTTPS-hosting of live backend-E2E.
- Open blokkades: geautoriseerde afzonderlijke publieke previewhost, backend-eigenaarsrechten met geïsoleerde testdata, iPhone/Android-browseracceptatie op gehoste URL en toepasselijke reviews. Niet mergen of deployen voordat dit aantoonbaar is.


## Uitvoeringscyclus 7 november 2026, 08:51 CET — previewbundel als app controleren
- Op voorafgaande head `99a4bfc` waren vijf Actions groen, inclusief previewartefact [42349375659](https://github.com/waldokolk-dotcom/whatsup-dog/actions/runs/42349375659), browser [42349375708](https://github.com/waldokolk-dotcom/whatsup-dog/actions/runs/42349375708), validate [42349375656](https://github.com/waldokolk-dotcom/whatsup-dog/actions/runs/42349375656), map [42349375678](https://github.com/waldokolk-dotcom/whatsup-dog/actions/runs/42349375678) en quality [42349375660](https://github.com/waldokolk-dotcom/whatsup-dog/actions/runs/42349375660).
- Hosting-/previewverbetering `6a18fb2`: de geïsoleerde preview-workflow serveert nu **de daadwerkelijk gebouwde dist-bundel** op localhost, controleert HTML en kritieke assets en draait de mobiele Playwright-toegankelijkheidscontrole voordat het artefact wordt gepubliceerd. Geen wijziging aan productie-Pages of backend.
- Nieuwe previewrun [42353125964](https://github.com/waldokolk-dotcom/whatsup-dog/actions/runs/42353125964) was bij eerste controle nog bezig; map-regressie [42353125982](https://github.com/waldokolk-dotcom/whatsup-dog/actions/runs/42353125982) al groen. De overige checks waren nog bezig. Geen groene claim voor nieuwe head.
- Dit is een geautomatiseerde lokale preview-acceptatie, **geen publiek bereikbare HTTPS-preview**. Nog nodig: geautoriseerde aparte publieke previewhost, hosted backend-eigenaarsrechtentest met geïsoleerde data, vereiste reviews en volledige CI. Geen productiepublicatie.

## Uitvoeringscyclus 7 november 2026 — offline meldroute
- Productcommit `8c5ec53`: de meldknop voorkomt een zinloze backend-/GPS-/foto-uploadpoging als de browser expliciet offline is. Het meldconcept blijft lokaal bewaard en de gebruiker krijgt een concrete melding om na herstel van verbinding opnieuw te proberen. Bestaande backend, eigenaarsrechten en productiegegevens blijven ongewijzigd.
- CI en publieke HTTPS-preview moeten op de nieuwe head afzonderlijk worden bevestigd. Een lokaal gebouwde preview is niet hetzelfde als een gehoste klantreis. Geen productiepublicatie zonder geautoriseerde hosting, reviews en hosted E2E.

## Uitvoeringscyclus 7 november 2026, 10:59 CET — GPS-fallback volledig
- Productcommit `9b74344`: ook bij ongeldige GPS-coördinaten, kaartweergavefouten en synchrone geolocatie-uitzonderingen opent de bestaande handmatige gebiedskeuze; voorheen verscheen daar alleen een toast. Geen backend- of productiedatawijziging.
- Nieuwe CI op commit direct bevraagd; definitieve resultaten worden pas na workflowafloop als groen aangemerkt. Publieke HTTPS-featurepreview, geïsoleerde backend-E2E en vereiste reviews zijn nog niet aangetoond; geen productiepublicatie.

## Uitvoeringscyclus 7 november 2026, 11:53 CET — offline kaart met bestaande meldingen
- Productcommit `e10adb830fd206dafba2f8c694fe029a4277831f`: bij het starten van de PWA worden eerder door de server bevestigde, nog actieve openbare meldingen direct uit de bestaande lokale cache op de kaart en in de meldingenlijst getoond, ook wanneer anonieme authenticatie of netwerk vertraagd of onbereikbaar is. Zodra de sessie klaar is vervangt de serverfeed de cache. Geen nieuwe opslag, backendwijziging of echte gebruikersdata gemuteerd.
- Voorafgaande head `c86dc4e`: vijf Actions groen: validate #42362008309, map #42362008292, previewbundel #42362008291, browser #42362008273, quality #42362008313.
- Nieuwe head en CI opnieuw controleren. De geïsoleerde previewbundel is geen publieke HTTPS-preview. GitHub Pages workflow publiceert vanuit main naar productie; geen geautoriseerde afzonderlijke host gevonden. Gehoste create/reload/owner-delete-test en reviews blijven releasegates; productie niet gewijzigd.

## Uitvoeringscyclus 7 november 2026, 12:55 CET — offline meldingenlijst bruikbaar
- Productcommit `6c7d09b`: een opgeslagen openbare melding uit de meldingenlijst kan nu ook zonder backend-/authsessie worden geopend. Bij een tijdelijke serverfout wordt op de reeds opgeslagen openbare melding teruggevallen; offline detailweergave doet geen reactie-RPC zonder sessie. Geen nieuwe opslag, backendmutatie of echte gebruikersdata gewijzigd.
- Voorafgaande head `6f33f38`: vijf Actions groen (map #42365857498, preview #42365857465, browser #42365857449, validate #42365857495, quality #42365857457).
- Nieuwe head en Actions na deze wijziging controleren; geen geverifieerde publieke HTTPS-featurepreview. Pages blijft productiegebonden; afzonderlijke geautoriseerde previewhost, geïsoleerde backend-E2E en toepasselijke reviews ontbreken. Niet mergen of productie wijzigen.

## Uitvoeringscyclus 7 november 2026, 13:55 CET — transparantie offline meldingen
- Productcommit `55341b35a66e5b757d0d9d93bd61e60c5f904812`: de lijst met eerder opgehaalde meldingen toont nu expliciet dat deze mogelijk verouderd zijn wanneer de backend nog niet beschikbaar is of verversen mislukt. Bij succesvolle serververversing verdwijnt de waarschuwing. Hiermee worden offline meldingen niet ten onrechte als actuele livewaarnemingen gepresenteerd.
- Voor deze productcommit zijn CI en publiek bereikbare HTTPS-preview nog niet groen bevestigd; afzonderlijke geautoriseerde previewhost, echte geïsoleerde backendacceptatie en toepasselijke review blijven releasevoorwaarden. Geen productiepublicatie.

## Uitvoeringscyclus 7 november 2026 — anonieme meldconcepten
- Productcommit `4a14dc5`: als anonieme backend-sessie ontbreekt, wordt het meldconcept nu bewaard vóór de foutmelding; offline controle gebeurt vóór de sessiecontrole. Geen verloren invoer bij tijdelijke authenticatieproblemen.
- De previewworkflow levert momenteel uitsluitend een GitHub Actions-artefact; dit is geen publieke HTTPS-featurepreview. Pages publiceert alleen vanaf `main`. Er is nog geen afzonderlijke geautoriseerde previewhost bevestigd.
- Nog vereist: actuele CI op nieuwe head, Playwright mobiele acceptatie, echte geïsoleerde backend-eigenaarsrechtentest en eventuele verplichte review. Geen productiepublicatie.

## Uitvoeringscyclus 7 november 2026, 15:53 CET — veilige offline PWA-cache
- Productcommit `ec3e37d`: serviceworker beperkt offline caching tot de eigen app-scope en expliciet bekende statische PWA-bestanden; willekeurige dynamische URL's worden niet langer in Cache Storage opgeslagen. Dit voorkomt onbedoelde opslag van potentieel gevoelige responses op gedeelde apparaten. Cacheversie v117 dwingt opschoning van eerdere caches bij activatie. Geen backend- of productiegegevens gewijzigd.
- De geïsoleerde PR-previewworkflow publiceert nog geen publieke HTTPS-URL. Gehoste accountloze meldroute en geïsoleerde eigenaarsrechtentest, review en groene CI op de nieuwe head zijn releasevoorwaarden; niet naar productie gemerged.

## Uitvoeringscyclus 7 november 2026, 16:56 CET — exacte offline-cache allowlist
- Productcommit `b70f9482d1356c9503c57835b133c0dd3e3d9ef6`: serviceworker accepteert alleen exact vooraf goedgekeurde statische URL's inclusief queryversie voor offline caching; onbekende queryparameters op een bekende bestandsnaam worden niet meer gecachet. Cacheversie v118 verwijdert oude cache bij activatie. Geen backend- of productiegegevens gewijzigd.
- Releasegates: controleer actuele Actions op deze commit, valideer publieke HTTPS-preview en geïsoleerde backend create/reload/owner-delete. Pages workflow is aan `main`/handmatige dispatch en productieomgeving gekoppeld; geen previewpublicatie zonder aparte hostautorisatie. Geen merge of productiepublicatie uitgevoerd.


### 7 november 2026, 17:53 CET — lokale opslag vol (P0)
- Productcommit `53d9c48`: `app-v3.js` vangt opslagfouten (quota, private browsing, opslagblokkade) af zodat een volle lokale opslag de kaart-/meldingenverversing niet onderbreekt. Als een meldconcept niet kan worden bewaard, krijgt de gebruiker een expliciete waarschuwing in het meldscherm; de app claimt dan niet dat het concept veilig is opgeslagen.
- Vorige head `b979f77`: vijf Actions geslaagd (map regression 42388879642, preview artifact 42388879812, browser acceptance 42388879676, validate 42388879731, quality 42388879738). Nieuwe head vereist eigen CI-verificatie.
- De bestaande `.github/workflows/pages.yml` publiceert naar de productie-Pages-omgeving, niet naar een geïsoleerde featurepreview. Zonder geautoriseerde afzonderlijke hostingroute wordt Pages niet vanuit de featurebranch gestart. Geen productiegegevens of secrets gewijzigd.
- Open: publieke HTTPS-featurepreview, gehoste geïsoleerde backend-E2E inclusief eigenaarsverwijdering, toepasselijke reviews en mobiele toestelacceptatie. Geen release.

## Uitvoering 7 november 2026 — onboarding GPS-fallback
- Productcommit `dcb7ceae543e540f8f7083daac88e69a2535db26`: onboarding-locatieknop geeft nu ook zonder geolocation-API, bij ongeldige GPS-coördinaten, geweigerde toestemming of niet-beschikbare lokale opslag een duidelijke handmatige terugval met focus op plaatsinvoer. GPS krijgt een timeout van 8 seconden; bestaande backend en gebruikersdata blijven ongemoeid.
- Publieke featurepreview nog niet geverifieerd: Pages-workflow publiceert uitsluitend `main` naar productie; PR-previewworkflow levert uitsluitend een artifact. Geen afzonderlijke previewhosting geautoriseerd. Geen merge zonder reviews, groene CI en geïsoleerde backendacceptatie.
- Controleer CI op product-SHA en huidige PR-head; verifieer HTTPS en volledige meldroute voordat release wordt geclaimd.

## Uitvoering 7 november 2026 — herstel meldroute na offline authenticatie
- Productcommit `f50710a53542bf5f1620929576b3c20d40ed3846`: wanneer anonieme authenticatie offline faalt, herlaadt de PWA eenmalig zodra de verbinding terugkeert. Dit herstart de bestaande anonieme sessie en meldroute zonder handmatig herladen; het bestaande lokaal bewaarde meldconcept blijft behouden. Geen backend-, secret- of productiegegevenswijziging.
- CI op de vorige head `60b39e6`: vijf workflows groen (validate, browser acceptance, map regression, preview artifact, quality). Nieuwe head moet afzonderlijk groen worden.
- Releasegates blijven: geen afzonderlijke publieke HTTPS-previewhost geautoriseerd; PR #71 heeft geen reviews; geïsoleerde gehoste backend-E2E en toestelacceptatie ontbreken. Niet mergen of productie deployen.

## Uitvoering 7 november 2026, 20:54 CET — expliciete meldlocatie
- Productcommit `fbf780f77f5de719bda39169aff62c6d475f7df0`: bij handmatige locatiekeuze wordt het midden van de kaart niet langer stilzwijgend als bevestigde meldlocatie gebruikt. De gebruiker moet op de kaart tikken of de pin verslepen. Zonder bevestiging blokkeert publiceren veilig, met een begrijpelijke melding en terugkeer naar de kaartkeuze. Eerder bewust gekozen locatie blijft behouden. Geen backend- of productiegegevens gewijzigd.
- CI op deze commit: nog geen workflowruns teruggegeven bij controle. Publieke HTTPS-featurepreview en geïsoleerde backendacceptatie nog niet aangetoond; PR-reviews ontbreken. Geen merge of productiepublicatie.

## Uitvoering 7 november 2026, 21:51 CET — meldconcept bij geblokkeerde opslag
- Productcommit `11dd72a90403b8bce1e50a5a775e3bacf21cfe3c`: alle verwijderacties voor lokale meldconcepten gebruiken nu een afgeschermde opslagfunctie. Een SecurityError bij geblokkeerde browseropslag laat openen/herstellen/weggooien van het meldscherm niet meer crashen. Geen backend, secrets of echte data gewijzigd.
- GitHub Actions op product-SHA: bij eerste controle nog geen runs geretourneerd; groen niet bewezen. PR #71: nul ingediende reviews. De huidige Pages-workflow publiceert alleen `main` naar de productieomgeving; geen afzonderlijk geautoriseerde publieke featurepreview. Gehoste geïsoleerde backend-E2E en echte iPhone/Android-acceptatie blijven open. Geen merge of productiepublicatie.

## Uitvoering 7 november 2026, 22:51 CET — herstel CI en bevestiging kaartpin
- Productcommit `d98e36acf672524d9551bb1e88f1b9ba76309603`: het controlescherm blokkeert voortaan vóór publicatie wanneer een handmatig gekozen kaartlocatie nog niet expliciet bevestigd is. De app toont een concrete instructie, scrolt naar de kaart en bewaart de invoer. Geen stilzwijgende kaartcentrumlocatie of datamutatie.
- Regressiecommit `4e4faeb9c634108eee4a5f936665e069d1e7e338`: de drie accountloze browserflows bevestigen de kaartpin nu expliciet. Vorige head `9577661`: 9 fouten in drie browsers (foto-upload, uploadfout en GPS-fallback); 186 tests geslaagd, kaartregressie en previewartifact groen. Oorzaak: verouderde tests verwachtten publicatie zonder expliciete pinbevestiging.
- Geen productiepublicatie. Een publiek gehoste aparte featurepreview en geïsoleerde backend-E2E ontbreken; reviews nog te controleren. Nieuwe head CI en HTTPS-hoststatus opnieuw controleren.

## Uitvoering 7 november 2026, 23:52 CET — veilige herstelkaartlocatie
- Productcommit `81bc60b4032abf0b60e6b2568501a5199dd7e6d7`: herstelde meldconcepten accepteren uitsluitend eindige, geografisch geldige kaartcoördinaten. Ongeldige of beschadigde browseropslag leidt terug naar expliciete pinselectie in plaats van een Leaflet-fout of ongeldige meldlocatie. Geen backend- of productiegegevens gewijzigd.
- Vorige head `8b607236d0cb1a10c9eb75117783567b1fc2467b`: vijf Actions groen (map 42417943811, previewartifact 42417943831, browser 42417943834, validate 42417943879, quality 42417943781). Nieuwe productcommit en documentatie-head vereisen afzonderlijke CI-controle.
- Publieke HTTPS-featurepreview niet aangetoond: Pages-workflow deployt vanuit `main` naar `github-pages`; bestaande preview is slechts een artifact. PR #71 heeft nul ingediende reviews. Geïsoleerde backendacceptatie en fysieke mobiele acceptatie ontbreken. Geen merge of productiepublicatie.


## Uitvoering 8 november 2026 — robuuste kaartstart
- Productcommit `cff86bcd49c84bd03b211cd5182528cb7bebd0b3`: opgeslagen kaartpositie wordt alleen hersteld bij geografisch geldige coördinaten; zoom wordt begrensd. Geblokkeerde lokale opslag van de losloopvoorkeur laat de kaart niet langer vastlopen. Bestaande backend en productiegegevens ongewijzigd.
- Vorige head `737318c`: vijf GitHub Actions groen (map 42422707474, preview 42422707431, browser 42422707444, validate 42422707552, quality 42422707558). Productcommit vereist nieuwe CI-verificatie.
- Publieke featurepreview nog niet beschikbaar: `.github/workflows/pr-preview-artifact.yml` uploadt alleen een artefact; `.github/workflows/pages.yml` deployt uitsluitend `main` naar `github-pages`. Zonder aparte geautoriseerde previewomgeving geen productie-deploy of Pages-omschakeling. Backend-eigenaarsacceptatie en review blijven releasegates.

## Uitvoeringscyclus 8 november 2026 — herstel anonieme sessie
- Productcommit `0291174897d44ad5275811ff284674cf89b63948`: herstel na mislukte anonieme login luistert voortaan ook naar een volgende `online`-gebeurtenis wanneer de browser tijdens de fout ten onrechte al online rapporteerde. Geen backend-, productie- of datamutaties.
- Vorige head `08786a63e33ad9ff503186c2d58cf8fc58e691dc`: vijf GitHub Actions geslaagd, inclusief validatie, mobiele browseracceptatie, kaartregressie, quality en preview-artifact. Nieuwe CI en publieke HTTPS-preview moeten afzonderlijk worden bewezen.
- De previewworkflow uploadt alleen een artifact; Pages deployt uitsluitend naar productie vanuit main. Geen geautoriseerde aparte publieke previewhost vastgesteld; geen ingediende reviews; geïsoleerde backend-eigenaarsacceptatie ontbreekt. Geen merge/deploy.


## Uitvoering 8 november 2026, 03:59 CET — losloopkaart blijft bedienbaar bij opslagblokkade
- Productcommit `8ab6818a678139b14ccb5eb392fdfeb57b27573d`: `toggleOffleashLayer` vangt nu ook fouten bij het schrijven van de losloopvoorkeur af. De kaartlaag blijft direct aan/uit te zetten bij geblokkeerde browseropslag; de gebruiker krijgt melding dat de keuze niet permanent wordt opgeslagen. Geen backend- of gebruikersdatamutaties.
- Preview: bestaande PR-workflow produceert alleen een artefact; Pages-workflow gebruikt productieomgeving `github-pages` vanuit `main`. Zonder afzonderlijk geautoriseerde previewhost geen publieke featurepreview claimen.
- Releasegates: controleer Actions op productcommit en documentatiehead; vereiste reviews, geïsoleerde backend-eigenaarsacceptatie en publieke HTTPS-preview ontbreken nog. Geen merge of productiepublicatie.

## Uitvoering 8 november 2026, 04:54 CET — previewbouw niet meer annuleren
- Previewworkflow gewijzigd in commit `9d5b28f3331187a733f282a4613d28ac36ee57c3`: `cancel-in-progress: false` voor PR #71, zodat opvolgende commits de lopende previewbouw niet telkens annuleren. Vorige productcommit `8ab6818`: validate, browseracceptatie, kaartregressie en quality groen; previewrun #42440780324 was geannuleerd.
- Dit herstelt de continuïteit van het afzonderlijke preview-artefact, maar levert **nog geen publiek gehoste HTTPS-preview**. GitHub Pages blijft uitsluitend productie vanuit `main`; geen nieuwe host of productiedata aangeraakt.
- PR heeft nul ingediende reviews. Open gates: nieuwe previewrun groen, afzonderlijke geautoriseerde publieke previewhost, geïsoleerde backend-eigenaarsacceptatie, mobiele acceptatie en toepasselijke reviews. Geen merge of deploy.


## Uitvoeringscyclus 8 november 2026 — GPS fallback
- Productcommit `421f5771`: als GPS niet ondersteund wordt en de handmatige gebiedsdialoog al open is, probeert de app niet opnieuw `showModal()` aan te roepen. Dit voorkomt een `InvalidStateError` en houdt handmatige gebiedskeuze bruikbaar.
- De code is uitsluitend aangepast op PR #71 / `feature/map-first-mobile-20261030`. Geen productiegegevens, secrets of hostinginstellingen gewijzigd.
- CI voor deze head bij eerste controle: []. Nieuwe CI en publieke HTTPS-preview moeten nog afzonderlijk worden bevestigd; geen groene release of livegang geclaimd.
- Hostingblokkade: previewworkflow uploadt alleen een Actions-artefact, terwijl `pages.yml` uitsluitend `main` naar de bestaande productieomgeving deployt. Geen afzonderlijk geautoriseerde publieke previewhost vastgesteld. Echte geïsoleerde backend-E2E en toepasselijke PR-reviews blijven releasevoorwaarden.

## Uitvoeringsrun 8 november 2026 — GPS-precisie op mobiele kaart
- Productcommit `5ad2f6a5a84f699477d7ef292082e5c34a322365`: kaartlocatie weigert onnauwkeurige GPS-fixes boven 1000 meter en ontbrekende nauwkeurigheidsmetadata; biedt direct handmatige gebiedskeuze. Bij 100–1000 meter gebruikt de kaart minder nauwkeurige zoom en toont expliciet dat het om een benadering gaat. Hiermee wordt schijnprecisie bij mobiele netwerkgeolocatie voorkomen.
- Release blijft gescheiden van productie: Pages-workflow deployt alleen `main`; PR-previewworkflow levert een artifact, geen publieke HTTPS-host. Geen veilige afzonderlijke hostautorisatie aangetoond.
- Nieuwe head/Actions en mobiele browseracceptatie moeten na deze commit worden bevestigd; geen groene test of live preview geclaimd zonder bewijs. Geïsoleerde backend-E2E en toepasselijke reviews blijven releasegates.


## Uitvoering 8 november 2026 — GPS-nauwkeurigheid bij publiceren
- Productcode `9980c6b`: publicatie met GPS weigert nu posities met onbekende nauwkeurigheid of >1000 m afwijking; de bestaande kaartkeuze wordt geopend en het concept blijft behouden. GPS probeert hoge nauwkeurigheid met een timeout van 10 seconden. Hiermee wordt een onnauwkeurige kaartpin niet als exacte melding gepubliceerd.
- PWA-versie bijgewerkt: `1092eb1` (app-script v36), `086bbbf` (offline cache v119). Geen wijziging aan productie of echte gebruikersdata.
- Open releasegates: controleer Actions op nieuwe head, browseracceptatie iPhone/Android, echte backend-eigenaarsrechten met geïsoleerde testdata, en een afzonderlijk geautoriseerde publiek bereikbare HTTPS-preview. GitHub Pages-workflow publiceert vanaf main; PR-preview bouwt uitsluitend een artefact. Geen geverifieerde publieke feature-URL; geen merge.

## Uitvoering 8 november 2026 — backendinitialisatie veilig afvangen
- Productcommit `7ec07834b8eef2e387156dd528d414c0967de66b`: als Supabase-clientinitialisatie onverwacht faalt, blijft de kaart zichtbaar en wordt de meldfunctie als tijdelijk onbeschikbaar gemeld. Geen ongecontroleerde boot-exceptie.
- Voorafgaande head `af58fd5`: vijf Actions groen, inclusief mobiele browseracceptatie, kaartregressie en preview-artefact. Nieuwe head moet opnieuw CI doorlopen; geen nieuwe groene status claimen voordat Actions slagen.
- Previewworkflow publiceert nog niet naar publieke HTTPS-host. Pages is gekoppeld aan main; geen productiepublicatie zonder review, geautoriseerde hosting en geïsoleerde backendacceptatie.

## Uitvoering 8 november 2026 — foutpad foto-upload en databasepublicatie
- Productcommit `acbb4de5c73f4b6196b27eb412f9982fb5e55112`: bij een exception tijdens het wegschrijven van een melding (zoals netwerkuitval) wordt een eerder geüploade privéfoto nu via de bestaande geautoriseerde storage-remove-route opgeruimd, net als bij een geretourneerde databasefout. Geen echte gebruikersdata aangeraakt.
- Browserasset `app-v3.js?v=37` in `ab598836`; offline PWA-cache `v120` in `42b9c323` om oude code niet te blijven serveren.
- Hosting blijft ongewijzigd: PR-preview is alleen een Actions-artefact, Pages is productie vanuit `main`. Geen publieke featurepreview of live backendacceptatie bewezen. Controleer nieuwe SHA/Actions vóór release; geen merge zonder review- en beveiligingsgates.


## Uitvoering 8 november 2026 — herstel meldfunctie na tijdelijke backendstoring
- Voorafgaande head `8c3ca68404859910175986269c35236515a59cf4`: vijf PR Actions succesvol (validate 42469026467, browseracceptatie 42469026430, kaartregressie 42469026459, kwaliteitscontrole 42469026411, previewbundle 42469026417).
- Productcode `fc2c406a`: anonieme aanmelding kan na tijdelijke backenduitval bij terugkeer naar de app herstellen, ook als het toestel continu online bleef. Een sessionStorage-grens van 60 seconden voorkomt herhaalde reloads; bij geblokkeerde opslag geen automatische reload. Concept blijft lokaal bewaard. HTML `90ebe5a4` laadt JS v38; service worker `299092ef` gebruikt cache v121.
- Dit is een productwijziging, geen bewijs van werkende hosting. Nieuwe CI en browseracceptatie op de uiteindelijke head moeten nog slagen. Publieke featurepreview is niet aangetoond: PR-workflow levert slechts een artifact; Pages-workflow deployt alleen vanuit main. Geen productiepublicatie uitgevoerd.
- Open gates: geautoriseerde afzonderlijke HTTPS-preview, geïsoleerde backendacceptatie (aanmaken, herladen, alleen eigen melding verwijderen), vereiste reviews en eventuele hostingrechten. Geen gebruikersdata of secrets gewijzigd.


## Uitvoeringscyclus 8 november 2026 — herstel anonieme melding zonder sessieopslag
- Productcommit `164b7e2`: wanneer iOS Safari of privébrowser `sessionStorage` blokkeert, kan de anonieme meldroute na een tijdelijke aanmeldstoring bij terugkeer naar de app alsnog herstellen. De herlaadpoging blijft in geheugen beperkt tot maximaal eenmaal per 60 seconden; bij beschikbare sessieopslag blijft de beperking over herladen heen behouden.
- De bestaande Pages-workflow publiceert vanaf `main` naar productie. De PR-previewworkflow uploadt uitsluitend een Actions-artefact. Er is daarom **geen publieke featurepreview** of productiepublicatie uitgevoerd; het bestaande Pages-doel niet overschrijven.
- Direct na productcommit leverde GitHub nog geen workflowruns voor `164b7e2`; groene CI en echte iPhone/Android/backendacceptatie voor deze head zijn **niet bevestigd**. PR #71 had bij controle nul ingediende reviews.
- Releasegates: afzonderlijk geautoriseerde publieke HTTPS-previewhost, daadwerkelijke backendtest met geïsoleerde gegevens en verwijdering, toepasselijke reviews en groene CI op actuele head. Geen nieuwe secrets, kosten of productiegegevensmutaties.

## 8 november 2026 — aparte HTTPS-preview voorbereid
- Hostingverbetering commit `f335beb19f9d5987a0b29ab0bff641d10c059834`: `render.yaml` definieert een afzonderlijke statische preview op de bestaande PR #71-branch, met bestaande build/validatie, zonder extra secrets of wijzigingen aan productie-GitHub Pages. Automatische deploy is uitgeschakeld.
- Voorafgaande head `fff4d61`: vijf Actions succesvol, inclusief browseracceptatie, kaartregressie en preview-artefact. Nieuwe hostingcommit vereist eigen CI-resultaten.
- Render-workspace is gevonden, maar niet door de eigenaar geselecteerd; daarom is geen externe Render-service aangemaakt en is er nog **geen publieke HTTPS-previewlink**. Voor publicatie zijn expliciete workspacebevestiging en aantoonbare gratis beschikbaarheid nodig.
- PR #71 heeft nul ingediende reviews. Geïsoleerde backend-eigenaarsacceptatie nog niet bewezen; geen productie-merge.

## 8 november 2026 — Render preview router en PWA cachebeleid
- Hostingcommit `b92e05ccf661d5aa58472440e9225ce070e6efec`: afzonderlijke Render-preview heeft nu een rewrite naar `index.html` voor directe navigatie/deep links en expliciete `no-cache, must-revalidate` headers voor HTML en service worker, zodat een nieuwe previewversie niet door oude PWA-shell blijft hangen.
- Voorafgaande head `fe7e4ed`: vijf GitHub Actions groen (validate, browseracceptatie, kaartregressie, kwaliteitscontrole, preview-artefact). Nieuwe head vereist opnieuw CI; een Render-service of publieke HTTPS-URL is niet geverifieerd.
- Externe publicatie geblokkeerd op expliciete keuze van Render-workspace en controle van kosteloze service. Geen productie-merge of backendtest op echte gebruikersdata uitgevoerd.

## 8 november 2026 — bestaande Render-preview live, blueprintbeveiliging hersteld
- Render deployment `dep-dbo9m33rjlhs73aq461g` staat op `live` voor featurecommit `f769a7b`; buildlog bevestigt `Your site is live` en `Preview static assets built with isolated local storage and Supabase read-only gateway`. Preview-adres: https://whatsup-dog-pr71-preview.onrender.com. Onafhankelijke HTTP-controle vanuit deze uitvoeromgeving faalde door DNS-resolutie; dus geen volledige browseracceptatie op publieke URL geclaimd.
- Hostingfix `1b1eb7e`: `render.yaml` gebruikte ten onrechte de onbeschermde `build-site.mjs` in plaats van de al live gebruikte `build-preview.mjs`. Blueprint bouwt nu uitsluitend de geïsoleerde preview met lokale opslag en read-only Supabase-gateway, zodat toekomstig opnieuw aanmaken geen productie-schrijfrechten blootstelt.
- Vijf GitHub Actions groen op `f769a7b`; nieuwe CI op huidige head opnieuw controleren. Render-autodeploy staat uit: blueprintwijziging wijzigt bestaande live service niet. Live preview ondersteunt bewust geen echte backendpublicatie; geïsoleerde backend-eigenaarsacceptatie en eventuele reviews blijven vereist voor productie.
- Render-buildlog meldde twee high-severity npm audit-waarschuwingen; nader dependencyonderzoek nodig voor release. Geen echte gebruikersdata, secrets of productiehosting aangepast.

## 8 november 2026 — veilige preview-cache en deploy
- Product-/hostingcommit `6c70382432878655a3357fb25f41faed67f1bbc5`: `scripts/build-preview.mjs` berekent nu een SHA-256 fingerprint van `preview-guard.js`, injecteert deze als assetversie in de HTML en controleert dat de beschermende guard daadwerkelijk identiek in `dist` staat. Dit voorkomt dat een oude guard uit browsercache bij een nieuwe preview blijft hangen.
- Render-deployment `dep-dbobg3jl550s7398c600` aangevraagd voor exact deze commit op bestaande geïsoleerde service `whatsup-dog-pr71-preview`; bij eerste controle `build_in_progress`. Publieke URL: https://whatsup-dog-pr71-preview.onrender.com. Nieuwe CI en onafhankelijke URL-acceptatie nog niet bewezen; productie niet aangepast.
- Preview blijft bewust read-only voor echte backendwrites; backend-eigenaarsacceptatie met geïsoleerde testdata en verplichte reviews blijven open.

## 8 november 2026 — mobiele previewbanner uit kaartviewport
- Productcommit `c7d27432ae68616f838cb43cd81c5bca44bd5537`: de veiligheidsbanner van de Render-proefversie is niet meer sticky en blijft in de documentflow, met iOS safe-area padding en compacte typografie. Zo kan deze niet bovenop kaartbediening blijven plakken bij scrollen; preview blijft read-only en productie onaangeroerd.
- Render-deployment `dep-dbocase417fc73frn87g` aangevraagd voor die exacte commit op bestaande statische preview. Controleer live status, huidige SHA en nieuwe CI vóór acceptatie. URL: https://whatsup-dog-pr71-preview.onrender.com.
- Vijf GitHub Actions waren groen op vorige head `80febf8`; nieuwe head nog niet bevestigd. Echte backendwrite- en eigenaarsacceptatie blijft bewust niet mogelijk in deze alleen-lezen preview.

## 8 november 2026 — preview build herstel
- Product/hostingcommit `ab09cce7abb97f8fd0906ab84750b9706c284c8a`: verwijdert dubbele productiebuild uit `scripts/build-preview.mjs` (Render voert `build-site` al vooraf uit) en corrigeert de case-insensitive titelvervanging zodat de publieke proefversie expliciet als proefversie herkenbaar is. Een ontbrekende HTML-titel laat de build nu falen in plaats van ongemerkt verkeerde labeling te publiceren.
- Preview blijft read-only; backend-eigenaarsrechten en productie-merge niet bewezen. CI en Render-deploy voor nieuwe head apart controleren.


## 8 november 2026 — mobiele preview werkt zonder browseropslag
- Productcommits `f353eb3` en `feeb0b6`: previewopslag gebruikt een tijdelijke in-memory fallback als iOS Safari of een privacywebview `localStorage` blokkeert; ook wissen van previewgegevens werkt zonder Storage API. Dit raakt geen productiebackend of echte gebruikersdata. In-memory concepten verdwijnen bij herladen.
- Render-preview op bestaande geautoriseerde statische service; alleen-lezen gateway blijft actief. Controleer actuele deploy en vijf Actions voor de definitieve SHA. Backendplaatsing/eigenaarsverwijdering blijven niet bewezen en mogen niet als afgerond worden geclaimd.

## 8 november 2026 — Safari previewopslag consistent bij quota-omslag
- Productcommit `7d96749`: de geïsoleerde previewopslag leest in-memory waarden met voorrang en telt zowel browser- als geheugensleutels. Bij een mislukte localStorage-write blijven nieuwe proefgegevens zichtbaar in dezelfde sessie; echte backendgegevens worden niet gewijzigd.
- Eerdere head `c4a8f24`: vijf Actions groen en Render deployment `dep-dboe2h3m8hqs738adomg` live. Nieuwe head vereist eigen CI- en deploycontrole. Backendwrites/eigenaarsrechten blijven bewust buiten deze read-only preview.

## 8 november 2026 — Render blueprint buildketen hersteld
- Hostingcommit `19e63fec`: `render.yaml` bouwt nu eerst `dist` via `build-site.mjs`, daarna pas de beveiligde preview via `build-preview.mjs`; voordien ontbrak de vereiste buildstap in de declaratieve configuratie. Ook onbedoelde letterlijke `\n` in commentaar gecorrigeerd.
- De bestaande Render-service gebruikt een afzonderlijke werkende buildcommand; de blueprintfix voorkomt een kapotte herinstallatie vanuit repositoryconfiguratie. De publieke preview blijft read-only. Nieuwe SHA, CI en Render deployment afzonderlijk controleren.

## 9 november 2026 — offline preview guard cacheherstel
- Product/hostingcommit `d256dace`: `scripts/build-preview.mjs` voegt de SHA-256-versie van `preview-guard.js` aan de service-worker precache toe en roteert de previewcache bij een nieuwe guardversie. Hiermee kan de offline PWA-shell niet zonder de benodigde alleen-lezen gateway laden wanneer de guard al eerder online is opgehaald. Geen productiecode, backend of gebruikersdata gewijzigd.
- De bestaande Render-static-preview heeft autoDeploy uit; handmatige deploy nodig. Controleer CI, Render commit-SHA en onafhankelijke HTTPS-bereikbaarheid voor acceptatie. Backend-eigenaarsacceptatie en review blijven open.


## Uitvoering 9 november 2026, 01:55 CET — veilige preview-uploadgrens
- Productfix `8afef548f21cdc187f60c4717c920b3830054473`: preview weigert nu ook signed-upload aanvragen naar Supabase Storage. Voorheen was `POST /storage/v1/object/sign/` uitgezonderd, ondanks het alleen-lezen karakter van de publieke featurepreview. Anonieme authenticatie en moderatorrolcontrole blijven uitgezonderd.
- Voorgaande head `e84dce3`: vijf Actions groen (validate, browseracceptatie, kaartregressie, kwaliteitscontrole, preview-build), Render deployment `dep-dbogop0u01pc73f7dhq0` live.
- Deze wijziging is een beveiligingsreparatie, geen bewijs van volledige backendmeldroute. Hosted schrijf-/verwijderacceptatie vereist geïsoleerde testdata en geautoriseerde backendroute. Geen productiegegevens gewijzigd.

## 9 november 2026 — preview cacheveiligheid
- Hostingwijziging `ceb2a9a`: Render geeft `/preview-guard.js` expliciet `Cache-Control: no-store, max-age=0`, zodat CDN/browser geen verouderde read-only gateway bewaren. Productie niet gewijzigd.
- Voorafgaande head `73ede57`: vijf GitHub Actions geslaagd (validate, browseracceptatie, kaartregressie, quality, previewbuild).
- Nieuwe SHA, CI en publieke HTTPS-bereikbaarheid na commit opnieuw controleren; deze wijziging bewijst geen backendpublicatie of eigenaarsverwijdering. Preview blijft read-only totdat geïsoleerde backend-E2E en releasegates zijn aangetoond.

## 9 november 2026 — mobiele previewruimte en duidelijkheid
- Previewproductcode: commit `8b06fa9` maakt expliciet dat kaart en meldingen te bekijken zijn, maar publiceren niet mogelijk is in de geïsoleerde alleen-lezen preview.
- Productcommit `c4b73e480fe760419c97ad163b1a2dda153a3229`: veiligheidsbanner is nu sluitbaar met een toegankelijk 44px-aanraakdoel, zodat deze geen permanente verticale ruimte inneemt op een klein telefoonscherm. De Supabase-writeblokkade blijft ook na sluiten actief.
- Direct na de productcommit leverde de GitHub workflowquery nog geen runs op. De publieke URL https://whatsup-dog-pr71-preview.onrender.com kon vanuit de externe HTTP-controle niet worden geopend. Geen nieuwe Render-deploy of groene CI geclaimd; productie niet gewijzigd.
- Open: daadwerkelijke HTTPS-bereikbaarheid, iPhone/Android hosted acceptatie, geïsoleerde backend-eigenaarsrechten en vereiste reviews. Volgende run: controleer nieuwe CI en Render SHA; werk daarna aan de echte accountloze meldroute in plaats van verdere previewcosmetica.

## 9 november 2026 — meldlocatie behouden bij GPS-fout
- Productcommit `874612ac04c670d49e83be424356be8839d27e9e`: wisselen van handmatig gekozen kaartpin naar GPS wist de bevestigde pin niet meer. Als GPS daarna weigert of onnauwkeurig is, kan de gebruiker terug naar de eerder gekozen kaartlocatie zonder opnieuw te tikken; publiceren in GPS-modus gebruikt nog steeds uitsluitend de GPS-fix.
- GitHub Actions direct na commit: nog geen workflowruns voor deze SHA gevonden. Preview-HTTPS, mobiele Playwright-acceptatie en backend-eigenaarsrechten op deze head niet bevestigd; niet mergen of als live claimen.
- Volgende cyclus: CI controleren, gehoste meldroute met geïsoleerde backenddata verifiëren en pas na alle gates releasen.


## Uitvoering 9 november 2026 — fallback voor actieve meldingen
- Productcommit `95f15549106d4d14ef8d0c2aad4a6de0e97ee5eb`: `fetchActiveReports()` toont bij uitval van `get_active_reports` RPC ook actieve meldingen zonder vervaldatum (`expires_at IS NULL`). Voorheen filterde `.gt()` die onbedoeld weg; de lokale validatie stond meldingen zonder vervaldatum wel toe. Dit is een functionele correctie aan het ophalen en herladen van meldingen, geen test-only wijziging.
- Commit teruggelezen via GitHub; GitHub Actions en commit-status leverden onmiddellijk na de commit nog geen resultaten op. Groene tests op deze SHA zijn dus niet aangetoond.
- De bekende Render-preview `https://whatsup-dog-pr71-preview.onrender.com` is in deze uitvoering niet onafhankelijk via HTTPS/browser geverifieerd. Geen claim van deployment of werkende backendpublicatie/verwijdering. Geen productie-merge of mutatie van gebruikersdata.
- Vervolg: CI op de nieuwe SHA controleren, echte mobiele browseracceptatie en gehoste meldroute met geïsoleerde backendtestdata valideren voordat productie wordt vrijgegeven.

## 9 november 2026 — iPhone kaartstart en losloopgebieden (screenshot gebruiker)
- Productcode `b9a1459`: een oude opgeslagen kaartpositie buiten het geselecteerde gebied wordt niet langer als startpunt hergebruikt; automatische focus op een recente melding springt niet meer naar een andere plaats.
- Mobiele UI `76a35bf`: losloopgebieden is een compacte 38×24 px schakelaar in een 48 px hoge bediening, met vaste iOS-styling, focusindicator en voldoende ruimte voor de tekst.
- PWA assetversies `ed2622f` en serviceworker v122 verversen de mobiele code en styling.
- Verificatie nog nodig: nieuwe head Actions, Render-deployment op exact SHA en browsercontrole op iPhone/Android. Geen backenddata of productie gewijzigd.

## 9 november 2026 — mobiele losloopbediening en echte Render-preview deploy
- Productcommit `42c25f9`: de gehele losloopgebieden-bediening is nu aanklikbaar; een tik op de tekst bedient de echte checkbox zonder dubbele omschakeling. De schakelaar behoudt native change-events, opslag en kaartlaag.
- PWA `8acd65e` / `066a9d0`: HTML assetversie 40 en serviceworker cache v123 voorkomen een oude iOS-bundel.
- Voorafgaand aan de wijziging waren vijf Actions groen op `2837a9c`. Op `066a9d0` was kaartregressie groen; overige Actions liepen nog.
- Render preview service `srv-dbljci6gekts738j4r40` gebruikt de juiste featurebranch en heeft autoDeploy uit. Deployment `dep-dbomtndg1s2s73fn6t9g` is handmatig gestart op exact `066a9d0`; bij controle build_in_progress.
- Publieke URL `https://whatsup-dog-pr71-preview.onrender.com`: externe DNS-resolutie in controlecontainer faalde; bereikbaarheid niet bewezen. Preview is read-only, backend-write/eigenaarsverwijdering niet gevalideerd. Productie en echte data ongewijzigd.
