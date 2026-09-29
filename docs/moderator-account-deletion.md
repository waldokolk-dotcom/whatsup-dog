# Whatsup Dog — gecontroleerde accountverwijdering van moderators

## Doel en afbakening
Een moderator die moderatiebesluiten heeft vastgelegd, mag niet met één klik bewijs uit het auditspoor laten verdwijnen. Het account wordt pas verwijderd nadat een bevoegde beheerder de wettelijke bewaarplichten en het verwijderverzoek afzonderlijk heeft beoordeeld. Dit is een operationele controle, geen vervanging voor een privacy- of juridische beoordeling.

## 1. Verzoek van de betrokkene
De bestaande knop **Account opheffen** probeert eerst de gewone verwijderroute. Als daarbij een moderatie-auditblokkade optreedt, roept de app `public.request_my_account_deletion()` aan en toont expliciet dat het account nog bestaat. Herhaalde verzoeken leveren dezelfde openstaande zaak op.

## 2. Beoordeling door de beheerder
Gebruik uitsluitend de geautoriseerde Supabase SQL-editor of een gelijkwaardig vertrouwd administratief kanaal. Selecteer uitsluitend openstaande zaken en raadpleeg de relevante moderatiebesluiten:

```sql
select id,requester_id,requested_at
from private.account_deletion_requests
where status='pending'
order by requested_at;
```

Verifieer de identiteit en het verzoek via het bestaande beheerdersproces, bepaal welke gegevens om juridische redenen bewaard moeten blijven en documenteer een concrete beslissing. Deel nooit de service-role-sleutel met de browser of de gebruiker.

## 3. Goedkeuren en afronden
Gebruik uitsluitend na bevoegde goedkeuring de zaak-id van stap 2:

```sql
select private.approve_moderator_account_deletion(
  '<UUID-VAN-DE-ZAAK>'::uuid,
  'Beoordeling uitgevoerd; auditretentie en verwijdering volgens intern besluit <REFERENTIE>'
);
```

Deze databaseprocedure archiveert de bestaande moderatiebesluiten in de afgeschermde private auditarchief-tabel, maakt het oorspronkelijke moderatorveld van overblijvende besluiten leeg, draagt nog bestaande groepsgesprekken over aan andere deelnemers en verwijdert het account. De archivering, statuswijziging en verwijdering zijn één transactie: bij een fout wordt alles teruggedraaid.

## 4. Controle achteraf
Controleer de zaak en het archief zonder persoonsgegevens te exporteren:

```sql
select id,status,reviewed_at,requester_id
from private.account_deletion_requests
where id='<UUID-VAN-DE-ZAAK>'::uuid;

select count(*) as archived_actions
from private.moderation_audit_archive
where case_id='<UUID-VAN-DE-ZAAK>'::uuid;
```

Verwacht `status='approved'` en `requester_id is null`. De beheerder moet eventuele niet-databaseobjecten, zoals foto's zonder bijbehorende databaseverwijdering, en externe verwerkers apart beoordelen.

## 5. Afwijzen of aanhouden
Bij een ontbrekende wettelijke of organisatorische grondslag voor onmiddellijke verwijdering: laat het account intact, registreer de reden bij het verzoek en communiceer de beslissing via het reguliere privacyproces. Voer de goedkeuringsfunctie niet uit. Geen automatisch opschonen van moderatiebesluiten en geen brede bulkverwijderingen.

## Acceptatiebewijs
De lokale PostgreSQL-tests onder `supabase/tests/moderator_account_deletion.test.sql` verifiëren onder meer dat een moderator zijn eigen verzoek niet kan goedkeuren en dat ook auditbewijzen bij een eigen rapport blijven bestaan na bevoegde verwijdering. Publicatie vereist een groene database- en browsertest en een afzonderlijk geautoriseerde productiecontrole.
