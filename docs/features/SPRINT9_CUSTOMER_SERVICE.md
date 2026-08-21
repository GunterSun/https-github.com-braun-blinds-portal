# Sprint 9.6 Customer Warranty and Service

Every service case is permanently keyed to one authorized Property, Room and Window. Customer creation validates the hierarchy server-side and preserves the Window timeline. Statuses are explicit: submitted, under review, appointment needed, parts ordered, scheduled, resolved, closed, and not-covered/needs-approval.

Messages have an explicit `internal_only` boundary; customer reads exclude internal messages at the database predicate. Private R2 attachments support JPEG, PNG, WebP, MP4 and PDF up to 25 MB, with authorization repeated on each download. Warranty terms and customer documents are published records, never AI-generated coverage decisions. AI may locate these approved records but must not approve claims or invent coverage.
