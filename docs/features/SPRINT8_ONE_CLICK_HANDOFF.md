# BRN-146 — One-click authoritative handoff

## Contract

`Window` is the permanent identity. A handoff revision stores one immutable SHA-256 snapshot containing Property/Customer, Room, Window, approved Measurement Version, selected Design Version, exact Fabric Version IDs, exact Hardware SKUs and the latest QA Run.

The downstream chain is fixed: AI Visualizer → Quote → Customer Approval → Order → Production Drawing. Each prepared artifact stores the same source hash and snapshot. The user never retypes dimensions or material identity.

## Safety and acceptance

- Owner and the Sales user who created the Property can prepare a handoff.
- Approved measurement, selected/approved design, a QA run and zero open QA errors are mandatory.
- POST requires an `Idempotency-Key`; replay returns the existing handoff.
- A changed source never overwrites history. The UI previews affected Quote, BOM/MRP, drawing and installation output, then creates a new revision.
- Every handoff creation writes an audit event.
- Acceptance: select a real Window such as LR-1, verify exact source identities, prepare once, and confirm the five artifact rows share one source hash.

This increment establishes the authoritative traceability boundary. Domain modules may later replace a prepared artifact with an external record ID while retaining the signed source snapshot.
