# BRN-010 数据库设计

## 1. 主要实体

### suppliers
- id
- type: factory / material / logistics / service
- legal_name
- display_name
- default_currency: USD / RMB
- payment_terms
- lead_time_days
- status
- internal_notes
- created_at / updated_at

### supplier_contacts
- id
- supplier_id
- name
- role
- phone
- email
- wechat
- preferred_language

### factory_jobs
- id
- order_id
- supplier_id
- job_number
- status
- promised_date
- actual_completion_date
- currency
- quoted_amount
- approved_amount
- actual_amount
- assigned_by
- created_at / updated_at

### factory_job_items
- id
- factory_job_id
- order_item_id
- product_description
- quantity
- dimensions
- material_spec
- production_notes

### purchase_orders
- id
- po_number
- supplier_id
- order_id nullable
- status
- currency
- subtotal
- shipping_amount
- tax_amount
- total_amount
- approved_by
- sent_at

### purchase_order_items
- id
- purchase_order_id
- description
- quantity
- unit
- unit_price
- line_total
- related_factory_job_id nullable

### supplier_payments
- id
- supplier_id
- purchase_order_id nullable
- factory_job_id nullable
- amount
- currency
- method
- reference_number
- paid_at
- status
- source_import_row_id nullable

### factory_events
- id
- factory_job_id
- event_type
- previous_status
- new_status
- note
- actor_id
- created_at

### quality_issues
- id
- factory_job_id
- severity
- category
- description
- resolution
- status
- photos
- opened_at / closed_at

## 2. 约束

- 所有金额字段必须同时有 currency。
- supplier_payments 的来源参考号与金额组合需要重复检查。
- 同一 order_item 可分配多个 factory_job，但分配数量总和不得无提示超过订单数量。
- 正式付款和已审批采购单不允许硬删除，只能撤销或调整。
- 客户、工厂、供应商和内部财务数据必须通过服务端权限过滤。

## 3. 索引

- factory_jobs(order_id, supplier_id, status)
- purchase_orders(supplier_id, status, po_number)
- supplier_payments(supplier_id, paid_at, currency)
- factory_events(factory_job_id, created_at)
- quality_issues(factory_job_id, status)