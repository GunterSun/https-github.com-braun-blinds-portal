# Sprint 9.2 — Customer Quote review and immutable signature

Owner issues each customer Quote version from an authoritative workflow handoff. The issued snapshot reuses exact Property, Room, Window, Measurement Version, Design Version, Fabric Version and Hardware SKU identities. Only explicitly customer-visible amounts, terms, options and HTTPS rendering URLs are added.

Customer retrieval begins from active `customer_property_access` grants. The response is allowlisted and never queries wholesale cost, supplier cost, margin, factory payments, protected formulas or internal notes.

Customers may select valid issued options before signature. The document hash is recalculated after selection. Signature requires printed name, typed legal signature, timezone and disclosure acceptance; evidence includes exact Quote hash, UTC time, hashed IP and hashed user agent. Signing is idempotent and locks the version. Later changes require a new Quote version.

Measurements are stored as integer sixteenths and displayed without `0/16`. Rendering comparison is shown only when approved HTTPS rendering assets are attached. Workflow Quote and Customer Approval artifacts retain the external Quote/signature identity.
