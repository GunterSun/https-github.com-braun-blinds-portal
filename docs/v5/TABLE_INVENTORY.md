# 数据表清单（源码与空库迁移重放）

不包含客户数据；不是生产数据库逐表验证。源：PR #301，提交 4e2b649。

| 表 | Schema 位置 | 关联候选列（列名不能证明外键或业务联通） | 数据库外键数 |
|---|---|---|---|
| app_sessions | db/schema.ts:21 | user_id | 0 |
| app_users | db/schema.ts:4 | customer_id | 0 |
| audit_logs | db/schema.ts:276 | user_id, entity_id | 0 |
| blind_specifications | db/schema.ts:122 | product_id | 0 |
| business_ledger_entries | db/import-schema.ts:45 | import_batch_id, import_row_id, order_id, order_number, created_by_user_id | 0 |
| catalog_products | db/schema.ts:88 | category_id | 0 |
| customer_addresses | db/schema.ts:198 | customer_id | 0 |
| customer_billing_invoices | db/schema.ts:62 | invoice_number, quote_version_id, customer_id, property_id | 0 |
| customer_billing_transactions | db/schema.ts:68 | invoice_id, provider_session_id, provider_transaction_id, provider_event_id, receipt_number | 0 |
| customer_contacts | db/schema.ts:182 | customer_id | 0 |
| customer_fulfillment_packages | db/schema.ts:73 | fulfillment_id | 0 |
| customer_fulfillments | db/schema.ts:72 | property_id, customer_id, tracking_number | 0 |
| customer_installation_details | db/installation-schema.ts:21 | installation_job_id | 0 |
| customer_invitations | db/schema.ts:43 | customer_id, property_id, accepted_by_user_id | 0 |
| customer_journey_acceptances | db/schema.ts:76 | property_id | 0 |
| customer_orders | db/schema.ts:244 | order_number, invoice_number, stripe_session_id, stripe_payment_intent_id | 0 |
| customer_pickup_signatures | db/schema.ts:74 | fulfillment_id, user_id | 0 |
| customer_property_access | db/schema.ts:30 | user_id, customer_id, property_id | 0 |
| customer_quote_shipping | db/schema.ts:467 | quote_version_id | 0 |
| customer_quote_signatures | db/schema.ts:58 | quote_version_id, user_id | 0 |
| customer_quote_versions | db/schema.ts:50 | quote_number, customer_id, property_id, handoff_id | 0 |
| customer_sequences | db/schema.ts:176 | last_number | 0 |
| customer_service_cases | db/service-schema.ts:3 | property_id, room_id, window_id, customer_user_id | 0 |
| customer_service_media | db/service-schema.ts:5 | case_id | 0 |
| customer_service_messages | db/service-schema.ts:4 | case_id, author_user_id | 0 |
| customer_sessions | db/schema.ts:216 | customer_id | 0 |
| customer_visible_documents | db/service-schema.ts:6 | property_id, window_id, order_reference | 0 |
| customers | db/schema.ts:145 | customer_number, sales_owner_user_id, tax_document_id | 0 |
| design_versions | db/schema.ts:461 | window_id, measurement_version_id | 0 |
| fabric_inventory_lots | db/schema.ts:456 | fabric_id, lot_reference, roll_reference | 0 |
| fabric_versions | db/schema.ts:453 | fabric_id, selling_price_reference | 0 |
| fabrics | db/schema.ts:450 | current_version_id | 0 |
| factory_work_order_freight | db/factory-schema.ts:3 | work_order_id, tracking_number | 0 |
| factory_work_orders | db/factory-schema.ts:2 | assignment_id, drawing_id, window_id, measurement_version_id, factory_order_number | 0 |
| hardware_compatibility_rules | db/schema.ts:460 | source_part_id, target_part_id | 0 |
| hardware_parts | db/schema.ts:458 | current_version_id | 0 |
| hardware_versions | db/schema.ts:459 | hardware_part_id | 0 |
| import_batches | db/import-schema.ts:4 | imported_by_user_id | 0 |
| import_rows | db/import-schema.ts:19 | batch_id, order_number, target_entity_id, reviewed_by_user_id | 0 |
| installation_assignments | db/installation-schema.ts:13 | installation_job_id, installer_user_id | 0 |
| installation_completion_records | db/installation-schema.ts:27 | installation_job_id | 0 |
| installation_completion_signatures | db/installation-schema.ts:30 | completion_record_id, user_id | 0 |
| installation_jobs | db/installation-schema.ts:4 | order_id | 0 |
| installation_reschedule_requests | db/installation-schema.ts:24 | installation_job_id, user_id | 0 |
| installation_service_requests | db/installation-schema.ts:33 | installation_job_id, user_id | 0 |
| installation_status_events | db/installation-schema.ts:17 | installation_job_id, actor_user_id | 0 |
| invoice_sequences | db/schema.ts:323 | last_number | 0 |
| invoice_signature_events | db/schema.ts:357 | request_id, actor_id | 0 |
| invoice_signature_requests | db/schema.ts:340 | invoice_version_id, invoice_number | 0 |
| invoice_signatures | db/schema.ts:367 | request_id, invoice_version_id | 0 |
| invoice_versions | db/schema.ts:329 | order_id, invoice_number | 0 |
| manufacturing_drawings | db/manufacturing-schema.ts:3 | window_id, measurement_version_id, superseded_by_id | 0 |
| manufacturing_factory_assignments | db/manufacturing-schema.ts:20 | drawing_id | 0 |
| measure_properties | db/schema.ts:376 | customer_id | 0 |
| measure_qa_findings | db/schema.ts:463 | qa_run_id, window_id, measurement_version_id | 0 |
| measure_qa_runs | db/schema.ts:462 | property_id | 0 |
| measure_rooms | db/schema.ts:386 | property_id | 0 |
| measure_windows | db/schema.ts:394 | property_id, room_id | 0 |
| measurement_media | db/schema.ts:427 | property_id, window_id, measurement_version_id | 0 |
| measurement_values | db/schema.ts:417 | measurement_version_id | 0 |
| measurement_versions | db/schema.ts:403 | window_id | 0 |
| offline_job_packages | db/schema.ts:287 | installation_job_id, assigned_user_id | 0 |
| offline_sync_operations | db/schema.ts:307 | package_id, assigned_user_id, client_operation_id | 0 |
| order_assignments | db/schema.ts:265 | order_id, user_id, assigned_by_user_id | 0 |
| order_items | db/order-schema.ts:36 | order_id, import_batch_id, import_row_id | 0 |
| order_sequences | db/order-schema.ts:4 | last_number | 0 |
| orders | db/order-schema.ts:10 | order_number, customer_id, sales_user_id | 0 |
| product_audit_events | db/schema.ts:136 | product_id, user_id | 0 |
| product_categories | db/schema.ts:78 | parent_id | 0 |
| quotes | db/schema.ts:224 | quote_number | 0 |
| room_sketch_versions | db/schema.ts:432 | room_id | 0 |
| shutter_specifications | db/schema.ts:108 | product_id | 0 |
| unified_order_assignments | db/order-schema.ts:67 | order_id, user_id, assigned_by_user_id | 0 |
| wall_elevation_versions | db/schema.ts:443 | room_id | 0 |
| window_warranties | db/service-schema.ts:2 | window_id | 0 |
| workflow_artifacts | db/schema.ts:465 | handoff_id, external_record_id | 0 |
| workflow_handoffs | db/schema.ts:464 | window_id, measurement_version_id, design_version_id, qa_run_id | 0 |
| z_series_quote_issuance_operations | db/schema.ts:471 | quote_version_id | 0 |
