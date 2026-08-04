# BRN-020 Acceptance Tests

## Customer and project
- Create a new project from an existing customer.
- Create a new customer without producing a duplicate record.
- Confirm the project address is stored as a snapshot.

## Measurements
- Enter inches and centimeters and verify normalized values.
- Confirm blank fields remain blank rather than zero.
- Reject negative or impossible dimensions.
- Test IB/OB and depth requirements by product type.
- Test left/center/right measurements and warnings.
- Verify revisions preserve the earlier version.

## Products and pricing
- Test Roman shade, drapery, roller, zebra, blinds and track/rod use cases.
- Compare Braun calculator results with approved reference cases.
- Compare Jin calculator results with approved reference cases.
- Verify double-layer and multiplier rules where configured.
- Verify manual overrides require reason and permission.
- Confirm USD and RMB never merge silently.

## Quote
- Create a draft Quote from approved measurements.
- Verify the Quote stores measurement and pricing-rule versions.
- Confirm later edits do not change a sent Quote.
- Verify customer-facing output hides wholesale cost and profit.
- Test PDF generation for empty, one-page and multi-page cases.

## Mobile and offline
- Test iPhone, Android phone, iPad and desktop layouts.
- Test camera capture, upload, retry and deletion permissions.
- Create and edit a project offline, reconnect and sync.
- Produce a simultaneous-edit conflict and verify no silent overwrite.
- Verify visible saved, syncing, conflict and failed states.

## Permissions
- Owner full access.
- Sales limited to assigned data.
- Installer read-only access to assigned approved details.
- Factory only receives approved production specifications.
- Customer cannot access internal notes, costs or unrelated projects.
- Direct URL and API manipulation must not bypass permissions.

## Audit and reliability
- Verify approvals, overrides, pricing runs and Quote creation are audited.
- Repeat mutation requests and confirm idempotency.
- Simulate pricing service outage and confirm no fabricated result.
- Simulate upload failure and verify recoverable drafts.

## Release gate
No production release until real Braun and Jin reference orders pass, mobile/offline tests pass, permissions pass, backups exist and the deployed production URL is verified.