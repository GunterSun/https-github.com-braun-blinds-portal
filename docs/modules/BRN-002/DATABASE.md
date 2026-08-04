# BRN-002 统一订单中心数据库设计

## 1. 主实体

### orders

- `id`：内部主键
- `order_number`：唯一五位数业务订单号
- `external_prefix`：例如 CWF
- `customer_id`
- `project_name`
- `project_address_id`
- `sales_user_id`
- `status`
- `payment_status`
- `currency`：订单销售主币种，默认 USD
- `subtotal`
- `discount_amount`
- `tax_amount`
- `installation_fee`
- `shipping_charge`
- `grand_total`
- `amount_paid`
- `balance_due`
- `confirmed_at`
- `completed_at`
- `archived_at`
- `created_at`
- `updated_at`

约束：`order_number` 唯一；金额不得通过前端传入的汇总值直接信任，应由子记录或服务端计算。

## 2. 子实体

### order_items

一个订单可有多个产品明细：

- `order_id`
- `source_calculator`：Braun / Jin / manual / import
- `product_type`
- `style`
- `fabric_code`
- `width`
- `height`
- `quantity`
- `mount_type`
- `control_type`
- `lining`
- `unit_price`
- `line_total`
- `cost_estimate_usd`
- `notes`
- `sort_order`

### quotes / quote_versions

Quote 必须支持版本化，已发送版本不可被静默覆盖。

### invoices

- `order_id`
- `invoice_number`：五位数、唯一
- `status`
- `total`
- `amount_paid`
- `balance_due`
- `due_date`
- `pdf_version`
- `issued_at`
- `paid_at`

### payments

- `order_id`
- `invoice_id`
- `amount`
- `currency`
- `payment_method`
- `reference_number`
- `stripe_payment_intent_id`
- `received_at`
- `status`
- `notes`

一个 Invoice 可对应多笔付款。退款应作为独立负向或 refund 记录保存，禁止覆盖原付款。

### factories / order_factory_jobs

一个订单可分配多个工厂。工厂任务保存生产资料、状态、交期和可见范围。

### order_expenses

- `order_id`
- `factory_job_id`（可空）
- `expense_type`：material / processing / freight / installation / other
- `vendor_id`
- `amount`
- `currency`：USD 或 RMB
- `exchange_rate`（可空）
- `exchange_rate_date`（可空）
- `paid_status`
- `paid_at`
- `tracking_number`（适用时）
- `source_import_row_id`（可空）
- `notes`

原币金额不可被换算值覆盖。

### shipments / shipment_packages

Shipment 对应承运商和 Tracking；Package 保存每箱长宽高、重量、超长标识与报价结果。

### installations

保存排期、安装工、状态、现场照片、客户签字和完工时间。

### order_files

保存文件元数据和存储引用；不得把大型二进制直接塞入业务表。

### order_assignments

支持 Sales、Factory、Installer 的订单分配和访问等级。

### audit_logs

所有金额、状态、付款、分配和删除操作必须记录。

## 3. 导入追踪

正式记录从 Excel 生成时保存：

- `import_batch_id`
- `import_row_id`
- `source_file_name`
- `source_sheet`
- `source_row`

同一 `import_row_id + target_entity_type` 应有唯一约束，防止重复生成。

## 4. 金额计算

- `invoice.amount_paid` = 有效付款之和减退款。
- `invoice.balance_due` = invoice total - amount paid。
- `order.amount_paid` = 订单下有效付款汇总。
- USD 成本与 RMB 成本分别统计。
- 只有存在明确汇率时，才计算统一展示利润。
- 汇率计算结果须保存使用的汇率和日期，以便复算。

## 5. 删除与归档

- 订单、Invoice、付款和支出默认不可硬删除。
- 错误记录使用 void、cancelled、reversed 或 archived 状态。
- 已关联财务记录时，任何删除都必须有 Owner 权限和审计日志。
