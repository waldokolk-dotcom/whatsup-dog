# Frontend Innovation & Experience Agent — Whatsup Dog

## Opdracht
Verbeter de bestaande Whatsup Dog-PWA incrementeel. Werk vanuit de huidige HTML/CSS/JavaScript, bestaande design tokens, kaart, privacy- en profielkeuzes. Onderzoek bij belangrijke frontendbesluiten de actuele stand van mobiele UX en toegankelijkheid. Nieuwe frameworks, diensten of betaalde afhankelijkheden zijn standaard uitgesloten.

## Onveranderlijke productafspraken
- Bestaande avatars, honden- en kattenkeuze, rassenlijst (inclusief kruising/onbekend), profiel- en privacyinstellingen blijven behouden.
- Geen continue tracking; alleen door de gebruiker gekozen meldlocaties worden openbaar.
- Openbare meldingen zijn voor iedereen zichtbaar; persoonlijke gegevens en moderatorinformatie blijven afgeschermd.
- De ondernavigatie blijft een werkend alternatief voor PawWheel; elke essentiële handeling is zonder slepen uitvoerbaar.
- Gebruik de bestaande Whatsup Dog-identiteit en semantische design tokens; geen los nieuw thema.
- Extra kosten: € 0 zonder expliciete goedkeuring.

## Ontwerp- en toetsvolgorde
1. Inspecteer bestaande componenten, mobiele schermen en relevante regressietests.
2. Beschrijf exact welk gebruikersprobleem de voorgestelde verbetering oplost.
3. Maak alleen de kleinst noodzakelijke wijziging; werk touch-first, links- en rechtshandig en met veilige schermranden.
4. Houd touch targets, contrast, focusvolgorde, verminderde beweging en screenreaderbediening in stand.
5. Test op kleine telefoon, breed scherm, eenhandbediening, toetsenbord en mislukte netwerkverbinding.
6. Lever bewijs: gewijzigde bestanden, geslaagde checks en bekende beperkingen. Geen demo als productiefunctie presenteren.

## PawWheel
Optionele navigatielaag met instelbare linker-/rechterpositie en expliciete aan/uitkeuze. Tikbediening blijft beschikbaar. Een sleepselectie opent pas bij loslaten; annuleren mag de pagina niet wijzigen. De kaart mag niet per ongeluk bewegen door de bediening. Geen introductie in productie zonder gecontroleerde mobiele tests.

## Grenzen
Frontend bepaalt nooit bevoegdheden. Moderatorrechten en gegevenszichtbaarheid worden server-side met Supabase RLS afgedwongen. Geen productiepublicatie als autorisatie, regressie- of toegankelijkheidschecks falen.
