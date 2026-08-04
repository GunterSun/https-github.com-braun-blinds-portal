# BRN-002 统一订单中心 API 规范

## 1. 通用要求

- API 前缀：`/api/v4`。
- 所有写操作需要登录、角色检查、输入校验和审计日志。
- 金额以服务端计算结果为准。
- 错误响应不得泄露密钥、SQL 或服务器堆栈。
- 列表接口必须分页，默认 25 条，最大 100 条。
- 时间使用 ISO 8601；数据库保存 UTC，界面按用户时区显示。

## 2. 订单接口

### GET `/api/v4/orders`

筛选参数：

- `q`：订单号、客户、电话、邮箱、地址、Invoice 或 Tracking
- `status`
- `paymentStatus`
- `assignedUserId`
- `dateFrom` / `dateTo`
- `page` / `pageSize`

权限：Owner 查看全部；其他角色只返回允许访问的订单。

### POST `/api/v4/orders`

创建草稿订单。订单号由服务端生成或经 Owner 授权导入，不允许客户端随意覆盖现有订单号。

### GET `/api/v4/orders/[orderNumber]`

返回订单工作区完整概要。敏感字段按角色裁剪：客户、工厂和安装工不能收到成本、利润或不相关资料。

### PATCH `/api/v4/orders/[orderNumber]`

修改订单基本信息。必须使用字段白名单；金额汇总字段不可直接修改。

### POST `/api/v4/orders/[orderNumber]/archive`

仅 Owner 可归档。存在未结余额、活动付款或未完成安装时返回警告并要求明确确认。

## 3. 产品明细

- `POST /api/v4/orders/[orderNumber]/items`
- `PATCH /api/v4/orders/[orderNumber]/items/[itemId]`
- `DELETE /api/v4/orders/[orderNumber]/items/[itemId]`

已开具 Invoice 后修改产品明细，应创建 Quote/Invoice 新版本或生成调整记录，不能静默改变已发送文件。

## 4. Quote 与 Invoice

- `POST /api/v4/orders/[orderNumber]/quotes`
- `POST /api/v4/orders/[orderNumber]/quotes/[quoteId]/send`
- `POST /api/v4/orders/[orderNumber]/invoices`
- `GET /api/v4/invoices/[invoiceNumber]`
- `POST /api/v4/invoices/[invoiceNumber]/pdf`

Invoice 编号由服务端五位数序列生成。重复提交必须使用幂等键，避免生成两张 Invoice。

## 5. 付款

- `GET /api/v4/orders/[orderNumber]/payments`
- `POST /api/v4/orders/[orderNumber]/payments`
- `POST /api/v4/payments/[paymentId]/void`
- `POST /api/v4/payments/[paymentId]/refund`

Stripe webhook 为付款状态的权威来源之一，但必须验证签名和幂等事件 ID。手工付款必须记录方式、参考号、日期和操作人。

## 6. 工厂与支出

- `POST /api/v4/orders/[orderNumber]/factory-jobs`
- `PATCH /api/v4/factory-jobs/[jobId]`
- `POST /api/v4/orders/[orderNumber]/expenses`
- `PATCH /api/v4/expenses/[expenseId]`
- `POST /api/v4/expenses/[expenseId]/void`

RMB 与 USD 必须显式传入。未知币种返回错误，不能默认转换。

## 7. 物流

- `POST /api/v4/orders/[orderNumber]/shipments`
- `POST /api/v4/shipments/[shipmentId]/packages`
- `PATCH /api/v4/shipments/[shipmentId]`
- `GET /api/v4/orders/[orderNumber]/shipping-history`

每箱尺寸和重量单独保存；承运商报价与最终购买费用分开记录。

## 8. 安装

- `POST /api/v4/orders/[orderNumber]/installations`
- `PATCH /api/v4/installations/[installationId]`
- `POST /api/v4/installations/[installationId]/photos`
- `POST /api/v4/installations/[installationId]/signature`

安装工只能访问分配给自己的任务。

## 9. 文件与日志

- `GET /api/v4/orders/[orderNumber]/files`
- `POST /api/v4/orders/[orderNumber]/files`
- `GET /api/v4/orders/[orderNumber]/audit`

客户只能下载明确标记为 customer-visible 的文件。

## 10. Excel 暂存生成正式订单

- `POST /api/v4/imports/[batchId]/commit-preview`
- `POST /api/v4/imports/[batchId]/commit`

`commit-preview` 返回将创建、关联、跳过和警告的记录，不写入正式表。`commit` 仅接受审核通过的行，并保存导入追踪字段。重复调用必须幂等。
