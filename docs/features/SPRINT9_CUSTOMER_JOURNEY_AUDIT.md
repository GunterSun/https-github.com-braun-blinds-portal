# Sprint 9 Customer Journey Truth Audit

The Owner-only audit evaluates one Property against authoritative source records for active customer access, Property/Room/Window hierarchy, a signed Quote version containing locked rendering evidence, issued Invoice and posted ledger transactions, confirmed fulfillment handoff, a Property-address-matched immutable installation completion signature, published Window warranties, and a Window-linked service case with an active staff response.

Missing data remains a failed check. The audit never manufactures `paid`, `delivered`, `completed`, warranty, or service evidence and never exposes internal costs, factory notes, internal-only messages, passwords, signature text, or raw payment metadata.

Every failed check links the Owner to the corresponding evidence workspace. Those links assist remediation but never change the audit result by themselves.

When all eight checks pass, the Owner may certify an immutable acceptance snapshot. The snapshot stores the exact evidence JSON and SHA-256 in D1, is idempotent for identical evidence, and is never available while any check remains false.
