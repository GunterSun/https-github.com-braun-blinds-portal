# BRN-020 API Contract

Base path: `/api/v4/measurement-projects`

## Projects
- `POST /measurement-projects`
- `GET /measurement-projects/{id}`
- `PATCH /measurement-projects/{id}`
- `POST /measurement-projects/{id}/submit-review`
- `POST /measurement-projects/{id}/approve`

## Rooms and openings
- `POST /measurement-projects/{id}/rooms`
- `PATCH /measurement-rooms/{roomId}`
- `POST /measurement-rooms/{roomId}/openings`
- `PATCH /measurement-openings/{openingId}`
- `POST /measurement-openings/{openingId}/specification`

## Media
- `POST /measurement-projects/{id}/media/presign`
- `POST /measurement-projects/{id}/media/complete`
- `DELETE /measurement-media/{mediaId}`

## Pricing and Quote
- `POST /measurement-projects/{id}/price-preview`
- `POST /measurement-projects/{id}/create-quote`

Price preview response must include:
- pricing source
- rule version
- line inputs
- warnings
- USD totals
- RMB totals separately when applicable
- missing or uncertain fields

## Offline synchronization
- `POST /measurement-projects/{id}/sync`
- `GET /measurement-projects/{id}/sync-status`

Sync requests include device ID, local revision, last known server revision and idempotency key. Conflicts return `409` with field-level differences; the server must not silently overwrite newer work.

## Safety and permissions
- Every endpoint enforces permissions server-side.
- Customer-facing responses exclude cost, profit and internal notes.
- Factory responses exclude customer price and unrelated rooms.
- Create Quote requires an approved or explicitly overridden measurement version.
- Override requires reason and audit record.
- All mutation endpoints accept an idempotency key.
- Media uploads require type, size and malware validation.

## Error states
- `400` invalid measurement or unit
- `403` permission denied
- `409` version or sync conflict
- `422` missing required specification
- `503` pricing source unavailable

A pricing outage must return an unavailable state and must not fabricate a price.