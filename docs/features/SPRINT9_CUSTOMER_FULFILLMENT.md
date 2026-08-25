# Sprint 9.4 — Customer fulfillment and pickup

Fulfillment records are scoped to an authorized Property and expose only confirmed carrier/tracking, customer-visible instructions, package codes and Window codes. Internal freight cost, carrier accounts, supplier data and warehouse notes are not selected.

Shipment/delivered statuses require confirmed carrier and tracking identity. Customer pickup uses a random code stored only as SHA-256. Selected packages are released once; already released packages cannot be signed again. Partial pickup leaves the remaining packages visible and available. Each handoff stores immutable package IDs, customer signature, released-by identity, UTC time and evidence hash, with an audit event.
