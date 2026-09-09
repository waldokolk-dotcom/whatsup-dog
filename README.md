# Whatsup dog

Standalone PWA extracted from `waldokolk-dotcom/VakantieApp/whatsup-dog` on 2026-09-09. The original source is retained for a safe cutover. All 20 Nijkerk GeoJSON polygons are copied without alteration. Map tiles require internet; the app shell, Leaflet and official polygons are cached offline.

## Run and validate

Serve this directory over HTTP (for example `python -m http.server 8765`). Run:

```
node scripts/validate.mjs
supabase start
supabase db reset
supabase test db
node scripts/api-e2e.mjs
```

The GitHub validation workflow runs the same tests against an ephemeral local Supabase stack. SQL tests exercise owner/nonowner/moderator/anonymous access. API tests use real Auth, REST and private Storage with two users; they refuse non-local endpoints. Fixtures are disposable and never run against production.

## Connect the hosted Supabase project

1. Use the Supabase CLI in this repository: `supabase login`, then `supabase link --project-ref YOUR_PROJECT_REF`. Keep database passwords and access tokens in your local environment or secret manager.
2. Review `supabase db push --dry-run`, then apply the migration with `supabase db push`. These migrations are for a fresh Whatsup dog project, not the VakantieApp database.
3. In hosted Auth settings enable anonymous sign-ins, configure abuse protection/rate limits and the production site URL `https://waldokolk-dotcom.github.io/whatsup-dog/`. Local config.toml does not automatically apply hosted Auth settings. Anonymous users are device-bound; linking a verified login for account recovery is future work.
4. In `backend-config.js` set only `url`, the **publishable** (or legacy **anon**) key and `enabled:true`. Never use a service-role/secret key here. The browser rejects privileged key formats. Public keys are not authorization; database RLS supplies authorization.
5. Run the app with two separate browser profiles: make a report and JPEG photo in A, verify it in B, reload both, then disable internet and create/retry a local report. Check point and polygon rendering. Existing local-only reports are not silently migrated between different origins.
6. Only after validation: configure GitHub Pages source as GitHub Actions and run **Publish PWA to GitHub Pages**. The upload contains static assets only. Verify the new URL, installation and offline reopening on a device before switching the old entry point. Existing installed PWAs retain their old start URL and must be reinstalled; localStorage is shared only on the same origin.

## Security and scope

- Profiles (including home location) are owner-only. Report attribution is a snapshot and is not a verified identity.
- Active reports are readable by signed-in users (including anonymous Auth users). Hidden/resolved reports are visible only to their owner/moderators. Clients insert reports but cannot overwrite or unhide published content. Retry checks report ownership; photo objects are immutable.
- Leaflet [lat,lng] polygons are validated and converted to indexed PostGIS geometry. Maximum 120 points; invalid/self-intersecting polygons are rejected.
- Photos are private JPEG objects, max 5 MiB. Signed URLs expire after the configured lifetime (default one hour). Hiding a report prevents NEW signed URLs; an already issued URL can remain valid until expiry. Trusted cleanup may remove orphaned uploads. Do not delete storage rows with SQL; use the Storage API.
- Chat rooms/membership are provisioned by trusted server code. Only members may read/write messages. The existing chat UI remains a local demonstration; shared chat UI and membership invitations are not implemented.
- `moderation_flags` receives user flags. Provision moderators server-side in `private.moderators`; never trust user_metadata roles. `moderate_report` checks membership and atomically records an audit entry. The moderator UI is future work.
- Push subscriptions are owner-only. The worker can display received pushes. Browser subscription enrollment and the trusted push sender are future work; keep VAPID private keys and service-role credentials on the server. A sender must allowlist supported push-provider hosts, reject private/loopback destinations and redirects, enforce consent, and remove expired endpoints. The existing test-notification button is not remote push delivery.
- Confirmation counts currently remain local/demo behavior; a deduplicated server confirmation RPC is future work.
- Do not deploy `.env`, SQL, test fixtures or service-role credentials as site assets. `scripts/build-site.mjs` creates the static-only `dist` directory.

References: [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security), [Storage access control](https://supabase.com/docs/guides/storage/security/access-control), [Migrations](https://supabase.com/docs/guides/local-development/database-migrations).
