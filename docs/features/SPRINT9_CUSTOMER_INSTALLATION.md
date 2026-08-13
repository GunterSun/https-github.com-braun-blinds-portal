# Sprint 9.5 Customer Installation

Customer-visible installation data is a safe projection of the authoritative installation job. A reschedule/contact request never changes `scheduled_start` or `scheduled_end`; staff must accept it through the scheduling workflow. Team display is explicitly enabled, and internal installer notes, payroll, costs, unrelated jobs and employee contact data are excluded.

Staff may publish one completion record per installation containing exact Room/Window codes, selected customer-safe photo URLs and open exceptions. The customer signature is a separate immutable record with a SHA-256 evidence digest. A later problem creates an `installation_service_requests` event tied to the original installation and exact Room/Window; it never rewrites completion history.

Acceptance: multi-Window appointments expose confirmed time/address/preparation, accept non-authoritative reschedule requests, publish immutable completion evidence, accept one customer signature, and create later service events independently.
