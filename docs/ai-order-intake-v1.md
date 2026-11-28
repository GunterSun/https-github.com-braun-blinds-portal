# Braun Blinds AI Order Intake — Phase 1

Status: isolated development scaffold; not deployed and not wired to production data.

## Existing components to reuse
- `app/ai/page.tsx`: owner-only AI workbench
- `lib/ai/extract-inquiry.ts`, `extract-lines.ts`: text inquiry extraction
- `lib/ai/draft-workflow.ts`: explicit human approval lifecycle
- `lib/order-access.ts`: order-level access enforcement
- `app/api/v4/orders/route.ts`: unified order APIs
- `app/data-import`: historical financial Excel import, NOT the new customer inquiry intake

## Proposed pipeline
1. Authenticated owner/admin or scoped sales user uploads an image, workbook, PDF or pasted text.
2. Validate MIME signature, file size, number of pages/rows, and malware scanning policy before parsing.
3. Store original files in private object storage, encrypted at rest, with a content hash and restricted retrieval.
4. Extract text and workbook cell positions; scanned images/PDF require a dedicated OCR/vision adapter.
5. Map lines to the intake contract with per-field evidence and unverified defaults.
6. Require human correction/verification and resolve conflicts before marking ready for review.
7. Save a versioned draft in a new, separate staging store; prevent duplicate submission with an idempotency key.
8. Convert to an existing unified order draft only after server-side authorization and explicit review.
9. Quote issuance, customer email, payment verification and factory release remain separate, existing approval gates.

## Implementation sequence
A. Contract and pure tests (this branch).
B. Inspect existing storage bindings and choose private file storage and retention controls.
C. Implement parsers with fixtures: handwritten image, XLSX multi-sheet, text PDF, scanned PDF.
D. Implement authenticated upload, draft storage and edit/revision APIs.
E. Add bilingual UI and original-source side-by-side review.
F. Run typecheck, tests and end-to-end access checks before proposing merge.

## Non-negotiable safety
- Never infer an illegible dimension, missing product, customer identity or price.
- No automatic formal quote, email, payment confirmation or supplier order.
- Customer/supplier users cannot access internal intake files.
- Every draft revision must record actor, time, old/new value and source.
- No production D1 migration, deployment or branch merge without separate approval.
