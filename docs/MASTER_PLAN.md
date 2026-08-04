# Braun Smart Portal — Master Plan

Last updated: 2026-08-03

## Project goal

Build one unified Braun Smart Portal for daily operations. The system must replace fragmented portals and reduce dependence on multiple Excel files while preserving real business rules.

## Single source of truth

- Primary repository: `GunterSun/https-github.com-braun-blinds-portal`
- Unified application entry: `/hub`
- Target production domain: `portal.braunblinds.com`
- Customer, order, invoice, payment, factory, shipping, installation and finance data must each have one canonical record.
- Old portals may temporarily redirect to the unified portal but must not continue as separate products.

## Permanent development workflow

1. The business requirement is clarified.
2. The requirement is written to GitHub before coding.
3. A unique BRN feature number is assigned.
4. Codex implements the documented requirement.
5. Code is reviewed for business accuracy, security and data consistency.
6. Acceptance tests are completed.
7. Only tested code is merged and deployed.
8. Changelog and project status are updated.

No feature should exist only in chat history.

## Feature numbering

- BRN-001 Unified portal and `/hub`
- BRN-002 Unified order workspace
- BRN-003 Customer 360 / CRM
- BRN-004 Quote, Invoice and payment system
- BRN-005 Excel import, review and rollback
- BRN-006 Logistics and shipping cost analysis
- BRN-007 Installation operations
- BRN-008 Finance, cost and profit
- BRN-009 Braun AI assistant and global search
- BRN-010 Factory, purchasing and supplier management
- BRN-011 Inventory and warehouse
- BRN-012 Product and document center
- BRN-013 User, role and permission management
- BRN-014 Owner dashboard and management reporting
- BRN-015 Braun AI agents and controlled automation
- BRN-016 Auditable business workflow engine
- BRN-017 Developer platform, APIs and webhooks
- BRN-018 Computer Use Agent and controlled browser operations

## Current status

### Completed or substantially implemented in code

- Unified role model: Owner, Sales, Factory, Installer and Customer
- Unified login and session foundation
- Stripe payment status foundation
- Five-digit invoice handling
- `/hub` unified navigation foundation
- Excel workbook detection and import preview
- USD and RMB separation rules
- SHA-256 duplicate file protection
- Import batch staging and safe rollback APIs
- Project vision, product requirements, database, roles, import, logistics, AI and UI documentation

### In progress

- BRN-005 import confirmation UI, history and row-level review
- BRN-001 migration of existing portal functions into one portal
- BRN-002 unified order workspace
- Production deployment and domain connection

### Next priorities

1. Finish import row review and approved conversion into business records.
2. Build the unified order workspace around one order number.
3. Add global search across order, customer, invoice, phone, tracking and address.
4. Build Customer 360.
5. Build logistics history and comparable shipment recommendations.
6. Complete deployment automation and connect `portal.braunblinds.com`.

## Non-negotiable business rules

- USD and RMB are separate currencies and must never be silently converted or relabeled.
- Empty amounts remain empty; they must not be replaced by zero without explicit intent.
- A five-digit order or invoice number is normalized consistently.
- One order must not be duplicated across modules.
- Import always follows preview, validation, confirmation and audit logging.
- Uncertain currency or ambiguous rows require owner review.
- Customer users must never see wholesale costs, factory costs or internal profit.
- Deployment status must be reported truthfully; merged code is not the same as a live website.

## Required documents for each feature

Every BRN feature should include:

- Feature specification
- Business rules
- Data model or schema changes
- API contract
- Permission matrix
- UI and user flow
- Acceptance criteria
- Test checklist
- Migration and rollback plan
- Changelog entry

## Definition of done

A feature is complete only when:

- The requirement is documented.
- The implementation matches the business rules.
- Permissions are enforced on the server, not only hidden in the UI.
- Mobile, tablet and desktop behavior is checked.
- USD/RMB and financial calculations are tested when applicable.
- Existing data is protected by migration and rollback steps.
- Acceptance tests pass.
- Deployment is confirmed in the actual target environment.
