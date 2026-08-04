# Invoice Customer Signature — Implementation Plan

## Goal
Implement a customer-signature workflow for versioned invoices in Braun Smart Portal V1.

## Database migration
Create `invoice_signature_requests`:
- `id`
- `invoice_id`
- `invoice_version_id`
- `token_hash`
- `status`: pending, viewed, signed, declined, expired, revoked
- `expires_at`
- `created_by`
- timestamps

Create `invoice_signatures`:
- `id`
- `signature_request_id`
- `invoice_id`
- `invoice_version_id`
- `signer_name`
- `signer_email`
- `signature_file_id`
- `signed_at_utc`
- `timezone`
- `document_sha256`
- `verification_code`
- `consent_text_version`
- `ip_address_hash`
- `user_agent_summary`
- timestamps

Create `invoice_signature_events` for viewed, signed, declined, expired, revoked and downloaded events.

## Required workflow
1. Freeze an invoice version before sending for signature.
2. Generate a single-use, expiring signature link.
3. Customer reviews the exact invoice PDF and terms.
4. Customer enters printed name, confirms consent and draws/signs.
5. Server verifies the request token, invoice version and document SHA-256.
6. Store the immutable signature record and generate a signed PDF.
7. Mark that version signed without changing payment status.
8. Any later material invoice change creates a new version and requires a new signature.

## API
- `POST /api/v4/invoices/{id}/signature-requests`
- `GET /api/v4/signature-requests/{token}`
- `POST /api/v4/signature-requests/{token}/sign`
- `POST /api/v4/signature-requests/{token}/decline`
- `POST /api/v4/invoices/{id}/signature-requests/{requestId}/revoke`
- `GET /api/v4/invoices/{id}/signature-status`
- `GET /api/v4/invoices/{id}/signed-pdf`

All write endpoints require idempotency protection. Tokens must never be stored in plaintext.

## UI
- Invoice page: Request signature, Copy link, Resend, Revoke and View audit.
- Customer page: responsive invoice preview, printed-name field, consent checkbox and signature canvas.
- Signed invoice: visible signature, signer name, signed date/time and verification code.

## Security and audit
- Employees, AI and Workflow cannot sign for the customer.
- Do not accept a signature against a different invoice version or hash.
- Expired, revoked or previously used tokens must fail safely.
- Do not store raw IP addresses unless legally required; use minimized or hashed audit data.
- Signature images are private files and follow invoice access permissions.

## Acceptance gate
- Mobile, tablet and desktop signing passes.
- Duplicate submit creates one signature only.
- Signed version cannot be silently changed.
- Signed PDF hash and verification code can be validated.
- Audit history shows every signature-related event.