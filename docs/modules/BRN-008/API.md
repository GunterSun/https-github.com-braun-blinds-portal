# BRN-008 Finance Center — API 规范

## 1. 通用要求

- API 前缀：`/api/v4/finance`。
- 服务端执行权限、币种、金额、幂等和审计校验。
- 金额响应必须同时返回 `amount` 与 `currency`。
- 不得返回银行密钥、Stripe secret 或完整敏感账号。

## 2. 总览与应收

- `GET /api/v4/finance/summary`
- `GET /api/v4/finance/receivables`
- `GET /api/v4/finance/orders/[orderNumber]`

支持日期、客户、销售员、订单状态和付款状态筛选。返回 `dataAsOf`、完整性警告及 USD/RMB 分项。

## 3. 付款与退款

- `POST /api/v4/orders/[orderNumber]/payments`
- `POST /api/v4/payments/[paymentId]/void-preview`
- `POST /api/v4/payments/[paymentId]/void`
- `POST /api/v4/payments/[paymentId]/refund-preview`
- `POST /api/v4/payments/[paymentId]/refund`

手工付款需金额、币种、方式、日期和参考号。退款与 void 必须预览、确认、幂等并记录审计。

## 4. 支出

- `GET /api/v4/finance/expenses`
- `POST /api/v4/orders/[orderNumber]/expenses`
- `PATCH /api/v4/finance/expenses/[expenseId]`
- `POST /api/v4/finance/expenses/[expenseId]/void-preview`
- `POST /api/v4/finance/expenses/[expenseId]/void`

未知币种、空币种或负数金额必须拒绝；退款/冲销使用专门记录。

## 5. 汇率与利润

- `GET /api/v4/finance/exchange-rates`
- `POST /api/v4/finance/exchange-rates`
- `GET /api/v4/finance/profit`
- `GET /api/v4/finance/profit/orders/[orderNumber]`

利润接口默认返回原币组成。只有请求指定有效汇率记录时，才返回折算分析值。

## 6. 对账与期间

- `GET /api/v4/finance/reconciliation/unmatched`
- `POST /api/v4/finance/reconciliation/[recordId]/match-preview`
- `POST /api/v4/finance/reconciliation/[recordId]/match`
- `POST /api/v4/finance/periods/[period]/close-preview`
- `POST /api/v4/finance/periods/[period]/close`

锁账和重新打开期间仅 Owner 可操作，并要求二次确认。

## 7. Excel 暂存转换

- `POST /api/v4/imports/[batchId]/finance-commit-preview`
- `POST /api/v4/imports/[batchId]/finance-commit`

预览必须显示将创建、关联、跳过、币种不明和重复的记录；正式提交仅处理审核通过行。

## 8. 权限

Owner 可访问全部；Sales、Factory、Installer、Customer 的数据范围按角色、订单分配和字段级规则裁剪。前端隐藏不等于权限控制，所有校验必须在服务端执行。