# Sprint 9.1 — Customer authentication and property-safe dashboard

## Security boundary

Customer access is granted to an `app_user` through `customer_property_access`. The customer master remains singular; co-owners and household contacts receive separate user identities without duplicating the Customer record. Every customer dashboard query starts from active property grants, not a client-supplied Customer or Property ID.

The dashboard deliberately selects only customer-safe fields. It does not query supplier cost, internal cost, margin, factory payments, internal approvals, room-sketch internal notes, measurement notes, or unrestricted documents.

## Invitation and revocation

- Owner creates a seven-day, single-use invitation for one linked Property.
- Only the SHA-256 token hash is stored. The raw invitation token is returned once for secure delivery.
- Acceptance requires a 10+ character password and creates a PBKDF2-protected customer user.
- Email, username, or exact phone can be used to sign in.
- Revoking a property grant immediately revokes all active sessions for that user and writes an audit event.
- Invitation, acceptance, login, language/profile changes, dashboard views, grants, and revocations are auditable.

## Acceptance checks

1. Link two Properties to different Customer records.
2. Invite two separate customer users and accept each invite.
3. Confirm each customer sees only their granted Property hierarchy.
4. Attempt direct API access and language switching; the response remains grant-scoped.
5. Revoke one grant and confirm the active session can no longer access the dashboard.
