# Braun Blinds AI Phase 1 — manual acceptance checklist

This is a **staging/local-only** acceptance plan. Do not use live customer data, send customer emails, issue quotes, place factory orders, run production D1 migrations, or deploy without explicit approval.

## Preconditions
- Use an isolated preview or local build with synthetic users and inquiry data.
- Verify the exact commit SHA and green GitHub CI for AI tests, V5.2 read-only tests, TypeScript, and full build.
- The 13 previously divergent V5.2 file contents match PR #301 commit `ebe4c847f366`; Git history is still divergent. Do not merge automatically.
- Verify staging R2 `MEDIA` binding separately before testing existing photo routes; a TypeScript declaration does not provision storage.

## Owner and access control
- [ ] Anonymous browser visiting `/ai` is redirected to `/login`.
- [ ] Non-owner authenticated account visiting `/ai` sees a denial and no inquiry data.
- [ ] Owner visiting `/ai` sees the Chinese-first workbench.
- [ ] English toggle changes the UI labels; toggling back restores Chinese.

## Inquiry extraction and editing
- [ ] Paste synthetic multi-line inquiry: `1. JL3601 White LF WH 39 5/8 x 40 5/8 qty 1\n2. ML-1801 36 x 60 qty 2 motorized`.
- [ ] Two separate draft cards appear and are marked review-required.
- [ ] First width and height parse as 39.625 and 40.625 inches; editing with `39 5/8` does not truncate the typed fraction.
- [ ] `LF` means light-filtering and `WH` means white hardware; `BK` means black hardware, **not** blackout (`BO`).
- [ ] Blank, zero, negative, and malformed quantities/dimensions show validation alerts and block completeness.
- [ ] Fabric code remains unverified; no JL price is inferred from a Z catalog.
- [ ] Changing a draft field does not silently update a different line.
- [ ] Re-extracting new source clears stale edits and warnings.

## Mobile and keyboard accessibility
- [ ] iPhone-width (375px), tablet-width (768px), and desktop-width (1280px) layout: no horizontal overflow, readable cards and inputs.
- [ ] Keyboard-only tab order reaches inquiry input, extraction button, language toggle, and every draft field.
- [ ] Validation messages are announced via `role="alert"`; extraction result via `role="status"`.

## Negative side-effect checks
- [ ] Browser network panel: extraction/editing makes no API POST or other remote requests.
- [ ] No D1 rows, order records, quote records, customer messages, or factory production requests are created.
- [ ] Formal quote and supplier production remain blocked pending verified catalog, customer pricing evidence, human approval, and cleared/allocated/finance-approved full payment.

Record browser/device, tested commit SHA, tester, screenshots, date, and pass/fail for each item. Failures must be fixed and rerun before any merge/deploy request.

## Additional ambiguity acceptance cases
- [ ] Two different models in one numbered window (`JL3601 and ML-1801 36 x 60 qty 1`) trigger an explicit review alert; no second model is silently discarded for formal quoting.
- [ ] Two dimension pairs in one window (`JL3601 36 x 60 or 40 x 70 qty 1`) trigger an explicit review alert.
- [ ] Conflicting opacity (`LF BO`), hardware (`WH BK`), or operating modes (`motorized cordless`) trigger distinct review alerts, in Chinese by default and English after switching language.
- [ ] Normal `JL3601 White LF WH 39 5/8 x 40 5/8 qty 1 motorized remote` triggers no false conflict alert.
- [ ] Repeated, skipped, reversed or zero-based window numbers produce warnings; ordinary consecutive 1,2 numbering does not.
- [ ] 101 numbered windows generate at most 100 draft cards plus a warning; no automatic quotation for omitted windows.
- [ ] Overlong unnumbered inquiry produces **both** truncation and missing-number warnings.
- [ ] Edit source after extraction: all old cards, edits, warnings and notice disappear before re-extraction.
- [ ] Warning alerts are visible, keyboard accessible, and announced by a screen reader where available.

All cases use synthetic inquiries in a nonproduction environment. Record screenshots and any browser console/network errors.
