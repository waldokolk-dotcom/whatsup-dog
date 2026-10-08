# Whatsup Dog — phase 3: safe enhancement gate

Google Agent Skills are **developer instructions**, not a drop-in replacement for Leaflet, Supabase/PostGIS or existing map controls. Keep the current infrastructure and avoid unapproved paid Google Maps APIs.

The added regression gate is `node scripts/map-regression-qa.mjs`. It detects accidental removal of marker clustering, report synchronization, owner-only deletion/resolution, geolocation and off-leash overlays. It does **not** prove these behaviours work in the browser.

Before deployment: run `node scripts/validate.mjs`, `npm run test:usability`, Supabase SQL and API tests, and the manual hosted two-account tests documented in README. Do not push migrations blindly. This PR contains no data migrations and no production configuration changes.

Follow-up implementation after green tests: reproduce and address any remaining marker/list synchronization, map selection or push delivery defects based on recorded failing tests. Remote push requires a verified trusted sender and opt-in.
