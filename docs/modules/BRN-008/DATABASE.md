# BRN-008 Finance Center — 数据库设计

## 1. 核心实体

### financial_accounts

用于标记现金、银行、Stripe、Zelle 或其他收付款渠道的逻辑账户。不得保存完整银行卡号或敏感凭证。

### payments

- `id`
- `order_id`
- `invoice_id`
- `customer_id`
- `amount`
- `currency`
- `method`
- `reference_number`
- `provider_event_id`
- `status`
- `received_at`
- `voided_at`
- `created_by`
- `source_import_row_id`

约束：Stripe/provider 事件 ID 唯一；金额必须大于零；币种必须显式提供。

### refunds

退款作为独立记录关联原付款，保存金额、币种、原因、状态、处理人和 provider reference。禁止覆盖原付款。

### expenses

- `id`
- `order_id`（可空）
- `factory_job_id`（可空）
- `vendor_id`（可空）
- `expense_type`
- `amount`
- `currency`
- `paid_status`
- `paid_at`
- `payment_method`
- `reference_number`
- `source_import_row_id`
- `notes`
- `voided_at`

### exchange_rates

- `base_currency`
- `quote_currency`
- `rate`
- `rate_date`
- `source`
- `status`
- `created_by`

同一日期和币种对允许版本化；正式报表引用具体汇率记录 ID。

### reconciliations

保存账目记录与 Invoice、付款、退款或支出的匹配关系、匹配置信度、状态、审核人和时间。

### financial_periods

用于月度锁账。锁账后普通用户不能修改该期间记录；更正必须使用调整记录。

### financial_adjustments

保存受控调整、原因、原值、新值、审批人和关联实体。

## 2. 计算规则

- Invoice 已收 = 有效付款总额 - 有效退款总额。
- Invoice 余额 = Invoice 总额 - 已收。
- 订单 USD 成本 = 有效 USD 支出总额。
- 订单 RMB 成本 = 有效 RMB 支出总额。
- 未指定汇率时，禁止把 RMB 成本从 USD 收入中直接相减。
- 折算利润必须保存汇率 ID、汇率日期和计算时间。

## 3. 数据完整性

- 所有金额使用定点小数，不使用浮点数。
- `currency` 不能为空。
- void 记录不参与有效汇总，但保留审计。
- 同一 `source_import_row_id + target_type` 唯一，防止重复导入。
- 所有财务写入使用事务和幂等键。

## 4. 审计

金额、币种、付款状态、支出状态、汇率、退款、void、对账和锁账操作必须记录：操作人、时间、前值、后值、原因、来源和请求 ID。