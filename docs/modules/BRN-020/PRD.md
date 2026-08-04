# BRN-020 Mobile Measurement & On-site Quote

## Goal
Provide a mobile-first workflow for in-home measurement, product selection, photos, calculation and Quote creation without returning to the office.

## Core workflow
1. Select or create customer and project address.
2. Create rooms and window openings.
3. Record mount type, measurements, depth and site conditions.
4. Select product, fabric/material, style, control and options.
5. Attach photos, sketches and notes.
6. Run Braun or Jin pricing rules.
7. Review warnings and create a versioned Quote.
8. Obtain customer acknowledgement or save as draft.

## Measurement fields
- Room and opening name
- Quantity
- Inside mount / outside mount
- Width, height and depth
- Left, center and right measurements where required
- Ceiling, wall and trim conditions
- Obstructions, handles, alarms and access limits
- Product, style, lift/control, lining, valance, trim and special instructions

## Business rules
- Measurements must retain their original unit and normalized value.
- Empty measurements remain empty and are never silently converted to zero.
- A Quote cannot be marked ready when required measurements are missing.
- Measurement revisions create versions and do not overwrite accepted records.
- Photos and notes belong to the specific room/opening and project.
- Braun and Jin calculations must identify the pricing source and rule version.
- Wholesale cost, factory cost and profit are hidden from customers.
- USD and RMB remain separate.

## Mobile requirements
- Fast one-hand data entry
- Large controls and numeric keypad
- Camera upload and optional photo annotation
- Offline draft support with conflict-safe synchronization
- Autosave with visible sync state
- English/Chinese switching

## Roles
- Owner: full access
- Sales: assigned customers/projects and Quote creation
- Installer: read-only approved measurement details when assigned
- Factory: only production-relevant approved specifications
- Customer: only customer-facing Quote and approved shared details

## Out of scope for first release
- Automatic measurement from a photo
- Fully autonomous pricing approval
- Automatic customer charge without confirmation

## Definition of done
The feature is complete only after mobile, tablet and desktop tests; permission tests; pricing comparison against approved spreadsheets; offline recovery tests; and production deployment verification.