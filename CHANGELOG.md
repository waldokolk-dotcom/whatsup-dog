# Changelog

## [1.6.3] - 2026-09-13
- Verholpen dat de pagina kon vastlopen door een zichzelf herhaald triggerende MutationObserver.
- UI-hotfixes zijn nu idempotent: teksten worden alleen aangepast wanneer ze echt veranderen.
- Observerwerk wordt gededupliceerd via requestAnimationFrame zodat snelle DOM-wijzigingen niet tot een CPU-loop leiden.
- Regressiecheck toegevoegd die deze stabiliteitswaarborgen bewaakt.

## [1.6.2] - 2026-09-13
- Vaste nep-ongelezenbadge “3” bij standaardchat verwijderd.
- Na het maken/kiezen van een herkenningsfoto zijn “Foto verwijderen” en “Verder met melding” duidelijk beschikbaar.
- Na terugkomst uit de camera scrolt de app naar de foto-acties zodat de gebruiker niet vastloopt.
- Kolom “Wat” in het meldingenoverzicht toont Nederlandse categorienamen in plaats van interne Engelse codes.

## [1.6.1] - 2026-09-13
- Koptekst “Rond jullie” verwijderd van Home.
- Meldingenlijst is nu eerst in de app te bekijken als tabel, ook op laptop.
- Vanuit dezelfde lijst kan nog steeds worden gedeeld of als CSV gedownload.
- Chat legt duidelijk uit dat echte aangemelde gebruikers nog niet als selecteerbare namenlijst beschikbaar zijn.
- Bestaande voorbeeld-/groepsgesprekken blijven herkenbaar gescheiden van echte gebruikers.
- Privacyveilige opt-in toegevoegd: “Vindbaar in Whatsup dog” staat standaard uit.
- Alleen hondnaam/profielnaam, avatar, ras en woonplaats worden na opt-in vindbaar; geen e-mail of exacte thuislocatie.
- Vindbare gebruikers verschijnen als selecteerbare Hondenmensen en kunnen een privégesprek starten.

## [1.6.0] - 2026-09-13
- Profielfoto kan vanuit fotobibliotheek/album gekozen worden.
- Meldingen krijgen hoelang en mate van ergernis/impact 1-5.
- Deelbare CSV-lijst voor gemeente of andere organisaties met datum, wat, waar, hoelang, ergernis, omschrijving, status en kaartlink.
- Gesprekken kunnen persistent gewist worden; standaardgesprekken komen niet meer terug na wissen.
- Mobile UX Agent controleert deze functies vóór release.
- Release Agent bewaakt versie en offline-cache.

## [1.5.0] - 2026-09-13
- Centrale SemVer-versiebron.
- Mobile UX kwaliteitscontrole.
- Release kwaliteitscontrole.
- Touch targets minimaal 44 px.
- Ondersteuning voor safe areas op telefoons.
- Verbeteringen voor smalle schermen en landscape.
- Dubbele meldknop verwijderd.
- Meer avatars en keuze voor eigen hondenfoto.

## [1.4.0] - 2026-09-13
- Eerste publieke PWA-versie.
