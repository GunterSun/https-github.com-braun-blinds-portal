# AI Phase 1 — Integration and build gate (2026-11-13)

## Verified
- AI isolated GitHub Actions passed at commit 684575a70e14da9cff5fea10153e239b4dc26df6.
- AI branch is 54 commits ahead of main and 0 behind at time of inspection.
- AI branch includes many V5.2 changes also present in PR #301, but was based on an earlier V5.2 snapshot.

## Blocking items before merge or deploy
1. PR #301 must be reconciled first; its latest commit ebe4c847f366 includes package-lock.json and build corrections not proven present on the AI branch.
2. Rebase or merge the reviewed V5.2 head into the AI branch only after checking file-level conflicts, especially package.json, package-lock.json, scripts/build-portable.mjs and V5.2 tests.
3. Run npm ci, npx tsc --noEmit, npm run build and relevant V5.2 + AI tests in isolated CI. Current AI workflow runs dependency-free unit tests only and does NOT prove the portal builds.
4. Manually test /login -> /ai owner, unauthorized role 403, mobile layout and fractional-inch edits.
5. Verify catalog provenance and per-customer discount snapshots before allowing any quote preparation; no automatic issuance.
6. D1 migration is proposal only. Require backup, staging rehearsal and explicit authorization before execution.

## Safety
No merges, production deploys, D1 writes, customer messages, or supplier orders are authorized by this document.

## Manual verification workflow
A workflow at `.github/workflows/ai-phase1-build-verification.yml` is available for manual execution only. It attempts `npm ci --ignore-scripts`, `npx tsc --noEmit`, isolated AI tests and `npm run build`. Creating the workflow does **not** mean it ran or passed. Its install step may expose the stale lockfile in this branch. Do not merge or deploy on the strength of the isolated tests alone.

## First complete CI pass
GitHub Actions run https://github.com/GunterSun/https-github.com-braun-blinds-portal/actions/runs/43568456084 completed successfully for commit 28422e151844450b8b5b5d914a178c70476b4729:
- `npm ci --ignore-scripts --no-audit --no-fund` passed
- `npx tsc --noEmit` passed
- AI isolated unit tests passed
- `npm run build` passed

The prior CI failure was due to missing `MEDIA` binding type in `cloudflare-env.d.ts`; the declaration was aligned with `.openai/hosting.json`, which lists `r2: "MEDIA"`. This does not validate production R2 provisioning or browser flows.

Still required: reconcile PR #301's reviewed V5.2 changes, run full V5.2 regression tests, perform owner login/mobile UI acceptance, verify live R2 binding without modifying production, and obtain explicit approval before merge/deploy/migration.
