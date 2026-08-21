# Sprint 9.3 — Customer billing ledger

Invoices are issued only from signed customer Quote versions. The immutable customer snapshot retains the exact Quote version, Property and amount/currency identity. USD and CNY are never converted or combined.

Payment session creation records a `pending` transaction and never changes the Invoice to paid. Only a verified Stripe webhook can post the exact session amount and currency. Duplicate browser actions and provider events are idempotent. The ledger derives paid amount, partial/full status and balance from posted payment/credit/refund/reversal records.

Owner-recorded credits, adjustments, refunds and reversals require an authoritative external reference and an explicit status. Customers see only allowlisted Invoice totals, transactions and receipt references—not costs, margin, supplier/factory payables or internal notes. Printing the bilingual-safe customer view provides a downloadable browser PDF without creating a second financial data source.
