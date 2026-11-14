# AI Phase 1 — D1 migration proposal (NOT EXECUTED)

Status: design only. No production D1 changes are authorized. Do not place this file under drizzle/ or apply automatically.

## Required environment checks
1. Confirm distinct Cloudflare D1 database IDs for local/staging and production; the binding name `DB` alone does not prove separation.
2. Capture current production schema and a verified backup under approved operational controls.
3. Compare existing `db/schema.ts`, migration journal, and live schema before generating migrations.
4. Verify owner/admin auth on every AI endpoint; customer and supplier roles cannot read another account's inquiries.
5. Prove rollback in staging before requesting approval for production changes.

## Proposed logical tables
- `ai_inquiries`: id, customer_id nullable, source_type, source_external_id nullable, source_hash, original_text_ref, parsed_json, review_status, created_at, reviewed_by. Unique (source_type, source_external_id) when available. Avoid duplicating sensitive email bodies in audit logs.
- `ai_tasks`: id, inquiry_id nullable, order_id nullable, assignee_user_id, task_type, state, due_at, created_at, updated_at.
- `ai_approvals`: id, entity_type, entity_id, action, requested_by, decided_by nullable, decision, policy_version, evidence_hash, created_at, decided_at.
- `ai_workflow_events`: id, entity_type, entity_id, event_type, actor_user_id, payload_redacted_json, created_at. Append-only.
- `ai_message_links`: id, inquiry_id, provider, external_message_id, direction, draft_status, created_at. Unique (provider, external_message_id).
- `ai_execution_logs`: id, action, idempotency_key, actor_user_id, outcome, correlation_id, created_at. Unique (action, idempotency_key).

## Invariants
- AI extraction creates only drafts. It cannot call the existing quote issuance endpoint or supplier order endpoint.
- Issuing a quote, sending a customer email, refunding, or releasing a supplier order requires explicit human approval and server-side role validation.
- Supplier release requires 100% cleared funds allocated to the same order and currency, plus finance approval. Deposit-only gates are insufficient.
- Historical order association is never inferred from customer name/email alone; use owner-reviewed mappings.
- Quote versions, price snapshots, currencies and source evidence must remain immutable after approval.
- No migrations or external messages until staging tests and owner sign-off.

## Suggested rollout
1. Validate schema and D1 separation (read-only).
2. Create isolated staging migration with reversible additive tables and indexes.
3. Run access-control, idempotency, and concurrency tests in staging.
4. Review a redacted sample with owner.
5. Request separate explicit authorization for any production migration or deployment.
