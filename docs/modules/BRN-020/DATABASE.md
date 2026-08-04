# BRN-020 Data Model

## MeasurementProject
- id
- customer_id
- project_address_snapshot_id
- assigned_sales_user_id
- status: draft, measuring, review_required, approved, quoted, converted, archived
- measurement_unit_default: inch, cm
- version
- created_by, created_at, updated_at

## MeasurementRoom
- id
- measurement_project_id
- name
- floor
- sequence
- notes

## MeasurementOpening
- id
- measurement_room_id
- opening_name
- quantity
- mount_type: inside, outside, ceiling, wall, other
- width_original, height_original, depth_original
- original_unit
- width_normalized_in, height_normalized_in, depth_normalized_in
- width_left, width_center, width_right
- height_left, height_center, height_right
- sill_type
- obstruction_notes
- site_condition_notes
- review_status
- version

## MeasurementSpecification
- id
- measurement_opening_id
- product_type
- product_series
- style
- fabric_or_material_id
- color
- pattern
- control_type
- lift_type
- lining
- valance
- trim
- motor_and_power
- special_instructions
- pricing_source: braun, jin, manual, imported
- pricing_rule_version

## MeasurementMedia
- id
- project_id
- room_id nullable
- opening_id nullable
- file_id
- media_type
- caption
- annotation_json
- captured_at
- uploaded_by

## MeasurementRevision
- id
- project_id
- entity_type
- entity_id
- version_before
- version_after
- change_summary
- changed_by
- changed_at

## OfflineDraft
- id
- user_id
- device_id
- project_id
- local_revision
- server_revision
- payload_encrypted
- sync_status
- last_sync_at
- conflict_details

## Quote linkage
A Quote stores the approved measurement project version and pricing rule version. Later measurement edits do not silently change an already-sent Quote.

## Constraints
- Required dimensions must be positive when supplied.
- No silent zero substitution.
- Normalized values are derived and must not replace original values.
- Optimistic locking is required for concurrent edits.
- Media access follows project permissions.
- All approval, pricing and version changes are audited.