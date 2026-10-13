# V5.2 CI dependency recovery · 2026-10-13

GitHub Actions run 38353630450 failed at npm ci before either test suite ran. The repository package-lock.json was truncated at byte 32768 and was invalid JSON; the npm message described it as an unusable/missing lockfile.

Recovered a complete lock from the working source baseline, then reconciled it with this GitHub branch's package.json using npm 11.9.0 --package-lock-only --ignore-scripts. No retained dependency versions changed. Removed only the unused Stripe lock entry because this branch does not declare Stripe (the production source checkout does).

The recovered file is 379880 bytes, lockfileVersion 3, 710 package entries. Git blob SHA: 0755876688fdd8c1a2ffaba70cf08be6a3e27818. The uploaded blob matches the local Git hash, guarding against another truncated transfer.

Clean isolated checkout validation: npm ci succeeded; 18 read-only review tests and 8 SQL proposal tests passed. Production data, migrations and deployment were not changed. Remote GitHub CI must be checked on this new commit; the earlier failed run is not a test result for this repair.
