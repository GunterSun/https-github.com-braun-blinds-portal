# BRN-004 Quote / Invoice / Payment Center — 数据库设计

## 1. quotes

- `id`
- `quote_number`：唯一业务编号
- `order_id`（可空，接受后关联）
- `customer_id`
- `status`
- `currency`
- `current_version_id`
- `accepted_at`
- `expires_at`
- `created_by`
- `created_at` / `updated_at`

## 2. quote_versions

保存不可变版本：

- `quote_id`
- `version_number`
- `subtotal`
- `discount_type` / `discount_value` / `discount_amount`
- `tax_rate` / `tax_amount`
- `installation_fee`
- `shipping_charge`
- `other_charge`
- `grand_total`
- `customer_message`
- `internal_notes`
- `pdf_file_id`
- `sent_at`
- `created_by`

## 3. quote_items

- `quote_version_id`
- `order_item_id`（可空）
- `source_calculator`：Braun / Jin / manual / import
- `description`
- `product_type`
- `width` / `height`
- `quantity`
- `unit_price`
- `line_discount`
- `line_total`
- `sort_order`
- `customer_visible_notes`
- `internal_notes`

## 4. invoices

- `id`
- `invoice_number`：唯一五位数
- `order_id`
- `customer_id`
- `status`
- `currency`
- `current_version_id`
- `issued_at`
- `due_date`
- `paid_at`
- `voided_at`
- `created_by`
- `created_at` / `updated_at`

## 5. invoice_versions

- `invoice_id`
- `version_number`
- `source_quote_version_id`（可空）
- `subtotal`
- `discount_amount`
- `tax_amount`
- `installation_fee`
- `shipping_charge`
- `other_charge`
- `total`
- `pdf_file_id`
- `billing_name` / `billing_address_snapshot`
- `project_address_snapshot`
- `company_profile_snapshot`
- `payment_terms_snapshot`
- `created_by`

已签发版本保持不可变。地址使用快照，客户资料后续修改不得改变历史 Invoice。

## 6. invoice_items

字段与 Quote 明细相近，但必须保存签发时的描述、数量、单价和金额快照。

## 7. payments

- `id`
- `order_id`
- `invoice_id`（可空，允许未分配收款）
- `amount`
- `currency`
- `method`
- `status`：pending / succeeded / failed / voided / refunded / partially_refunded
- `reference_number`
- `received_at`
- `stripe_payment_intent_id`
- `external_event_id`
- `idempotency_key`
- `notes`
- `created_by`
- `created_at`

## 8. payment_allocations

一笔付款可分配到多个 Invoice：

- `payment_id`
- `invoice_id`
- `amount`
- `currency`

同一分配币种必须与付款及 Invoice 一致。

## 9. refunds

- `payment_id`
- `amount`
- `currency`
- `status`
- `reason`
- `stripe_refund_id`
- `approved_by`
- `processed_at`

退款不覆盖原付款。

## 10. document_deliveries

保存 Quote、Invoice、Receipt 的发送记录：

- `document_type`
- `document_id`
- `version_id`
- `channel`
- `recipient`
- `subject`
- `status`
- `provider_message_id`
- `sent_at`
- `error_message`

## 11. 计算与约束

- `invoice.amount_paid` 由成功付款分配减有效退款计算。
- `balance_due = total - amount_paid`。
- 金额字段使用 decimal/定点整数，不使用 binary float。
- `invoice_number` 唯一；生成过程使用数据库序列或锁。
- Stripe `external_event_id` 唯一，避免 webhook 重复处理。
- 写操作保存审计日志。
- 正式财务记录默认软作废，不硬删除。