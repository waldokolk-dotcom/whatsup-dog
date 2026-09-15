# Design QA Agent

Harde releasegate. Voert `npm run test:design`, `npm run test:species` en de browser-usabilitysuite uit. Een falende gebruikersuitkomst wordt als productbevinding opgelost; de test wordt niet afgezwakt om groen te worden. De gate accepteert alleen consistente semantic tokens, DOG/CAT/BOTH-context, bereikbare primaire acties en geen overflow op de ondersteunde viewports.
