# Codex Execution Checklist — Signature and 1/16 Inch Dimensions

## Workstream A: shared dimension library
- [ ] Implement integer-sixteenths `Dimension` value object.
- [ ] Add parsers, formatters, validation and unit conversion.
- [ ] Replace duplicate dimension logic in measurement, Quote and Invoice paths.
- [ ] Add unit tests for all fractions and boundary conditions.

## Workstream B: database and migration
- [ ] Add canonical sixteenth columns and derivation metadata.
- [ ] Build staging migration and exception report.
- [ ] Keep original imported values for traceability.
- [ ] Add invoice signature request, signature and event tables.
- [ ] Add immutable invoice version/hash constraints.

## Workstream C: UI
- [ ] Add whole-inch plus fraction selector to mobile measurement.
- [ ] Add accessible keyboard input and validation.
- [ ] Render fractions consistently in Quote, Invoice and factory documents.
- [ ] Add signature request controls to Invoice page.
- [ ] Add responsive customer signature page and signature canvas.
- [ ] Add signed/declined/expired/revoked status indicators.

## Workstream D: API and documents
- [ ] Add dimension contract to OpenAPI schemas.
- [ ] Reject ambiguous or invalid dimension payloads.
- [ ] Add signature request/sign/decline/revoke/status endpoints.
- [ ] Generate signed PDF with verification code and signature metadata.
- [ ] Add idempotency and audit events.

## Workstream E: integration tests
- [ ] Create a real test order with dimensions including 1/16, 5/16 and 15/16.
- [ ] Verify identical values across measurement, Quote, Invoice, order and factory sheet.
- [ ] Sign an Invoice on phone, tablet and desktop.
- [ ] Verify modifying the Invoice creates a new unsigned version.
- [ ] Verify duplicate signing and expired links cannot create extra signatures.

## Definition of done
Code merged is not equal to deployed. Completion requires:
1. CI tests pass.
2. Staging migration succeeds and rollback is tested.
3. Owner validates a real Invoice and real measurement workflow.
4. Production deployment is recorded.
5. `portal.braunblinds.com` is tested on phone, tablet and desktop.