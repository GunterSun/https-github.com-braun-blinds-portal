# Z Series regression checks

Run `node --test tests/z-series-formal.test.mjs` for pure pricing/source validation.

Integration fixture is for an isolated, disposable local D1 database only. Never load it into production: it contains deliberately predictable local test sessions.
1. Apply existing drizzle migrations to the local DB used by the Vite server.
2. Create `.sites-runtime/`, then run `python3 tests/seed-local-z-series.py`.
3. Execute the generated `.sites-runtime/qa.sql` against that local DB only.
4. Start Vite on 127.0.0.1:5180 and run `node tests/z-series-integration.mjs`.

Checks cover server totals, concurrent idempotency, invalid input, customer permissions, signature and invoice contents. Fixtures use IDs 99001–99032 and example.invalid addresses.
