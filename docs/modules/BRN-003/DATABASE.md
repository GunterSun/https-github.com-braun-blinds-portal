# BRN-003 Customer 360 / CRM — 数据库设计

## 1. customers

- `id`
- `customer_number`：稳定内部编号
- `customer_type`
- `display_name`
- `legal_name`
- `status`
- `source`
- `sales_owner_user_id`
- `default_discount_type` / `default_discount_value`
- `payment_terms`
- `tax_exempt_status`
- `tax_document_id`
- `preferred_language`
- `first_order_at` / `last_order_at`
- `archived_at`
- `created_at` / `updated_at`

客户累计销售、已付款和欠款应由订单、Invoice 与付款实时或物化汇总，禁止把前端汇总值作为权威数据。

## 2. customer_contacts

- `customer_id`
- `name`
- `title`
- `phone_raw` / `phone_normalized`
- `email_raw` / `email_normalized`
- `preferred_channel`
- `is_primary`
- `customer_visible`
- `created_at` / `updated_at`

同一客户可有多个联系人。跨客户出现相同电话或邮箱时生成重复候选，不自动合并。

## 3. customer_addresses

- `customer_id`
- `address_type`：billing / shipping / project / other
- `label`
- `line1` / `line2`
- `city` / `state` / `postal_code` / `country`
- `normalized_address_hash`
- `access_notes`
- `is_default`

订单确认时保存地址快照，避免客户主档后续修改影响历史 Invoice、物流或安装记录。

## 4. end_customers

用于批发客户的终端客户：

- `parent_customer_id`
- `name`
- `phone` / `email`
- `address_id`
- `notes`
- `visibility_policy`

终端客户对象不得获得批发成本、内部价格或利润字段。

## 5. customer_interactions

- `customer_id`
- `order_id`（可空）
- `contact_id`（可空）
- `channel`
- `direction`
- `subject`
- `summary`
- `occurred_at`
- `created_by_user_id`
- `external_message_id`（可空）
- `status`：draft / sent / received / logged

## 6. customer_files

保存文件元数据、存储引用、类型、可见范围、关联订单和版本。大型二进制不得直接写入业务表。

## 7. customer_tags 与 customer_tag_links

标签用于批发、设计师、重点客户、欠款风险、产品偏好等。标签变更写入审计。

## 8. duplicate_candidates

- `customer_id_a` / `customer_id_b`
- `reason`
- `score`
- `evidence_json`
- `status`：open / ignored / merged
- `reviewed_by` / `reviewed_at`

## 9. customer_merge_events

记录主客户、被合并客户、字段选择、关联记录迁移、操作人和回滚所需映射。合并必须使用事务；失败不得产生半合并状态。

## 10. 约束与索引

- `customer_number` 唯一。
- 标准化电话、邮箱、名称和地址建立搜索索引，但不能仅凭单一字段自动合并。
- 订单、Quote、Invoice、付款、安装、物流和文件均通过 `customer_id` 或订单关系关联。
- 有财务或订单关系的客户仅允许归档。
- 所有敏感修改写入 `audit_logs`。